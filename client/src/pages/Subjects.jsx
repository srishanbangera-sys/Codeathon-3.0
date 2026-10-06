import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { subjectsAPI } from '../api';
import { Plus, MoreVertical, Trash2, Edit2, BookOpen, Layers } from 'lucide-react';

const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  priority: z.coerce.number().int().min(1).max(5)
});

const presetColors = ['#0F4C5C', '#C9A646', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: { color: presetColors[0], priority: 3 }
  });

  const selectedColor = watch('color');

  const fetchSubjects = async () => {
    try {
      const res = await subjectsAPI.list();
      setSubjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await subjectsAPI.update(editingId, data);
        toast.success('Subject updated');
      } else {
        await subjectsAPI.create(data);
        toast.success('Subject created');
      }
      setIsModalOpen(false);
      reset({ color: presetColors[0], priority: 3 });
      setEditingId(null);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will delete all related topics, exams, and sessions.')) return;
    try {
      await subjectsAPI.delete(id);
      toast.success('Subject deleted');
      fetchSubjects();
    } catch (err) {
      toast.error('Failed to delete subject');
    }
  };

  const openEdit = (subject) => {
    setEditingId(subject.id);
    reset({
      name: subject.name,
      color: subject.color,
      priority: subject.priority
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-48"></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 page-enter">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary-dark)]">Subjects</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage your courses and modules</p>
        </div>
        <button 
          onClick={() => { reset({ color: presetColors[0], priority: 3 }); setEditingId(null); setIsModalOpen(true); }} 
          className="btn btn-primary"
        >
          <Plus size={18} /> New Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="empty-state bg-white card rounded-2xl">
          <BookOpen className="mx-auto" />
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mt-4">No subjects yet</h3>
          <p className="mt-2 mb-6">Add your first subject to start planning your studies.</p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">Add Subject</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject.id} className="card rounded-2xl overflow-hidden flex flex-col group">
              <div className="h-3 w-full" style={{ backgroundColor: subject.color }}></div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <Link to={`/subjects/${subject.id}`} className="hover:underline">
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{subject.name}</h3>
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(subject)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(subject.id)} className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2 mb-6">
                   <span className="badge bg-gray-100 text-gray-700">Priority: {subject.priority}/5</span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-[var(--color-border-light)] flex justify-between items-center text-sm text-[var(--color-text-secondary)]">
                   <div className="flex items-center gap-1.5">
                      <Layers size={16} />
                      <span>{subject._count?.topics || 0} Topics</span>
                   </div>
                   <Link to={`/subjects/${subject.id}`} className="text-[var(--color-primary)] font-medium hover:underline">
                     View details →
                   </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">
                {editingId ? 'Edit Subject' : 'New Subject'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">✕</button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input type="text" className="form-input" placeholder="e.g. Mathematics" {...register('name')} />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Theme Color</label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {presetColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full cursor-pointer transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setValue('color', color)}
                    />
                  ))}
                </div>
                <input type="hidden" {...register('color')} />
              </div>

              <div className="form-group">
                <label className="form-label">Priority (1-5)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="5" className="flex-1 accent-[var(--color-primary)]" {...register('priority')} />
                  <span className="font-bold text-lg w-6 text-center">{watch('priority')}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">5 is highest priority for scheduling</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-border-light)]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">{editingId ? 'Save Changes' : 'Create Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
