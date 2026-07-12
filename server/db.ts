import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Student, Activity, Attendance, User } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  students: Student[];
  activities: Activity[];
  absences: Attendance[];
}

// Default Admin password is 'unaba123', we'll hash it on initialization
const DEFAULT_ADMIN_HASH = bcrypt.hashSync('unaba123', 10);

const DEFAULT_DB_DATA: DatabaseSchema = {
  users: [
    { id: '1', username: 'Admin', role: 'admin' }
  ],
  students: [
    {
      id: '250222003',
      name: 'Riko',
      studyProgram: 'Informatics Engineering',
      faculty: 'Computer Science',
      email: 'riko@unaba.ac.id',
      username: 'riko',
      password: bcrypt.hashSync('student123', 10)
    },
    {
      id: '250222006',
      name: 'Alfia Shilka Firhandani',
      studyProgram: 'Information Systems',
      faculty: 'Computer Science',
      email: 'alfia@unaba.ac.id',
      username: 'alfia',
      password: bcrypt.hashSync('student123', 10)
    },
    {
      id: '250222004',
      name: 'Deni Davitra',
      studyProgram: 'Digital Business',
      faculty: 'Economics & Business',
      email: 'deni@unaba.ac.id',
      username: 'deni',
      password: bcrypt.hashSync('student123', 10)
    },
    {
      id: '250222001',
      name: 'Nayla Syifa Ramadhani',
      studyProgram: 'Management',
      faculty: 'Economics & Business',
      email: 'nayla@unaba.ac.id',
      username: 'nayla',
      password: bcrypt.hashSync('student123', 10)
    },
    {
      id: '250222007',
      name: 'Apriliani Meka',
      studyProgram: 'Visual Communication Design',
      faculty: 'Creative Industry',
      email: 'apriliani@unaba.ac.id',
      username: 'apriliani',
      password: bcrypt.hashSync('student123', 10)
    },
    {
      id: '250222005',
      name: 'Andora Lavincy',
      studyProgram: 'Informatics Engineering',
      faculty: 'Computer Science',
      email: 'andora@unaba.ac.id',
      username: 'andora',
      password: bcrypt.hashSync('student123', 10)
    },
    {
      id: '250222002',
      name: 'Galang Saputra',
      studyProgram: 'Information Systems',
      faculty: 'Computer Science',
      email: 'galang@unaba.ac.id',
      username: 'galang',
      password: bcrypt.hashSync('student123', 10)
    }
  ],
  activities: [
    {
      id: 'ACT001',
      activityName: 'Campus Hackathon 2026',
      description: 'A 24-hour programming and design competition to solve real-world problems.',
      date: '2026-07-15',
      time: '09:00',
      location: 'Auditorium Main Campus',
      organizer: 'Tech Student Association',
      status: 'Active'
    },
    {
      id: 'ACT002',
      activityName: 'Entrepreneurship Seminar',
      description: 'Seminar featuring modern digital startups and business builders in Indonesia.',
      date: '2026-07-20',
      time: '13:00',
      location: 'Seminar Hall B, 3rd Floor',
      organizer: 'BEM Universitas Anak Bangsa',
      status: 'Active'
    },
    {
      id: 'ACT003',
      activityName: 'English Debate Championship',
      description: 'Annual inter-faculty english debate competition covering current global trends.',
      date: '2026-07-10',
      time: '08:00',
      location: 'Classroom C.402',
      organizer: 'English Club UNABA',
      status: 'Active'
    },
    {
      id: 'ACT004',
      activityName: 'Campus Blood Donation Drive',
      description: 'Quarterly community service in partnership with Indonesian Red Cross (PMI).',
      date: '2026-07-05',
      time: '08:30',
      location: 'Campus Gymnasium',
      organizer: 'KSR PMI Sub-Unit UNABA',
      status: 'Completed'
    },
    {
      id: 'ACT005',
      activityName: 'Web Development Bootcamp',
      description: 'Intensive weekend hands-on coding course focusing on React & Tailwind CSS.',
      date: '2026-07-01',
      time: '10:00',
      location: 'Lab Computer 2',
      organizer: 'Informatics Lab',
      status: 'Completed'
    }
  ],
  absences: [
    { id: 'ABS001', studentId: '250222003', activityId: 'ACT001', date: '2026-07-15', time: '09:15', status: 'Present' },
    { id: 'ABS002', studentId: '250222006', activityId: 'ACT001', date: '2026-07-15', time: '09:10', status: 'Present' },
    { id: 'ABS003', studentId: '250222004', activityId: 'ACT001', date: '2026-07-15', time: '09:30', status: 'Present' },
    { id: 'ABS004', studentId: '250222001', activityId: 'ACT001', date: '2026-07-15', time: '10:00', status: 'Absent' },
    { id: 'ABS005', studentId: '250222007', activityId: 'ACT001', date: '2026-07-15', time: '09:05', status: 'Present' },
    
    { id: 'ABS006', studentId: '250222003', activityId: 'ACT002', date: '2026-07-20', time: '13:05', status: 'Present' },
    { id: 'ABS007', studentId: '250222006', activityId: 'ACT002', date: '2026-07-20', time: '13:10', status: 'Present' },
    { id: 'ABS008', studentId: '250222004', activityId: 'ACT002', date: '2026-07-20', time: '13:40', status: 'Sick' },
    { id: 'ABS009', studentId: '250222001', activityId: 'ACT002', date: '2026-07-20', time: '13:00', status: 'Present' },
    
    { id: 'ABS010', studentId: '250222003', activityId: 'ACT005', date: '2026-07-01', time: '10:02', status: 'Present' },
    { id: 'ABS011', studentId: '250222006', activityId: 'ACT005', date: '2026-07-01', time: '10:15', status: 'Present' },
    { id: 'ABS012', studentId: '250222007', activityId: 'ACT005', date: '2026-07-01', time: '10:05', status: 'Present' },
    { id: 'ABS013', studentId: '250222004', activityId: 'ACT005', date: '2026-07-01', time: '09:55', status: 'Permission' },
    { id: 'ABS014', studentId: '250222001', activityId: 'ACT005', date: '2026-07-01', time: '10:30', status: 'Absent' },

    { id: 'ABS015', studentId: '250222005', activityId: 'ACT001', date: '2026-07-15', time: '09:08', status: 'Present' },
    { id: 'ABS016', studentId: '250222002', activityId: 'ACT001', date: '2026-07-15', time: '09:22', status: 'Present' },
    { id: 'ABS017', studentId: '250222005', activityId: 'ACT002', date: '2026-07-20', time: '13:00', status: 'Present' },
    { id: 'ABS018', studentId: '250222002', activityId: 'ACT002', date: '2026-07-20', time: '13:12', status: 'Present' }
  ]
};

// Ensure Directory and database exists
export function initializeDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB_DATA, null, 2), 'utf-8');
    console.log('Database initialized successfully with mock data.');
  } else {
    // If database exists, verify Admin user exists and is up to date
    try {
      const currentData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      let modified = false;
      
      // Ensure Admin exists in users table with role admin and standard username
      if (!currentData.users || !Array.isArray(currentData.users)) {
        currentData.users = [{ id: '1', username: 'Admin', role: 'admin' }];
        modified = true;
      } else {
        const adminIndex = currentData.users.findIndex((u: any) => u.username === 'Admin');
        if (adminIndex === -1) {
          currentData.users.push({ id: '1', username: 'Admin', role: 'admin' });
          modified = true;
        }
      }

      // Ensure Admin student record or Admin credential configuration
      if (modified) {
        fs.writeFileSync(DB_FILE, JSON.stringify(currentData, null, 2), 'utf-8');
      }
    } catch (e) {
      // In case of corrupt file, write defaults
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB_DATA, null, 2), 'utf-8');
    }
  }
}

export function readDb(): DatabaseSchema {
  initializeDb();
  const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(fileContent);
}

export function writeDb(data: DatabaseSchema): void {
  initializeDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
