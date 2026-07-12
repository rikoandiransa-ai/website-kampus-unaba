import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { readDb, writeDb } from './db';
import { Student, Activity, Attendance, User } from '../src/types';

export const routes = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'unaba_campus_activity_secret_key';

// Middleware to verify JWT token
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: 'admin' | 'student';
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }
    req.user = user as any;
    next();
  });
}

// ---------------- AUTH ROUTES ----------------

// POST /api/login
routes.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  const db = readDb();

  // 1. Check for Admin Login
  if (username === 'Admin') {
    if (password === 'unaba123') {
      const token = jwt.sign(
        { id: '1', username: 'Admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({
        token,
        user: { id: '1', username: 'Admin', role: 'admin' }
      });
      return;
    } else {
      res.status(401).json({ message: 'Invalid Admin password' });
      return;
    }
  }

  // 2. Check for Student Login (either username or email or NIM/Student ID)
  const student = db.students.find(
    s => s.username?.toLowerCase() === username.toLowerCase() || s.id?.toLowerCase() === username.toLowerCase()
  );

  if (!student) {
    res.status(401).json({ message: 'User not found' });
    return;
  }

  const isPasswordValid = bcrypt.compareSync(password, student.password || '');
  if (!isPasswordValid) {
    res.status(401).json({ message: 'Invalid password' });
    return;
  }

  const token = jwt.sign(
    { id: student.id, username: student.username, role: 'student' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: student.id, username: student.username, role: 'student' }
  });
});


// ---------------- STUDENT CRUD ROUTES ----------------

// GET /api/students
routes.get('/students', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  // Don't send back hashed passwords to client
  const safeStudents = db.students.map(({ password, ...rest }) => rest);
  res.json(safeStudents);
});

// POST /api/students
routes.post('/students', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id, name, studyProgram, faculty, email, username, password } = req.body;

  if (!id || !name || !studyProgram || !faculty || !email || !username || !password) {
    res.status(400).json({ message: 'All student fields are required' });
    return;
  }

  const db = readDb();

  // Validate uniqueness of Student ID, Email, and Username
  if (db.students.some(s => s.id.toLowerCase() === id.toLowerCase())) {
    res.status(400).json({ message: `Student with NIM/ID ${id} already exists.` });
    return;
  }
  if (db.students.some(s => s.email.toLowerCase() === email.toLowerCase())) {
    res.status(400).json({ message: `Student with email ${email} already exists.` });
    return;
  }
  if (db.students.some(s => s.username.toLowerCase() === username.toLowerCase())) {
    res.status(400).json({ message: `Student with username ${username} already exists.` });
    return;
  }

  const newStudent: Student = {
    id,
    name,
    studyProgram,
    faculty,
    email,
    username,
    password: bcrypt.hashSync(password, 10)
  };

  db.students.push(newStudent);
  writeDb(db);

  const { password: _, ...safeStudent } = newStudent;
  res.status(201).json(safeStudent);
});

// PUT /api/students/:id
routes.put('/students/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, studyProgram, faculty, email, username, password } = req.body;

  const db = readDb();
  const index = db.students.findIndex(s => s.id === id);

  if (index === -1) {
    res.status(404).json({ message: `Student with ID ${id} not found.` });
    return;
  }

  // Check unique constraints for other records
  if (email && db.students.some(s => s.id !== id && s.email.toLowerCase() === email.toLowerCase())) {
    res.status(400).json({ message: `Student with email ${email} already exists.` });
    return;
  }
  if (username && db.students.some(s => s.id !== id && s.username.toLowerCase() === username.toLowerCase())) {
    res.status(400).json({ message: `Student with username ${username} already exists.` });
    return;
  }

  const currentStudent = db.students[index];
  const updatedStudent: Student = {
    ...currentStudent,
    name: name || currentStudent.name,
    studyProgram: studyProgram || currentStudent.studyProgram,
    faculty: faculty || currentStudent.faculty,
    email: email || currentStudent.email,
    username: username || currentStudent.username,
  };

  if (password) {
    updatedStudent.password = bcrypt.hashSync(password, 10);
  }

  db.students[index] = updatedStudent;
  writeDb(db);

  const { password: _, ...safeStudent } = updatedStudent;
  res.json(safeStudent);
});

