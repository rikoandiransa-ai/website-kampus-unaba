export interface User {
  id: string;
  username: string;
  role: 'admin' | 'student';
}

export interface Student {
  id: string; // Student ID / NIM
  name: string;
  studyProgram: string;
  faculty: string;
  email: string;
  username: string;
  password?: string; // Hashed password
}

export interface Activity {
  id: string;
  activityName: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  status: 'Active' | 'Completed';
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName?: string; // joined
  studentNim?: string; // joined
  activityId: string;
  activityName?: string; // joined
  date: string;
  time: string; // manual input
  status: 'Present' | 'Sick' | 'Permission' | 'Absent';
}

export interface DashboardStats {
  totalStudents: number;
  totalActivities: number;
  totalAbsences: number; // logs with 'Absent' status
  totalAttendanceLogs: number; // all attendance logs
}
