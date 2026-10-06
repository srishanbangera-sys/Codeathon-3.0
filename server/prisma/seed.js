import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding StudyPilot database...');

  // Clean existing data
  await prisma.resource.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.availabilityOverride.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const passwordHash = await bcrypt.hash('Demo@1234', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Demo Student',
      email: 'demo@studypilot.com',
      passwordHash
    }
  });
  console.log('✅ Created demo user: demo@studypilot.com / Demo@1234');

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: { userId: user.id, name: 'Mathematics', color: '#3B82F6', priority: 5 }
    }),
    prisma.subject.create({
      data: { userId: user.id, name: 'Physics', color: '#10B981', priority: 4 }
    }),
    prisma.subject.create({
      data: { userId: user.id, name: 'Computer Science', color: '#8B5CF6', priority: 4 }
    }),
    prisma.subject.create({
      data: { userId: user.id, name: 'English Literature', color: '#F59E0B', priority: 3 }
    })
  ]);
  console.log('✅ Created 4 subjects');

  const [math, physics, cs, english] = subjects;

  // Create topics (15+)
  const now = new Date();
  const topics = await Promise.all([
    // Math topics
    prisma.topic.create({ data: { subjectId: math.id, title: 'Linear Algebra', difficulty: 4, estimatedHours: 3, status: 'COMPLETED', completedAt: new Date(now - 5 * 86400000) } }),
    prisma.topic.create({ data: { subjectId: math.id, title: 'Calculus - Derivatives', difficulty: 5, estimatedHours: 4, status: 'IN_PROGRESS' } }),
    prisma.topic.create({ data: { subjectId: math.id, title: 'Calculus - Integrals', difficulty: 5, estimatedHours: 4, status: 'NOT_STARTED' } }),
    prisma.topic.create({ data: { subjectId: math.id, title: 'Probability Theory', difficulty: 3, estimatedHours: 2, status: 'NOT_STARTED' } }),
    // Physics topics
    prisma.topic.create({ data: { subjectId: physics.id, title: 'Mechanics - Newton\'s Laws', difficulty: 3, estimatedHours: 2, status: 'COMPLETED', completedAt: new Date(now - 3 * 86400000) } }),
    prisma.topic.create({ data: { subjectId: physics.id, title: 'Thermodynamics', difficulty: 4, estimatedHours: 3, status: 'IN_PROGRESS' } }),
    prisma.topic.create({ data: { subjectId: physics.id, title: 'Electromagnetism', difficulty: 5, estimatedHours: 4, status: 'NOT_STARTED' } }),
    prisma.topic.create({ data: { subjectId: physics.id, title: 'Optics', difficulty: 3, estimatedHours: 2, status: 'NOT_STARTED' } }),
    // CS topics
    prisma.topic.create({ data: { subjectId: cs.id, title: 'Data Structures', difficulty: 4, estimatedHours: 3, status: 'COMPLETED', completedAt: new Date(now - 7 * 86400000) } }),
    prisma.topic.create({ data: { subjectId: cs.id, title: 'Algorithms - Sorting', difficulty: 4, estimatedHours: 2.5, status: 'COMPLETED', completedAt: new Date(now - 2 * 86400000) } }),
    prisma.topic.create({ data: { subjectId: cs.id, title: 'Dynamic Programming', difficulty: 5, estimatedHours: 4, status: 'IN_PROGRESS' } }),
    prisma.topic.create({ data: { subjectId: cs.id, title: 'Graph Theory', difficulty: 4, estimatedHours: 3, status: 'NOT_STARTED' } }),
    prisma.topic.create({ data: { subjectId: cs.id, title: 'Database Design', difficulty: 3, estimatedHours: 2, status: 'NOT_STARTED' } }),
    // English topics
    prisma.topic.create({ data: { subjectId: english.id, title: 'Shakespeare - Hamlet', difficulty: 3, estimatedHours: 2, status: 'COMPLETED', completedAt: new Date(now - 4 * 86400000) } }),
    prisma.topic.create({ data: { subjectId: english.id, title: 'Essay Writing', difficulty: 2, estimatedHours: 1.5, status: 'IN_PROGRESS' } }),
    prisma.topic.create({ data: { subjectId: english.id, title: 'Poetry Analysis', difficulty: 3, estimatedHours: 2, status: 'NOT_STARTED' } }),
    prisma.topic.create({ data: { subjectId: english.id, title: 'Modern Fiction', difficulty: 2, estimatedHours: 2, status: 'NOT_STARTED' } }),
  ]);
  console.log(`✅ Created ${topics.length} topics`);

  // Create exams (3)
  const examDate1 = new Date(now);
  examDate1.setDate(examDate1.getDate() + 21);
  const examDate2 = new Date(now);
  examDate2.setDate(examDate2.getDate() + 28);
  const examDate3 = new Date(now);
  examDate3.setDate(examDate3.getDate() + 35);

  await Promise.all([
    prisma.exam.create({ data: { userId: user.id, subjectId: math.id, title: 'Math Midterm', date: examDate1 } }),
    prisma.exam.create({ data: { userId: user.id, subjectId: physics.id, title: 'Physics Final', date: examDate2 } }),
    prisma.exam.create({ data: { userId: user.id, subjectId: cs.id, title: 'CS Algorithms Exam', date: examDate3 } }),
  ]);
  console.log('✅ Created 3 exams');

  // Create assignments (3)
  const deadline1 = new Date(now);
  deadline1.setDate(deadline1.getDate() + 7);
  const deadline2 = new Date(now);
  deadline2.setDate(deadline2.getDate() + 14);
  const deadline3 = new Date(now);
  deadline3.setDate(deadline3.getDate() + 10);

  await Promise.all([
    prisma.assignment.create({ data: { userId: user.id, subjectId: cs.id, title: 'Algorithm Analysis Report', deadline: deadline1, estimatedHours: 3, status: 'IN_PROGRESS' } }),
    prisma.assignment.create({ data: { userId: user.id, subjectId: english.id, title: 'Literary Analysis Essay', deadline: deadline2, estimatedHours: 4, status: 'NOT_STARTED' } }),
    prisma.assignment.create({ data: { userId: user.id, subjectId: physics.id, title: 'Lab Report - Thermodynamics', deadline: deadline3, estimatedHours: 2, status: 'NOT_STARTED' } }),
  ]);
  console.log('✅ Created 3 assignments');

  // Set availability (Mon-Sun)
  await Promise.all([
    prisma.availability.create({ data: { userId: user.id, weekday: 0, hours: 2 } }),   // Sunday
    prisma.availability.create({ data: { userId: user.id, weekday: 1, hours: 3 } }),   // Monday
    prisma.availability.create({ data: { userId: user.id, weekday: 2, hours: 3 } }),   // Tuesday
    prisma.availability.create({ data: { userId: user.id, weekday: 3, hours: 4 } }),   // Wednesday
    prisma.availability.create({ data: { userId: user.id, weekday: 4, hours: 3 } }),   // Thursday
    prisma.availability.create({ data: { userId: user.id, weekday: 5, hours: 2 } }),   // Friday
    prisma.availability.create({ data: { userId: user.id, weekday: 6, hours: 4 } }),   // Saturday
  ]);
  console.log('✅ Set weekly availability');

  // Create some completed/missed history sessions
  const sessionData = [];
  for (let i = 10; i >= 1; i--) {
    const sessionDate = new Date(now);
    sessionDate.setDate(sessionDate.getDate() - i);
    sessionDate.setHours(0, 0, 0, 0);
    
    // 2-3 sessions per past day
    const topic1 = topics[Math.floor(Math.random() * topics.length)];
    sessionData.push({
      userId: user.id,
      topicId: topic1.id,
      date: sessionDate,
      startTime: '09:00',
      endTime: '10:00',
      status: i % 3 === 0 ? 'MISSED' : 'COMPLETED',
      completedAt: i % 3 === 0 ? null : sessionDate
    });
    
    const topic2 = topics[Math.floor(Math.random() * topics.length)];
    sessionData.push({
      userId: user.id,
      topicId: topic2.id,
      date: sessionDate,
      startTime: '14:00',
      endTime: '15:00',
      status: i % 4 === 0 ? 'MISSED' : 'COMPLETED',
      completedAt: i % 4 === 0 ? null : sessionDate
    });
  }

  await prisma.studySession.createMany({ data: sessionData });
  console.log(`✅ Created ${sessionData.length} historical sessions`);

  // Create some resources
  await Promise.all([
    prisma.resource.create({ data: { userId: user.id, subjectId: math.id, topicId: topics[1].id, title: 'Khan Academy - Derivatives', url: 'https://khanacademy.org/derivatives', type: 'VIDEO' } }),
    prisma.resource.create({ data: { userId: user.id, subjectId: cs.id, topicId: topics[10].id, title: 'DP Tutorial - GeeksForGeeks', url: 'https://geeksforgeeks.org/dp', type: 'ARTICLE' } }),
    prisma.resource.create({ data: { userId: user.id, subjectId: physics.id, title: 'Physics Textbook PDF', url: 'https://example.com/physics.pdf', type: 'PDF' } }),
  ]);
  console.log('✅ Created 3 resources');

  console.log('\n🎉 Seeding complete!');
  console.log('Login with: demo@studypilot.com / Demo@1234');
}

seed()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
