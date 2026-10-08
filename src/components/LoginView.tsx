import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Shield,
  HelpCircle,
  X,
  Layers,
  Check,
  FileCheck
} from 'lucide-react';
import { 
  DEMO_STUDENT, 
  DEMO_INVIGILATOR, 
  DEMO_ADMIN, 
  TEACHERS_LIST, 
  PROFESSORS_LIST 
} from '../data/mockData';
import { db } from '../data/db';
import { 
  StudentProfile, 
  TeacherProfile, 
  InvigilatorProfile, 
  AdminProfile, 
  UserRole,
  RegisteredUser
} from '../types';

interface LoginViewProps {
  initialRole?: UserRole;
  onLoginSuccess: (student: StudentProfile) => void;
  onTeacherLogin?: (teacher: TeacherProfile) => void;
  onInvigilatorLogin?: (invigilator: InvigilatorProfile) => void;
  onAdminLogin?: (admin: AdminProfile) => void;
  onOpenGuide?: () => void;
  onNavigateRegister: (role?: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  onLoginSuccess, 
  onTeacherLogin,
  onInvigilatorLogin,
  onAdminLogin,
  onNavigateRegister 
}) => {
  // All fields initialize 100% BLANK on open - zero default prefilled logins!
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanInput = emailOrId.trim().toLowerCase();

    if (!cleanInput) {
      setErrorMessage('Please enter your Registered ID or Academic Email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // 1. Check Unified Registered Accounts (Saved during registration with position & custom password)
      const registeredAccounts = db.getRegisteredAccounts();
      let customUsers: RegisteredUser[] = [];
      try {
        const stored = localStorage.getItem('registered_users_v4');
        if (stored) customUsers = JSON.parse(stored);
      } catch (err) {
        console.error('Storage parse error:', err);
      }

      const allRegistered = [...customUsers, ...registeredAccounts];
      const matchedUser = allRegistered.find(
        (u) =>
          u.email.toLowerCase() === cleanInput ||
          u.idCode.toLowerCase() === cleanInput
      );

      if (matchedUser) {
        // STRICT REQUIREMENT: Only the intake password provided during registration is valid!
        if (password !== matchedUser.password) {
          setIsLoading(false);
          setErrorMessage(
            `Incorrect password for "${matchedUser.name}". Only the personal password you created during registration is valid.`
          );
          return;
        }

        // Successfully authenticated! Route to their registered position portal automatically!
        const position = matchedUser.role;
        setSuccessMessage(
          `Access Granted: Welcome ${matchedUser.name}! Identity verified as ${position.toUpperCase()}. Launching secure portal...`
        );

        setTimeout(() => {
          setIsLoading(false);
          if (position === 'student') {
            const studentProfile: StudentProfile = {
              id: matchedUser.id,
              name: matchedUser.name,
              email: matchedUser.email,
              password: matchedUser.password,
              rollNumber: matchedUser.idCode,
              prn: matchedUser.details?.prn || matchedUser.idCode,
              college: matchedUser.college || 'Government Polytechnic Pune',
              department: matchedUser.department || 'Information Technology',
              semester: matchedUser.details?.semester || 'Semester IV',
              phone: matchedUser.details?.phone || '',
              avatarUrl: matchedUser.avatarUrl,
              verified: true,
            };
            onLoginSuccess(studentProfile);
          } else if (position === 'teacher' && onTeacherLogin) {
            const teacherProfile: TeacherProfile = {
              id: matchedUser.id,
              name: matchedUser.name,
              email: matchedUser.email,
              password: matchedUser.password,
              employeeCode: matchedUser.idCode,
              department: matchedUser.department || 'Information Technology',
              college: matchedUser.college || 'Government Polytechnic Pune',
              designation: matchedUser.details?.designation || 'Faculty Professor',
              assignedSubject: matchedUser.details?.assignedSubject || 'Core Engineering',
              phone: matchedUser.details?.phone || '',
              avatarUrl: matchedUser.avatarUrl,
            };
            onTeacherLogin(teacherProfile);
          } else if (position === 'invigilator' && onInvigilatorLogin) {
            const invProfile: InvigilatorProfile = {
              id: matchedUser.id,
              name: matchedUser.name,
              email: matchedUser.email,
              password: matchedUser.password,
              employeeCode: matchedUser.idCode,
              department: matchedUser.department || 'Information Technology',
              college: matchedUser.college || 'Government Polytechnic Pune',
              roomAssigned: matchedUser.details?.roomAssigned || 'Exam Hall A-102',
              phone: matchedUser.details?.phone || '',
              avatarUrl: matchedUser.avatarUrl,
            };
            onInvigilatorLogin(invProfile);
          } else if (position === 'admin' && onAdminLogin) {
            const admProfile: AdminProfile = {
              id: matchedUser.id,
              name: matchedUser.name,
              email: matchedUser.email,
              password: matchedUser.password,
              adminCode: matchedUser.idCode,
              designation: matchedUser.details?.designation || 'Controller of Examinations',
              college: matchedUser.college || 'Government Polytechnic Pune',
              accessLevel: 'CONTROLLER_OF_EXAMS',
              avatarUrl: matchedUser.avatarUrl,
            };
            onAdminLogin(admProfile);
          }
        }, 500);
        return;
      }

      // 2. Check student store fallback
      let customStudents: any[] = [];
      try {
        const storedS = localStorage.getItem('registered_students');
        if (storedS) customStudents = JSON.parse(storedS);
      } catch (e) {}

      const allStudents = [...customStudents, ...db.getStudents()];
      const matchedStudent = allStudents.find(
        (s) =>
          s.email?.toLowerCase() === cleanInput ||
          s.rollNumber?.toLowerCase() === cleanInput
      );

      if (matchedStudent) {
        const studentPass = (matchedStudent as any).password;
        if (studentPass) {
          if (password !== studentPass) {
            setIsLoading(false);
            setErrorMessage('Incorrect password. Only the personal password created during registration is valid.');
            return;
          }
        } else if (password !== '123456') {
          setIsLoading(false);
          setErrorMessage('Incorrect password for student account.');
          return;
        }

        setSuccessMessage(`Access Granted: Welcome ${matchedStudent.name}! Identity verified as STUDENT.`);
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(matchedStudent);
        }, 500);
        return;
      }

      // 3. Check teacher store fallback
      let customTeachers: any[] = [];
      try {
        const storedT = localStorage.getItem('registered_teachers');
        if (storedT) customTeachers = JSON.parse(storedT);
      } catch (e) {}

      const allTeachers = [...customTeachers, ...db.getTeachers(), ...TEACHERS_LIST];
      const matchedTeacher = allTeachers.find(
        (t) =>
          t.email?.toLowerCase() === cleanInput ||
          t.employeeCode?.toLowerCase() === cleanInput
      );

      if (matchedTeacher) {
        const teacherPass = (matchedTeacher as any).password;
        if (teacherPass) {
          if (password !== teacherPass) {
            setIsLoading(false);
            setErrorMessage('Incorrect password. Only the personal password created during registration is valid.');
            return;
          }
        } else if (password !== 'faculty123') {
          setIsLoading(false);
          setErrorMessage('Incorrect password for faculty account.');
          return;
        }

        setSuccessMessage(`Access Granted: Welcome Professor ${matchedTeacher.name}! Identity verified as TEACHER.`);
        setTimeout(() => {
          setIsLoading(false);
          if (onTeacherLogin) onTeacherLogin(matchedTeacher);
        }, 500);
        return;
      }

      // 4. Check invigilator store fallback
      const matchedInvigilator = PROFESSORS_LIST.find(
        (inv) =>
          inv.email.toLowerCase() === cleanInput ||
          inv.employeeCode.toLowerCase() === cleanInput
      );

      if (matchedInvigilator && (password === 'proctor123' || password === '123456')) {
        setSuccessMessage(`Access Granted: Welcome ${matchedInvigilator.name}! Identity verified as INVIGILATOR.`);
        setTimeout(() => {
          setIsLoading(false);
          if (onInvigilatorLogin) onInvigilatorLogin(matchedInvigilator);
        }, 500);
        return;
      }

      // 5. Check admin store fallback
      if (
        (cleanInput === DEMO_ADMIN.email.toLowerCase() || cleanInput === 'admin' || cleanInput === 'coe') &&
        (password === 'admin123' || password === '123456')
      ) {
        setSuccessMessage(`Access Granted: Welcome ${DEMO_ADMIN.name}! Identity verified as CONTROLLER OF EXAMS.`);
        setTimeout(() => {
          setIsLoading(false);
          if (onAdminLogin) onAdminLogin(DEMO_ADMIN);
        }, 500);
        return;
      }

      // If not recognized
      setIsLoading(false);
      setErrorMessage(
        'Account not recognized or password incorrect. Please register first with your ID and personal password.'
      );
    }, 450);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-100">
      <div className="w-full max-w-md">
        
        {/* Professional Institutional Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Institutional Crest Header */}
          <div className="p-7 text-center bg-gradient-to-b from-blue-950 via-slate-900 to-blue-950 text-white border-b border-blue-900/40">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3 border border-blue-400/30">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Government Polytechnic Pune &bull; Autonomous Board</span>
            </div>
            
            <h1 className="text-2xl font-black tracking-tight text-white">
              Anti Cheating Online Examination
            </h1>
            <p className="text-xs text-blue-200/80 mt-1 max-w-xs mx-auto">
              Institutional Examination &amp; Proctoring Portal
            </p>
          </div>

          {/* Form Container */}
          <div className="p-6 sm:p-8">
            
            {/* Professional RBAC Security Seal */}
            <div className="mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-slate-800">Automatic Position Resolution</span>
              </div>
              <button
                type="button"
                onClick={() => setShowExplanationModal(true)}
                className="text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How It Works</span>
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="font-semibold">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="font-semibold">{successMessage}</div>
              </div>
            )}

            {/* Clean Professional Login Form (ID & Password only) */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* ID or Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Registered ID / Academic Email: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    placeholder="e.g. IT-2026-042 or user@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password: <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold">
                    Intake Password
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your personal password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Direct Register Link */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs">
              <span className="text-slate-500">Need to create an account? </span>
              <button
                type="button"
                onClick={() => onNavigateRegister('student')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Register with your ID &amp; Password
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Professional Explanation Modal: How Position Resolution Works */}
      {showExplanationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Institutional Identity Resolution
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExplanationModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              In enterprise academic portals, user positions are never selected on the front screen. Instead, the system automatically identifies who you are using <strong>Role-Based Access Control (RBAC)</strong>:
            </p>

            <div className="space-y-3 text-xs">
              
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-blue-950">Registration Identity Binding</h4>
                  <p className="text-blue-900/80 text-[11px] mt-0.5 leading-relaxed">
                    When you register, your account is bound to your selected position (Student, Faculty Teacher, Invigilator, or Admin CoE) along with your unique ID and personal password.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">Academic ID Classification Format</h4>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    Each position is assigned a standard institutional ID format:
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[10px] text-slate-500 font-mono">
                    <li>&bull; Students: Roll numbers (e.g. <span className="text-blue-700 font-semibold">IT-2026-042</span>)</li>
                    <li>&bull; Faculty: Employee codes (e.g. <span className="text-indigo-700 font-semibold">FAC-IT-108</span>)</li>
                    <li>&bull; Invigilators: Proctor duty codes (e.g. <span className="text-emerald-700 font-semibold">INV-HALL-04</span>)</li>
                    <li>&bull; CoE Admin: Controller admin code (e.g. <span className="text-amber-700 font-semibold">COE-ADMIN-01</span>)</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-emerald-950">Single-Terminal Auto-Dispatch</h4>
                  <p className="text-emerald-900/80 text-[11px] mt-0.5 leading-relaxed">
                    When you sign in with your ID and password, the system verifies your registered credentials and automatically launches your position's authorized workspace without asking for your role.
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowExplanationModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Understood
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
