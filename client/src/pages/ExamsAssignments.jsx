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
      setExams(exRes.data.data);
      setAssignments(asRes.data.data);
      setSubjects(subRes.data.data);
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
    <div className="space-y-6 page-enter">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary-dark)]">Exams & Tasks</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage your important dates</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => openModal('exam')} className="btn btn-outline">
             <Plus size={18} /> Exam
           </button>
           <button onClick={() => openModal('assignment')} className="btn btn-primary">
             <Plus size={18} /> Assignment
           </button>
        </div>
      </div>

      <div className="flex border-b border-[var(--color-border)]">
        <button 
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'exams' ? 'border-[var(--color-primary)] text-[var(--color-primary-dark)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          onClick={() => setActiveTab('exams')}
        >
          Exams ({exams.length})
        </button>
        <button 
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'assignments' ? 'border-[var(--color-primary)] text-[var(--color-primary-dark)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments ({assignments.length})
        </button>
      </div>

      {activeTab === 'exams' && (
        <div className="space-y-4">
          {exams.length === 0 ? (
            <div className="empty-state bg-white card rounded-2xl">
              <Calendar className="mx-auto" />
              <p className="mt-4">No exams scheduled.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map(exam => {
                const daysUntil = Math.max(0, Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24)));
                return (
                  <div key={exam.id} className="card p-5 relative overflow-hidden group border border-[var(--color-border-light)]">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: exam.subject.color }}></div>
                    <div className="flex justify-between items-start mb-2">
                       <div className="text-xs font-bold px-2 py-1 rounded bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] uppercase tracking-wider" style={{ color: exam.subject.color }}>
                         {exam.subject.name}
                       </div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal('exam', exam)} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"><Edit2 size={14}/></button>
                          <button onClick={() => deleteItem(exam.id, 'exam')} className="text-[var(--color-text-muted)] hover:text-red-500"><Trash2 size={14}/></button>
                       </div>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">{exam.title}</h3>
                    <div className="flex justify-between items-end border-t border-[var(--color-border-light)] pt-3">
                       <div>
                         <div className="text-xs text-[var(--color-text-muted)]">Date</div>
                         <div className="font-medium text-sm">{new Date(exam.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                       </div>
                       {daysUntil > 0 ? (
                          <div className={`text-xs font-bold px-2 py-1 rounded ${daysUntil <= 7 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                            {daysUntil} days left
                          </div>
                       ) : (
                          <div className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600">Past</div>
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
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="empty-state bg-white card rounded-2xl">
              <FileText className="mx-auto" />
              <p className="mt-4">No assignments.</p>
            </div>
          ) : (
            <div className="card rounded-2xl overflow-hidden divide-y divide-[var(--color-border-light)]">
              {assignments.map(assignment => (
                <div key={assignment.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--color-surface-secondary)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: assignment.subject.color }}></div>
                      <span className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">{assignment.subject.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <h3 className={`text-lg font-bold truncate ${assignment.status === 'COMPLETED' ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-primary)]'}`}>
                        {assignment.title}
                      </h3>
                      {assignment.status === 'COMPLETED' && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                    <div className="flex gap-3 mt-2 text-sm text-[var(--color-text-secondary)]">
                      <span>⏳ Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                      <span>⏱ {assignment.estimatedHours} hrs</span>
                      <span className={`badge badge-${assignment.status.toLowerCase().replace('_', '-')}`}>{assignment.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => openModal('assignment', assignment)} className="btn btn-outline btn-sm">Edit</button>
                    <button onClick={() => deleteItem(assignment.id, 'assignment')} className="btn btn-outline btn-sm text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">
                {editingId ? `Edit ${activeTab === 'exams' ? 'Exam' : 'Assignment'}` : `New ${activeTab === 'exams' ? 'Exam' : 'Assignment'}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">✕</button>
            </div>
            
            {activeTab === 'exams' ? (
              <form onSubmit={handleExamSubmit(onExamSubmit)} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-input" {...registerExam('subjectId')}>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {examErrors.subjectId && <p className="form-error">{examErrors.subjectId.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Exam Title</label>
                  <input type="text" className="form-input" placeholder="e.g. Midterm 1" {...registerExam('title')} />
                  {examErrors.title && <p className="form-error">{examErrors.title.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date & Time</label>
                  <input type="datetime-local" className="form-input" {...registerExam('date')} />
                  {examErrors.date && <p className="form-error">{examErrors.date.message}</p>}
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline flex-1">Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1">Save</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAssignmentSubmit(onAssignmentSubmit)} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-input" {...registerAssignment('subjectId')}>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assignment Title</label>
                  <input type="text" className="form-input" placeholder="e.g. Essay Draft" {...registerAssignment('title')} />
                  {assignmentErrors.title && <p className="form-error">{assignmentErrors.title.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input type="datetime-local" className="form-input" {...registerAssignment('deadline')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Est. Hours</label>
                    <input type="number" step="0.5" className="form-input" {...registerAssignment('estimatedHours')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" {...registerAssignment('status')}>
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline flex-1">Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1">Save</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
