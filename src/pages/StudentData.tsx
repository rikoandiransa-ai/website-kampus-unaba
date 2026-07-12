import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  UserPlus, 
  AlertCircle, 
  CheckCircle,
  GraduationCap,
  Mail,
  FolderLock
} from 'lucide-react';
import { Student } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const StudentData: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form Fields
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [faculty, setFaculty] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/students');
      setStudents(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch students. Ensure the server is online.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const resetForm = () => {
    setStudentId('');
    setName('');
    setStudyProgram('');
    setFaculty('');
    setEmail('');
    setUsername('');
    setPassword('');
    setCurrentId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setIsEditMode(true);
    setCurrentId(student.id);
    setStudentId(student.id);
    setName(student.name);
    setStudyProgram(student.studyProgram);
    setFaculty(student.faculty);
    setEmail(student.email);
    setUsername(student.username);
    setPassword(''); // blank for editing unless they want to override
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validations
    if (!studentId || !name || !studyProgram || !faculty || !email || !username) {
      setError('All fields are required.');
      return;
    }
    if (!isEditMode && !password) {
      setError('Password is required for new students.');
      return;
    }

    const payload = {
      id: studentId,
      name,
      studyProgram,
      faculty,
      email,
      username,
      password: password || undefined
    };

    try {
      if (isEditMode && currentId) {
        await axios.put(`/api/students/${currentId}`, payload);
        setSuccess('Student updated successfully!');
      } else {
        await axios.post('/api/students', payload);
        setSuccess('New student registered successfully!');
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save student.');
    }
  };

  const handleDelete = async (id: string, sName: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${sName} (ID: ${id})?\nAll attendance logs associated with this student will also be cascade-deleted.`)) {
      return;
    }

    try {
      await axios.delete(`/api/students/${id}`);
      setSuccess('Student record deleted successfully.');
      fetchStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      student.id.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term) ||
      student.studyProgram.toLowerCase().includes(term) ||
      student.faculty.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Student Directory Data</h2>
          <p className="text-xs text-slate-400">Complete listing and operations for students at Universitas Anak Bangsa</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all duration-200 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Student</span>
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

      {/* Directory Table Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Search Bar section */}
        <div className="p-5 border-b border-slate-100 flex items-center">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by ID, name, email, study program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
            />
          </div>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-400">Loading student directory...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-semibold">No students found matching your filters.</p>
              <p className="text-xs text-slate-400 mt-1">Try expanding your search parameters or register a new student.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="px-6 py-4">NIM/Student ID</th>
                  <th className="px-6 py-4">Student Profile</th>
                  <th className="px-6 py-4">Academic Division</th>
                  <th className="px-6 py-4">Username & Email</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-800 text-xs">
                      {student.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center font-bold text-sm">
                          {student.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-400">Undergraduate</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-medium">{student.studyProgram}</p>
                      <p className="text-xs text-slate-400">{student.faculty}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-medium font-mono text-xs">@{student.username}</p>
                      <p className="text-xs text-slate-400">{student.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit Student Info"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CRUD Overlay Form Modal */}
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
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{isEditMode ? 'Update Student Record' : 'Register New Student'}</h3>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Student ID (NIM) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Student ID (NIM)
                    </label>
                    <input
                      type="text"
                      disabled={isEditMode}
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. NIM1006"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>

                  {/* Student Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Riko Andiransa"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Faculty */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Faculty
                    </label>
                    <input
                      type="text"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                    />
                  </div>

                  {/* Study Program */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Study Program
                    </label>
                    <input
                      type="text"
                      value={studyProgram}
                      onChange={(e) => setStudyProgram(e.target.value)}
                      placeholder="e.g. Informatics Engineering"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Academic Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. riko@unaba.ac.id"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Portal Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. riko"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {isEditMode ? 'New Password (Leave empty to keep current)' : 'Account Password'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                  />
                </div>

                {/* Submit button bar */}
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
                    {isEditMode ? 'Update Student' : 'Add Student'}
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
