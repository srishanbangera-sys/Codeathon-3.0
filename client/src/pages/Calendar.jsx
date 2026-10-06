import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import interactionPlugin from '@fullcalendar/react/interaction';
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
      (sessionsRes.data?.data || []).forEach(s => {
        if (!s || !s.startTime || !s.date) return;
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
      (examsRes.data?.data || []).forEach(e => {
        if (!e) return;
        formattedEvents.push({
          id: `exam_${e.id}`,
          title: `EXAM: ${e.title}`,
          date: new Date(e.date).toISOString().split('T')[0],
          backgroundColor: '#EF4444',
          borderColor: 'transparent',
          allDay: true,
          extendedProps: { type: 'exam', subject: e.subject?.name }
        });
      });

      // Add Assignments
      (assignRes.data?.data || []).forEach(a => {
        if (!a || a.status === 'COMPLETED') return;
        formattedEvents.push({
          id: `assignment_${a.id}`,
          title: `DUE: ${a.title}`,
          date: new Date(a.deadline).toISOString().split('T')[0],
          backgroundColor: '#F59E0B',
          borderColor: 'transparent',
          allDay: true,
          extendedProps: { type: 'assignment', subject: a.subject?.name }
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
    <div className="space-y-6 page-enter h-[calc(100vh-80px)] flex flex-col max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-[#051c24] tracking-tight">Schedule</h1>
          <p className="text-gray-500 font-medium mt-1">Your auto-generated study timetable</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
           <button onClick={() => handleGenerate(false)} disabled={generating} className="px-5 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 disabled:opacity-50">
             <RefreshCcw size={18} strokeWidth={2.5} className={generating ? 'animate-spin' : ''} /> Generate Plan
           </button>
           <button onClick={() => handleGenerate(true)} disabled={generating} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50">
             <Sparkles size={18} strokeWidth={2.5} /> AI Plan
           </button>
           <button onClick={handleReplan} disabled={generating} className="bg-[#2dc1c1] hover:bg-[#1b8c8c] text-white font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50">
             Replan
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex-1 min-h-0 custom-calendar">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-[#051c24] flex items-center gap-3">
                {selectedEvent.type === 'session' ? (
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#2dc1c1] flex items-center justify-center">
                    <Clock size={20} strokeWidth={2.5} />
                  </div>
                ) : null}
                {selectedEvent.title}
              </h2>
              <button onClick={() => setSelectedEvent(null)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors">✕</button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">Subject</div>
                   <div className="font-bold text-[#051c24]">{selectedEvent.subject || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">Type</div>
                   <div className="font-bold text-[#051c24] capitalize">{selectedEvent.type}</div>
                </div>
              </div>
              
              {selectedEvent.start && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-1">Time</div>
                   <div className="font-bold text-[#051c24]">
                     {selectedEvent.start.toLocaleString()}
                     {selectedEvent.end && ` - ${selectedEvent.end.toLocaleTimeString()}`}
                   </div>
                </div>
              )}
              
              {selectedEvent.type === 'session' && (
                 <div>
                   <div className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">Status</div>
                   <div className={`inline-flex px-3 py-1.5 rounded-lg font-bold text-sm ${
                        selectedEvent.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                        selectedEvent.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600' :
                        selectedEvent.status === 'MISSED' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                   }`}>
                     {selectedEvent.status}
                   </div>
                 </div>
              )}
            </div>

            {selectedEvent.type === 'session' && selectedEvent.status !== 'COMPLETED' && (
              <button 
                onClick={markSessionComplete}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <CheckCircle2 strokeWidth={2.5} /> Mark as Completed
              </button>
            )}
            
            {selectedEvent.type === 'session' && selectedEvent.status === 'COMPLETED' && (
              <div className="text-center p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2">
                 <CheckCircle2 strokeWidth={2.5} /> Great job! Session completed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
