import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Filter, 
  Calendar, 
  Activity, 
  Users, 
  TrendingUp,
  AlertCircle,
  FileCheck,
  ClipboardList
} from 'lucide-react';
import { Attendance } from '../types';
import { motion } from 'motion/react';

interface RecapSummary {
  totalParticipants: number;
  totalPresent: number;
  totalAbsent: number;
  totalSick: number;
  totalPermission: number;
  totalStudents: number;
  totalActivities: number;
}

interface ActivitySummaryItem {
  activityId: string;
  activityName: string;
  organizer: string;
  totalParticipants: number;
  present: number;
  absent: number;
  sick: number;
  permission: number;
  status: string;
}

interface DateSummaryItem {
  date: string;
  totalParticipants: number;
  present: number;
  absent: number;
  sick: number;
  permission: number;
}

export const AttendanceRecap: React.FC = () => {
  const [summary, setSummary] = useState<RecapSummary>({
    totalParticipants: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalSick: 0,
    totalPermission: 0,
    totalStudents: 0,
    totalActivities: 0
  });

  const [activitySummary, setActivitySummary] = useState<ActivitySummaryItem[]>([]);
  const [dateSummary, setDateSummary] = useState<DateSummaryItem[]>([]);
  const [logs, setLogs] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<'logs' | 'activities' | 'dates'>('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activityFilter, setActivityFilter] = useState('All');

  const fetchRecapData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/recap');
      setSummary(response.data.summary);
      setActivitySummary(response.data.summaryPerActivity);
      setDateSummary(response.data.summaryByDate);
      setLogs(response.data.logs);
    } catch (err: any) {
      console.error(err);
      setError('Could not retrieve academic recap metrics from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecapData();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      log.studentName?.toLowerCase().includes(term) ||
      log.studentNim?.toLowerCase().includes(term) ||
      log.activityName?.toLowerCase().includes(term)
    );

    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    const matchesActivity = activityFilter === 'All' || log.activityId === activityFilter;

    return matchesSearch && matchesStatus && matchesActivity;
  });

  // Export to Excel (CSV)
  const exportToExcel = () => {
    if (logs.length === 0) return;

    // Build CSV Content
    const headers = ['Attendance ID', 'NIM', 'Student Name', 'Activity ID', 'Activity Name', 'Date', 'Time Logged', 'Status'];
    const rows = logs.map(log => [
      log.id,
      log.studentNim || '',
      log.studentName || '',
      log.activityId,
      log.activityName || '',
      log.date,
      log.time,
      log.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "UNABA_Attendance_Report_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF (Triggers Print layout optimized to print beautifully on portrait/landscape)
  const triggerPrintPdf = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Extracting ledger recap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      
      {/* Printable Header - hidden on screen, visible on print only */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-wider text-black">UNIVERSITAS ANAK BANGSA</h1>
        <p className="text-sm font-semibold text-slate-700 tracking-widest mt-1">REKAPITULASI PRESENSI & ABSENSI KEGIATAN MAHASISWA</p>
        <p className="text-xs text-slate-500 font-mono mt-1">Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()} UTC</p>
      </div>

      {/* Top action header - hidden on print */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Attendance Summary & Recap</h2>
          <p className="text-xs text-slate-400">Complete campus activity records, participants ledger, and custom exporting utilities</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Export to Excel (CSV) */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/10 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4.5 w-4.5" />
            <span>Export Excel</span>
          </button>
          
          {/* Print PDF */}
          <button
            onClick={triggerPrintPdf}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/10 transition-colors cursor-pointer"
          >
            <Printer className="h-4.5 w-4.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Recap statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 print:grid-cols-3 print:gap-4">
        {/* Total Participants */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between print:border-slate-300 print:p-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-600">Total Participants</p>
            <p className="text-2xl font-black text-slate-800">{summary.totalParticipants}</p>
            <p className="text-[10px] text-slate-400 print:hidden">Cumulative entries</p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl print:hidden">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Total Present */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between print:border-slate-300 print:p-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-600 font-mono text-emerald-600">Total Present (Hadir)</p>
            <p className="text-2xl font-black text-emerald-600">{summary.totalPresent}</p>
            <p className="text-[10px] text-slate-400 print:hidden">
              {summary.totalParticipants > 0 
                ? `${Math.round((summary.totalPresent / summary.totalParticipants) * 100)}% active rate`
                : '0% rate'
              }
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl print:hidden">
            <FileCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Total Absentees (Sick, Perm, Absent) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between print:border-slate-300 print:p-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-600 text-orange-600">Total Absence Tickets</p>
            <p className="text-2xl font-black text-orange-600">
              {summary.totalSick + summary.totalPermission + summary.totalAbsent}
            </p>
            <p className="text-[10px] text-slate-400 print:hidden">
              Sick: {summary.totalSick} | Izin: {summary.totalPermission} | Alpa: {summary.totalAbsent}
            </p>
          </div>
          <div className="p-3.5 bg-orange-50 text-orange-600 rounded-xl print:hidden">
            <ClipboardList className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Tabs navigation - hidden on print */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-fit print:hidden">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer ${
            activeTab === 'logs' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          DETAILED ATTENDANCE LOGS
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer ${
            activeTab === 'activities' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          RECAP BY ACTIVITY
        </button>
        <button
          onClick={() => setActiveTab('dates')}
          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer ${
            activeTab === 'dates' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          RECAP BY DATE
        </button>
      </div>

      {/* TABLE PANEL CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
        
        {/* FILTERS PANEL - Hidden on print, ONLY when logs tab is active */}
        {activeTab === 'logs' && (
          <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center gap-4 print:hidden">
            
            {/* Search filter input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search Student, NIM, Event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
              />
            </div>

            {/* Status selection drop */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present (Hadir)</option>
                <option value="Sick">Sick (Sakit)</option>
                <option value="Permission">Permission (Izin)</option>
                <option value="Absent">Absent (Alpa)</option>
              </select>
            </div>

            {/* Activity selection drop */}
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none w-full sm:w-auto"
            >
              <option value="All">All Activities</option>
              {Array.from(new Set(logs.map(l => l.activityId))).map(actId => {
                const lName = logs.find(l => l.activityId === actId)?.activityName || actId;
                return (
                  <option key={actId} value={actId}>
                    {lName}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* TAB CONTENT: 1. DETAILED ATTENDANCE LOGS */}
        {activeTab === 'logs' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600 print:text-black">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold print:bg-slate-100 print:text-slate-800">
                  <th className="px-6 py-4">NIM</th>
                  <th className="px-6 py-4">Student Profile</th>
                  <th className="px-6 py-4">Campus Activity</th>
                  <th className="px-6 py-4">Date & Time Logged</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      No matching attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 font-mono font-semibold text-xs text-slate-700">
                        {log.studentNim}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 print:text-black">{log.studentName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800 print:text-black">{log.activityName}</p>
                        <p className="text-[10px] text-slate-400 print:hidden font-mono">Activity ID: {log.activityId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-700 font-medium">{log.date}</p>
                        <p className="text-xs text-slate-400 font-mono">{log.time} WIB</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-center min-w-[90px] ${
                            log.status === 'Present' ? 'bg-blue-100 text-blue-700 print:border print:border-blue-700' :
                            log.status === 'Sick' ? 'bg-amber-100 text-amber-700 print:border print:border-amber-700' :
                            log.status === 'Permission' ? 'bg-purple-100 text-purple-700 print:border print:border-purple-700' :
                            'bg-red-100 text-red-700 print:border print:border-red-700'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB CONTENT: 2. RECAP BY ACTIVITY */}
        {activeTab === 'activities' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600 print:text-black">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold print:bg-slate-100 print:text-slate-800">
                  <th className="px-6 py-4">Activity Name</th>
                  <th className="px-6 py-4">Organizer</th>
                  <th className="px-6 py-4 text-center">Cumulative Logs</th>
                  <th className="px-6 py-4 text-center text-blue-600">Present (Hadir)</th>
                  <th className="px-6 py-4 text-center text-amber-600">Sick (Sakit)</th>
                  <th className="px-6 py-4 text-center text-purple-600">Permission (Izin)</th>
                  <th className="px-6 py-4 text-center text-red-600">Absent (Alpa)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                {activitySummary.map((item) => (
                  <tr key={item.activityId} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 font-bold text-slate-800 print:text-black">
                      {item.activityName}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-500">
                      {item.organizer}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      {item.totalParticipants}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-blue-600">
                      {item.present}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-amber-600">
                      {item.sick}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-purple-600">
                      {item.permission}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-red-600">
                      {item.absent}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Active' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB CONTENT: 3. RECAP BY DATE */}
        {activeTab === 'dates' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600 print:text-black">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold print:bg-slate-100 print:text-slate-800">
                  <th className="px-6 py-4">Log Date</th>
                  <th className="px-6 py-4 text-center">Cumulative Logs</th>
                  <th className="px-6 py-4 text-center text-blue-600">Present (Hadir)</th>
                  <th className="px-6 py-4 text-center text-amber-600">Sick (Sakit)</th>
                  <th className="px-6 py-4 text-center text-purple-600">Permission (Izin)</th>
                  <th className="px-6 py-4 text-center text-red-600">Absent (Alpa)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                {dateSummary.map((item) => (
                  <tr key={item.date} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 font-bold text-slate-800 print:text-black">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      {item.totalParticipants}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-blue-600">
                      {item.present}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-amber-600">
                      {item.sick}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-purple-600">
                      {item.permission}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-red-600">
                      {item.absent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
      
      {/* Print footer - visible on print only */}
      <div className="hidden print:flex items-center justify-between mt-12 pt-4 border-t border-dashed border-slate-300">
        <div>
          <p className="text-xs text-slate-500">Universitas Anak Bangsa Activity Management Portal</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-800">Verified Academic Officer,</p>
          <div className="h-16"></div>
          <p className="text-xs font-mono font-bold text-slate-900">( UNABA Administrator )</p>
        </div>
      </div>

    </div>
  );
};
