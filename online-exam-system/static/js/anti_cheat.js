/**
 * Parts 20-26: Browser Anti-Cheating Monitoring & Warning System
 */

class AntiCheatGuard {
    constructor(config) {
        this.attemptId = config.attemptId;
        this.logUrl = config.logUrl;
        this.warningCount = 0;
        this.maxWarnings = 3;
        this.isSubmitting = false;

        this.initModalElements();
        this.attachEventListeners();
        this.requestInitialFullscreen();
    }

    initModalElements() {
        this.warningBadge = document.getElementById('warningCounterBadge');
        this.modalElement = document.getElementById('antiCheatWarningModal');
        this.warningModal = this.modalElement ? new bootstrap.Modal(this.modalElement) : null;
        this.warningTitle = document.getElementById('warningTitle');
        this.warningDescription = document.getElementById('warningDescription');
        this.warningTallyBadge = document.getElementById('warningTallyBadge');
        this.resumeBtn = document.getElementById('resumeExamBtn');

        if (this.resumeBtn) {
            this.resumeBtn.addEventListener('click', () => {
                this.requestInitialFullscreen();
            });
        }
    }

    attachEventListeners() {
        // Part 21: Tab Switch Detection
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && !this.isSubmitting) {
                this.recordViolation('TAB_SWITCH', 'Student switched browser tabs or minimized window.');
            }
        });

        // Window blur (switching to another software/alt+tab)
        window.addEventListener('blur', () => {
            if (!this.isSubmitting) {
                this.recordViolation('WINDOW_BLUR', 'Examination window lost focus.');
            }
        });

        // Part 22: Fullscreen Exit Monitoring
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && !this.isSubmitting) {
                this.recordViolation('FULLSCREEN_EXIT', 'Student exited locked fullscreen mode.');
            }
        });

        // Part 23: Copy Attempt Monitoring
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.recordViolation('COPY_ATTEMPT', 'Copy command blocked during active test.');
        });

        // Part 23: Paste Attempt Monitoring
        document.addEventListener('paste', (e) => {
            e.preventDefault();
            this.recordViolation('PASTE_ATTEMPT', 'Paste command blocked during active test.');
        });

        // Part 24: Right-Click Monitoring
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.recordViolation('RIGHT_CLICK_ATTEMPT', 'Right-click context menu prevented.');
        });

        // Prevent common devtools shortcuts
        document.addEventListener('keydown', (e) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'u')
            ) {
                e.preventDefault();
                this.recordViolation('RIGHT_CLICK_ATTEMPT', 'Developer tools shortcut blocked.');
            }
        });
    }

    requestInitialFullscreen() {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen && !document.fullscreenElement) {
            docEl.requestFullscreen().catch(() => {
                // Browsers require a direct user gesture for fullscreen
                console.warn('[AntiCheat] Fullscreen requires direct click confirmation.');
            });
        }
    }

    async recordViolation(eventType, description) {
        if (this.isSubmitting) return;

        try {
            const response = await fetch(this.logUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event_type: eventType,
                    description: description
                })
            });

            const data = await response.json();
            this.warningCount = data.warning_count || (this.warningCount + 1);

            this.triggerWarningUI(eventType, description, data.auto_submit);
        } catch (err) {
            console.error('[AntiCheat] Logging failed:', err);
            this.warningCount++;
            this.triggerWarningUI(eventType, description, this.warningCount >= this.maxWarnings);
        }
    }

    triggerWarningUI(eventType, description, shouldAutoSubmit) {
        if (this.warningBadge) {
            this.warningBadge.textContent = `Warnings: ${this.warningCount}/${this.maxWarnings}`;
        }

        // Part 25: Warning System Messages
        if (this.warningCount === 1) {
            this.warningTitle.textContent = 'Warning 1: Please remain on the examination page.';
            this.warningDescription.textContent = `${description} Repeated infractions will lead to test disqualification.`;
            this.warningTallyBadge.textContent = 'Warning 1 of 3';
        } else if (this.warningCount === 2) {
            this.warningTitle.textContent = 'Warning 2: Repeated suspicious activity detected!';
            this.warningDescription.textContent = `${description} You have 1 warning remaining before automatic forced submission.`;
            this.warningTallyBadge.textContent = 'Warning 2 of 3';
            this.warningTallyBadge.className = 'badge bg-danger text-white px-3 py-2 fw-semibold';
        } else {
            // Warning 3: Maximum reached -> Auto submit
            this.warningTitle.textContent = 'Warning 3: Maximum warning limit reached!';
            this.warningDescription.textContent = 'Integrity threshold breached. The examination is being submitted automatically.';
            this.warningTallyBadge.textContent = 'Test Auto-Submitting...';
            this.isSubmitting = true;

            setTimeout(() => {
                const examForm = document.getElementById('examForm');
                if (examForm) {
                    examForm.submit();
                }
            }, 1800);
        }

        if (this.warningModal) {
            this.warningModal.show();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof EXAM_CONFIG !== 'undefined') {
        window.antiCheatGuard = new AntiCheatGuard(EXAM_CONFIG);
    }
});
