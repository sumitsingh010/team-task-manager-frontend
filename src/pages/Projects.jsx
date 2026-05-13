import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Plus,
  Search,
  FolderKanban,
  Users,
  CheckSquare,
  Filter,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/projects', { params });
      setProjects(res.data.data.projects);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      toast.error('Project title is required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/projects', createForm);
      toast.success('Project created!');
      setShowCreate(false);
      setCreateForm({ title: '', description: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      active: 'badge-active',
      completed: 'badge-completed',
      archived: 'badge-archived',
    };
    return map[status] || 'badge-archived';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-100">
            Projects
          </h1>
          <p className="text-dark-400 mt-1">
            {isAdmin ? 'Manage your team projects' : 'Your assigned projects'}
          </p>
        </div>
        {isAdmin && (
          <button
            id="create-project-btn"
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            id="project-search"
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <select
            id="project-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field pl-11 pr-8 min-w-[160px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className={`card-hover group animate-slide-in stagger-${Math.min(index + 1, 5)}`}
              style={{ opacity: 0 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-primary-500/15 text-primary-400 group-hover:bg-primary-500/25 transition-colors">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <span className={statusBadge(project.status)}>
                  {project.status}
                </span>
              </div>

              <h3 className="text-dark-100 font-semibold text-lg mb-1 group-hover:text-primary-300 transition-colors">
                {project.title}
              </h3>
              {project.description && (
                <p className="text-dark-400 text-sm line-clamp-2 mb-4">
                  {project.description}
                </p>
              )}

              <div className="flex items-center gap-4 pt-3 border-t border-dark-800 text-sm text-dark-400">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {project.members?.length || 0} members
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  {project.completedCount || 0}/{project.taskCount || 0} tasks
                </span>
              </div>

              {/* Progress bar */}
              {project.taskCount > 0 && (
                <div className="mt-3 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(project.completedCount / project.taskCount) * 100}%`,
                    }}
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <FolderKanban className="w-16 h-16 text-dark-700 mx-auto mb-4" />
          <h3 className="text-dark-300 text-lg font-medium mb-2">
            No projects found
          </h3>
          <p className="text-dark-500 text-sm">
            {isAdmin
              ? 'Create your first project to get started'
              : 'You haven\'t been added to any projects yet'}
          </p>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Project Title *
            </label>
            <input
              id="project-title-input"
              type="text"
              placeholder="Enter project title"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm({ ...createForm, title: e.target.value })
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Description
            </label>
            <textarea
              id="project-desc-input"
              placeholder="Enter project description"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm({ ...createForm, description: e.target.value })
              }
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              id="project-create-submit"
              type="submit"
              disabled={creating}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
