/**
 * Part 12-16: Examination Engine, Navigation, State, Timer, & Palette Controller
 */

class ExamEngine {
    constructor(config) {
        this.totalQuestions = config.totalQuestions;
        this.durationSeconds = (config.durationMinutes || 10) * 60;
        this.currentIndex = 0;
        this.answers = {}; // { questionId: selectedOption }
        this.questionStatus = []; // 'not-visited', 'current', 'answered', 'unanswered', 'review'

        for (let i = 0; i < this.totalQuestions; i++) {
            this.questionStatus[i] = i === 0 ? 'current' : 'not-visited';
        }

        this.timerInterval = null;
        this.initElements();
        this.bindEvents();
        this.startTimer();
        this.updateUI();
    }

    initElements() {
        this.examForm = document.getElementById('examForm');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.timerBadge = document.getElementById('timerBadge');
        this.questionNumberBadge = document.getElementById('questionNumberBadge');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.reviewBtn = document.getElementById('reviewBtn');
        this.openSubmitModalBtn = document.getElementById('openSubmitModalBtn');
        this.submitExamCardBtn = document.getElementById('submitExamCardBtn');
        this.confirmFinalSubmitBtn = document.getElementById('confirmFinalSubmitBtn');
        this.submitConfirmModal = new bootstrap.Modal(document.getElementById('submitConfirmModal'));

        // Summary labels
        this.summaryAnswered = document.getElementById('summaryAnswered');
        this.summaryUnanswered = document.getElementById('summaryUnanswered');
        this.summaryReview = document.getElementById('summaryReview');
    }

