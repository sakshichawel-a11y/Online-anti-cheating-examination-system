import React, { useState, useRef, useEffect } from 'react';
import { UserRole, StudentProfile, TeacherProfile, InvigilatorProfile, AdminProfile, RegisteredUser } from '../types';
import { db } from '../data/db';
import { 
  UserPlus, 
  ShieldCheck, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  GraduationCap, 
  Mail, 
  Lock, 
  Phone, 
  Hash, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Video,
  VideoOff,
  Upload,
  Image as ImageIcon,
  Glasses, 
  Briefcase, 
  UserCog,
  School,
  Layers,
  RotateCcw
} from 'lucide-react';
import { PolicyPagesModal } from './PolicyPagesModal';
import { PolicyTab } from '../types/privacy';

interface RegisterViewProps {
  initialRole?: UserRole;
  onRegisterSuccess: (student: StudentProfile, autoLogin: boolean) => void;
  onRegisterTeacherSuccess?: (teacher: TeacherProfile, autoLogin: boolean) => void;
  onRegisterUserSuccess?: (user: RegisteredUser, autoLogin: boolean) => void;
  onNavigateLogin: (role?: UserRole) => void;
}

const DEPARTMENTS_LIST = [
  'Information Technology (IT)',
  'Computer Engineering (CE / CSE)',
  'Computer Science & Engineering (AI & ML)',
  'Artificial Intelligence & Data Science (AI & DS)',
  'Cybersecurity & Digital Forensics',
  'Electronics & Telecommunication Engineering (EXTC)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Other / Interdisciplinary Branch',
];

