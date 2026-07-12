import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardCheck, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Clock, 
  User, 
  HelpCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Activity, Student } from '../types';
import { motion } from 'motion/react';

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Form values
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [status, setStatus] = useState<'Present' | 'Sick' | 'Permission' | 'Absent'>('Present');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [actRes, studRes] = await Promise.all([
          axios.get('/api/activities'),
          axios.get('/api/students')
        ]);

        setActivities(actRes.data);
        setStudents(studRes.data);

        // Prepopulate student selection if logged in as student
        if (user && user.role === 'student') {
          setSelectedStudentId(user.id);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch required lists from database.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedStudentId) {
      setError('Please select or specify a student.');
      return;
    }
    if (!selectedActivityId) {
      setError('Please select an activity to check-in.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }
    if (!time) {
      setError('Please input a log time.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      studentId: selectedStudentId,
      activityId: selectedActivityId,
      date,
      time,
      status
    };

    try {
      await axios.post('/api/attendance', payload);
      setSuccess('Attendance record checked in successfully!');
      
      // Keep selected student if student role, reset other entries
      if (user?.role !== 'student') {
        setSelectedStudentId('');
      }
      setSelectedActivityId('');
      // reset time
      const now = new Date();
      setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setStatus('Present');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check-in attendance record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading form metadata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Page Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Student Presensi & Absensi Portal</h2>
        <p className="text-xs text-slate-400">
          {user?.role === 'admin' 
            ? 'Administrator manual check-in form for students participating in registered activities.'
            : 'Submit your participation presence or upload an absence note for scheduled campus events.'
          }
        </p>
      </div>

      {/* Message Notifications */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Banner decorator */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-950 p-6 text-white flex items-center gap-4">
          <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-500/20">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Check-In Activity Presence</h3>
            <p className="text-xs text-slate-300">Universitas Anak Bangsa Attendance Logging</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Student Profile
            </label>
            {user?.role === 'student' ? (
              // If student: display profile but lock choice
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 text-slate-700">
                <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {students.find(s => s.id === user.id)?.name || user.username}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">NIM ID: {user.id}</p>
                </div>
              </div>
            ) : (
              // If Admin: full searchable / list selection
              <div className="relative">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                >
                  <option value="">-- Choose student from directory --</option>
                  {students.map((stud) => (
                    <option key={stud.id} value={stud.id}>
                      {stud.name} ({stud.id}) - {stud.studyProgram}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Activity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Campus Activity
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
            >
              <option value="">-- Select active event --</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id} disabled={act.status !== 'Active'}>
                  {act.activityName} ({act.status}) - {act.location}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" /> Scheduled activities are restricted to active events.
            </p>
          </div>

          {/* Date and Time inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Log Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                />
              </div>
            </div>

            {/* Manual Time input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Log Time (Manual Entry)
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Attendance Status */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Attendance / Absence Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Present */}
              <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition-all duration-200 ${
                status === 'Present' 
                  ? 'bg-blue-50 border-blue-600 text-blue-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
              }`}>
                <input
                  type="radio"
                  name="attendance_status"
                  value="Present"
                  checked={status === 'Present'}
                  onChange={() => setStatus('Present')}
                  className="sr-only"
                />
                <span className="font-bold text-sm">Present</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Hadir</span>
              </label>

              {/* Sick */}
              <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition-all duration-200 ${
                status === 'Sick' 
                  ? 'bg-amber-50 border-amber-500 text-amber-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
              }`}>
                <input
                  type="radio"
                  name="attendance_status"
                  value="Sick"
                  checked={status === 'Sick'}
                  onChange={() => setStatus('Sick')}
                  className="sr-only"
                />
                <span className="font-bold text-sm">Sick</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Sakit</span>
              </label>

              {/* Permission */}
              <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition-all duration-200 ${
                status === 'Permission' 
                  ? 'bg-purple-50 border-purple-500 text-purple-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
              }`}>
                <input
                  type="radio"
                  name="attendance_status"
                  value="Permission"
                  checked={status === 'Permission'}
                  onChange={() => setStatus('Permission')}
                  className="sr-only"
                />
                <span className="font-bold text-sm">Permission</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Izin</span>
              </label>

              {/* Absent */}
              <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition-all duration-200 ${
                status === 'Absent' 
                  ? 'bg-red-50 border-red-500 text-red-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/50'
              }`}>
                <input
                  type="radio"
                  name="attendance_status"
                  value="Absent"
                  checked={status === 'Absent'}
                  onChange={() => setStatus('Absent')}
                  className="sr-only"
                />
                <span className="font-bold text-sm">Absent</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Alpa</span>
              </label>

            </div>
          </div>

          {/* Instructions disclaimer on multiple entries */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
            <strong>System Validation:</strong> Students are allowed to check-in multiple times for the same activity on different sessions, days, or time logs.
          </div>

          {/* Submit bar */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Recording Log...' : 'Confirm Attendance Check-In'}
          </button>

        </form>

      </div>

    </div>
  );
};
