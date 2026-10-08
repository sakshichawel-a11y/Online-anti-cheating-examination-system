import React from 'react';
import { 
  ShieldCheck, 
  Camera, 
  Mic, 
  FileCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  UserPlus,
  KeyRound,
  Code,
  Shield,
  Layers
} from 'lucide-react';
import { UserRole } from '../types';

interface LandingViewProps {
  onSelectRole: (role: UserRole) => void;
  onNavigateLogin?: (role?: UserRole) => void;
  onNavigateRegister: (role?: UserRole) => void;
  onOpenGuide: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onSelectRole,
  onNavigateLogin,
  onNavigateRegister,
  onOpenGuide,
}) => {
  const handleOpenLogin = (role?: UserRole) => {
    if (onNavigateLogin) {
      onNavigateLogin(role || 'student');
    } else {
      onSelectRole(role || 'student');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between pb-12">
      
      {/* Grand Cover Main Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-blue-900/60 shadow-2xl">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-semibold shadow-inner">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Government Polytechnic Pune &bull; Autonomous Board of Examinations</span>
          </div>

          {/* Official Cover Application Name */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-white">
              Anti Cheating <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
                Online Examination
              </span>
            </h1>
            <p className="text-sm sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
              Official Secure Autonomous Examination &amp; AI-Powered Proctoring Gateway
            </p>
          </div>

          {/* Institutional Disclaimer Badge */}
          <div className="inline-block px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs max-w-2xl mx-auto leading-relaxed shadow-sm">
            <strong>Autonomous Diploma IT Project:</strong> Confidential institutional examination environment with real-time biometric verification, live computer vision anti-cheating surveillance, and tamper-resistant evaluation.
          </div>

          {/* Primary Action Gateways (Sign In & Register) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            
            {/* Primary Action 1: Sign In */}
            <button
              onClick={() => handleOpenLogin()}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-base font-extrabold shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer border border-blue-400/30"
            >
              <KeyRound className="w-5 h-5 text-blue-200" />
              <span>Sign In to Examination System</span>
              <ArrowRight className="w-5 h-5 text-blue-200" />
            </button>

            {/* Primary Action 2: Direct Registration for Position */}
            <button
              onClick={() => onNavigateRegister('student')}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 text-white border-2 border-white/20 hover:border-white/40 rounded-2xl text-base font-extrabold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer"
            >
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <span>Register New Account</span>
            </button>

          </div>

          {/* Security & System Features */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Strict Password Authentication
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Camera className="w-4 h-4 text-sky-400" />
              Webcam AI Vision Proctoring
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Mic className="w-4 h-4 text-indigo-400" />
              Microphone Decibel Calibration
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Layers className="w-4 h-4 text-amber-400" />
              Automatic Account Routing
            </span>
          </div>

        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Secure Account Registration</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Register with your institutional ID and personal intake password. Your workspace is automatically loaded upon sign in.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Strict Password Protection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Only the password created during registration is accepted for logging in. Blank login terminals ensure zero unauthorized access.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Anti-Cheating Surveillance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time multi-face lockout, room audio analysis, tab switch counters, and proctor live stream monitoring.
            </p>
          </div>

        </div>

        {/* Technical Blueprint Action Bar */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold">Diploma IT Microproject Technical Specification</h4>
              <p className="text-[11px] text-slate-400">Complete architectural roadmap, schema definitions, and examination code.</p>
            </div>
          </div>
          <button
            onClick={onOpenGuide}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-md flex-shrink-0"
          >
            View Technical Documentation
          </button>
        </div>

      </section>

    </div>
  );
};
