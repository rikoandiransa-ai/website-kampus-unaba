import React from 'react';
import { Menu, GraduationCap, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Left section: menu toggle & page header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 lg:hidden focus:outline-none"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Small header on desktop, main title area */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Academic Year 2026/2027</span>
          <span className="h-4 w-px bg-slate-200"></span>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
            Semester Gasal
          </span>
        </div>
      </div>

      {/* Right section: User Profile Indicator & Title Accent */}
      <div className="flex items-center gap-4">
        {/* Simple Notification Indicator */}
        <button className="p-2 text-slate-500 hover:text-orange-500 hover:bg-slate-50 rounded-full transition-all relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500 border border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.username === 'Admin' ? 'UNABA Administrator' : user?.username}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              Role: {user?.role}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/10">
            {user?.username?.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
