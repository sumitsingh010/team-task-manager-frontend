import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LogOut,
  ChevronLeft,
  Menu,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      to: '/projects',
      icon: FolderKanban,
      label: 'Projects',
    },
    {
      to: '/tasks',
      icon: CheckSquare,
      label: 'Tasks',
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-dark-900/95 border-r border-dark-800 backdrop-blur-xl z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-dark-800 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shrink-0">
          <CheckSquare className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-dark-100 text-base whitespace-nowrap">
            Task Manager
          </span>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors hidden lg:flex"
        >
          {collapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-600/15 text-primary-400 border border-primary-500/20'
                  : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200 border border-transparent'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <span className="font-medium text-sm whitespace-nowrap">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-dark-800 p-3 space-y-2 shrink-0">
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-200 truncate">
                {user?.name}
              </p>
              <div className="flex items-center gap-1">
                {isAdmin ? (
                  <Shield className="w-3 h-3 text-amber-400" />
                ) : (
                  <User className="w-3 h-3 text-dark-500" />
                )}
                <span className="text-xs text-dark-500 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-dark-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <span className="font-medium text-sm">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}
