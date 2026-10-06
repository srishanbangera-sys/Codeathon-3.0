import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import toast from 'react-hot-toast';
import { scheduleAPI, examsAPI, assignmentsAPI } from '../api';
import { Sparkles, RefreshCcw, CheckCircle2, Clock } from 'lucide-react';

export default function Calendar() {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      const [sessionsRes, examsRes, assignRes] = await Promise.all([
        scheduleAPI.getSessions(),
        examsAPI.list(),
        assignmentsAPI.list()
      ]);

      const formattedEvents = [];

      // Add Sessions
      sessionsRes.data.data.forEach(s => {
        const dateStr = new Date(s.date).toISOString().split('T')[0];
        formattedEvents.push({
          id: `session_${s.id}`,
          title: s.topic?.title || s.assignment?.title || 'Study Session',
          start: `${dateStr}T${s.startTime}:00`,
          end: `${dateStr}T${s.endTime}:00`,
          backgroundColor: s.status === 'COMPLETED' ? '#10B981' : (s.topic?.subject.color || s.assignment?.subject.color || '#3B82F6'),
          borderColor: 'transparent',
          extendedProps: {
            type: 'session',
            originalId: s.id,
            status: s.status,
            subject: s.topic?.subject.name || s.assignment?.subject.name,
          }
        });
      });

      // Add Exams
      examsRes.data.data.forEach(e => {
        formattedEvents.push({
          id: `exam_${e.id}`,
          title: `EXAM: ${e.title}`,
          date: new Date(e.date).toISOString().split('T')[0],
          backgroundColor: '#EF4444',
          borderColor: 'transparent',
          allDay: true,
          extendedProps: { type: 'exam', subject: e.subject.name }
        });
      });

      // Add Assignments
      assignRes.data.data.forEach(a => {
        if (a.status === 'COMPLETED') return;
        formattedEvents.push({
          id: `assignment_${a.id}`,
          title: `DUE: ${a.title}`,
          date: new Date(a.deadline).toISOString().split('T')[0],
          backgroundColor: '#F59E0B',
          borderColor: 'transparent',
          allDay: true,
          extendedProps: { type: 'assignment', subject: a.subject.name }
        });
      });

      setEvents(formattedEvents);
    } catch (err) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleGenerate = async (useAI = false) => {
    try {
      setGenerating(true);
      const res = await scheduleAPI.generate(useAI);
      
      if (res.data.data.warning?.overloaded) {
        toast.error(`Schedule full! Shortfall: ${res.data.data.warning.shortfallHours}hrs`, { duration: 6000 });
      } else {
        toast.success(`Generated ${res.data.data.count} sessions via ${res.data.data.source}`);
      }
      
      fetchEvents();
    } catch (err) {
      toast.error('Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  const handleReplan = async () => {
    try {
      setGenerating(true);
      const res = await scheduleAPI.replan();
      toast.success(`Replanned! ${res.data.data.count} new sessions created.`);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to replan');
    } finally {
      setGenerating(false);
    }
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.extendedProps.originalId,
      type: info.event.extendedProps.type,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      status: info.event.extendedProps.status,
      subject: info.event.extendedProps.subject
    });
  };

  const markSessionComplete = async () => {
    if (!selectedEvent?.id || selectedEvent.type !== 'session') return;
    try {
      await scheduleAPI.updateSession(selectedEvent.id, { status: 'COMPLETED' });
      toast.success('Session completed!');
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to update session');
    }
  };

  if (loading) return <div className="skeleton h-[600px] rounded-2xl w-full"></div>;

  return (
    <div className="space-y-6 page-enter h-[calc(100vh-80px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary-dark)]">Schedule</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Your auto-generated study timetable</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <button onClick={() => handleGenerate(false)} disabled={generating} className="btn btn-outline btn-sm">
             <RefreshCcw size={16} className={generating ? 'animate-spin' : ''} /> Generate Plan
           </button>
           <button onClick={() => handleGenerate(true)} disabled={generating} className="btn bg-indigo-600 text-white hover:bg-indigo-700 btn-sm">
             <Sparkles size={16} /> AI Plan
           </button>
           <button onClick={handleReplan} disabled={generating} className="btn btn-primary btn-sm">
             Replan
           </button>
        </div>
      </div>

      <div className="card p-4 flex-1 min-h-0">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          height="100%"
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={true}
          nowIndicator={true}
          eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
        />
      </div>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border-light)] pb-4">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)] flex items-center gap-2">
                {selectedEvent.type === 'session' ? <Clock className="text-[var(--color-primary)]" /> : null}
                {selectedEvent.title}
              </h2>
              <button onClick={() => setSelectedEvent(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">✕</button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <div className="text-xs text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Subject</div>
                   <div className="font-medium">{selectedEvent.subject || 'N/A'}</div>
                </div>
                <div>
                   <div className="text-xs text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Type</div>
                   <div className="font-medium capitalize">{selectedEvent.type}</div>
                </div>
              </div>
              
              {selectedEvent.start && (
                <div>
                   <div className="text-xs text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Time</div>
                   <div className="font-medium">
                     {selectedEvent.start.toLocaleString()}
                     {selectedEvent.end && ` - ${selectedEvent.end.toLocaleTimeString()}`}
                   </div>
                </div>
              )}
              
              {selectedEvent.type === 'session' && (
                 <div>
                   <div className="text-xs text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1">Status</div>
                   <div className={`inline-flex badge badge-${selectedEvent.status.toLowerCase().replace('_', '-')}`}>
                     {selectedEvent.status}
                   </div>
                 </div>
              )}
            </div>

            {selectedEvent.type === 'session' && selectedEvent.status !== 'COMPLETED' && (
              <button 
                onClick={markSessionComplete}
                className="btn btn-success w-full py-3 text-lg"
              >
                <CheckCircle2 /> Mark as Completed
              </button>
            )}
            
            {selectedEvent.type === 'session' && selectedEvent.status === 'COMPLETED' && (
              <div className="text-center p-4 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2">
                 <CheckCircle2 /> Great job! Session completed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
