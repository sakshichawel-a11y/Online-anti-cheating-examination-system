"""
Result & Submission Routes.
Handles server-side evaluation, result calculation, and history.
"""

from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from routes.auth import login_required
from models.exam import Exam
from models.question import Question, Attempt
import sqlite3
from datetime import datetime
from config import Config

result_bp = Blueprint('result', __name__)

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@result_bp.route('/attempt/<int:attempt_id>/submit', methods=['POST'])
@login_required
def submit_exam(attempt_id):
    """Part 16 & 17: Submit Examination and Server-Side Evaluation."""
    attempt = Attempt.get_by_id(attempt_id)
    if not attempt or attempt['student_id'] != session['student_id']:
        flash('Invalid submission attempt.', 'danger')
        return redirect(url_for('exam.dashboard'))

    # Prevent duplicate submission
    if attempt['status'] != 'IN_PROGRESS':
        flash('This attempt has already been submitted.', 'warning')
        return redirect(url_for('result.view_result', attempt_id=attempt_id))

    # Answers sent from client { "question_id": "selected_option" }
    submitted_answers = request.form.to_dict()

    # Load actual questions WITH correct answers strictly on server
    questions = Question.get_by_exam_id(attempt['exam_id'], include_correct=True)
    exam = Exam.get_by_id(attempt['exam_id'])

    total_questions = len(questions)
    correct_count = 0
    wrong_count = 0
    unanswered_count = 0
    total_score = 0

    conn = get_db_connection()
    cursor = conn.cursor()

    for q in questions:
        q_id = str(q['id'])
        selected = submitted_answers.get(f'q_{q_id}')
        
        is_correct = 0
        if not selected:
            unanswered_count += 1
            selected = None
        elif selected == q['correct_option']:
            correct_count += 1
            is_correct = 1
            total_score += q['marks']
        else:
            wrong_count += 1

        cursor.execute("""
            INSERT INTO answers (attempt_id, question_id, selected_option, is_correct)
            VALUES (?, ?, ?, ?)
        """, (attempt_id, q['id'], selected, is_correct))

    percentage = round((total_score / exam['total_marks']) * 100, 1) if exam['total_marks'] > 0 else 0
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    cursor.execute("""
        UPDATE attempts
        SET end_time = ?, total_score = ?, percentage = ?, status = 'SUBMITTED'
        WHERE id = ?
    """, (now, total_score, percentage, attempt_id))

    conn.commit()
    conn.close()

    flash('Examination submitted and evaluated successfully!', 'success')
    return redirect(url_for('result.view_result', attempt_id=attempt_id))

@result_bp.route('/attempt/<int:attempt_id>/result')
@login_required
def view_result(attempt_id):
    """Part 18: Result Page."""
    conn = get_db_connection()
    attempt = conn.execute("""
        SELECT a.*, e.title as exam_title, e.subject, e.total_marks, e.passing_marks, e.total_questions, s.name as student_name
        FROM attempts a
        JOIN exams e ON a.exam_id = e.id
        JOIN students s ON a.student_id = s.id
        WHERE a.id = ? AND a.student_id = ?
    """, (attempt_id, session['student_id'])).fetchone()

    if not attempt:
        conn.close()
        flash('Result not found or access denied.', 'danger')
        return redirect(url_for('exam.dashboard'))

    # Answers and cheating logs
    answers = conn.execute("""
        SELECT ans.*, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.marks
        FROM answers ans
        JOIN questions q ON ans.question_id = q.id
        WHERE ans.attempt_id = ?
        ORDER BY q.id ASC
    """, (attempt_id,)).fetchall()

    cheating_logs = conn.execute("""
        SELECT * FROM cheating_logs WHERE attempt_id = ? ORDER BY timestamp ASC
    """, (attempt_id,)).fetchall()

    conn.close()

    is_pass = attempt['total_score'] >= attempt['passing_marks']

    return render_template(
        'result.html',
        attempt=attempt,
        answers=answers,
        cheating_logs=cheating_logs,
        is_pass=is_pass
    )

@result_bp.route('/history')
@login_required
def history():
    """Part 19: History Page."""
    conn = get_db_connection()
    attempts = conn.execute("""
        SELECT a.*, e.title as exam_title, e.subject, e.total_marks, e.passing_marks
        FROM attempts a
        JOIN exams e ON a.exam_id = e.id
        WHERE a.student_id = ? AND a.status = 'SUBMITTED'
        ORDER BY a.start_time DESC
    """, (session['student_id'],)).fetchall()
    conn.close()

    return render_template('history.html', attempts=attempts)
