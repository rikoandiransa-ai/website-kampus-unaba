import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  ClipboardList
} from 'lucide-react';
import { Activity } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const ActivityData: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form Field States
  const [activityName, setActivityName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [status, setStatus] = useState<'Active' | 'Completed'>('Active');

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/activities');
      setActivities(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Could not fetch campus activities.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const resetForm = () => {
    setActivityName('');
    setDescription('');
    setDate('');
    setTime('');
    setLocation('');
    setOrganizer('');
    setStatus('Active');
    setCurrentId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (act: Activity) => {
    setIsEditMode(true);
    setCurrentId(act.id);
    setActivityName(act.activityName);
    setDescription(act.description);
    setDate(act.date);
    setTime(act.time);
    setLocation(act.location);
    setOrganizer(act.organizer);
    setStatus(act.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!activityName || !description || !date || !time || !location || !organizer) {
      setError('Please fill in all the activity properties.');
      return;
    }

    const payload = {
      activityName,
      description,
      date,
      time,
      location,
      organizer,
      status
    };

    try {
      if (isEditMode && currentId) {
        await axios.put(`/api/activities/${currentId}`, payload);
        setSuccess('Activity details updated successfully!');
      } else {
        await axios.post('/api/activities', payload);
        setSuccess('New activity added and scheduled!');
      }
      setIsModalOpen(false);
      fetchActivities();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save the activity.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete "${name}"?\nAll attendance records associated with this event will be deleted as well.`)) {
      return;
    }

    try {
      await axios.delete(`/api/activities/${id}`);
      setSuccess('Activity record and related attendance logs removed.');
      fetchActivities();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove activity.');
    }
  };

  // Filter Activities list
  const filteredActivities = activities.filter(act => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      act.activityName.toLowerCase().includes(term) ||
      act.location.toLowerCase().includes(term) ||
      act.organizer.toLowerCase().includes(term) ||
      act.description.toLowerCase().includes(term)
    );

    const matchesStatus = statusFilter === 'All' || act.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Campus Activities Directory</h2>
          <p className="text-xs text-slate-400">Schedule, update, and manage official activities at Universitas Anak Bangsa</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all duration-200 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Schedule New Activity</span>
        </button>
      </div>

      {/* Success and Error messages */}
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

      {/* Filter and Search Layout */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Search box */}
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, venue, organizer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
            />
          </div>

          {/* Status selector tab */}
          <div className="flex gap-2 bg-slate-50 p-1 rounded-xl self-start md:self-auto border border-slate-200">
            {['All', 'Active', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                  statusFilter === tab 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

        </div>

        {/* List Grid view or Table */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-400">Retrieving campus events...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="font-semibold text-slate-500">No scheduled activities found matching the filters.</p>
              <p className="text-xs mt-1">Add a new event or clear your filters to explore campus schedules.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredActivities.map((act) => (
                <div 
                  key={act.id}
                  className="bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200/80 p-5 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-200"
                >
                  <div className="space-y-3.5">
                    {/* Header: ID & Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-md">
                        {act.id}
                      </span>
                      <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full ${
                        act.status === 'Active' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {act.status}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-800 text-base leading-snug line-clamp-1 hover:text-blue-600 transition-colors">
                        {act.activityName}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    <div className="h-px bg-slate-200/50"></div>

                    {/* Metadata details */}
                    <div className="space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="font-medium text-slate-600">{act.date} at {act.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
                        <span className="font-medium text-slate-600 line-clamp-1">{act.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-600 line-clamp-1">{act.organizer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-200/40">
                    <button
                      onClick={() => handleOpenEditModal(act)}
                      className="p-1.5 hover:bg-blue-100/60 text-blue-600 rounded-lg transition-colors cursor-pointer"
                      title="Edit Activity"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(act.id, act.activityName)}
                      className="p-1.5 hover:bg-red-100/60 text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Activity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CRUD Overlaid Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-800 to-blue-950 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500 rounded-xl">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{isEditMode ? 'Modify Activity Record' : 'Schedule New Event'}</h3>
                    <p className="text-xs text-blue-200 mt-0.5">Universitas Anak Bangsa Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/80 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Activity Name
                  </label>
                  <input
                    type="text"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder="e.g. Science Fair Exhibition"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed description or guidelines for participants..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Location / Venue
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Auditorium Hall B"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                    />
                  </div>

                  {/* Organizer */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Organizer / Club
                    </label>
                    <input
                      type="text"
                      value={organizer}
                      onChange={(e) => setOrganizer(e.target.value)}
                      placeholder="e.g. Computer Science Club"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Event Progress Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={status === 'Active'}
                        onChange={() => setStatus('Active')}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-300"
                      />
                      <span>Active (Upcoming / Running)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                      <input
                        type="radio"
                        name="status"
                        value="Completed"
                        checked={status === 'Completed'}
                        onChange={() => setStatus('Completed')}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-600 border-slate-300"
                      />
                      <span>Completed (Concluded)</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {isEditMode ? 'Update Activity' : 'Create Activity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