// DELETE /api/students/:id
routes.delete('/students/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = readDb();

  const index = db.students.findIndex(s => s.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  // Cascade delete or cleanup absences for this student
  db.students.splice(index, 1);
  db.absences = db.absences.filter(a => a.studentId !== id);

  writeDb(db);
  res.json({ message: 'Student and associated attendance logs deleted successfully' });
});


// ---------------- ACTIVITY CRUD ROUTES ----------------

// GET /api/activities
routes.get('/activities', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  res.json(db.activities);
});

// POST /api/activities
routes.post('/activities', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { activityName, description, date, time, location, organizer, status } = req.body;

  if (!activityName || !description || !date || !time || !location || !organizer || !status) {
    res.status(400).json({ message: 'All activity fields are required' });
    return;
  }

  const db = readDb();
  const newActivity: Activity = {
    id: `ACT${Math.floor(100 + Math.random() * 900)}`, // Generate simple random ID
    activityName,
    description,
    date,
    time,
    location,
    organizer,
    status
  };

  db.activities.push(newActivity);
  writeDb(db);

  res.status(201).json(newActivity);
});

// PUT /api/activities/:id
routes.put('/activities/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { activityName, description, date, time, location, organizer, status } = req.body;

  const db = readDb();
  const index = db.activities.findIndex(a => a.id === id);

  if (index === -1) {
    res.status(404).json({ message: 'Activity not found' });
    return;
  }

  const current = db.activities[index];
  db.activities[index] = {
    ...current,
    activityName: activityName || current.activityName,
    description: description || current.description,
    date: date || current.date,
    time: time || current.time,
    location: location || current.location,
    organizer: organizer || current.organizer,
    status: status || current.status
  };

  writeDb(db);
  res.json(db.activities[index]);
});

// DELETE /api/activities/:id
routes.delete('/activities/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const db = readDb();

  const index = db.activities.findIndex(a => a.id === id);
  if (index === -1) {
    res.status(404).json({ message: 'Activity not found' });
    return;
  }

  db.activities.splice(index, 1);
  // Cascade delete or clean absences for this activity
  db.absences = db.absences.filter(a => a.activityId !== id);

  writeDb(db);
  res.json({ message: 'Activity and associated attendance logs deleted successfully' });
});


// ---------------- ATTENDANCE ROUTES ----------------

// GET /api/attendance
routes.get('/attendance', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();
  
  // Join student and activity data
  const logsWithDetails: Attendance[] = db.absences.map(abs => {
    const student = db.students.find(s => s.id === abs.studentId);
    const activity = db.activities.find(a => a.id === abs.activityId);

    return {
      ...abs,
      studentName: student ? student.name : 'Unknown Student',
      studentNim: student ? student.id : 'N/A',
      activityName: activity ? activity.activityName : 'Unknown Activity'
    };
  });

  res.json(logsWithDetails);
});

// POST /api/attendance
routes.post('/attendance', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { studentId, activityId, date, time, status } = req.body;

  if (!studentId || !activityId || !date || !time || !status) {
    res.status(400).json({ message: 'Student ID, Activity ID, Date, Time, and Status are required' });
    return;
  }

  const db = readDb();

  // Validate student exists
  const studentExists = db.students.some(s => s.id === studentId);
  if (!studentExists) {
    res.status(404).json({ message: `Student with NIM/ID ${studentId} does not exist.` });
    return;
  }

  // Validate activity exists
  const activityExists = db.activities.some(a => a.id === activityId);
  if (!activityExists) {
    res.status(404).json({ message: `Activity with ID ${activityId} does not exist.` });
    return;
  }

  const newLog: Attendance = {
    id: `ABS${Math.floor(100 + Math.random() * 900)}`,
    studentId,
    activityId,
    date,
    time,
    status
  };

  db.absences.push(newLog);
  writeDb(db);

  // Send back with populated details
  const student = db.students.find(s => s.id === studentId);
  const activity = db.activities.find(a => a.id === activityId);

  res.status(201).json({
    ...newLog,
    studentName: student ? student.name : 'Unknown Student',
    studentNim: student ? student.id : 'N/A',
    activityName: activity ? activity.activityName : 'Unknown Activity'
  });
});