export const RegisterView: React.FC<RegisterViewProps> = ({
  initialRole = 'student',
  onRegisterSuccess,
  onRegisterTeacherSuccess,
  onRegisterUserSuccess,
  onNavigateLogin,
}) => {
  const [registerRole, setRegisterRole] = useState<UserRole>(initialRole);

  // All form fields initialize 100% BLANK as per user specification!
  const [fullName, setFullName] = useState('');
  const [idCode, setIdCode] = useState(''); // Roll No / Employee ID / Proctor ID / Admin ID
  const [prn, setPrn] = useState('');
  const [designation, setDesignation] = useState('');
  const [assignedRoomOrSubject, setAssignedRoomOrSubject] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS_LIST[0]);
  const [semester, setSemester] = useState('Semester IV');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeHonorCode, setAgreeHonorCode] = useState(false);

  // Policy Modal state
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyModalTab, setPolicyModalTab] = useState<PolicyTab>('privacy');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Camera & Photo enrollment state
  const [photoMode, setPhotoMode] = useState<'camera' | 'upload'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isConnectingCamera, setIsConnectingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setIsConnectingCamera(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
      setIsConnectingCamera(false);
    } catch (err: any) {
      console.warn('Camera enrollment error:', err);
      setIsConnectingCamera(false);
      setIsCameraActive(false);
      setCameraError('Camera access unavailable. You can use image upload below.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsConnectingCamera(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedPhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full official name.');
      return;
    }

    if (!idCode.trim()) {
      const label = 
        registerRole === 'student' ? 'Student Roll Number' :
        registerRole === 'teacher' ? 'Faculty / Employee ID' :
        registerRole === 'invigilator' ? 'Invigilator Duty Code' : 'Controller Admin ID';
      setErrorMessage(`Please enter your ${label}.`);
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Academic email address cannot be empty.');
      return;
    }

    if (/[A-Z]/.test(trimmedEmail)) {
      setErrorMessage('Only small letters are acceptable in the email address.');
      return;
    }

    const lowercaseEmailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!lowercaseEmailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid academic email address using only small letters.');
      return;
    }

    if (!password) {
      setErrorMessage('Please create an account password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeHonorCode) {
      setErrorMessage('You must accept the Examination Integrity & Autonomous Regulations Undertaking.');
      return;
    }

    setIsLoading(true);

    const defaultCollege = college.trim() || 'Government Polytechnic Pune (Autonomous Institute)';
    const assignedAvatar = capturedPhoto || 
      (registerRole === 'student'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : registerRole === 'teacher'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : registerRole === 'invigilator'
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80');

    setTimeout(() => {
      // Build unified registered user object
      const registeredUser: RegisteredUser = {
        id: Date.now(),
        name: fullName.trim(),
        email: trimmedEmail,
        password, // Crucial: saved intake password
        role: registerRole,
        idCode: idCode.trim(),
        department,
        college: defaultCollege,
        avatarUrl: assignedAvatar,
        createdAt: new Date().toISOString(),
        details: {
          prn: prn.trim() || idCode.trim(),
          semester,
          designation: designation.trim() || (registerRole === 'teacher' ? 'Assistant Professor' : registerRole === 'admin' ? 'Controller of Exams' : 'Surveillance Officer'),
          assignedSubject: assignedRoomOrSubject.trim() || 'Core Engineering & Applied Technologies',
          roomAssigned: assignedRoomOrSubject.trim() || 'Exam Hall A-102',
          phone: phone.trim(),
          referencePhoto: capturedPhoto || undefined,
        },
      };

      // Save into DB unified registered accounts table & role sync
      db.registerAccount(registeredUser);

      // Save into localStorage for browser persistence
      try {
        const stored = localStorage.getItem('registered_users_v4');
        const list: RegisteredUser[] = stored ? JSON.parse(stored) : [];
        const updated = list.filter(
          (u) =>
            u.email.toLowerCase() !== trimmedEmail &&
            u.idCode.toLowerCase() !== idCode.trim().toLowerCase()
        );
        updated.unshift(registeredUser);
        localStorage.setItem('registered_users_v4', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error:', err);
      }

      setSuccessMessage(
        `Registration Successful! Welcome ${registeredUser.name}. Your personal password has been saved. Only this password will open your ${registerRole.toUpperCase()} portal.`
      );

      setTimeout(() => {
        setIsLoading(false);
        if (onRegisterUserSuccess) {
          onRegisterUserSuccess(registeredUser, true);
        } else if (registerRole === 'student') {
          const studentProfile: StudentProfile = {
            id: registeredUser.id,
            name: registeredUser.name,
            email: registeredUser.email,
            password: registeredUser.password,
            rollNumber: registeredUser.idCode,
            prn: registeredUser.details?.prn,
            college: registeredUser.college,
            department: registeredUser.department,
            semester: registeredUser.details?.semester,
            phone: registeredUser.details?.phone,
            avatarUrl: registeredUser.avatarUrl,
            referencePhoto: registeredUser.details?.referencePhoto,
            verified: true,
          };
          onRegisterSuccess(studentProfile, true);
        } else if (registerRole === 'teacher' && onRegisterTeacherSuccess) {
          const teacherProfile: TeacherProfile = {
            id: registeredUser.id,
            name: registeredUser.name,
            email: registeredUser.email,
            password: registeredUser.password,
            employeeCode: registeredUser.idCode,
            department: registeredUser.department || 'Information Technology',
            college: registeredUser.college || 'Government Polytechnic Pune',
            designation: registeredUser.details?.designation || 'Faculty Professor',
            assignedSubject: registeredUser.details?.assignedSubject || 'Computer Engineering',
            phone: registeredUser.details?.phone,
            avatarUrl: registeredUser.avatarUrl,
          };
          onRegisterTeacherSuccess(teacherProfile, true);
        } else {
          onNavigateLogin(registerRole);
        }
      }, 700);
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-100">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-8 border-b border-blue-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/30">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Autonomous Board of Examinations &bull; Registration Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Direct Position Registration
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl">
              Register directly for your specific position with your own personal password. All input fields start blank.
            </p>
          </div>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{successMessage}</div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* Section 1: Position Credentials */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              1. Institutional Position &amp; Academic Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Position Selection Input (Field-level selection, not on the bar!) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
                  Select Institutional Position: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5 pointer-events-none" />
                  <select
                    value={registerRole}
                    onChange={(e) => {
                      setRegisterRole(e.target.value as UserRole);
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition cursor-pointer"
                    required
                  >
                    <option value="student">Student Candidate (Examination Enrolment Desk)</option>
                    <option value="teacher">Faculty Professor / Teacher (Paper Setting &amp; Evaluations)</option>
                    <option value="invigilator">Exam Invigilator (Live Hall CCTV Surveillance Room)</option>
                    <option value="admin">Administrator / Controller of Examinations (CoE Panel)</option>
                  </select>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Select your institutional capacity. Your ID and personal password will automatically unlock this position's portal upon sign-in.
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter official full name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                  required
                />
              </div>

              {/* ID Code based on Position */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {registerRole === 'student' && 'Student Roll Number *'}
                  {registerRole === 'teacher' && 'Faculty / Employee Code *'}
                  {registerRole === 'invigilator' && 'Invigilator Proctor Duty ID *'}
                  {registerRole === 'admin' && 'Controller Admin ID *'}
                </label>
                <input
                  type="text"
                  value={idCode}
                  onChange={(e) => setIdCode(e.target.value)}
                  placeholder={
                    registerRole === 'student' ? 'e.g. IT-2026-042' :
                    registerRole === 'teacher' ? 'e.g. FAC-IT-108' :
                    registerRole === 'invigilator' ? 'e.g. INV-HALL-04' : 'e.g. COE-ADMIN-01'
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                  required
                />
              </div>

              {/* Position Specific Detail 1 */}
              {registerRole === 'student' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Permanent Registration Number (PRN)
                  </label>
                  <input
                    type="text"
                    value={prn}
                    onChange={(e) => setPrn(e.target.value)}
                    placeholder="e.g. PRN2024098142 (Optional)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder={
                      registerRole === 'teacher' ? 'e.g. Assistant Professor / Lecturer' :
                      registerRole === 'invigilator' ? 'e.g. Senior Exam Supervisor' : 'e.g. Controller of Examinations'
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                  />
                </div>
              )}

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition cursor-pointer"
                >
                  {DEPARTMENTS_LIST.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Position Specific Detail 2 */}
              {registerRole === 'student' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Academic Semester
                  </label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. Semester IV"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {registerRole === 'teacher' ? 'Assigned Subject / Discipline' :
                     registerRole === 'invigilator' ? 'Assigned Examination Room' : 'Executive Authority Scope'}
                  </label>
                  <input
                    type="text"
                    value={assignedRoomOrSubject}
                    onChange={(e) => setAssignedRoomOrSubject(e.target.value)}
                    placeholder={
                      registerRole === 'teacher' ? 'e.g. Core Java & System Architecture' :
                      registerRole === 'invigilator' ? 'e.g. Exam Hall B-204' : 'e.g. Institutional Autonomous Board'
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                  />
                </div>
              )}

              {/* College / Institution */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  College / Institute Name
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Government Polytechnic Pune (or your college)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Contact & Authentication */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              2. Academic Email &amp; Personal Password (Intake Password)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Academic Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    placeholder="lowercase.email@college.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Only lowercase letters allowed.
                </span>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Create Personal Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-blue-600 mt-1 block font-medium">
                  This intake password is the ONLY valid password for logging into your portal.
                </span>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Personal Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Biometric Baseline Photo (Optional but recommended) */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              3. Biometric Photo Verification Baseline
            </h2>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
              
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center flex-shrink-0">
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Baseline" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="text-xs font-bold text-slate-800">
                  {capturedPhoto ? 'Admit Card Photo Enrolled' : 'Capture or Upload Face Photo for Hall Ticket'}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Used by the real-time AI face recognition engine during examination surveillance.
                </p>

                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={isConnectingCamera}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{isConnectingCamera ? 'Connecting...' : 'Open Webcam'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCapturePhoto}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Snap Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <VideoOff className="w-3.5 h-3.5" />
                        <span>Close</span>
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Image</span>
                  </button>
                </div>

                {isCameraActive && (
                  <div className="mt-2 w-full max-w-xs rounded-xl overflow-hidden border border-slate-300 bg-black aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </div>
                )}

                {cameraError && (
                  <p className="text-[10px] text-amber-600 font-semibold">{cameraError}</p>
                )}
              </div>

            </div>
          </div>

          {/* Section 4: Undertaking */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeHonorCode}
                onChange={(e) => setAgreeHonorCode(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                <strong>Autonomous Examination Undertaking:</strong> I declare that all registration details are correct. I understand that my registered personal password is confidential and is the only valid key to access my {registerRole.toUpperCase()} portal.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigateLogin(registerRole)}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Sign In to Portal
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-extrabold rounded-2xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Registration...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Complete Registration &amp; Save Password</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      <PolicyPagesModal
        isOpen={policyModalOpen}
        initialTab={policyModalTab}
        onClose={() => setPolicyModalOpen(false)}
      />
    </div>
  );
};
