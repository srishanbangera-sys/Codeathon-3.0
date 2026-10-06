/**
 * StudyPilot Scheduler - Rule-based deterministic scheduling algorithm
 * 
 * Priority score = 0.4*urgency + 0.3*difficulty + 0.2*(1-progress) + 0.1*subjectPriority
 * Normalized to 0-1 range for each component.
 */

/**
 * Calculate priority score for a schedulable item
 * @param {Object} item - Topic or assignment
 * @param {Date} deadline - The relevant deadline (exam date or assignment deadline)
 * @param {number} totalDays - Total days from now to the furthest deadline
 * @param {number} subjectPriority - Subject priority (1-5)
 * @param {number} progress - Item progress (0-1)
 * @returns {number} Priority score (higher = more urgent)
 */
export function calculatePriorityScore(item, deadline, totalDays, subjectPriority, progress) {
  const now = new Date();
  const daysToDeadline = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));
  
  // Urgency: closer deadlines = higher urgency (inverted, normalized)
  const urgency = totalDays > 0 ? Math.max(0, 1 - (daysToDeadline / totalDays)) : 1;
  
  // Difficulty: normalized 1-5 to 0-1
  const difficulty = ((item.difficulty || 3) - 1) / 4;
  
  // Remaining work: 1 - progress (more remaining = higher priority)
  const remaining = 1 - (progress || 0);
  
  // Subject priority: normalized 1-5 to 0-1
  const subjectPriorityNorm = ((subjectPriority || 3) - 1) / 4;
  
  const score = 0.4 * urgency + 0.3 * difficulty + 0.2 * remaining + 0.1 * subjectPriorityNorm;
  return Math.round(score * 1000) / 1000;
}

/**
 * Get priority label from score
 */
export function getPriorityLabel(score) {
  if (score >= 0.6) return 'High';
  if (score >= 0.35) return 'Medium';
  return 'Low';
}

/**
 * Get available hours for a specific date
 */
export function getAvailableHours(date, availability, overrides) {
  // Check for date-specific override first
  const dateStr = date.toISOString().split('T')[0];
  const override = overrides.find(o => {
    const oDate = new Date(o.date).toISOString().split('T')[0];
    return oDate === dateStr;
  });
  if (override) return override.hours;
  
  // Fall back to weekday default
  const weekday = date.getDay(); // 0=Sunday
  const avail = availability.find(a => a.weekday === weekday);
  return avail ? avail.hours : 0;
}

/**
 * Generate study sessions
 * @param {Object} params
 * @returns {Object} { sessions, warning }
 */