    bindEvents() {
        // Next & Prev
        this.prevBtn.addEventListener('click', () => this.navigate(this.currentIndex - 1));
        this.nextBtn.addEventListener('click', () => {
            if (this.currentIndex < this.totalQuestions - 1) {
                this.navigate(this.currentIndex + 1);
            } else {
                this.showSubmitModal();
            }
        });

        // Clear response
        this.clearBtn.addEventListener('click', () => this.clearCurrentResponse());

        // Mark for review
        this.reviewBtn.addEventListener('click', () => this.toggleReviewStatus());

        // Palette buttons click
        document.querySelectorAll('.palette-btn[data-q-index]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetIdx = parseInt(btn.getAttribute('data-q-index'), 10);
                this.navigate(targetIdx);
            });
        });

        // Option radio change
        document.querySelectorAll('.option-radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.recordAnswer(this.currentIndex, e.target.value);
            });
        });

        // Submit buttons
        if (this.openSubmitModalBtn) {
            this.openSubmitModalBtn.addEventListener('click', () => this.showSubmitModal());
        }
        if (this.submitExamCardBtn) {
            this.submitExamCardBtn.addEventListener('click', () => this.showSubmitModal());
        }
        if (this.confirmFinalSubmitBtn) {
            this.confirmFinalSubmitBtn.addEventListener('click', () => this.submitExam(false));
        }
    }

    navigate(newIndex) {
        if (newIndex < 0 || newIndex >= this.totalQuestions) return;

        // Update previous question's status if not review
        const currentContainer = document.getElementById(`qContainer_${this.currentIndex}`);
        const selectedRadio = currentContainer.querySelector('.option-radio:checked');

        if (this.questionStatus[this.currentIndex] !== 'review') {
            this.questionStatus[this.currentIndex] = selectedRadio ? 'answered' : 'unanswered';
        }

        // Switch active question container
        currentContainer.classList.add('d-none');
        currentContainer.classList.remove('active-question');

        this.currentIndex = newIndex;

        const nextContainer = document.getElementById(`qContainer_${this.currentIndex}`);
        nextContainer.classList.remove('d-none');
        nextContainer.classList.add('active-question');

        // Set status of newly visited question to current (unless review)
        if (this.questionStatus[this.currentIndex] !== 'review') {
            this.questionStatus[this.currentIndex] = 'current';
        }

        this.updateUI();
    }

    recordAnswer(index, value) {
        if (this.questionStatus[index] !== 'review') {
            this.questionStatus[index] = 'answered';
        }
        this.updatePaletteColors();
    }

    clearCurrentResponse() {
        const container = document.getElementById(`qContainer_${this.currentIndex}`);
        const checked = container.querySelector('.option-radio:checked');
        if (checked) {
            checked.checked = false;
        }
        if (this.questionStatus[this.currentIndex] !== 'review') {
            this.questionStatus[this.currentIndex] = 'unanswered';
        }
        this.updatePaletteColors();
    }

    toggleReviewStatus() {
        if (this.questionStatus[this.currentIndex] === 'review') {
            const container = document.getElementById(`qContainer_${this.currentIndex}`);
            const checked = container.querySelector('.option-radio:checked');
            this.questionStatus[this.currentIndex] = checked ? 'answered' : 'current';
        } else {
            this.questionStatus[this.currentIndex] = 'review';
        }
        this.updatePaletteColors();
    }

    updateUI() {
        // Question number indicator
        this.questionNumberBadge.textContent = `Question ${this.currentIndex + 1} of ${this.totalQuestions}`;

        // Previous button disabled on Q1
        this.prevBtn.disabled = this.currentIndex === 0;

        // Next button text on last question
        if (this.currentIndex === this.totalQuestions - 1) {
            this.nextBtn.innerHTML = 'Review & Submit <i class="bi bi-check2-all ms-1"></i>';
            this.nextBtn.classList.remove('btn-primary');
            this.nextBtn.classList.add('btn-success');
        } else {
            this.nextBtn.innerHTML = 'Next <i class="bi bi-chevron-right ms-1"></i>';
            this.nextBtn.classList.remove('btn-success');
            this.nextBtn.classList.add('btn-primary');
        }

        this.updatePaletteColors();
    }

    updatePaletteColors() {
        for (let i = 0; i < this.totalQuestions; i++) {
            const btn = document.getElementById(`paletteBtn_${i}`);
            if (!btn) continue;

            // Remove all status classes
            btn.className = 'palette-btn';

            const status = this.questionStatus[i];
            if (i === this.currentIndex) {
                btn.classList.add('status-current');
            } else if (status === 'answered') {
                btn.classList.add('status-answered');
            } else if (status === 'review') {
                btn.classList.add('status-review');
            } else if (status === 'unanswered') {
                btn.classList.add('status-unanswered');
            } else {
                btn.classList.add('status-not-visited');
            }
        }
    }

    startTimer() {
        const updateTimerDisplay = () => {
            const minutes = Math.floor(this.durationSeconds / 60);
            const seconds = this.durationSeconds % 60;
            this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Critical time alert (less than 2 minutes)
            if (this.durationSeconds <= 120) {
                this.timerBadge.classList.remove('bg-danger');
                this.timerBadge.classList.add('bg-warning', 'text-dark');
            }

            if (this.durationSeconds <= 0) {
                clearInterval(this.timerInterval);
                this.submitExam(true); // Auto-submit when countdown finishes (Part 15)
            }
            this.durationSeconds--;
        };

        updateTimerDisplay();
        this.timerInterval = setInterval(updateTimerDisplay, 1000);
    }

    showSubmitModal() {
        let answered = 0;
        let review = 0;

        document.querySelectorAll('.option-radio:checked').forEach(() => answered++);
        this.questionStatus.forEach(st => {
            if (st === 'review') review++;
        });

        const unanswered = this.totalQuestions - answered;

        this.summaryAnswered.textContent = answered;
        this.summaryUnanswered.textContent = unanswered;
        this.summaryReview.textContent = review;

        this.submitConfirmModal.show();
    }

    submitExam(isAuto = false) {
        if (isAuto) {
            alert('Time has expired! Your examination is being automatically submitted.');
        }
        clearInterval(this.timerInterval);
        this.examForm.submit();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof EXAM_CONFIG !== 'undefined') {
        window.examApp = new ExamEngine(EXAM_CONFIG);
    }
});
