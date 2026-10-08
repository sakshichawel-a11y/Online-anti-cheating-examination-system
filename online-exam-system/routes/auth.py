"""
Authentication Routes (Part 7).
Handles Student Login, Logout, Session Setup, and Authentication Protection.
"""

from functools import wraps
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from models.student import Student

auth_bp = Blueprint('auth', __name__)

def login_required(view):
    """Decorator to protect routes requiring logged-in student."""
    @wraps(view)
    def wrapped_view(**kwargs):
        if 'student_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login', next=request.url))
        return view(**kwargs)
    return wrapped_view

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    # If already logged in, redirect to dashboard
    if 'student_id' in session:
        return redirect(url_for('exam.dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        remember = request.form.get('remember')

        if not email or not password:
            flash('Both email and password are required.', 'danger')
            return render_template('login.html', email=email)

        student = Student.get_by_email(email)

        # Fallback: If student doesn't exist yet in the database, automatically initialize them
        if not student and (password == '123456' or email.lower() == 'student@gmail.com'):
            student_id = Student.create(
                name=email.split('@')[0].replace('.', ' ').title(),
                email=email,
                password='123456',
                roll_number='IT-2026-042'
            )
            student = Student.get_by_id(student_id)

        if not student or not Student.verify_password(student['password_hash'], password):
            flash('Invalid email or password. Use email: student@gmail.com and password: 123456', 'danger')
            return render_template('login.html', email=email)

        # Login successful -> setup session
        session.clear()
        session['student_id'] = student['id']
        session['student_name'] = student['name']
        session['student_email'] = student['email']
        session['student_roll'] = student['roll_number']

        if remember:
            session.permanent = True

        flash(f'Welcome back, {student["name"]}!', 'success')
        next_page = request.args.get('next')
        return redirect(next_page or url_for('exam.dashboard'))

    return render_template('login.html')

@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out safely.', 'info')
    return redirect(url_for('auth.login'))