export function generateSchedule({
  topics,
  assignments,
  exams,
  availability,
  overrides,
  startDate = new Date()
}) {
  const sessions = [];
  const now = new Date(startDate);
  now.setHours(0, 0, 0, 0);
  
  // Find the last deadline
  const allDeadlines = [
    ...exams.map(e => new Date(e.date)),
    ...assignments.filter(a => a.status !== 'COMPLETED').map(a => new Date(a.deadline))
  ].filter(d => d > now);
  
  if (allDeadlines.length === 0) {
    return { sessions: [], warning: null };
  }
  
  const lastDeadline = new Date(Math.max(...allDeadlines));
  const totalDays = Math.max(1, Math.ceil((lastDeadline - now) / (1000 * 60 * 60 * 24)));
  
  // Build schedulable items with priorities
  const items = [];
  
  // Topics - find their nearest exam deadline
  for (const topic of topics) {
    if (topic.status === 'COMPLETED') continue;
    
    const subjectExams = exams.filter(e => e.subjectId === topic.subjectId);
    const nearestExam = subjectExams
      .filter(e => new Date(e.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    
    const deadline = nearestExam ? new Date(nearestExam.date) : lastDeadline;
    const remainingHours = topic.estimatedHours || 1;
    const progress = topic.status === 'IN_PROGRESS' ? 0.5 : 0;
    
    const subject = topic.subject || {};
    const score = calculatePriorityScore(
      topic, deadline, totalDays,
      subject.priority || 3, progress
    );
    
    items.push({
      type: 'topic',
      id: topic.id,
      topicId: topic.id,
      assignmentId: null,
      subjectId: topic.subjectId,
      subjectName: subject.name || 'Unknown',
      title: topic.title,
      remainingHours,
      deadline,
      score,
      label: getPriorityLabel(score)
    });
  }
  
  // Assignments
  for (const assignment of assignments) {
    if (assignment.status === 'COMPLETED') continue;
    
    const deadline = new Date(assignment.deadline);
    if (deadline <= now) continue;
    
    const remainingHours = assignment.estimatedHours || 1;
    const progress = assignment.status === 'IN_PROGRESS' ? 0.5 : 0;
    
    const subject = assignment.subject || {};
    const score = calculatePriorityScore(
      { difficulty: 3 }, deadline, totalDays,
      subject.priority || 3, progress
    );
    
    items.push({
      type: 'assignment',
      id: assignment.id,
      topicId: null,
      assignmentId: assignment.id,
      subjectId: assignment.subjectId,
      subjectName: subject.name || 'Unknown',
      title: assignment.title,
      remainingHours,
      deadline,
      score,
      label: getPriorityLabel(score)
    });
  }
  
  // Sort by priority score descending
  items.sort((a, b) => b.score - a.score);
  
  // Track remaining hours per item
  const remaining = {};
  let totalRequired = 0;
  for (const item of items) {
    remaining[item.id] = item.remainingHours;
    totalRequired += item.remainingHours;
  }
  
  // Calculate total available hours
  let totalAvailable = 0;
  const currentDate = new Date(now);
  const endDate = new Date(lastDeadline);
  while (currentDate <= endDate) {
    totalAvailable += getAvailableHours(currentDate, availability, overrides);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Walk day by day
  const dayDate = new Date(now);
  dayDate.setDate(dayDate.getDate() + 1); // Start from tomorrow
  
  let consecutiveSameSubject = 0;
  let lastSubjectId = null;
  
  while (dayDate <= lastDeadline) {
    const dayHours = getAvailableHours(dayDate, availability, overrides);
    if (dayHours <= 0) {
      dayDate.setDate(dayDate.getDate() + 1);
      continue;
    }
    
    let usedHours = 0;
    let cumulativeMinutes = 0;
    let startHour = 9; // Default start at 9 AM
    
    // Get eligible items for this day (not past their deadline)
    const eligible = items.filter(item => {
      return remaining[item.id] > 0 && item.deadline > dayDate;
    });
    
    // Sort eligible items (with interleaving consideration)
    const sortedEligible = [...eligible].sort((a, b) => {
      // If we've had 2 consecutive sessions of the same subject, deprioritize it
      if (consecutiveSameSubject >= 2 && a.subjectId === lastSubjectId && b.subjectId !== lastSubjectId) {
        return 1;
      }
      if (consecutiveSameSubject >= 2 && b.subjectId === lastSubjectId && a.subjectId !== lastSubjectId) {
        return -1;
      }
      return b.score - a.score;
    });
    
    for (const item of sortedEligible) {
      if (usedHours >= dayHours) break;
      if (remaining[item.id] <= 0) continue;
      
      // Session duration: 30-60 min chunks
      const maxSessionHours = Math.min(1, dayHours - usedHours, remaining[item.id]);
      const sessionMinutes = Math.max(30, Math.round(maxSessionHours * 60));
      const sessionHours = sessionMinutes / 60;
      
      // Calculate start and end time
      const sessionStart = startHour + usedHours;
      const startTimeHours = Math.floor(sessionStart);
      const startTimeMinutes = Math.round((sessionStart - startTimeHours) * 60);
      
      const sessionEnd = sessionStart + sessionHours;
      const endTimeHours = Math.floor(sessionEnd);
      const endTimeMinutes = Math.round((sessionEnd - endTimeHours) * 60);
      
      // Add break after 90 minutes of cumulative study
      cumulativeMinutes += sessionMinutes;
      let breakMinutes = 0;
      if (cumulativeMinutes >= 90) {
        breakMinutes = 10;
        cumulativeMinutes = 0;
      }
      
      const session = {
        topicId: item.topicId,
        assignmentId: item.assignmentId,
        date: new Date(dayDate),
        startTime: `${String(startTimeHours).padStart(2, '0')}:${String(startTimeMinutes).padStart(2, '0')}`,
        endTime: `${String(endTimeHours).padStart(2, '0')}:${String(endTimeMinutes).padStart(2, '0')}`,
        status: 'PLANNED',
        // Extra metadata for the response (not stored in DB)
        _meta: {
          subjectId: item.subjectId,
          subjectName: item.subjectName,
          title: item.title,
          type: item.type,
          priority: item.label,
          score: item.score
        }
      };
      
      sessions.push(session);
      remaining[item.id] -= sessionHours;
      usedHours += sessionHours + (breakMinutes / 60);
      
      // Track interleaving
      if (item.subjectId === lastSubjectId) {
        consecutiveSameSubject++;
      } else {
        consecutiveSameSubject = 1;
        lastSubjectId = item.subjectId;
      }
    }
    
    dayDate.setDate(dayDate.getDate() + 1);
  }
  
  // Check for overload warning
  const warning = totalRequired > totalAvailable
    ? { overloaded: true, shortfallHours: Math.round((totalRequired - totalAvailable) * 10) / 10 }
    : null;
  
  return { sessions, warning };
}

/**
 * Calculate per-subject progress (weighted by estimated hours)
 */
export function calculateSubjectProgress(topics) {
  if (!topics || topics.length === 0) return 0;
  
  const totalHours = topics.reduce((sum, t) => sum + (t.estimatedHours || 1), 0);
  const completedHours = topics
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + (t.estimatedHours || 1), 0);
  
  return totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;
}

/**
 * Calculate predicted progress based on last 14 days completion rate
 */
export function calculatePredictedProgress(sessions, examDate) {
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  
  // Get sessions from last 14 days
  const recentSessions = sessions.filter(s => {
    const sDate = new Date(s.date);
    return sDate >= fourteenDaysAgo && sDate <= now;
  });
  
  const totalRecent = recentSessions.length;
  const completedRecent = recentSessions.filter(s => s.status === 'COMPLETED').length;
  const completionRate = totalRecent > 0 ? completedRecent / totalRecent : 0.5;
  
  // Project forward
  const daysToExam = Math.max(0, Math.ceil((new Date(examDate) - now) / (1000 * 60 * 60 * 24)));
  const futureSessions = sessions.filter(s => {
    const sDate = new Date(s.date);
    return sDate > now && sDate <= new Date(examDate) && s.status === 'PLANNED';
  });
  
  const predictedCompleted = Math.round(futureSessions.length * completionRate);
  const allCompleted = sessions.filter(s => s.status === 'COMPLETED').length;
  const allTotal = sessions.length;
  
  const predictedTotal = allCompleted + predictedCompleted;
  const predictedProgress = allTotal > 0 ? Math.min(100, Math.round((predictedTotal / allTotal) * 100)) : 0;
  
  return {
    completionRate: Math.round(completionRate * 100),
    predictedProgress,
    status: completionRate >= 0.7 ? 'On track' : 'At risk',
    daysToExam
  };
}

/**
 * Identify weak subjects
 */
export function identifyWeakSubjects(subjects) {
  if (!subjects || subjects.length === 0) return [];
  
  const progressList = subjects.map(s => ({
    ...s,
    progress: calculateSubjectProgress(s.topics || []),
    missedCount: (s.topics || []).filter(t => t.status === 'MISSED').length
  }));
  
  const avgProgress = progressList.reduce((sum, s) => sum + s.progress, 0) / progressList.length;
  
  return progressList
    .filter(s => s.progress < avgProgress || s.missedCount > 0)
    .map(s => ({
      subjectId: s.id,
      name: s.name,
      progress: s.progress,
      avgProgress: Math.round(avgProgress),
      missedCount: s.missedCount,
      suggestedExtraHoursPerWeek: Math.max(1, Math.round((avgProgress - s.progress) / 10))
    }));
}
