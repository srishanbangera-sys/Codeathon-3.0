import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { examsAPI, assignmentsAPI, subjectsAPI } from '../api';
import { Plus, Trash2, Calendar, Edit2, FileText, CheckCircle2 } from 'lucide-react';

const examSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required')
});

const assignmentSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  title: z.string().min(1, 'Title is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  estimatedHours: z.coerce.number().min(0.5),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MISSED'])
});

export default function ExamsAssignments() {
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'assignments'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register: registerExam, handleSubmit: handleExamSubmit, reset: resetExam, formState: { errors: examErrors } } = useForm({
    resolver: zodResolver(examSchema)
  });

  const { register: registerAssignment, handleSubmit: handleAssignmentSubmit, reset: resetAssignment, formState: { errors: assignmentErrors } } = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { estimatedHours: 1, status: 'NOT_STARTED' }
  });

  const fetchData = async () => {
    try {
      const [exRes, asRes, subRes] = await Promise.all([
        examsAPI.list(),
        assignmentsAPI.list(),
        subjectsAPI.list()
      ]);
      setExams(exRes.data?.data || []);
      setAssignments(asRes.data?.data || []);
      setSubjects(subRes.data?.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onExamSubmit = async (data) => {
    try {
      if (editingId) {
        await examsAPI.update(editingId, data);
        toast.success('Exam updated');
      } else {
        await examsAPI.create(data);
        toast.success('Exam created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save exam');
    }
  };

  const onAssignmentSubmit = async (data) => {
    try {
      if (editingId) {
        await assignmentsAPI.update(editingId, data);
        toast.success('Assignment updated');
      } else {
        await assignmentsAPI.create(data);
        toast.success('Assignment created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save assignment');
    }
  };

  const deleteItem = async (id, type) => {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      if (type === 'exam') await examsAPI.delete(id);
      else await assignmentsAPI.delete(id);
      toast.success(`${type} deleted`);
      fetchData();
    } catch (err) {
      toast.error(`Failed to delete ${type}`);
    }
  };

  const openModal = (type, item = null) => {
    setEditingId(item?.id || null);
    if (type === 'exam') {
      resetExam({
        subjectId: item?.subjectId || subjects[0]?.id || '',
        title: item?.title || '',
        date: item ? new Date(item.date).toISOString().slice(0, 16) : ''
      });
    } else {
      resetAssignment({
        subjectId: item?.subjectId || subjects[0]?.id || '',
        title: item?.title || '',
        deadline: item ? new Date(item.deadline).toISOString().slice(0, 16) : '',
        estimatedHours: item?.estimatedHours || 1,
        status: item?.status || 'NOT_STARTED'
      });
    }
    setActiveTab(type === 'exam' ? 'exams' : 'assignments');
    setIsModalOpen(true);
  };

  if (loading) return <div className="skeleton h-64 rounded-2xl max-w-7xl mx-auto"></div>;

  return (
    <div className="space-y-6 page-enter max-w-[1400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#051c24] tracking-tight">Exams & Tasks</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your important dates</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => openModal('exam')} className="px-5 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2">
             <Plus size={18} strokeWidth={2.5} /> Exam
           </button>
           <button onClick={() => openModal('assignment')} className="bg-[#2dc1c1] hover:bg-[#1b8c8c] text-white font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors shadow-sm">
             <Plus size={18} strokeWidth={2.5} /> Task
           </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 gap-6 mt-8">
        <button 
          className={`pb-4 font-bold text-sm transition-colors border-b-2 relative ${activeTab === 'exams' ? 'border-[#2dc1c1] text-[#051c24]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          onClick={() => setActiveTab('exams')}
        >
          Exams <span className="ml-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">{exams.length}</span>
        </button>
        <button 
          className={`pb-4 font-bold text-sm transition-colors border-b-2 relative ${activeTab === 'assignments' ? 'border-[#2dc1c1] text-[#051c24]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          onClick={() => setActiveTab('assignments')}
        >
          Tasks <span className="ml-1.5 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">{assignments.length}</span>
        </button>
      </div>

      {activeTab === 'exams' && (
        <div className="space-y-4 pt-4">
          {exams.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                 <Calendar size={32} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-[#051c24]">No exams scheduled</h3>
              <p className="text-gray-500 font-medium mt-2">Add your upcoming exams to start planning your studies.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map(exam => {
                const daysUntil = Math.max(0, Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24)));
                return (
                  <div key={exam.id} className="bg-white rounded-3xl p-6 relative overflow-hidden group border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: exam.subject.color }}></div>
                    <div className="flex justify-between items-start mb-4">
                       <div className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 uppercase tracking-wide border border-gray-100" style={{ color: exam.subject.color }}>
                         {exam.subject.name}
                       </div>
                       <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('exam', exam)} className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#2dc1c1] hover:bg-teal-50 transition-colors"><Edit2 size={12} strokeWidth={2.5}/></button>
                          <button onClick={() => deleteItem(exam.id, 'exam')} className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={12} strokeWidth={2.5}/></button>
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#051c24] mb-6">{exam.title}</h3>
                    <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                       <div>
                         <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date & Time</div>
                         <div className="font-semibold text-sm text-[#051c24]">{new Date(exam.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                       </div>
                       {daysUntil > 0 ? (
                          <div className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${daysUntil <= 7 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                            {daysUntil} days left
                          </div>
                       ) : (
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">Past</div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-4 pt-4">
          {assignments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
                 <FileText size={32} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-[#051c24]">No tasks</h3>
              <p className="text-gray-500 font-medium mt-2">Add your upcoming assignments and tasks.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm divide-y divide-gray-100">
              {assignments.map(assignment => (
                <div key={assignment.id} className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: assignment.subject.color }}></div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{assignment.subject.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className={`text-lg font-bold truncate ${assignment.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-[#051c24]'}`}>
                        {assignment.title}
                      </h3>
                      {assignment.status === 'COMPLETED' && <CheckCircle2 size={16} strokeWidth={3} className="text-emerald-500" />}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-1.5">
                        <Calendar size={12} strokeWidth={2.5}/> Due: {new Date(assignment.deadline).toLocaleDateString()}
                      </span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">
                        ⏱ {assignment.estimatedHours} hrs
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg ${
                        assignment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                        assignment.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' :
                        assignment.status === 'MISSED' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {assignment.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal('assignment', assignment)} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors">Edit</button>
                    <button onClick={() => deleteItem(assignment.id, 'assignment')} className="px-4 py-2 rounded-xl border border-red-100 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#051c24]">
                {editingId ? `Edit ${activeTab === 'exams' ? 'Exam' : 'Task'}` : `New ${activeTab === 'exams' ? 'Exam' : 'Task'}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors">✕</button>
            </div>
            
            {activeTab === 'exams' ? (
              <form onSubmit={handleExamSubmit(onExamSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#051c24] mb-2">Subject</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dc1c1]/20 focus:border-[#2dc1c1] transition-all" {...registerExam('subjectId')}>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {examErrors.subjectId && <p className="text-red-500 text-xs font-bold mt-1.5">{examErrors.subjectId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#051c24] mb-2">Exam Title</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dc1c1]/20 focus:border-[#2dc1c1] transition-all" placeholder="e.g. Midterm 1" {...registerExam('title')} />
                  {examErrors.title && <p className="text-red-500 text-xs font-bold mt-1.5">{examErrors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#051c24] mb-2">Date & Time</label>
                  <input type="datetime-local" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dc1c1]/20 focus:border-[#2dc1c1] transition-all" {...registerExam('date')} />
                  {examErrors.date && <p className="text-red-500 text-xs font-bold mt-1.5">{examErrors.date.message}</p>}
                </div>
                <div className="flex gap-3 pt-6 mt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-[#2dc1c1] text-white font-bold hover:bg-[#1b8c8c] transition-colors">Save</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAssignmentSubmit(onAssignmentSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#051c24] mb-2">Subject</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dc1c1]/20 focus:border-[#2dc1c1] transition-all" {...registerAssignment('subjectId')}>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#051c24] mb-2">Task Title</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dc1c1]/20 focus:border-[#2dc1c1] transition-all" placeholder="e.g. Essay Draft" {...registerAssignment('title')} />
                  {assignmentErrors.title && <p className="text-red-500 text-xs font-bold mt-1.5">{assignmentErrors.title.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#051c24] mb-2">Deadline</label>
                    <input type="datetime-local" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dc1c1]/20 focus:border-[#2dc1c1] transition-all" {...registerAssignment('deadline')} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#051c24] mb-2">Est. Hours</label>
                    <input type="number" step="0.5" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dc1c1]/20 focus:border-[#2dc1c1] transition-all" {...registerAssignment('estimatedHours')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#051c24] mb-2">Status</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2dc1c1]/20 focus:border-[#2dc1c1] transition-all" {...registerAssignment('status')}>
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-6 mt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-[#2dc1c1] text-white font-bold hover:bg-[#1b8c8c] transition-colors">Save</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
