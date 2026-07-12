import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  TrendingUp, 
  Sparkles,
  ClipboardCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { motion } from 'motion/react';

interface Stats {
  totalStudents: number;
  totalActivities: number;
  totalAbsences: number;
  totalAttendanceLogs: number;
}

interface ChartItem {
  name: string;
  fullName: string;
  participants: number;
  present: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalActivities: 0,
    totalAbsences: 0,
    totalAttendanceLogs: 0
  });
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/dashboard-stats');
        setStats(response.data.stats);
        setChartData(response.data.activityChartData);
      } catch (err: any) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Could not connect to the backend database server to retrieve statistics.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Gathering academic statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-600" />
        <div>
          <h3 className="font-bold text-red-800 text-lg">Server Connection Issue</h3>
          <p className="text-sm text-red-600 mt-1 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  // Visual Palette: Blues and Oranges
  const COLORS = ['#2563eb', '#f97316', '#3b82f6', '#ea580c', '#1d4ed8', '#ff781f'];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 p-6 md:p-8 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-blue-950/20">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-orange-500/10 to-transparent -mr-10 opacity-70"></div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs bg-orange-500 text-white font-bold tracking-wider px-2.5 py-1 rounded-full uppercase w-fit">
            <Sparkles className="h-3 w-3" /> UNIVERSITAS ANAK BANGSA
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Dashboard Panel Akademik
          </h1>
          <p className="text-blue-200 text-sm md:text-base leading-relaxed">
            Welcome to the Campus Activity Management System. Track active student participation, manage registrations, verify student presences, and extract comprehensive analytics on-the-fly.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Students */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
        >
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
            <p className="text-3xl font-extrabold text-slate-800">{stats.totalStudents}</p>
            <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
              Active accounts <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Total Activities */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
        >
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Activities</p>
            <p className="text-3xl font-extrabold text-slate-800">{stats.totalActivities}</p>
            <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
              Events scheduled <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
            <Calendar className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Total Absences */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
        >
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Absentees</p>
            <p className="text-3xl font-extrabold text-slate-800">{stats.totalAbsences}</p>
            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
              Absence tickets logged <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </motion.div>

        {/* Attendance Rates */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
        >
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Logs</p>
            <p className="text-3xl font-extrabold text-slate-800">{stats.totalAttendanceLogs}</p>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              Attendance records <CheckCircle2 className="h-3 w-3" />
            </span>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ClipboardCheck className="h-6 w-6" />
          </div>
        </motion.div>

      </div>

      {/* Charts & Interactive Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph of participants for each activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Activity Participant Metrics</h3>
              <p className="text-xs text-slate-400">Total registered students vs present attendees per event</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ChartItem;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs space-y-1.5 shadow-xl border border-slate-800">
                          <p className="font-bold">{data.fullName}</p>
                          <p className="text-slate-300">Total Participants: <span className="text-orange-400 font-bold">{data.participants}</span></p>
                          <p className="text-slate-300">Attended (Present): <span className="text-blue-400 font-bold">{data.present}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="participants" name="Total Participants" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick List / Announcement Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Academic Notice Board</h3>
              <p className="text-xs text-slate-400">Universitas Anak Bangsa announcements</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl space-y-1">
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                System Guide
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-1">Admin Account Active</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                As Admin, you can add students and activities, delete, modify records, and register manual student presences in the Attendance page.
              </p>
            </div>

            <div className="p-3 bg-orange-50/50 border border-orange-100/50 rounded-xl space-y-1">
              <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                Database Seed
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-1">Default MySQL Scripts</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check <strong>schema.sql</strong> at the project root for the complete database script, constraints, index and relationships details ready to deploy!
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[10px] bg-slate-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                Audit
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-1">Certification Ready</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attendance recap tables support robust custom filters and instant exports to Microsoft Excel and printable PDF.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
