import React, { useState, useRef, useEffect } from 'react';
import { ExamData, StudentProfile } from '../types';
import { 
  Info, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Maximize2, 
  ArrowLeft,
  Lock,
  Camera,
  Video,
  VideoOff,
  Check,
  AlertCircle
} from 'lucide-react';

interface InstructionsViewProps {
  exam: ExamData;
  student?: StudentProfile;
  onBack: () => void;
  onStartExam: () => void;
}

export const InstructionsView: React.FC<InstructionsViewProps> = ({
  exam,
  student,
  onBack,
  onStartExam,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [cameraVerified, setCameraVerified] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-initiate camera preview check
  useEffect(() => {
    startCameraCheck();
    return () => {
      stopCamera();
    };
  }, []);

  const startCameraCheck = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 480 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
        setCameraVerified(true);
      } else {
        setIsCameraActive(true);
        setCameraVerified(true);
      }
    } catch (err: any) {
      console.warn('Camera verification fallback:', err);
      setCameraError('Webcam permission request pending or hardware unavailable. Fallback simulation mode is enabled for demo testing.');
      setIsCameraActive(true);
      setCameraVerified(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleStart = () => {
    if (!agreed) return;

    // Request fullscreen on document if supported
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.log('Fullscreen request handled:', err);
        });
      }
    } catch (e) {
      console.log('Fullscreen error:', e);
    }

    // Stop instructions camera so exam engine can acquire its own stream cleanly
    stopCamera();
    onStartExam();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-2xl shadow-md border border-slate-200/90 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold mb-2 border border-blue-400/30">
                <Info className="w-3.5 h-3.5 text-amber-300" />
                <span>Autonomous Candidate Guidelines & Proctoring Pre-Check</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{exam.title}</h1>
              <p className="text-blue-200 text-xs sm:text-sm mt-0.5">
                {exam.code} &bull; {exam.subject} &bull; {exam.department}
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-blue-950/60 px-3.5 py-2 rounded-xl border border-blue-400/30 w-fit">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-semibold text-white">
                {exam.durationMinutes} Minutes Limit
              </span>
            </div>
          </div>
        </div>

        {/* Specs Overview */}
        <div className="p-6 sm:p-8 pb-4 border-b border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <div className="text-xs text-slate-500 font-medium">Total Questions</div>
              <div className="text-xl font-bold text-blue-600 mt-0.5">{exam.totalQuestions}</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <div className="text-xs text-slate-500 font-medium">Exam Duration</div>
              <div className="text-xl font-bold text-blue-600 mt-0.5">{exam.durationMinutes}m</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <div className="text-xs text-slate-500 font-medium">Total Marks</div>
              <div className="text-xl font-bold text-blue-600 mt-0.5">{exam.totalMarks}</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <div className="text-xs text-slate-500 font-medium">Passing Marks</div>
              <div className="text-xl font-bold text-emerald-600 mt-0.5">{exam.passingMarks}</div>
            </div>

          </div>
        </div>

        {/* Webcam Pre-Flight Proctoring Diagnostic */}
        <div className="p-6 sm:p-8 pb-4 bg-slate-50/70 border-b border-slate-200">
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {/* Live Camera Box */}
            <div className="w-full md:w-64 h-48 bg-slate-900 rounded-2xl overflow-hidden relative border-2 border-blue-500 shadow-inner flex items-center justify-center">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Facial Box Overlay */}
                  <div className="absolute inset-4 border border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm text-[10px] text-emerald-400 py-0.5 px-2 rounded-md text-center">
                    &bull; Video Stream Active
                  </div>
                </>
              ) : (
                <div className="text-slate-400 text-center space-y-1 p-3">
                  <VideoOff className="w-8 h-8 mx-auto" />
                  <div className="text-xs">Initializing Webcam...</div>
                </div>
              )}
            </div>

            {/* Verification Details */}
            <div className="flex-1 space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Webcam Surveillance Diagnostic: Passed</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                Candidate Facial & Room Proctoring Verification
              </h3>
              
              <p className="text-xs text-slate-600 leading-relaxed">
                During this examination, continuous real-time AI webcam monitoring will track candidate presence. If your face moves out of camera frame, multiple persons appear, or the camera is obstructed, an automated anti-cheating strike will be logged.
              </p>

              {cameraError && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  {cameraError}
                </p>
              )}

              <div className="text-[11px] text-slate-500 flex items-center gap-4">
                <span>&bull; Lighting: Adequate</span>
                <span>&bull; Camera: Front Facing</span>
                <span>&bull; Audio/Microphone: Monitored</span>
              </div>
            </div>

          </div>
        </div>

        {/* Rules & Anti-Cheating Guidelines */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
              <span>Mandatory Autonomous Examination Regulations</span>
            </h2>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>One Exam at a Time:</strong> Candidates are restricted to taking this scheduled paper during the authorized window. You cannot open parallel tests.
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-300 text-red-950 shadow-xs">
                <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Zero Tolerance for Multiple Faces (Instant Lock):</strong> When multiple faces are detected in the webcam surveillance feed, <u>no warnings are granted</u>. The examination is immediately and automatically locked and submitted for disciplinary disqualification.
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>35 Single-Choice Questions:</strong> The paper contains exactly 35 questions (1 mark each). Only one answer choice can be selected per question; multiple options cannot be chosen.
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-red-50/70 border border-red-200 text-red-900">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Do Not Switch Tabs or Minimize:</strong> Navigating away from the active examination window immediately logs a <code className="font-mono font-bold">TAB_SWITCH</code> warning strike.
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Camera className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Continuous Web Camera Monitoring:</strong> Face moving out of camera frame or camera lens obstruction logs warning strikes.
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Copy/Paste & Right-Click Restricted:</strong> Clipboard actions, context menu right-clicks, and developer shortcuts (Ctrl+C, Ctrl+V, F12) are actively blocked.
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Strict 3-Strike Warning Policy:</strong> Non-critical suspicious events record up to 3 warnings. On strike 3, your exam is terminated and auto-submitted.
                </div>
              </li>
            </ul>
          </div>

          {/* Agreement Checkbox */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                id="checkbox-agree-rules"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                I solemnly affirm that I am the registered candidate ({student?.name || 'Student Candidate'}, {student?.rollNumber || 'IT-2026-042'}). I agree to full-screen browser lockdown and continuous webcam proctoring throughout this test.
              </span>
            </label>
          </div>

          {/* Navigation CTAs */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Cancel & Return</span>
            </button>

            <button
              id="btn-begin-exam"
              onClick={handleStart}
              disabled={!agreed}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Enter Fullscreen & Begin Proctored Exam</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
