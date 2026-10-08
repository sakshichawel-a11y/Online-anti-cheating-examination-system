import React, { useState } from 'react';
import { 
  ViewMode, 
  StudentProfile, 
  TeacherProfile,
  InvigilatorProfile, 
  AdminProfile, 
  UserRole, 
  PortalPage 
} from '../types';
import { 
  ShieldCheck, 
  User, 
  LogOut, 
  Code, 
  Monitor, 
  Clock, 
  Glasses, 
  UserCog, 
  GraduationCap, 
  Building2, 
  ChevronDown,
  ShieldAlert,
  SlidersHorizontal,
  FileText,
  School,
  Sparkles,
  Lock
} from 'lucide-react';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  portalPage: PortalPage;
  userRole: UserRole;
  student: StudentProfile | null;
  teacher: TeacherProfile | null;
  invigilator: InvigilatorProfile | null;
  admin: AdminProfile | null;
  onSelectRole: (role: UserRole) => void;
  onLogout: () => void;
  onNavigateHistory: () => void;
  onNavigateDashboard: () => void;
  onNavigateProfile?: () => void;
  onNavigateTeacher: () => void;
  onNavigateInvigilator: () => void;
  onNavigateAdmin: () => void;
  onNavigateRegister: (role?: 'student' | 'teacher') => void;
  onNavigateLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  portalPage,
  userRole,
  student,
  teacher,
  invigilator,
  admin,
  onSelectRole,
  onLogout,
  onNavigateHistory,
  onNavigateDashboard,
  onNavigateProfile,
  onNavigateTeacher,
  onNavigateInvigilator,
  onNavigateAdmin,
  onNavigateRegister,
  onNavigateLogin,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Active user details
  const activeUser =
    userRole === 'student'
      ? student
      : userRole === 'teacher'
      ? teacher
      : userRole === 'invigilator'
      ? invigilator
      : admin;

  const roleTitle =
    userRole === 'student'
      ? 'Student Candidate'
      : userRole === 'teacher'
      ? 'Faculty Professor'
      : userRole === 'invigilator'
      ? 'Live Invigilator'
      : 'Controller of Exams (Admin)';

  const roleSubtitle =
    userRole === 'student'
      ? student?.rollNumber || 'IT-2026-042'
      : userRole === 'teacher'
      ? teacher?.department?.split(' ')[0] || 'Faculty'
      : userRole === 'invigilator'
      ? invigilator?.roomAssigned?.split(' ')[0] || 'Hall Proctor'
      : 'GPP CoE';

  return (
    <header className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white shadow-lg border-b border-blue-800/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (userRole === 'student') onNavigateDashboard();
                else if (userRole === 'teacher') onNavigateTeacher();
                else if (userRole === 'invigilator') onNavigateInvigilator();
                else onNavigateAdmin();
              }}
              className="flex items-center gap-2.5 text-left group transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="font-bold text-base sm:text-lg leading-tight tracking-tight flex items-center gap-2">
                  <span>Anti Cheating ExamPortal</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AI Anti-Cheat
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-normal">
                  {userRole === 'student' && '🎓 Govt. Polytechnic Pune • Student App'}
                  {userRole === 'teacher' && '👩‍🏫 Govt. Polytechnic Pune • Faculty Studio'}
                  {userRole === 'invigilator' && '🛡️ Govt. Polytechnic Pune • Invigilator Desk'}
                  {userRole === 'admin' && '🏛️ Govt. Polytechnic Pune • Controller of Exams'}
                </div>
              </div>
            </button>
          </div>

          {/* Navigation Links STRICTLY DIVIDED BY ROLE */}
          <div className="hidden lg:flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
            
            {/* If Not Authenticated (Login or Register or Landing) */}
            {(portalPage === 'login' || portalPage === 'register' || portalPage === 'landing') && (
              <>
                <button
                  onClick={() => onNavigateLogin()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    portalPage === 'login'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Portal Login (Password Gated)</span>
                </button>

                <button
                  onClick={() => onNavigateRegister()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    portalPage === 'register'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Student Registration</span>
                </button>
              </>
            )}

            {/* Student Candidate Navigation (Only when logged in as Student) */}
            {portalPage !== 'login' && portalPage !== 'register' && portalPage !== 'landing' && userRole === 'student' && (
              <>
                <button
                  onClick={() => {
                    setViewMode('portal');
                    onNavigateDashboard();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'portal' && (portalPage === 'dashboard' || portalPage === 'instructions' || portalPage === 'exam' || portalPage === 'result')
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Exam Desk</span>
                </button>

                <button
                  onClick={() => {
                    setViewMode('portal');
                    if (onNavigateHistory) onNavigateHistory();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'portal' && portalPage === 'history'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Exam History & Marksheet</span>
                </button>

                <button
                  onClick={() => {
                    setViewMode('portal');
                    if (onNavigateProfile) onNavigateProfile();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'portal' && portalPage === 'profile'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </>
            )}

            {/* Teacher / Faculty Navigation (Only when logged in as Teacher) */}
            {portalPage !== 'login' && portalPage !== 'register' && portalPage !== 'landing' && userRole === 'teacher' && (
              <>
                <button
                  onClick={() => {
                    setViewMode('portal');
                    onNavigateTeacher();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'portal' && portalPage === 'teacher'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <School className="w-3.5 h-3.5 text-blue-300" />
                  <span>Question Paper Studio (35 Questions)</span>
                </button>
              </>
            )}

            {/* Invigilator Live Room Navigation (Only when logged in as Invigilator) */}
            {portalPage !== 'login' && portalPage !== 'register' && portalPage !== 'landing' && userRole === 'invigilator' && (
              <>
                <button
                  onClick={() => {
                    setViewMode('portal');
                    onNavigateInvigilator();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'portal' && portalPage === 'invigilator'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Glasses className="w-3.5 h-3.5" />
                  <span>Live Surveillance Room</span>
                </button>
              </>
            )}

            {/* Admin CoE Navigation (EXCLUSIVE Exam History Access) */}
            {portalPage !== 'login' && portalPage !== 'register' && portalPage !== 'landing' && userRole === 'admin' && (
              <>
                <button
                  onClick={() => {
                    setViewMode('portal');
                    onNavigateAdmin();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'portal' && portalPage === 'admin'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <UserCog className="w-3.5 h-3.5" />
                  <span>Controller Admin</span>
                </button>

                <button
                  onClick={() => {
                    setViewMode('portal');
                    onNavigateHistory();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'portal' && portalPage === 'history'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Institutional Exam History (Admin Only)</span>
                </button>
              </>
            )}

            {/* Technical Documentation / Blueprint */}
            <button
              onClick={() => setViewMode('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ml-1 ${
                viewMode === 'guide'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-amber-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Technical Blueprint</span>
            </button>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="flex items-center gap-2.5">

            {/* Official GPP Website Link */}
            <a
              href="https://www.gppune.ac.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800/80 border border-blue-600/40 text-xs font-semibold text-blue-200 transition"
              title="Autonomous Institute of Government of Maharashtra"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Official GPP Website</span>
            </a>
            
            {/* Active User Avatar & Secure Logout OR Auth Action Buttons */}
            {portalPage === 'login' || portalPage === 'register' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => portalPage === 'login' ? onNavigateRegister() : onNavigateLogin()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {portalPage === 'login' ? (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>Register Account</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* Verified Active Portal Badge & Secure Switch */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-200">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      userRole === 'student' ? 'bg-blue-400' :
                      userRole === 'teacher' ? 'bg-indigo-400' :
                      userRole === 'invigilator' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`} />
                    <span className="capitalize font-bold text-slate-100">
                      {userRole === 'student' && 'Student Portal'}
                      {userRole === 'teacher' && 'Teacher Portal'}
                      {userRole === 'invigilator' && 'Invigilator Room'}
                      {userRole === 'admin' && 'Admin CoE'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1 border-l border-slate-700 pl-1.5 hidden md:inline">
                      Password Verified
                    </span>
                  </div>
                </div>

                {/* Active User Avatar & Secure Logout / Switch Portal */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => {
                      if (userRole === 'student' && onNavigateProfile) {
                        onNavigateProfile();
                      }
                    }}
                    className={`flex items-center gap-2 text-left transition ${
                      userRole === 'student' ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
                    }`}
                    title={userRole === 'student' ? 'Click to edit your student profile' : undefined}
                  >
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs font-bold leading-none text-slate-100">
                        {activeUser?.name || 'User'}
                      </span>
                      <span className="text-[10px] text-blue-300 font-semibold leading-tight mt-0.5">
                        {roleSubtitle}
                      </span>
                    </div>

                    <img
                      src={
                        activeUser?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                      }
                      alt="Active User"
                      className="w-8 h-8 rounded-xl object-cover border border-blue-400/50 shadow-xs"
                    />
                  </button>

                  <button
                    onClick={onLogout}
                    title="Switch Portal or Logout (Password Required to Re-enter)"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-red-950/50 border border-slate-700 hover:border-red-500/50 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
