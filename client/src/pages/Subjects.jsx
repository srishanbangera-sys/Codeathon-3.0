import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { subjectsAPI } from '../api';
import { Plus, MoreVertical, Trash2, Edit2, BookOpen, Layers, ArrowRight } from 'lucide-react';

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
      setSubjects(res.data?.data || []);
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
    <div className="space-y-8 page-enter max-w-[1400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#051c24] tracking-tight">Subjects</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your courses and modules</p>
        </div>
        <button 
          onClick={() => { reset({ color: presetColors[0], priority: 3 }); setEditingId(null); setIsModalOpen(true); }} 
          className="bg-[#2dc1c1] hover:bg-[#1b8c8c] text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} strokeWidth={2.5} /> New Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-teal-50 text-[#2dc1c1] rounded-2xl flex items-center justify-center mb-4">
             <BookOpen size={32} strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold text-[#051c24]">No subjects yet</h3>
          <p className="text-gray-500 font-medium mt-2 mb-8 max-w-sm">Add your first subject to start planning your studies and tracking your progress.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#2dc1c1] hover:bg-[#1b8c8c] text-white font-bold px-6 py-3 rounded-full transition-colors">
             Add Subject
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject.id} className="bg-white rounded-3xl overflow-hidden flex flex-col group border border-gray-100 shadow-sm hover:shadow-md transition-all relative">
              <div className="absolute top-0 left-0 h-2 w-full" style={{ backgroundColor: subject.color }}></div>
              <div className="p-6 pt-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <Link to={`/subjects/${subject.id}`} className="hover:opacity-80 transition-opacity">
                    <h3 className="text-xl font-bold text-[#051c24]">{subject.name}</h3>
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(subject)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#2dc1c1] hover:bg-teal-50 transition-colors">
                      <Edit2 size={14} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => handleDelete(subject.id)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2 mb-8">
                   <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-[11px] font-bold tracking-wide uppercase border border-gray-100">
                     Priority: {subject.priority}/5
                   </span>
                </div>
                
                <div className="mt-auto pt-5 border-t border-gray-100 flex justify-between items-center text-sm">
                   <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                      <Layers size={16} />
                      <span>{subject._count?.topics || 0} Topics</span>
                   </div>
                   <Link to={`/subjects/${subject.id}`} className="text-[#2dc1c1] font-bold hover:underline flex items-center gap-1">
                     Details <ArrowRight size={14} />
                   </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#051c24]">
                {editingId ? 'Edit Subject' : 'New Subject'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors">
                 ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#051c24] mb-2">Subject Name</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dc1c1]/20 focus:border-[#2dc1c1] transition-all" placeholder="e.g. Mathematics" {...register('name')} />
                {errors.name && <p className="text-red-500 text-xs font-bold mt-1.5">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#051c24] mb-2">Theme Color</label>
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

              <div>
                <label className="block text-sm font-bold text-[#051c24] mb-2">Priority (1-5)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="5" className="flex-1 accent-[#2dc1c1]" {...register('priority')} />
                  <span className="font-bold text-lg w-6 text-center text-[#051c24]">{watch('priority')}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1">5 is highest priority for scheduling</p>
              </div>

              <div className="flex gap-3 pt-6 mt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-[#2dc1c1] text-white font-bold hover:bg-[#1b8c8c] transition-colors">{editingId ? 'Save Changes' : 'Create Subject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
