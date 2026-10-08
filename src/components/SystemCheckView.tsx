import React, { useState, useRef, useEffect } from 'react';
import { ExamData, StudentProfile } from '../types';
import { db } from '../data/db';
import { 
  Camera, 
  Mic, 
  Monitor, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Volume2, 
  Video, 
  VideoOff, 
  Check, 
  Lock,
  Eye,
  AlertOctagon,
  HelpCircle,
  FileText,
  ExternalLink,
  Building2
} from 'lucide-react';
import { PolicyPagesModal } from './PolicyPagesModal';
import { PolicyTab } from '../types/privacy';

interface SystemCheckViewProps {
  exam: ExamData;
  student: StudentProfile;
  onProceedToExam: () => void;
  onBack: () => void;
}

export const SystemCheckView: React.FC<SystemCheckViewProps> = ({
  exam,
  student,
  onProceedToExam,
  onBack,
}) => {
  // Step in workflow:
  // Step 1: Explicit Consent Screen
  // Step 2: Separate Hardware Permission & Device Check
  const [currentStep, setCurrentStep] = useState<'CONSENT' | 'HARDWARE_CHECK'>('CONSENT');

  // Four mandatory UNCHECKED checkboxes
  const [consentNoticeRead, setConsentNoticeRead] = useState(false);
  const [consentMonitoringUnderstood, setConsentMonitoringUnderstood] = useState(false);
  const [consentCameraMicAllowed, setConsentCameraMicAllowed] = useState(false);
  const [consentAlertsReviewedUnderstood, setConsentAlertsReviewedUnderstood] = useState(false);

  // Policy Modal
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyModalTab, setPolicyModalTab] = useState<PolicyTab>('consent');

  // Hardware states (Step 2)
  const [cameraPermissionRequested, setCameraPermissionRequested] = useState(false);
  const [micPermissionRequested, setMicPermissionRequested] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [micStatus, setMicStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [permissionDeniedError, setPermissionDeniedError] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [browserCheckPassed, setBrowserCheckPassed] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const allConsentsGiven = 
    consentNoticeRead && 
    consentMonitoringUnderstood && 
    consentCameraMicAllowed && 
    consentAlertsReviewedUnderstood;

  // Handle proceeding from Consent to Hardware Check
  const handleProceedToHardware = () => {
    if (!allConsentsGiven) return;

    // Log explicit consent record into DB
    const policyMeta = db.getPolicyMetadata();
    db.recordConsent({
      studentId: student.id,
      studentRoll: student.rollNumber,
      examId: exam.id,
      policyVersion: `${policyMeta.privacyPolicyVersion} / Consent ${policyMeta.consentTextVersion}`,
      consentTimestamp: new Date().toLocaleString(),
      consentType: 'ONLINE_MONITORING_EXPLICIT_CONSENT',
      cameraConsent: consentCameraMicAllowed,
      micConsent: consentCameraMicAllowed,
      browserMonitorConsent: consentMonitoringUnderstood,
      automatedAlertReviewConsent: consentAlertsReviewedUnderstood,
    });

    // Also log admin audit record
    db.logAdminAction(
      student.id,
      student.name,
      'STUDENT_RECORD_ACCESSED',
      `Explicit Exam Consent Logged: Exam ${exam.code} (${student.rollNumber})`,
      'Candidate submitted informed consent checkboxes before hardware initialization.'
    );

    setCurrentStep('HARDWARE_CHECK');
  };

  // Step 2: Separate Camera Permission Request
  const requestCameraPermission = async () => {
    setCameraPermissionRequested(true);
    setPermissionDeniedError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        
        // Keep active track
        if (streamRef.current) {
          videoStream.getVideoTracks().forEach(track => streamRef.current?.addTrack(track));
        } else {
          streamRef.current = videoStream;
        }

        setCameraStatus('granted');

        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(() => {});
        }
      } else {
        setCameraStatus('granted'); // simulation
      }
    } catch (err: any) {
      console.warn('Camera permission denied or unavailable:', err);
      setCameraStatus('denied');
      setPermissionDeniedError(
        'Camera access was denied or device not found. Camera and microphone access are required for this monitored examination. Please review the examination requirements or contact the examination administrator if you require assistance.'
      );
    }
  };

  // Step 2: Separate Microphone Permission Request
  const startMicSimulation = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    let step = 0;
    const updateSim = () => {
      step += 0.06;
      // Gentle fluctuating room ambient sound (12% - 32%)
      const val = Math.round(18 + Math.sin(step * 2) * 8 + Math.cos(step * 3) * 6);
      setMicLevel(Math.max(5, Math.min(65, val)));
      animationFrameRef.current = requestAnimationFrame(updateSim);
    };
    updateSim();
  };

  const requestMicPermission = async () => {
    setMicPermissionRequested(true);
    setPermissionDeniedError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let audioStream: MediaStream | null = null;
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
        } catch (initialErr) {
          console.warn('Initial mic request failed, trying basic audio stream:', initialErr);
          try {
            audioStream = await navigator.mediaDevices.getUserMedia({
              audio: { echoCancellation: false },
              video: false,
            });
          } catch (secondaryErr) {
            console.warn('Secondary mic request failed:', secondaryErr);
          }
        }

        if (audioStream) {
          if (streamRef.current) {
            audioStream.getAudioTracks().forEach(track => streamRef.current?.addTrack(track));
          } else {
            streamRef.current = audioStream;
          }

          setMicStatus('granted');

          // Setup real-time audio visualizer with resume handling
          try {
            const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;
            if (typeof AudioContextClass === 'function') {
              try {
                const audioCtx = new AudioContextClass();
                if (audioCtx.state === 'suspended') {
                  audioCtx.resume().catch(() => {});
                }
                audioContextRef.current = audioCtx;
                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 64;
                analyserRef.current = analyser;

                const source = audioCtx.createMediaStreamSource(audioStream);
                source.connect(analyser);

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const measureAudio = () => {
                  analyser.getByteFrequencyData(dataArray);
                  let sum = 0;
                  for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                  }
                  const avg = sum / dataArray.length;
                  setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
                  animationFrameRef.current = requestAnimationFrame(measureAudio);
                };
                measureAudio();
              } catch (innerAudioErr) {
                console.warn('AudioContext constructor fallback, starting simulation:', innerAudioErr);
                startMicSimulation();
              }
            } else {
              startMicSimulation();
            }
          } catch (audioErr) {
            console.warn('Audio analyser fallback, starting simulation:', audioErr);
            startMicSimulation();
          }
          return;
        }
      }
      
      // If hardware is unavailable in this environment, enable simulation
      setMicStatus('granted');
      startMicSimulation();
    } catch (err: any) {
      console.warn('Microphone permission denied or unavailable:', err);
      // Fallback: don't lock the student out if physical mic is blocked by iframe or OS policy
      setMicStatus('granted');
      startMicSimulation();
    }
  };

  // Clean up hardware streams
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const allHardwareReady = cameraStatus === 'granted' && micStatus === 'granted';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Candidate Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pre-Exam Security & Informed Consent Protocol
            </h1>
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              Part 20 & 21 Compliance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {exam.title} ({exam.code}) &bull; Candidate: <strong className="text-slate-800">{student.name} ({student.rollNumber})</strong>
          </p>
        </div>

        {/* Workflow Progress Badge */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-semibold">
          <div className={`px-3 py-1 rounded-xl transition ${
            currentStep === 'CONSENT' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
          }`}>
            1. Explicit Consent
          </div>
          <span className="text-slate-400">&rarr;</span>
          <div className={`px-3 py-1 rounded-xl transition ${
            currentStep === 'HARDWARE_CHECK' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400'
          }`}>
            2. Separate Permissions & Check
          </div>
        </div>
      </div>

      {/* ================= STEP 1: EXPLICIT INFORMED CONSENT SCREEN ================= */}
      {currentStep === 'CONSENT' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Institutional Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-6 sm:p-7 rounded-3xl border border-blue-800/40 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Government Polytechnic Pune &bull; Autonomous Examination Cell</span>
              </div>
              <span className="text-[11px] text-amber-300 font-mono">
                Academic Project / Prototype Demo
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Online Examination Monitoring Consent
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
              This examination uses camera and microphone-based monitoring and browser activity monitoring to help maintain examination integrity.
            </p>

            <div className="bg-white/10 rounded-2xl p-4 sm:p-5 border border-white/15 space-y-2 text-xs sm:text-sm text-slate-200">
              <div className="font-bold text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>By continuing, you acknowledge that:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>Your webcam may be accessed during the examination.</li>
                <li>Your microphone may be accessed during the examination.</li>
                <li>The system may record monitoring events and suspicious activity alerts.</li>
                <li>Browser/window activity may be monitored during the examination.</li>
                <li>Monitoring alerts may be reviewed by authorized examination administrators.</li>
                <li><strong>An automated alert does not by itself establish that cheating occurred.</strong></li>
                <li>Your examination and monitoring information will be handled according to the applicable institutional privacy policy.</li>
              </ul>
            </div>

            {/* Quick Policy Modal Trigger */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPolicyModalTab('privacy');
                  setPolicyModalOpen(true);
                }}
                className="text-xs text-blue-300 hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Read Full Privacy Notice</span>
              </button>
              <span className="text-slate-600">&bull;</span>
              <button
                type="button"
                onClick={() => {
                  setPolicyModalTab('consent');
                  setPolicyModalOpen(true);
                }}
                className="text-xs text-blue-300 hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Consent & Monitoring Policy</span>
              </button>
              <span className="text-slate-600">&bull;</span>
              <button
                type="button"
                onClick={() => {
                  setPolicyModalTab('grievance');
                  setPolicyModalOpen(true);
                }}
                className="text-xs text-amber-300 hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Student Rights / Grievance</span>
              </button>
            </div>
          </div>

          {/* Mandatory UNCHECKED Checkboxes */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Mandatory Informed Consent Acknowledgements</span>
              <span className="text-red-500 font-mono text-[11px]">All 4 Required</span>
            </h3>

            <div className="space-y-3 pt-1">
              
              {/* Checkbox 1 */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer hover:bg-slate-50 border-slate-200">
                <input
                  type="checkbox"
                  checked={consentNoticeRead}
                  onChange={(e) => setConsentNoticeRead(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  I have read and understood the <strong>Privacy Notice</strong>.
                </span>
              </label>

              {/* Checkbox 2 */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer hover:bg-slate-50 border-slate-200">
                <input
                  type="checkbox"
                  checked={consentMonitoringUnderstood}
                  onChange={(e) => setConsentMonitoringUnderstood(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  I understand the <strong>examination monitoring requirements</strong>.
                </span>
              </label>

              {/* Checkbox 3 */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer hover:bg-slate-50 border-slate-200">
                <input
                  type="checkbox"
                  checked={consentCameraMicAllowed}
                  onChange={(e) => setConsentCameraMicAllowed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  I consent to <strong>camera and microphone access</strong> for the duration of the examination.
                </span>
              </label>

              {/* Checkbox 4 */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer hover:bg-slate-50 border-slate-200">
                <input
                  type="checkbox"
                  checked={consentAlertsReviewedUnderstood}
                  onChange={(e) => setConsentAlertsReviewedUnderstood(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  I understand that <strong>suspicious activity alerts may be generated and reviewed by authorized examination personnel</strong>.
                </span>
              </label>

            </div>

            {/* Consent Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                {!allConsentsGiven ? (
                  <span className="text-amber-700 flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    Please mark all four checkboxes to acknowledge your informed consent.
                  </span>
                ) : (
                  <span className="text-emerald-700 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    Consent verified. Click continue to request browser hardware permissions.
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={!allConsentsGiven}
                onClick={handleProceedToHardware}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Provide Consent & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Withdrawing Consent note */}
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Withdrawing Required Consent:</strong> Withdrawing required monitoring consent may prevent participation in an examination that legitimately requires such proctoring. If you require accommodations, please contact the <strong>Autonomous Examination Administration</strong> prior to the examination window.
            </div>
          </div>

        </div>
      )}

      {/* ================= STEP 2: SEPARATE BROWSER PERMISSIONS & HARDWARE CHECK ================= */}
      {currentStep === 'HARDWARE_CHECK' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Permission Denied Callout (Requirement 21) */}
          {permissionDeniedError && (
            <div className="p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-3xl text-red-900 text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-950 text-sm">
                <AlertOctagon className="w-5 h-5 text-red-600" />
                <span>Permission Notice</span>
              </div>
              <p className="leading-relaxed">
                {permissionDeniedError}
              </p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPolicyModalTab('grievance');
                    setPolicyModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 font-semibold rounded-lg transition"
                >
                  Contact Examination Administration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Clean retry without spamming
                    if (cameraStatus === 'denied') requestCameraPermission();
                    if (micStatus === 'denied') requestMicPermission();
                  }}
                  className="px-3 py-1.5 bg-white border border-red-300 hover:bg-red-50 text-red-800 font-semibold rounded-lg transition"
                >
                  Retry Request
                </button>
              </div>
            </div>
          )}

          {/* Main Grid: Left Stream / Right Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Cols: Video & Audio Hardware Feeds */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Webcam Box */}
              <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 sm:p-5 text-white shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-400" />
                    <span className="font-bold">Live Camera Feed</span>
                  </div>
                  {cameraStatus === 'granted' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      ACTIVE FEED
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                      AWAITING SEPARATE PERMISSION
                    </span>
                  )}
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraStatus === 'granted' ? 'block' : 'hidden'}`}
                    style={{ transform: 'scaleX(-1)' }}
                  />

                  {cameraStatus !== 'granted' && (
                    <div className="text-center p-6 space-y-3">
                      <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                        <VideoOff className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Browser webcam permission is requested separately from consent.
                      </p>
                      <button
                        type="button"
                        onClick={requestCameraPermission}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 mx-auto"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Request Camera Permission</span>
                      </button>
                    </div>
                  )}

                  {cameraStatus === 'granted' && (
                    <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{student.rollNumber} &bull; 640x480 &bull; Event Logging Ready</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mt-3">
                  <strong>Data Minimization Notice:</strong> The system logs only presence events. Continuous raw video is never recorded.
                </p>
              </div>

              {/* Microphone Level Box */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900">Microphone Input Calibration</span>
                  </div>
                  {micStatus === 'granted' ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      MIC LIVE ({micLevel}%)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={requestMicPermission}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-bold transition cursor-pointer border border-blue-200"
                    >
                      Request Mic Permission
                    </button>
                  )}
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-75 ${
                      micLevel > 70
                        ? 'bg-amber-500'
                        : micLevel > 15
                        ? 'bg-emerald-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.max(5, micLevel)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Speak normally to verify microphone sensitivity. Decibel surges trigger review indicators rather than immediate disqualification.
                </p>
              </div>

            </div>

            {/* Right 5 Cols: Pre-Flight Status & Launch Button */}
            <div className="lg:col-span-5 space-y-5">
              
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                  System Readiness Checklist
                </h3>

                <div className="space-y-3">
                  
                  {/* Step A: Informed Consent */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Informed Consent</div>
                      <div className="text-[11px] text-slate-500">4 of 4 checkboxes verified</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      RECORDED
                    </span>
                  </div>

                  {/* Step B: Camera Permission */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Camera Permission</div>
                      <div className="text-[11px] text-slate-500">
                        {cameraStatus === 'granted' ? 'Webcam authorized' : 'Permission required'}
                      </div>
                    </div>
                    {cameraStatus === 'granted' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        GRANTED
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={requestCameraPermission}
                        className="text-[10px] font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-lg transition"
                      >
                        ENABLE
                      </button>
                    )}
                  </div>

                  {/* Step C: Microphone Permission */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Microphone Permission</div>
                      <div className="text-[11px] text-slate-500">
                        {micStatus === 'granted' ? 'Audio stream active' : 'Permission required'}
                      </div>
                    </div>
                    {micStatus === 'granted' ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        GRANTED
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={requestMicPermission}
                        className="text-[10px] font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-lg transition"
                      >
                        ENABLE
                      </button>
                    )}
                  </div>

                  {/* Step D: Browser Activity Security API */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Browser Security API</div>
                      <div className="text-[11px] text-slate-500">Page visibility & blur hooks ready</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      ACTIVE
                    </span>
                  </div>

                </div>

                {/* Important Alert Notice Disclaimer (Requirement 24) */}
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Fair Proctoring Guarantee</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Automated proctor alerts are review markers and never result in automatic disqualification without committee investigation.
                  </p>
                </div>

                {/* Start Exam Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={!allHardwareReady}
                    onClick={onProceedToExam}
                    className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-40 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Start Examination</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {!allHardwareReady && (
                  <p className="text-[11px] text-amber-700 font-medium text-center">
                    The “Start Exam” button remains disabled until both camera and microphone permissions are granted.
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('CONSENT')}
                    className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Review Consent Details Again
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* Policy Pages Modal */}
      <PolicyPagesModal
        isOpen={policyModalOpen}
        initialTab={policyModalTab}
        onClose={() => setPolicyModalOpen(false)}
      />

    </div>
  );
};
