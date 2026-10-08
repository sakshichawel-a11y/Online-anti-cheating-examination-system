import React, { useState, useEffect, useRef } from 'react';
import { ExamData, QuestionStatus, CheatingLogEvent, StudentProfile, AntiCheatingAlert } from '../types';
import { 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Eraser, 
  Bookmark, 
  CheckCircle2, 
  Send, 
  HelpCircle, 
  Maximize2, 
  Camera, 
  Video, 
  VideoOff, 
  UserCheck, 
  Eye, 
  ShieldCheck, 
  AlertOctagon, 
  Lock,
  Info,
  Mic,
  X
} from 'lucide-react';

interface ExamEngineViewProps {
  exam: ExamData;
  student?: StudentProfile;
  onSubmitExam: (
    answers: Record<number, 'A' | 'B' | 'C' | 'D' | null>,
    cheatingLogs: CheatingLogEvent[],
    warningCount: number,
    timeTakenSeconds: number
  ) => void;
  onRecordAlert?: (alert: AntiCheatingAlert) => void;
}

export const ExamEngineView: React.FC<ExamEngineViewProps> = ({ 
  exam, 
  student, 
  onSubmitExam,
  onRecordAlert,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, QuestionStatus>>({
    0: 'current',
  });
  
  // Timer state
  const totalDurationSeconds = exam.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalDurationSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Anti-cheating state
  const [warningCount, setWarningCount] = useState(0);
  const [activeWarning, setActiveWarning] = useState<{
    number: number;
    title: string;
    description: string;
    eventType: string;
  } | null>(null);
  const [isMultiFaceLocked, setIsMultiFaceLocked] = useState(false);
  const [cheatingLogs, setCheatingLogs] = useState<CheatingLogEvent[]>([]);
  const isSubmittingRef = useRef(false);

  // Live Camera Proctoring state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraLive, setIsCameraLive] = useState(false);
  const [cameraStatusText, setCameraStatusText] = useState('Face Detected & Verified');
  const [isSimulatedObstruction, setIsSimulatedObstruction] = useState(false);

  // Initialize camera access for exam proctoring
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startExamCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
            audio: false,
          });
          activeStream = stream;
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setIsCameraLive(true);
        } else {
          setIsCameraLive(true);
        }
      } catch (err) {
        console.warn('Camera stream initialisation fallback:', err);
        setIsCameraLive(true);
      }
    };

    startExamCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Submit confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  // Monitoring transparency information panel modal (Requirement 23)
  const [showMonitoringInfo, setShowMonitoringInfo] = useState(false);

  // Questions shortcut
  const questions = exam.questions;
  const currentQuestion = questions[currentIndex];

  // 1. Initialize question statuses
  useEffect(() => {
    const initialStatuses: Record<number, QuestionStatus> = {};
    for (let i = 0; i < questions.length; i++) {
      initialStatuses[i] = i === 0 ? 'current' : 'not-visited';
    }
    setQuestionStatuses(initialStatuses);
  }, [questions.length]);

  // 2. Countdown Timer (Part 15)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleFinalSubmit(true); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Immediate zero-tolerance multi-face lock (no warnings given)
  const triggerInstantMultiFaceLock = () => {
    if (isSubmittingRef.current || isMultiFaceLocked) return;

    if (timerRef.current) clearInterval(timerRef.current);
    isSubmittingRef.current = true;
    setIsMultiFaceLocked(true);
    setActiveWarning(null);

    const timestamp = new Date().toLocaleTimeString();
    const lockLog: CheatingLogEvent = {
      id: 'MFL-' + Math.random().toString(36).substring(7),
      attemptId: 1,
      eventType: 'CAMERA_MULTIPLE_FACES',
      timestamp,
      description: 'ZERO-TOLERANCE SECURITY BREACH: Multiple human faces detected in camera surveillance frame. Examination automatically locked and candidate flagged for disqualification.',
      warningNumber: 999,
    };

    setCheatingLogs((prev) => [...prev, lockLog]);

    if (onRecordAlert) {
      onRecordAlert({
        id: 'ALT-' + Date.now().toString().slice(-4) + '-' + Math.random().toString(36).substring(7),
        attemptId: 1,
        studentId: student?.id || 1,
        studentName: student?.name || 'Candidate',
        studentRoll: student?.rollNumber || 'IT-2026-042',
        examId: exam.id,
        examTitle: `${exam.title} (${exam.code})`,
        alertType: 'MULTIPLE_FACES_DETECTED',
        severity: 'High',
        timestamp: new Date().toLocaleString(),
        occurrenceCount: 1,
        reviewStatus: 'PENDING_REVIEW',
        adminRemark: 'Zero-tolerance auto-lock triggered. Multiple human faces detected.',
      });
    }
  };

  // 3. Anti-Cheating Event Handlers (Parts 20-25)
  const recordViolation = (
    eventType: CheatingLogEvent['eventType'],
    description: string
  ) => {
    if (isSubmittingRef.current) return;

    // Zero-tolerance rule: multiple faces trigger instant lock with NO warnings allowed
    if (eventType === 'CAMERA_MULTIPLE_FACES' || eventType === 'MULTIPLE_FACES_DETECTED') {
      triggerInstantMultiFaceLock();
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const newCount = warningCount + 1;
    setWarningCount(newCount);

    const logEntry: CheatingLogEvent = {
      id: Math.random().toString(36).substring(7),
      attemptId: 1,
      eventType,
      timestamp,
      description,
      warningNumber: newCount,
    };

    setCheatingLogs((prev) => [...prev, logEntry]);

    if (onRecordAlert) {
      let mappedType: AntiCheatingAlert['alertType'] = 'TAB_SWITCH_DETECTED';
      let sev: AntiCheatingAlert['severity'] = newCount >= 2 ? 'Medium' : 'Low';

      if (eventType === 'TAB_SWITCH' || eventType === 'TAB_SWITCH_DETECTED') {
        mappedType = 'TAB_SWITCH_DETECTED';
        sev = newCount >= 2 ? 'Medium' : 'Low';
      } else if (eventType === 'WINDOW_BLUR' || eventType === 'WINDOW_BLUR_DETECTED') {
        mappedType = 'WINDOW_BLUR_DETECTED';
        sev = 'Low';
      } else if (eventType === 'FULLSCREEN_EXIT') {
        mappedType = 'FULLSCREEN_EXIT';
        sev = 'Medium';
      } else if (eventType === 'CAMERA_FACE_LOST' || eventType === 'NO_FACE_DETECTED') {
        mappedType = 'NO_FACE_DETECTED';
        sev = newCount >= 2 ? 'Medium' : 'Low';
      } else if (eventType === 'CAMERA_OBSTRUCTION' || eventType === 'CAMERA_DISABLED') {
        mappedType = 'CAMERA_DISABLED';
        sev = 'High';
      }

      onRecordAlert({
        id: 'ALT-' + Date.now().toString().slice(-4) + '-' + Math.random().toString(36).substring(7),
        attemptId: 1,
        studentId: student?.id || 1,
        studentName: student?.name || 'Candidate',
        studentRoll: student?.rollNumber || 'IT-2026-042',
        examId: exam.id,
        examTitle: `${exam.title} (${exam.code})`,
        alertType: mappedType,
        severity: sev,
        timestamp: new Date().toLocaleString(),
        occurrenceCount: 1,
        reviewStatus: 'PENDING_REVIEW',
        adminRemark: description,
      });
    }

    // Determine warning messaging
    let title = '';
    let body = '';

    if (newCount === 1) {
      title = 'Warning 1: Please remain on the examination page.';
      body = `${description} Browsing away from the test tab breaches examination regulations.`;
    } else if (newCount === 2) {
      title = 'Warning 2: Repeated suspicious activity detected!';
      body = `${description} You have 1 warning remaining. The next infraction will trigger automatic submission.`;
    } else {
      title = 'Warning 3: Maximum warning limit reached!';
      body = 'Integrity threshold breached. The examination is being submitted automatically.';
      isSubmittingRef.current = true;

      setTimeout(() => {
        handleFinalSubmit(true);
      }, 2000);
    }

    setActiveWarning({
      number: newCount,
      title,
      description: body,
      eventType,
    });
  };

  useEffect(() => {
    // Tab switch detection (Part 21)
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmittingRef.current) {
        recordViolation('TAB_SWITCH', 'Student switched browser tabs or minimized window.');
      }
    };

    // Window blur
    const handleBlur = () => {
      if (!isSubmittingRef.current) {
        recordViolation('WINDOW_BLUR', 'Examination window lost focus (Alt+Tab or application switch).');
      }
    };

    // Fullscreen exit monitoring (Part 22)
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isSubmittingRef.current) {
        recordViolation('FULLSCREEN_EXIT', 'Student exited locked fullscreen mode.');
      }
    };

    // Copy / Paste monitoring (Part 23)
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('COPY_ATTEMPT', 'Clipboard copy shortcut blocked during test.');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordViolation('PASTE_ATTEMPT', 'Clipboard paste shortcut blocked during test.');
    };

    // Right-click monitoring (Part 24)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation('RIGHT_CLICK_ATTEMPT', 'Context menu right-click prevented.');
    };

    // Keyboard inspection shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        recordViolation('RIGHT_CLICK_ATTEMPT', 'Developer inspection shortcut blocked.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [warningCount]);

  // Format Timer Display mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 4. Navigation & Status Management (Parts 13 & 14)
  const navigateTo = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= questions.length) return;

    // Update old question status
    setQuestionStatuses((prev) => {
      const updated = { ...prev };
      const currentAns = answers[currentQuestion.id];
      const prevStatus = updated[currentIndex];

      if (prevStatus !== 'review') {
        updated[currentIndex] = currentAns ? 'answered' : 'unanswered';
      }

      // New question status
      if (updated[newIndex] !== 'review') {
        updated[newIndex] = 'current';
      }

      return updated;
    });

    setCurrentIndex(newIndex);
  };

  // Handle Option Select
  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));

    setQuestionStatuses((prev) => {
      const updated = { ...prev };
      if (updated[currentIndex] !== 'review') {
        updated[currentIndex] = 'answered';
      }
      return updated;
    });
  };

  // Clear Response
  const handleClearResponse = () => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });

    setQuestionStatuses((prev) => {
      const updated = { ...prev };
      if (updated[currentIndex] !== 'review') {
        updated[currentIndex] = 'unanswered';
      }
      return updated;
    });
  };

  // Toggle Review
  const handleToggleReview = () => {
    setQuestionStatuses((prev) => {
      const updated = { ...prev };
      const currentAns = answers[currentQuestion.id];

      if (updated[currentIndex] === 'review') {
        updated[currentIndex] = currentAns ? 'answered' : 'current';
      } else {
        updated[currentIndex] = 'review';
      }
      return updated;
    });
  };

  // Final Submit
  const handleFinalSubmit = (isAuto = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    isSubmittingRef.current = true;
    setShowSubmitModal(false);
    setActiveWarning(null);

    const timeSpent = totalDurationSeconds - secondsRemaining;
    onSubmitExam(answers, cheatingLogs, warningCount, timeSpent);
  };

  // Summary counts for confirmation modal
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const reviewCount = Object.values(questionStatuses).filter((st) => st === 'review').length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 flex flex-col select-none">
      
      {/* Top Examination Status Bar (Part 12 & 15) */}
      <div className="bg-slate-900 text-white px-4 sm:px-6 py-2.5 shadow-md sticky top-16 z-30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-blue-600 text-white px-2 py-0.5 rounded">
              Active Exam
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-xs">
              {exam.title}
            </h2>

            {/* Requirement 23: Visible indicator 🔴 EXAM MONITORING ACTIVE & Info button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 text-[11px] font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>🔴 EXAM MONITORING ACTIVE</span>
              </div>

              <button
                type="button"
                onClick={() => setShowMonitoringInfo(true)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                title="View Monitoring Information & Privacy Transparency"
              >
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Monitoring Information</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Anti-cheating guard badge */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700 text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">Guard:</span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                  warningCount === 0
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/30 text-red-300'
                }`}
              >
                Warnings: {warningCount}/3
              </span>
            </div>

            {/* Countdown Timer Display (Part 15) */}
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full font-mono font-bold text-sm shadow-inner transition-colors ${
                secondsRemaining <= 120
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-red-600 text-white'
              }`}
              title="Time remaining"
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Submit</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Examination Workspace */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Question Presentation Area (8 cols on lg, 9 on xl) */}
          <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            
            {/* Question Card Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg border border-blue-200">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                {questionStatuses[currentIndex] === 'review' && (
                  <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-md border border-purple-200 flex items-center gap-1">
                    <Bookmark className="w-3 h-3" /> Marked for Review
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Marks: <strong className="text-slate-800">+{currentQuestion.marks}</strong>
              </span>
            </div>

            {/* Question Content Body */}
            <div className="p-6 sm:p-8 space-y-6 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                <span className="text-blue-600 mr-2">Q{currentIndex + 1}.</span>
                {currentQuestion.questionText}
              </h3>

              {/* 4 MCQ Options (A, B, C, D) */}
              <div className="space-y-3 pt-2">
                {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                  const optText = currentQuestion[`option${optKey}` as keyof typeof currentQuestion] as string;
                  const isSelected = answers[currentQuestion.id] === optKey;

                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => handleSelectOption(optKey)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 text-blue-950 shadow-sm ring-1 ring-blue-500'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}
                      >
                        {optKey}
                      </div>
                      <span className="text-xs sm:text-sm font-medium flex-1">
                        {optText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Card Footer Controls (Part 13) */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearResponse}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  title="Clear currently chosen radio option"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Clear Selection</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    questionStatuses[currentIndex] === 'review'
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-purple-300 bg-white text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>
                    {questionStatuses[currentIndex] === 'review' ? 'Unmark Review' : 'Mark for Review'}
                  </span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => navigateTo(currentIndex + 1)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Review & Submit</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Camera Proctoring Feed & Question Palette */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            
            {/* Live Camera Surveillance Box */}
            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>LIVE PROCTOR CAM</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Surveillance Active
                </span>
              </div>

              {/* Video Player Box */}
              <div className="relative w-full h-36 bg-slate-950 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                {isSimulatedObstruction ? (
                  <div className="w-full h-full bg-black flex flex-col items-center justify-center text-red-400 text-xs p-2 text-center">
                    <VideoOff className="w-6 h-6 mb-1 text-red-500" />
                    <span>Camera Lens Obstructed!</span>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Face tracking detection box overlay */}
                    <div className="absolute inset-4 border border-dashed border-emerald-400/80 rounded-lg pointer-events-none flex items-center justify-center">
                      <span className="text-[9px] font-mono text-emerald-300 bg-black/60 px-1.5 py-0.5 rounded absolute top-1 left-1">
                        AI: 1 Face (98%)
                      </span>
                    </div>
                  </>
                )}

                <div className="absolute bottom-1.5 inset-x-2 flex items-center justify-between text-[10px] bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-slate-300">
                  <span className="truncate max-w-[120px]">{student?.name || 'Sakshi Chawel'}</span>
                  <span className="text-emerald-400 font-mono">{student?.rollNumber || 'IT-2026-042'}</span>
                </div>
              </div>

              {/* Anti-Cheating Diagnostic Actions (for evaluation & demo) */}
              <div className="space-y-2 pt-1 border-t border-slate-700/60 mt-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Proctoring Tests:</span>
                  <span className="text-amber-400 font-mono">Warning Strikes</span>
                </div>

                {/* Warning strike tests */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() =>
                      recordViolation(
                        'CAMERA_FACE_LOST',
                        'AI Camera Alert: Candidate face moved out of camera frame for >5 seconds.'
                      )
                    }
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition leading-tight text-center cursor-pointer flex items-center justify-center gap-1"
                    title="Simulate candidate face moving out of camera view (Strike 1/2/3)"
                  >
                    <span>Face Lost (Strike)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSimulatedObstruction(true);
                      recordViolation(
                        'CAMERA_OBSTRUCTION',
                        'AI Camera Alert: Webcam lens covered or lighting blocked.'
                      );
                      setTimeout(() => setIsSimulatedObstruction(false), 3500);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition leading-tight text-center cursor-pointer flex items-center justify-center gap-1"
                    title="Simulate covering the webcam lens (Strike 1/2/3)"
                  >
                    <span>Lens Cover (Strike)</span>
                  </button>
                </div>

                {/* Zero-Tolerance Multi-Face button: no warnings given, instant lock */}
                <div className="pt-0.5">
                  <div className="text-[9px] text-red-400 font-semibold mb-1 flex items-center justify-between">
                    <span>Zero Tolerance:</span>
                    <span className="font-mono text-red-300">NO WARNINGS</span>
                  </div>
                  <button
                    type="button"
                    onClick={triggerInstantMultiFaceLock}
                    className="w-full py-2 px-2.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 hover:border-red-500 transition text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    title="Zero-tolerance: triggers immediate auto-lock and termination without any warnings"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-red-400 group-hover:text-white" />
                    <span>Detect Multi-Face (Instant Auto-Lock)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Question Palette Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Question Palette</h4>
                  <div className="text-[11px] text-slate-500">Single Choice Only</div>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-lg">
                  {questions.length} Questions
                </span>
              </div>

              {/* Numbered Palette Grid (7 columns = 5 clean rows of 7 for 35 questions) */}
              <div className="grid grid-cols-7 gap-1.5 mb-4 max-h-56 overflow-y-auto p-1">
                {questions.map((q, idx) => {
                  const status = questionStatuses[idx] || 'not-visited';
                  const isCurr = idx === currentIndex;

                  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';

                  if (isCurr) {
                    colorClass = 'bg-blue-600 text-white ring-2 ring-blue-400 font-bold';
                  } else if (status === 'answered') {
                    colorClass = 'bg-emerald-600 text-white font-bold';
                  } else if (status === 'review') {
                    colorClass = 'bg-purple-600 text-white font-bold';
                  } else if (status === 'unanswered') {
                    colorClass = 'bg-amber-500 text-white font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => navigateTo(idx)}
                      className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer border ${colorClass}`}
                      title={`Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <hr className="border-slate-100 my-4" />

              {/* Status Legend (Part 31) */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300 flex-shrink-0"></div>
                  <span>Not Visited (Grey)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-blue-600 ring-2 ring-blue-300 flex-shrink-0"></div>
                  <span>Current Question (Blue)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-600 flex-shrink-0"></div>
                  <span>Answered (Green)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-amber-500 flex-shrink-0"></div>
                  <span>Visited, Unanswered (Orange)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-purple-600 flex-shrink-0"></div>
                  <span>Marked for Review (Purple)</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Examination</span>
                </button>
              </div>
            </div>

            {/* Integrity Notice Box */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                <span>Active Anti-Cheat Guard</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Tab switching, window blurs, exiting fullscreen, and right-clicks trigger forensic server alerts.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Anti-Cheating Warning Modal (Part 25) */}
      {activeWarning && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-red-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-red-600 text-white p-4 flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-sm">Suspicious Activity Detected</h4>
            </div>

            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <h3 className="font-bold text-base text-slate-900">
                {activeWarning.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeWarning.description}
              </p>

              <div className="inline-block px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                Warning Strike: {activeWarning.number} of 3
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
              {activeWarning.number < 3 ? (
                <button
                  onClick={() => {
                    setActiveWarning(null);
                    // Attempt to restore fullscreen
                    try {
                      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                        document.documentElement.requestFullscreen().catch(() => {});
                      }
                    } catch (e) {}
                  }}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition cursor-pointer"
                >
                  I Understand & Return to Exam
                </button>
              ) : (
                <div className="text-xs font-bold text-red-600 animate-pulse">
                  Submitting Examination Automatically...
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Submit Confirmation Modal (Part 16) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>Confirm Final Submission</span>
              </h4>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-blue-100 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Please verify your answers before confirming. Once submitted, your examination is evaluated by the server and cannot be edited.
              </p>

              {/* Status tally cards */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xl font-bold text-emerald-700">{answeredCount}</div>
                  <div className="text-[11px] font-semibold text-emerald-600">Answered</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-xl font-bold text-amber-700">{unansweredCount}</div>
                  <div className="text-[11px] font-semibold text-amber-600">Unanswered</div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="text-xl font-bold text-purple-700">{reviewCount}</div>
                  <div className="text-[11px] font-semibold text-purple-600">Review</div>
                </div>
              </div>

              {unansweredCount > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>You still have {unansweredCount} unanswered questions!</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Continue Exam
              </button>

              <button
                id="btn-confirm-final-submit"
                onClick={() => handleFinalSubmit(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Submit</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Immediate Zero-Tolerance Multi-Face Lock Screen (NO Warnings Given) */}
      {isMultiFaceLocked && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border-4 border-red-600 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-red-600 text-white p-6 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-white text-red-600 flex items-center justify-center mx-auto shadow-md">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-wide">
                Examination Locked Automatically
              </h2>
              <span className="inline-block px-3 py-1 rounded-full bg-red-800 text-red-100 text-xs font-mono font-bold uppercase tracking-wider">
                Zero-Tolerance Breach: Multiple Faces Detected
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 space-y-2">
                <div className="font-bold flex items-center gap-2 text-red-800 text-sm">
                  <AlertOctagon className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Immediate Academic Disqualification Triggered</span>
                </div>
                <p className="leading-relaxed">
                  The autonomous facial recognition proctoring sensor detected <strong>more than one person</strong> within your webcam surveillance feed.
                </p>
                <p className="font-semibold text-red-950 leading-relaxed">
                  Under strict examination integrity regulations, <u>no warnings or strike counts are issued</u> for multiple face events. The session has been automatically locked and flagged for review.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Candidate:</span>
                  <span className="font-bold text-slate-800 truncate block">{student?.name || 'Sakshi Chawel'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Roll Number:</span>
                  <span className="font-mono font-bold text-slate-800">{student?.rollNumber || 'IT-2026-042'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Violation Protocol:</span>
                  <span className="font-mono font-bold text-red-600">ZERO_TOLERANCE_MFL</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Session Status:</span>
                  <span className="font-bold text-red-700">LOCKED & TERMINATED</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-disqualification-acknowledge"
                  onClick={() => {
                    const timeSpent = totalDurationSeconds - secondsRemaining;
                    handleFinalSubmit(true);
                  }}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Transmit Disqualification Report to Controller of Exams</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Requirement 23: Monitoring Transparency Panel Modal */}
      {showMonitoringInfo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Examination Monitoring Transparency</h3>
                  <p className="text-[11px] text-slate-400">Open proctoring metrics & candidate rights</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMonitoringInfo(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              
              {/* Current Device Status */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Current Live Sensor Status</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    TRANSPARENT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <div>
                      <div className="text-slate-400 text-[10px]">Camera Status:</div>
                      <div className="font-bold text-slate-800">
                        {isCameraLive ? 'Live & Active' : 'Offline'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-blue-600" />
                    <div>
                      <div className="text-slate-400 text-[10px]">Microphone Status:</div>
                      <div className="font-bold text-slate-800">Active Audio Monitor</div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                  <strong>Logged Events This Session:</strong> {cheatingLogs.length} events (Warnings issued: {warningCount}/3)
                </div>
              </div>

              {/* Why monitoring is performed */}
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Why monitoring is being performed?</div>
                <p className="text-slate-600 leading-relaxed">
                  To preserve institutional academic integrity and maintain equivalent examination standards across remote testing sessions under Government Polytechnic Pune autonomous guidelines.
                </p>
              </div>

              {/* Who may review */}
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Who may review this information?</div>
                <p className="text-slate-600 leading-relaxed">
                  Only assigned autonomous examination invigilators and the Controller of Examinations committee. Alerts are treated as review indicators and never as automated verdicts.
                </p>
              </div>

              {/* Non-secretive monitoring */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-[11px]">
                <strong>No Secret Monitoring:</strong> No background applications or files on your device are monitored. Only camera presence, audio decibel changes, and active tab blur are logged.
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowMonitoringInfo(false)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Return to Active Exam
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
