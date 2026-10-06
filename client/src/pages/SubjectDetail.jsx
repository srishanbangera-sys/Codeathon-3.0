import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { subjectsAPI, topicsAPI, resourcesAPI } from '../api';
import { ArrowLeft, Plus, Edit2, Trash2, CheckCircle2, Bookmark, Link as LinkIcon, ExternalLink } from 'lucide-react';

const topicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  difficulty: z.coerce.number().int().min(1).max(5),
  estimatedHours: z.coerce.number().min(0.5),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MISSED']),
  notes: z.string().optional().nullable()
});

const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Invalid URL'),
  type: z.enum(['ARTICLE', 'VIDEO', 'PDF', 'OTHER']),
  topicId: z.string().optional().nullable()
});

export default function SubjectDetail() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('topics');
  
  // Topic Modal state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  
  // Resource Modal state
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  
  const { register: registerTopic, handleSubmit: handleTopicSubmit, reset: resetTopic, formState: { errors: topicErrors }, watch: watchTopic } = useForm({
    resolver: zodResolver(topicSchema),
    defaultValues: { difficulty: 3, estimatedHours: 1, status: 'NOT_STARTED' }
  });

  const { register: registerResource, handleSubmit: handleResourceSubmit, reset: resetResource, formState: { errors: resourceErrors } } = useForm({
    resolver: zodResolver(resourceSchema),
    defaultValues: { type: 'OTHER' }
  });

  const fetchSubject = async () => {
    try {
      const res = await subjectsAPI.get(id);
      setSubject(res.data.data);
    } catch (err) {
      toast.error('Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubject();
  }, [id]);

  // Topic Handlers
  const onTopicSubmit = async (data) => {
    try {
      if (editingTopicId) {
        await topicsAPI.update(editingTopicId, data);
        toast.success('Topic updated');
      } else {
        await topicsAPI.create({ ...data, subjectId: id });
        toast.success('Topic created');
      }
      setIsTopicModalOpen(false);
      resetTopic({ difficulty: 3, estimatedHours: 1, status: 'NOT_STARTED' });
      setEditingTopicId(null);
      fetchSubject();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Action failed');
    }
  };

  const deleteTopic = async (topicId) => {
    if (!confirm('Delete this topic?')) return;
    try {
      await topicsAPI.delete(topicId);
      toast.success('Topic deleted');
      fetchSubject();
    } catch (err) {
      toast.error('Failed to delete topic');
    }
  };

  const openTopicEdit = (topic) => {
    setEditingTopicId(topic.id);
    resetTopic({
      title: topic.title,
      difficulty: topic.difficulty,
      estimatedHours: topic.estimatedHours,
      status: topic.status,
      notes: topic.notes || ''
    });
    setIsTopicModalOpen(true);
  };

  // Resource Handlers
  const onResourceSubmit = async (data) => {
    try {
      await resourcesAPI.create({ ...data, subjectId: id });
      toast.success('Resource added');
      setIsResourceModalOpen(false);
      resetResource({ type: 'OTHER' });
      fetchSubject();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to add resource');
    }
  };

  const deleteResource = async (resourceId) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await resourcesAPI.delete(resourceId);
      toast.success('Resource deleted');
      fetchSubject();
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  if (loading) return <div className="skeleton h-64 rounded-2xl max-w-7xl mx-auto"></div>;
  if (!subject) return <div>Subject not found</div>;

  const completedTopics = subject.topics.filter(t => t.status === 'COMPLETED').length;
  const progress = subject.topics.length > 0 ? Math.round((completedTopics / subject.topics.length) * 100) : 0;

  return (
    <div className="space-y-6 page-enter">
      <Link to="/subjects" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
        <ArrowLeft size={16} /> Back to Subjects
      </Link>

      {/* Header Card */}
      <div className="card overflow-hidden">
        <div className="h-4 w-full" style={{ backgroundColor: subject.color }}></div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">{subject.name}</h1>
            <div className="flex gap-4 text-sm text-[var(--color-text-secondary)]">
              <span className="badge bg-gray-100 text-gray-700">Priority: {subject.priority}/5</span>
              <span>{subject.topics.length} Topics</span>
              <span>{subject.resources.length} Resources</span>
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Progress</span>
              <span style={{ color: subject.color }}>{progress}%</span>
            </div>
            <div className="w-full bg-[var(--color-border-light)] rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%`, backgroundColor: subject.color }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        <button 
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'topics' ? 'border-[var(--color-primary)] text-[var(--color-primary-dark)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          onClick={() => setActiveTab('topics')}
        >
          Topics
        </button>
        <button 
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'resources' ? 'border-[var(--color-primary)] text-[var(--color-primary-dark)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </button>
      </div>

      {/* Tab Content: Topics */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">Topics & Modules</h2>
            <button 
              onClick={() => { resetTopic(); setEditingTopicId(null); setIsTopicModalOpen(true); }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} /> Add Topic
            </button>
          </div>

          {subject.topics.length === 0 ? (
            <div className="empty-state bg-white card rounded-2xl">
              <p>No topics added yet.</p>
              <button onClick={() => setIsTopicModalOpen(true)} className="btn btn-outline btn-sm mt-4">Create your first topic</button>
            </div>
          ) : (
            <div className="card rounded-2xl overflow-hidden divide-y divide-[var(--color-border-light)]">
              {subject.topics.map(topic => (
                <div key={topic.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--color-surface-secondary)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-lg font-semibold truncate ${topic.status === 'COMPLETED' ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-primary)]'}`}>
                        {topic.title}
                      </h3>
                      {topic.status === 'COMPLETED' && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                       <span className={`badge badge-${topic.status.toLowerCase().replace('_', '-')}`}>{topic.status.replace('_', ' ')}</span>
                       <span className="text-[var(--color-text-secondary)]">⏱ {topic.estimatedHours} hrs</span>
                       <span className="text-[var(--color-text-secondary)]">💪 Difficulty: {topic.difficulty}/5</span>
                    </div>
                    {topic.notes && <p className="text-sm text-[var(--color-text-secondary)] mt-2 line-clamp-2">{topic.notes}</p>}
                  </div>
                  
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <button onClick={() => openTopicEdit(topic)} className="btn btn-outline btn-sm h-8 w-full sm:w-auto">Edit</button>
                    <button onClick={() => deleteTopic(topic.id)} className="btn btn-sm h-8 w-full sm:w-auto text-red-600 bg-red-50 hover:bg-red-100">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">Saved Resources</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Links, videos, and PDFs (compatible with browser extension)</p>
            </div>
            <button 
              onClick={() => { resetResource(); setIsResourceModalOpen(true); }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} /> Add Resource
            </button>
          </div>

          {subject.resources.length === 0 ? (
            <div className="empty-state bg-white card rounded-2xl">
              <Bookmark className="mx-auto" />
              <p className="mt-4">No resources saved for this subject.</p>
              <button onClick={() => setIsResourceModalOpen(true)} className="btn btn-outline btn-sm mt-4">Add a link</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {subject.resources.map(resource => (
                <div key={resource.id} className="card p-4 flex gap-4 items-start group">
                  <div className="p-3 bg-[var(--color-surface-secondary)] rounded-xl text-[var(--color-primary)]">
                    {resource.type === 'VIDEO' ? <div className="w-5 h-5 bg-red-500 rounded text-white flex items-center justify-center text-xs font-bold">V</div> 
                     : resource.type === 'PDF' ? <div className="w-5 h-5 bg-orange-500 rounded text-white flex items-center justify-center text-xs font-bold">P</div>
                     : <LinkIcon size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] flex items-center gap-1 truncate transition-colors">
                      {resource.title} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100" />
                    </a>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1 truncate">{resource.url}</div>
                    {resource.topicId && (
                      <div className="mt-2 text-xs bg-[var(--color-surface-hover)] inline-block px-2 py-1 rounded">
                        Topic: {subject.topics.find(t => t.id === resource.topicId)?.title || 'Unknown'}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteResource(resource.id)} className="text-[var(--color-text-muted)] hover:text-red-500 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Topic Modal */}
      {isTopicModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">
                {editingTopicId ? 'Edit Topic' : 'New Topic'}
              </h2>
              <button onClick={() => setIsTopicModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">✕</button>
            </div>
            
            <form onSubmit={handleTopicSubmit(onTopicSubmit)} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" {...registerTopic('title')} />
                {topicErrors.title && <p className="form-error">{topicErrors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Estimated Hours</label>
                  <input type="number" step="0.5" className="form-input" {...registerTopic('estimatedHours')} />
                  {topicErrors.estimatedHours && <p className="form-error">{topicErrors.estimatedHours.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" {...registerTopic('status')}>
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="MISSED">Missed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty (1-5)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="5" className="flex-1 accent-[var(--color-primary)]" {...registerTopic('difficulty')} />
                  <span className="font-bold text-lg w-6 text-center">{watchTopic('difficulty')}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea className="form-input" rows="3" {...registerTopic('notes')}></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-border-light)]">
                <button type="button" onClick={() => setIsTopicModalOpen(false)} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save Topic</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {isResourceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">Add Resource</h2>
              <button onClick={() => setIsResourceModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">✕</button>
            </div>
            
            <form onSubmit={handleResourceSubmit(onResourceSubmit)} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" {...registerResource('title')} />
                {resourceErrors.title && <p className="form-error">{resourceErrors.title.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">URL</label>
                <input type="url" className="form-input" placeholder="https://..." {...registerResource('url')} />
                {resourceErrors.url && <p className="form-error">{resourceErrors.url.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" {...registerResource('type')}>
                    <option value="ARTICLE">Article</option>
                    <option value="VIDEO">Video</option>
                    <option value="PDF">PDF</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Related Topic (Optional)</label>
                  <select className="form-input" {...registerResource('topicId')}>
                    <option value="">-- None --</option>
                    {subject.topics.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--color-border-light)]">
                <button type="button" onClick={() => setIsResourceModalOpen(false)} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Add Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
