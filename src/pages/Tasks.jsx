import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import Modal from '../components/Modal';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Filter,
  Plus,
  CheckSquare,
  Loader2,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [overdueFilter, setOverdueFilter] = useState(false);

  // Create task modal
  const [showCreate, setShowCreate] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    projectId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (projectFilter) params.projectId = projectFilter;
      if (overdueFilter) params.overdue = 'true';

      const res = await api.get('/tasks', { params });
      setTasks(res.data.data.tasks);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data.projects);
    } catch {
      // silently fail
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/users');
      setAllUsers(res.data.data.users);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, projectFilter, overdueFilter]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success('Task status updated');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (
      !taskForm.title.trim() ||
      !taskForm.assignedTo ||
      !taskForm.dueDate ||
      !taskForm.projectId
    ) {
      toast.error('Title, project, assignee, and due date are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/tasks', taskForm);
      toast.success('Task created!');
      setShowCreate(false);
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
        projectId: '',
      });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  // Get members of selected project for the create form
  const selectedProject = projects.find((p) => p._id === taskForm.projectId);
  const projectMembers = selectedProject?.members || [];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-100">
            Tasks
          </h1>
          <p className="text-dark-400 mt-1">
            {isAdmin ? 'Manage all team tasks' : 'Your assigned tasks'}
          </p>
        </div>
        {isAdmin && (
          <button
            id="create-task-btn"
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              id="task-search"
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11 py-2.5 text-sm"
            />
          </div>

          {/* Status */}
          <select
            id="task-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field py-2.5 text-sm"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority */}
          <select
            id="task-priority-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="select-field py-2.5 text-sm"
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Project */}
          <select
            id="task-project-filter"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="select-field py-2.5 text-sm"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Overdue toggle */}
          <button
            id="task-overdue-filter"
            onClick={() => setOverdueFilter(!overdueFilter)}
            className={`flex items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all ${
              overdueFilter
                ? 'bg-red-500/15 border-red-500/30 text-red-400'
                : 'bg-dark-800/50 border-dark-700 text-dark-400 hover:text-dark-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Overdue Only
          </button>
        </div>
      </div>

      {/* Task count */}
      <div className="flex items-center gap-2 text-sm text-dark-400">
        <CheckSquare className="w-4 h-4" />
        <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</span>
      </div>

      {/* Tasks Grid */}
      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task, index) => (
            <div
              key={task._id}
              className={`relative group animate-slide-in stagger-${Math.min(index + 1, 5)}`}
              style={{ opacity: 0 }}
            >
              <TaskCard
                task={task}
                onStatusChange={handleStatusChange}
                isAdmin={isAdmin}
              />
              {isAdmin && (
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400 transition-all z-10"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <CheckSquare className="w-16 h-16 text-dark-700 mx-auto mb-4" />
          <h3 className="text-dark-300 text-lg font-medium mb-2">
            No tasks found
          </h3>
          <p className="text-dark-500 text-sm">
            {overdueFilter
              ? 'No overdue tasks — great job!'
              : isAdmin
              ? 'Create a task to get started'
              : 'No tasks have been assigned to you yet'}
          </p>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Task"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Project *
            </label>
            <select
              value={taskForm.projectId}
              onChange={(e) =>
                setTaskForm({
                  ...taskForm,
                  projectId: e.target.value,
                  assignedTo: '',
                })
              }
              className="select-field"
            >
              <option value="">Select project...</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              placeholder="Task title"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Description
            </label>
            <textarea
              placeholder="Task description"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Assign To *
              </label>
              <select
                value={taskForm.assignedTo}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, assignedTo: e.target.value })
                }
                className="select-field"
                disabled={!taskForm.projectId}
              >
                <option value="">
                  {taskForm.projectId
                    ? 'Select member...'
                    : 'Select project first'}
                </option>
                {projectMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
                className="select-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) =>
                setTaskForm({ ...taskForm, dueDate: e.target.value })
              }
              className="input-field"
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
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
