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
    <div className="space-y-6 page-enter max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary-dark)]">Study Availability</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Set the hours you can study each day. The scheduler will use this.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)] flex items-center gap-2">
                <Clock className="text-[var(--color-primary)]" /> Default Weekly Schedule
              </h2>
              <button 
                onClick={saveWeekly} 
                disabled={saving}
                className="btn btn-primary btn-sm"
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
            
            <div className="space-y-4">
              {WEEKDAYS.map(day => {
                const dayVal = weekly.find(w => w.weekday === day.id)?.hours || 0;
                return (
                  <div key={day.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors border border-transparent hover:border-[var(--color-border-light)]">
                    <span className="font-medium w-32">{day.name}</span>
                    <div className="flex-1 px-4">
                      <input 
                        type="range" 
                        min="0" max="12" step="0.5"
                        value={dayVal}
                        onChange={(e) => handleWeeklyChange(day.id, e.target.value)}
                        className="w-full accent-[var(--color-primary)]"
                      />
                    </div>
                    <div className="w-16 text-right font-bold text-[var(--color-primary-dark)]">
                      {dayVal} hrs
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--color-border-light)] flex justify-between text-sm text-[var(--color-text-muted)]">
              <span>Total weekly: {weekly.reduce((acc, curr) => acc + curr.hours, 0)} hrs</span>
              <span>Changes won't affect already scheduled sessions until you replan.</span>
            </div>
          </div>
        </div>

        <div>
          <div className="card p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)] flex items-center gap-2">
                <CalendarIcon className="text-[var(--color-warning)]" /> Exceptions
              </h2>
              <button onClick={() => setIsOverrideModalOpen(true)} className="btn btn-outline btn-sm">
                <Plus size={16} /> Add
              </button>
            </div>
            
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              Override your default schedule for specific dates (e.g. holidays, busy days).
            </p>

            {overrides.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
                No upcoming exceptions.
              </div>
            ) : (
              <div className="space-y-3">
                {overrides.map(override => (
                  <div key={override.id} className="flex items-center justify-between p-3 border border-[var(--color-border-light)] rounded-xl bg-orange-50/50">
                    <div>
                      <div className="font-semibold text-sm">{new Date(override.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div className="text-xs text-orange-600 font-bold">{override.hours} hrs available</div>
                    </div>
                    <button onClick={() => deleteOverride(override.id)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isOverrideModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">Add Exception</h2>
              <button onClick={() => setIsOverrideModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">✕</button>
            </div>
            
            <form onSubmit={addOverride} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={overrideDate}
                  onChange={(e) => setOverrideDate(e.target.value)}
                  className="form-input" 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Available Hours</label>
                <input 
                  type="number" 
                  step="0.5" min="0" max="24"
                  required
                  value={overrideHours}
                  onChange={(e) => setOverrideHours(e.target.value)}
                  className="form-input" 
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Set to 0 for a full day off.</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-border-light)]">
                <button type="button" onClick={() => setIsOverrideModalOpen(false)} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Add Exception</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
