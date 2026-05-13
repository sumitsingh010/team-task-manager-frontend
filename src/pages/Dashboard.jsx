import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import StatsCard from '../components/StatsCard';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      toast.success('Task status updated');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark-100">
          Welcome back,{' '}
          <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-dark-400 mt-1">
          Here's an overview of your {isAdmin ? 'team\'s' : ''} progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={FolderKanban}
          label="Total Projects"
          value={data?.projects?.total || 0}
          color="primary"
        />
        <StatsCard
          icon={CheckSquare}
          label="Total Tasks"
          value={data?.tasks?.total || 0}
          color="blue"
        />
        <StatsCard
          icon={TrendingUp}
          label="Completed"
          value={data?.tasks?.completed || 0}
          color="emerald"
        />
        <StatsCard
          icon={AlertTriangle}
          label="Overdue"
          value={data?.tasks?.overdue || 0}
          color="red"
        />
      </div>

      {/* Task Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status distribution */}
        <div className="card lg:col-span-1">
          <h2 className="text-lg font-semibold text-dark-100 mb-5">
            Task Status
          </h2>
          <div className="space-y-4">
            {[
              {
                label: 'To Do',
                value: data?.tasks?.todo || 0,
                total: data?.tasks?.total || 1,
                color: 'bg-amber-500',
              },
              {
                label: 'In Progress',
                value: data?.tasks?.inProgress || 0,
                total: data?.tasks?.total || 1,
                color: 'bg-purple-500',
              },
              {
                label: 'Completed',
                value: data?.tasks?.completed || 0,
                total: data?.tasks?.total || 1,
                color: 'bg-emerald-500',
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-dark-300">{item.label}</span>
                  <span className="text-sm font-semibold text-dark-200">
                    {item.value}
                  </span>
                </div>
                <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`}
                    style={{
                      width: `${
                        item.total > 0
                          ? (item.value / item.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Extra stats */}
          <div className="mt-6 pt-5 border-t border-dark-800 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-dark-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-dark-400">High Priority</span>
              </div>
              <p className="text-lg font-bold text-dark-100">
                {data?.tasks?.highPriority || 0}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-dark-800/50">
              <div className="flex items-center gap-2 mb-1">
                <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-dark-400">Active Projects</span>
              </div>
              <p className="text-lg font-bold text-dark-100">
                {data?.projects?.active || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark-100">
              Recent Tasks
            </h2>
            <span className="text-xs text-dark-500 bg-dark-800 px-3 py-1 rounded-lg">
              Last 5
            </span>
          </div>
          {data?.recentTasks?.length > 0 ? (
            <div className="space-y-3">
              {data.recentTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-dark-700 mx-auto mb-3" />
              <p className="text-dark-400">No tasks yet</p>
              <p className="text-dark-500 text-sm mt-1">
                {isAdmin
                  ? 'Create a project and assign tasks to get started'
                  : 'Tasks assigned to you will appear here'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overdue Tasks */}
      {data?.overdueTasks?.length > 0 && (
        <div className="card border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-red-300">
              Overdue Tasks
            </h2>
            <span className="badge-overdue ml-2">
              {data.overdueTasks.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.overdueTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
