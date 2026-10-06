import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { availabilityAPI } from '../api';
import { Clock, Plus, Trash2, Calendar as CalendarIcon, Save } from 'lucide-react';

const WEEKDAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 0, name: 'Sunday' }
];

export default function Availability() {
  const [weekly, setWeekly] = useState(WEEKDAYS.map(w => ({ weekday: w.id, hours: 0 })));
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideHours, setOverrideHours] = useState(0);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  const fetchAvailability = async () => {
    try {
      const res = await availabilityAPI.get();
      const { availability, overrides: overrideData } = res.data.data;
      
      if (availability.length > 0) {
        setWeekly(WEEKDAYS.map(w => {
          const found = availability.find(a => a.weekday === w.id);
          return { weekday: w.id, hours: found ? found.hours : 0 };
        }));
      }
      setOverrides(overrideData);
    } catch (err) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleWeeklyChange = (weekday, value) => {
    const hours = parseFloat(value) || 0;
    setWeekly(prev => prev.map(w => w.weekday === weekday ? { ...w, hours } : w));
  };

  const saveWeekly = async () => {
    try {
      setSaving(true);
      await availabilityAPI.set(weekly);
      toast.success('Weekly schedule saved');
    } catch (err) {
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const addOverride = async (e) => {
    e.preventDefault();
    try {
      await availabilityAPI.addOverride({ date: overrideDate, hours: parseFloat(overrideHours) });
      toast.success('Exception added');
      setIsOverrideModalOpen(false);
      setOverrideDate('');
      setOverrideHours(0);
      fetchAvailability();
    } catch (err) {
      toast.error('Failed to add exception');
    }
  };

  const deleteOverride = async (id) => {
    try {
      await availabilityAPI.deleteOverride(id);
      toast.success('Exception removed');
      fetchAvailability();
    } catch (err) {
      toast.error('Failed to remove exception');
    }
  };

  if (loading) return <div className="skeleton h-64 rounded-2xl max-w-4xl"></div>;

  return (
    <div className="space-y-8 page-enter max-w-[1400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#051c24] tracking-tight">Study Availability</h1>
          <p className="text-gray-500 font-medium mt-1">Set the hours you can study each day. The scheduler will use this.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-[#051c24] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#2dc1c1] flex items-center justify-center">
                  <Clock size={20} strokeWidth={2.5} />
                </div>
                Default Weekly Schedule
              </h2>
              <button 
                onClick={saveWeekly} 
                disabled={saving}
                className="bg-[#2dc1c1] hover:bg-[#1b8c8c] text-white font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
              >
                <Save size={16} strokeWidth={2.5} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            
            <div className="space-y-4">
              {WEEKDAYS.map(day => {
                const dayVal = weekly.find(w => w.weekday === day.id)?.hours || 0;
                return (
                  <div key={day.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50/50 transition-colors border border-gray-100 hover:border-gray-200">
                    <span className="font-bold text-[#051c24] w-28">{day.name}</span>
                    <div className="flex-1 px-4 md:px-8">
                      <input 
                        type="range" 
                        min="0" max="12" step="0.5"
                        value={dayVal}
                        onChange={(e) => handleWeeklyChange(day.id, e.target.value)}
                        className="w-full accent-[#2dc1c1]"
                      />
                    </div>
                    <div className="w-20 text-right font-bold text-[#051c24] bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      {dayVal} <span className="text-gray-400 text-xs">hrs</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between text-sm gap-2">
              <span className="font-bold text-[#051c24] px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">Total weekly: <span className="text-[#2dc1c1]">{weekly.reduce((acc, curr) => acc + curr.hours, 0)} hrs</span></span>
              <span className="text-gray-500 font-medium self-center">Changes won't affect already scheduled sessions until you replan.</span>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#051c24] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <CalendarIcon size={20} strokeWidth={2.5} />
                </div>
                Exceptions
              </h2>
              <button onClick={() => setIsOverrideModalOpen(true)} className="w-10 h-10 rounded-full border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center">
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 font-medium mb-8">
              Override your default schedule for specific dates (e.g. holidays, busy days).
            </p>

            {overrides.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-400 font-bold text-sm">No upcoming exceptions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {overrides.map(override => (
                  <div key={override.id} className="flex items-center justify-between p-4 border border-orange-100 rounded-2xl bg-orange-50/30 group hover:border-orange-200 transition-colors">
                    <div>
                      <div className="font-bold text-[#051c24] mb-1">{new Date(override.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div className="text-xs text-orange-600 font-bold bg-orange-100 px-2.5 py-1 rounded-md inline-block">{override.hours} hrs available</div>
                    </div>
                    <button onClick={() => deleteOverride(override.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#051c24]">Add Exception</h2>
              <button onClick={() => setIsOverrideModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors">✕</button>
            </div>
            
            <form onSubmit={addOverride} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#051c24] mb-2">Date</label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={overrideDate}
                  onChange={(e) => setOverrideDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dc1c1]/20 focus:border-[#2dc1c1] transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#051c24] mb-2">Available Hours</label>
                <input 
                  type="number" 
                  step="0.5" min="0" max="24"
                  required
                  value={overrideHours}
                  onChange={(e) => setOverrideHours(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dc1c1]/20 focus:border-[#2dc1c1] transition-all" 
                />
                <p className="text-xs text-gray-500 font-medium mt-1.5">Set to 0 for a full day off.</p>
              </div>

              <div className="flex gap-3 pt-6 mt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsOverrideModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-[#2dc1c1] text-white font-bold hover:bg-[#1b8c8c] transition-colors">Add Exception</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
