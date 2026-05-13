import { Calendar, User, Flag, AlertTriangle } from 'lucide-react';

export default function TaskCard({ task, onStatusChange, isAdmin, showProject = true }) {
  const statusLabels = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'completed': 'Completed',
  };

  const statusBadges = {
    'todo': 'badge-todo',
    'in-progress': 'badge-in-progress',
    'completed': 'badge-completed',
  };

  const priorityBadges = {
    'low': 'badge-low',
    'medium': 'badge-medium',
    'high': 'badge-high',
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`card-hover group relative ${
        isOverdue ? 'border-red-500/30 bg-red-500/5' : ''
      }`}
    >
      {/* Overdue indicator */}
      {isOverdue && (
        <div className="absolute top-3 right-3">
          <span className="badge-overdue">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Overdue
          </span>
        </div>
      )}

      {/* Title & Description */}
      <div className="mb-4">
        <h3 className="text-dark-100 font-semibold text-base mb-1 pr-20">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-dark-400 text-sm line-clamp-2">{task.description}</p>
        )}
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className={statusBadges[task.status]}>
          {statusLabels[task.status]}
        </span>
        <span className={priorityBadges[task.priority]}>
          <Flag className="w-3 h-3 mr-1" />
          {task.priority}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-dark-800">
        <div className="flex items-center gap-4 text-sm text-dark-400">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            {task.assignedTo?.name || 'Unassigned'}
          </span>
          <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : ''}`}>
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(task.dueDate)}
          </span>
        </div>

        {/* Status change */}
        {onStatusChange && (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="text-xs bg-dark-800 border border-dark-700 rounded-lg px-2 py-1.5 text-dark-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        )}
      </div>

      {/* Project tag */}
      {showProject && task.projectId?.title && (
        <div className="mt-3 pt-3 border-t border-dark-800/50">
          <span className="text-xs text-dark-500">
            Project: <span className="text-dark-400">{task.projectId.title}</span>
          </span>
        </div>
      )}
    </div>
  );
}
