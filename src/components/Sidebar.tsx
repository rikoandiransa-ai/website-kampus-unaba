import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  FileSpreadsheet, 
  LogOut,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'student']
    },
    {
      name: 'Student Data',
      path: '/students',
      icon: Users,
      roles: ['admin'] // Only admin can CRUD students
    },
    {
      name: 'Activity Data',
      path: '/activities',
      icon: Calendar,
      roles: ['admin'] // Only admin can CRUD activities
    },
    {
      name: 'Student Attendance',
      path: '/attendance',
      icon: ClipboardCheck,
      roles: ['admin', 'student'] // Both can submit attendance
    },
    {
      name: 'Attendance Recap',
      path: '/recap',
      icon: FileSpreadsheet,
      roles: ['admin', 'student'] // Both can view recap
    }
  ];

  const activeClass = "bg-orange-500 text-white shadow-md shadow-orange-500/20";
  const inactiveClass = "text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200";

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Area */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-1.5 bg-orange-500 rounded-lg text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide leading-tight">
              UNABA CAMPUS
            </h1>
            <span className="text-xs text-orange-400 font-semibold tracking-wider uppercase">
              Activity Hub
            </span>
          </div>
        </div>

        {/* User Profile Info in Sidebar */}
        <div className="p-4 mx-4 my-3 bg-slate-950/50 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
              {user?.username?.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-3 space-y-1.5 overflow-y-auto">
          {menuItems
            .filter(item => item.roles.includes(user?.role || ''))
            .map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive ? activeClass : inactiveClass
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 rounded-lg transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
