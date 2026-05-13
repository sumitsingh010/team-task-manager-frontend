import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import Modal from '../components/Modal';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Plus,
  UserPlus,
  UserMinus,
  Users,
  CheckSquare,
  Loader2,
  FolderKanban,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  // Modals
  const [showEdit, setShowEdit] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Forms
  const [editForm, setEditForm] = useState({ title: '', description: '', status: '' });
  const [memberUserId, setMemberUserId] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.data.project);
      setTasks(res.data.data.tasks);
      setEditForm({
        title: res.data.data.project.title,
        description: res.data.data.project.description || '',
        status: res.data.data.project.status,
      });
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
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
    fetchProject();
    fetchUsers();
  }, [id]);

  // Edit project
  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/projects/${id}`, editForm);
      toast.success('Project updated');
      setShowEdit(false);
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete project
  const handleDelete = async () => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  // Add member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberUserId) {
      toast.error('Select a user');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/projects/${id}/members`, { userId: memberUserId });
      toast.success('Member added');
      setShowAddMember(false);
      setMemberUserId('');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  // Remove member
  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // Create task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.assignedTo || !taskForm.dueDate) {
      toast.error('Title, assignee, and due date are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/tasks', { ...taskForm, projectId: id });
      toast.success('Task created');
      setShowCreateTask(false);
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
      });
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  // Update task status
  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success('Status updated');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return null;

  const statusBadge = {
    active: 'badge-active',
    completed: 'badge-completed',
    archived: 'badge-archived',
  };

  // Users not already in the project
  const availableUsers = allUsers.filter(
    (u) => !project.members?.some((m) => m._id === u._id)
  );

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Back button + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/projects')}
          className="btn-ghost p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-bold text-dark-100">
              {project.title}
            </h1>
            <span className={statusBadge[project.status]}>{project.status}</span>
          </div>
          {project.description && (
            <p className="text-dark-400 mt-1">{project.description}</p>
          )}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="btn-ghost p-2"
              title="Edit project"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="btn-ghost p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              title="Delete project"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Members Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-dark-400" />
            <h2 className="text-lg font-semibold text-dark-100">
              Team Members
            </h2>
            <span className="text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded-lg">
              {project.members?.length || 0}
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddMember(true)}
              className="btn-ghost text-primary-400 hover:text-primary-300 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm">Add</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {project.members?.map((member) => (
            <div
              key={member._id}
              className="flex items-center gap-2 bg-dark-800/50 border border-dark-700 rounded-xl px-3 py-2 group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {member.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-sm text-dark-200">{member.name}</span>
                <span className="text-xs text-dark-500 ml-1.5 capitalize">
                  ({member.role})
                </span>
              </div>
              {isAdmin &&
                member._id !== project.createdBy?._id && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="ml-1 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-400 transition-all"
                    title="Remove member"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-dark-400" />
            <h2 className="text-lg font-semibold text-dark-100">Tasks</h2>
            <span className="text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded-lg">
              {tasks.length}
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateTask(true)}
              className="btn-primary flex items-center gap-2 text-sm py-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>

        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tasks.map((task) => (
              <div key={task._id} className="relative group">
                <TaskCard
                  task={task}
                  onStatusChange={handleStatusChange}
                  isAdmin={isAdmin}
                  showProject={false}
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
          <div className="text-center py-12">
            <FolderKanban className="w-12 h-12 text-dark-700 mx-auto mb-3" />
            <p className="text-dark-400">No tasks in this project</p>
            {isAdmin && (
              <p className="text-dark-500 text-sm mt-1">
                Click "Add Task" to create one
              </p>
            )}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Project"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Status
            </label>
            <select
              value={editForm.status}
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value })
              }
              className="select-field"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Team Member"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Select User
            </label>
            {availableUsers.length > 0 ? (
              <select
                value={memberUserId}
                onChange={(e) => setMemberUserId(e.target.value)}
                className="select-field"
              >
                <option value="">Choose a user...</option>
                {availableUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email}) — {u.role}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-dark-400 text-sm">
                All users are already members of this project.
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddMember(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !availableUsers.length}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
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
              >
                <option value="">Select member...</option>
                {project.members?.map((m) => (
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
              onClick={() => setShowCreateTask(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