// ---------------- ATTENDANCE RECAP ROUTE ----------------

// GET /api/recap
routes.get('/recap', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();

  const totalLogs = db.absences.length;
  const attendeesCount = db.absences.filter(a => a.status === 'Present').length;
  const absenteesCount = db.absences.filter(a => a.status === 'Absent').length;
  const sickCount = db.absences.filter(a => a.status === 'Sick').length;
  const permissionCount = db.absences.filter(a => a.status === 'Permission').length;

  // Recap per activity
  const summaryPerActivity = db.activities.map(act => {
    const actLogs = db.absences.filter(a => a.activityId === act.id);
    const present = actLogs.filter(a => a.status === 'Present').length;
    const absent = actLogs.filter(a => a.status === 'Absent').length;
    const sick = actLogs.filter(a => a.status === 'Sick').length;
    const permission = actLogs.filter(a => a.status === 'Permission').length;

    return {
      activityId: act.id,
      activityName: act.activityName,
      organizer: act.organizer,
      totalParticipants: actLogs.length,
      present,
      absent,
      sick,
      permission,
      status: act.status
    };
  });

  // Recap by date
  const dates = Array.from(new Set(db.absences.map(a => a.date))).sort();
  const summaryByDate = dates.map(d => {
    const dateLogs = db.absences.filter(a => a.date === d);
    const present = dateLogs.filter(a => a.status === 'Present').length;
    const absent = dateLogs.filter(a => a.status === 'Absent').length;
    const sick = dateLogs.filter(a => a.status === 'Sick').length;
    const permission = dateLogs.filter(a => a.status === 'Permission').length;

    return {
      date: d,
      totalParticipants: dateLogs.length,
      present,
      absent,
      sick,
      permission
    };
  });

  // Detailed joined log array for flexible client-side filter & search
  const logs = db.absences.map(abs => {
    const student = db.students.find(s => s.id === abs.studentId);
    const activity = db.activities.find(a => a.id === abs.activityId);

    return {
      id: abs.id,
      studentId: abs.studentId,
      studentName: student ? student.name : 'Unknown Student',
      studentNim: student ? student.id : 'N/A',
      activityId: abs.activityId,
      activityName: activity ? activity.activityName : 'Unknown Activity',
      date: abs.date,
      time: abs.time,
      status: abs.status
    };
  });

  res.json({
    summary: {
      totalParticipants: totalLogs,
      totalPresent: attendeesCount,
      totalAbsent: absenteesCount,
      totalSick: sickCount,
      totalPermission: permissionCount,
      totalStudents: db.students.length,
      totalActivities: db.activities.length
    },
    summaryPerActivity,
    summaryByDate,
    logs
  });
});

// GET /api/dashboard-stats
routes.get('/dashboard-stats', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const db = readDb();

  const totalStudents = db.students.length;
  const totalActivities = db.activities.length;
  const totalAbsences = db.absences.filter(a => a.status === 'Absent').length;

  // Chart data: Number of participants for each activity
  const activityChartData = db.activities.map(act => {
    const participantCount = db.absences.filter(a => a.activityId === act.id).length;
    const presentCount = db.absences.filter(a => a.activityId === act.id && a.status === 'Present').length;
    
    return {
      name: act.activityName.length > 20 ? `${act.activityName.slice(0, 17)}...` : act.activityName,
      fullName: act.activityName,
      participants: participantCount,
      present: presentCount
    };
  });

  res.json({
    stats: {
      totalStudents,
      totalActivities,
      totalAbsences,
      totalAttendanceLogs: db.absences.length
    },
    activityChartData
  });
});
