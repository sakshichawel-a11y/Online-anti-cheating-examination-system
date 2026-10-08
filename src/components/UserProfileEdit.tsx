import React, { useState } from 'react';
import { StudentProfile, UserRole } from '../types';
import { 
  Camera, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  School, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Sparkles,
  Lock,
  GraduationCap,
  Save,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

interface UserProfileEditProps {
  student: StudentProfile | null;
  userRole: UserRole;
  onSaveProfile: (updatedStudent: StudentProfile) => void;
  onCancel: () => void;
}

const PRESET_AVATARS = [
  {
    name: 'Academic Avatar 1 (Default)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  },
  {
    name: 'Academic Avatar 2',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
  },
  {
    name: 'Academic Avatar 3',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  },
  {
    name: 'Academic Avatar 4',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
  },
];

export const UserProfileEdit: React.FC<UserProfileEditProps> = ({
  student,
  userRole,
  onSaveProfile,
  onCancel,
}) => {
  // Access control check: Only accessible when logged in as student
  if (userRole !== 'student' || !student) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-red-200 p-8 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Access Restricted &bull; Student Authorization Required
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            This candidate profile editor is strictly restricted to authenticated Student Candidates. Your current session ({userRole.toUpperCase()}) does not possess authorization to edit student credentials.
          </p>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Return to Authorized Portal
          </button>
        </div>
      </div>
    );
  }

  // Form states initialized with active student profile
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone || '+91 9876543210');
  const [rollNumber, setRollNumber] = useState(student.rollNumber);
  const [prn, setPrn] = useState(student.prn || 'PRN2024098124');
  const [department, setDepartment] = useState(student.department || 'Information Technology');
  const [semester, setSemester] = useState(student.semester || 'Semester IV (Diploma Engg)');
  const [college, setCollege] = useState(student.college || 'Apex Autonomous Institute of Engineering & Technology');
  const [avatarUrl, setAvatarUrl] = useState(
    student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250'
  );

  const [customUrlInput, setCustomUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setErrorMessage('File size exceeds 4MB limit. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Custom URL apply
  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatarUrl(customUrlInput.trim());
      setCustomUrlInput('');
      setErrorMessage(null);
    }
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Full name cannot be left empty.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid academic email address.');
      return;
    }

    setIsSubmitting(true);

    const updatedProfile: StudentProfile = {
      ...student,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      rollNumber: rollNumber.trim(),
      prn: prn.trim(),
      department: department.trim(),
      semester: semester.trim(),
      college: college.trim(),
      avatarUrl: avatarUrl,
      referencePhoto: avatarUrl,
      verified: true,
    };

    setTimeout(() => {
      onSaveProfile(updatedProfile);
      setSuccessToast(true);
      setIsSubmitting(false);

      setTimeout(() => {
        onCancel();
      }, 700);
    }, 350);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-semibold">Student profile updated successfully!</span>
        </div>
      )}

      {/* Top Navigation & Context */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 transition cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Desk</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Student Candidate Authorized</span>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-blue-800/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-2">
              <School className="w-3.5 h-3.5 text-blue-400" />
              <span>Autonomous Examination Candidate Record</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Edit Student Profile & Biometrics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Keep your academic credentials, contact details, and biometric webcam reference photo accurate for autonomous exam proctoring verification.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-900/80 p-3 rounded-2xl border border-slate-700 text-xs">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-bold text-white">{student.rollNumber}</div>
              <div className="text-[10px] text-slate-400">{student.prn || 'PRN2024098124'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification / Error */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Update Validation:</strong> {errorMessage}
          </div>
        </div>
      )}

      {/* Main Edit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Reference Photo Management */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Biometric Photo & Avatar</span>
            </h2>

            {/* Photo Preview */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-blue-600 shadow-md transition-all group-hover:brightness-95"
                />
                <span className="absolute -bottom-2 right-2 px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold shadow-md flex items-center gap-1 border border-white">
                  <ShieldCheck className="w-3 h-3" />
                  VERIFIED
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{name || 'Candidate Name'}</div>
                <div className="text-xs text-slate-500">Live Webcam Facial Comparison Baseline</div>
              </div>
            </div>

            {/* Upload File Input */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Upload New Image:
              </label>
              <label className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 text-slate-700 text-xs font-bold cursor-pointer transition">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Choose Image from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Custom URL Option */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Or Paste Image Web URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Preset Avatars */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Or Select Academic Preset:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(preset.url);
                      setErrorMessage(null);
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                      avatarUrl === preset.url
                        ? 'border-blue-600 ring-2 ring-blue-500/30'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                    title={preset.name}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-12 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Personal & Academic Details Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal & Enrolment Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Candidate Name: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Academic Email Address: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Contact Mobile Number:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Academic Department:
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition cursor-pointer"
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Cybersecurity & Digital Forensics">Cybersecurity & Digital Forensics</option>
                  <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Academic Semester:
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition cursor-pointer"
                >
                  <option value="Semester IV (Diploma Engg)">Semester IV (Diploma Engg)</option>
                  <option value="Semester III (Diploma Engg)">Semester III (Diploma Engg)</option>
                  <option value="Semester V (Diploma Engg)">Semester V (Diploma Engg)</option>
                  <option value="Semester VI (Final Year)">Semester VI (Final Year)</option>
                </select>
              </div>

              {/* College / Institution */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  College / Institute Name:
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

            </div>

            {/* University Registry Numbers (PRN & Roll) */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
                <span>Official Autonomous Examination Registry Identifiers:</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Institute Board
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    University Roll Number:
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="IT-2026-042"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Permanent Registration No (PRN):
                  </label>
                  <input
                    type="text"
                    value={prn}
                    onChange={(e) => setPrn(e.target.value)}
                    placeholder="PRN2024098124"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
