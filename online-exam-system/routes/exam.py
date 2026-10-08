"""
Exam & Dashboard Routes (Part 10).
Handles Dashboard, Exam Instructions, and Exam Delivery.
"""

from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from routes.auth import login_required
from models.exam import Exam
from models.question import Question, Attempt
import sqlite3
from config import Config

exam_bp = Blueprint('exam', __name__)

@exam_bp.route('/')
@exam_bp.route('/dashboard')
@login_required
def dashboard():
    """Part 10: Build Dashboard."""
    student_id = session['student_id']
    
    # 1. Available exams
    available_exams = Exam.get_all_active()
    
    # 2. Student performance statistics
    stats = Exam.get_student_dashboard_stats(student_id)
    
    return render_template(
        'dashboard.html',
        student_name=session.get('student_name'),
        student_email=session.get('student_email'),
        student_roll=session.get('student_roll'),
        exams=available_exams,
        stats=stats
    )

@exam_bp.route('/exam/<int:exam_id>/instructions')
@login_required
def instructions(exam_id):
    """Part 11: Exam Instructions."""
    exam = Exam.get_by_id(exam_id)
    if not exam:
        flash('Requested examination not found.', 'danger')
        return redirect(url_for('exam.dashboard'))
    return render_template('instructions.html', exam=exam)

@exam_bp.route('/exam/<int:exam_id>/start', methods=['POST'])
@login_required
def start_exam(exam_id):
    """Start an exam: create attempt and redirect to examination page."""
    exam = Exam.get_by_id(exam_id)
    if not exam:
        flash('Examination not found.', 'danger')
        return redirect(url_for('exam.dashboard'))
    
    student_id = session['student_id']
    attempt_id = Attempt.create(student_id, exam_id)
    
    return redirect(url_for('exam.take_exam', attempt_id=attempt_id))

@exam_bp.route('/attempt/<int:attempt_id>/take')
@login_required
def take_exam(attempt_id):
    """Part 12: Examination Engine."""
    attempt = Attempt.get_by_id(attempt_id)
    if not attempt or attempt['student_id'] != session['student_id']:
        flash('Unauthorized or invalid examination attempt.', 'danger')
        return redirect(url_for('exam.dashboard'))
    
    if attempt['status'] != 'IN_PROGRESS':
        flash('This examination has already been completed.', 'info')
        return redirect(url_for('result.view_result', attempt_id=attempt_id))
    
    exam = Exam.get_by_id(attempt['exam_id'])
    # SECURITY: questions without correct answers!
    questions = Question.get_by_exam_id(exam['id'], include_correct=False)
    
    return render_template(
        'exam.html',
        exam=exam,
        attempt=attempt,
        questions=questions,
        duration_minutes=exam['duration_minutes']
    )

@exam_bp.route('/attempt/<int:attempt_id>/anti-cheat-log', methods=['POST'])
@login_required
def log_cheating_event(attempt_id):
    """Part 20-26: Record browser anti-cheating events."""
    attempt = Attempt.get_by_id(attempt_id)
    if not attempt or attempt['student_id'] != session['student_id']:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() or {}
    event_type = data.get('event_type')
    description = data.get('description', '')

    new_warning_count = Attempt.increment_warning(attempt_id)
    Attempt.log_cheating(
        attempt_id=attempt_id,
        student_id=session['student_id'],
        exam_id=attempt['exam_id'],
        event_type=event_type,
        description=description,
        warning_number=new_warning_count
    )

    should_auto_submit = new_warning_count >= Config.MAX_WARNING_LIMIT

    return jsonify({
        'status': 'logged',
        'warning_count': new_warning_count,
        'max_warnings': Config.MAX_WARNING_LIMIT,
        'auto_submit': should_auto_submit
    })
