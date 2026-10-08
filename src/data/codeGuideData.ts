import { GuidePart } from '../types';

export const CODE_GUIDE_PARTS: GuidePart[] = [
  {
    id: 0,
    partNumber: 'PART 0',
    title: 'Understand the Final System',
    badge: 'System Flow & Lifecycle',
    summary: 'Mastering the end-to-end user journey, runtime states, data flows, and security perimeter of the Online Examination System before writing any code.',
    contentSections: [
      {
        heading: '1. Overall System Architecture & Student Flow',
        body: 'The examination system is built on a request-response cycle enforced by a stateful session. The student cannot skip steps or bypass verification checkpoints:',
        bullets: [
          'STUDENT → Accesses the landing portal via browser',
          'LOGIN → Authenticates using email and securely hashed password via Flask session',
          'DASHBOARD → Displays personalized student profile, performance metrics, and active examinations',
          'SELECT EXAMINATION → Student reviews exam topic, total questions, marks, and duration',
          'INSTRUCTIONS → Strict anti-cheating rules, fullscreen requirements, and time limits are acknowledged',
          'START EXAM → Generates an active Attempt record in the database; launches the secure exam interface',
          'EXAM INTERFACE → Question viewer, MCQ options, sticky countdown timer, question palette, and background anti-cheat listeners',
          'SUBMIT EXAM → Answers transmitted via POST request; prevents duplicate submissions',
          'SERVER-SIDE EVALUATION → Server retrieves canonical correct answers from database, calculates marks, percentage, and pass/fail',
          'RESULT → Displays detailed score card, question analysis, and suspicious activity logs',
          'HISTORY → Persisted archive of all past completed examinations with scores and timestamps',
          'LOGOUT → Clears session tokens and terminates credentials safely'
        ]
      },
      {
        heading: '2. The Anti-Cheating Perimeter (Defense-in-Depth)',
        body: 'Traditional online forms allow users to Google answers in neighboring tabs. Our system implements client-side behavioral detection paired with server-authoritative logging and a 3-strike disqualification rule:',
        bullets: [
          'Tab Switch & Window Blur Detection: Fires when visibilityState === "hidden" or focus is lost',
          'Fullscreen Lock: Forces HTML5 Fullscreen API; detects escape key or window resize',
          'Clipboard & Context Menu Lock: Blocks Ctrl+C, Ctrl+V, right-click context menu, and devtools inspect keys',
          'Warning Counter: Warning 1 (Gentle prompt), Warning 2 (Severe warning), Warning 3 (Automatic forced submission)',
          'Audit Log Persistence: Every infraction is timestamped and recorded in the cheating_logs table'
        ]
      }
    ],
    vivaQuestions: [
      {
        question: 'Why is client-side evaluation considered insecure for online examinations?',
        answer: 'If correct answers or evaluation logic are sent to the client browser (e.g. in JavaScript or hidden inputs), students can inspect DOM elements or network payloads in DevTools to find the correct answers. Evaluation must always happen server-side.'
      },
      {
        question: 'What is the role of an Attempt entity in this architecture?',
        answer: 'An Attempt encapsulates a single student’s test session at a specific time. It tracks start time, end time, final score, status, and binds individual answers and cheating logs to that specific test run.'
      }
    ]
  },
  {
    id: 1,
    partNumber: 'PART 1',
    title: 'Project Planning & Requirements',
    badge: 'Requirements & Scope',
    summary: 'Formal definition of users, actor privileges, functional requirements, and non-functional engineering constraints for a Diploma IT microproject.',
    contentSections: [
      {
        heading: 'Step 1: User & Actor Definition',
        body: 'For Version 1 (Microproject Scope), the primary actor is the Student. The system architecture is modularized so an Examiner/Admin portal can plug in seamlessly later:',
        bullets: [
          'Student: Authenticates, browses assigned tests, takes examinations under anti-cheat supervision, reviews instant results, and examines attempt histories',
          'Examiner / Admin (Future Phase): Creates question banks, configures exam schedules, reviews cheating event logs, and generates class analytics'
        ]
      },
      {
        heading: 'Step 2: Functional vs Non-Functional Requirements',
        body: 'Requirements must be clearly categorized for the microproject report documentation:',
        bullets: [
          'FR-1 (Authentication): Secure email/password login, PBKDF2/Scrypt password hashing, session expiration on logout',
          'FR-2 (Exam Catalog): Dynamic listing of available tests with duration, passing score, and question count',
          'FR-3 (Exam Engine): Single-question presentation, MCQ radio selection, question palette with status colors (Grey/Blue/Green/Orange/Purple)',
          'FR-4 (Timer & Auto-Submit): Synchronized frontend countdown with automatic POST submission at 00:00',
          'FR-5 (Anti-Cheating Monitoring): Detection of tab blur, fullscreen exit, copy/paste, and right-click with 3-tier warning modal',
          'FR-6 (Server Evaluation): Server compares student choices against correct_option, computes score and status',
          'NFR-1 (Security): Zero plaintext passwords, SQL injection protection via parameterized queries, protection against duplicate submissions',
          'NFR-2 (Reliability): Persistent SQLite database with foreign key cascades; state recovery on accidental browser glitch'
        ]
      }
    ],
    vivaQuestions: [
      {
        question: 'What are Non-Functional Requirements and give two examples in this system?',
        answer: 'Non-Functional Requirements describe the quality attributes, security, and performance of the system rather than specific features. Examples include password hashing (Security) and sub-second question rendering (Performance).'
      }
    ]
  },
  {
    id: 2,
    partNumber: 'PART 2',
    title: 'Design Before Coding (UML, DFD & ER)',
    badge: 'System Design & Diagrams',
    summary: 'Full architectural diagrams required for the Diploma IT project report: Use Case Diagram, DFD Level 0, DFD Level 1, ER Diagram, and Database Schema.',
    diagrams: [
      {
        title: 'Use Case Diagram',
        type: 'usecase',
        description: 'Represents the interactions between the Student actor and the core system use cases.'
      },
      {
        title: 'Data Flow Diagram (Level 0 - Context)',
        type: 'dfd0',
        description: 'Context-level DFD demonstrating external entity boundary with the Online Exam System.'
      },
      {
        title: 'Data Flow Diagram (Level 1 - Decomposed)',
        type: 'dfd1',
        description: 'Detailed DFD showing 5 primary sub-processes (Auth, Exam Mgmt, Monitoring, Evaluation, Reporting) and data stores.'
      },
      {
        title: 'Entity-Relationship (ER) Diagram',
        type: 'er',
        description: 'Relational model showing entities: STUDENTS, EXAMS, QUESTIONS, ATTEMPTS, ANSWERS, and CHEATING_LOGS with 1:N cardinality.'
      },
      {
        title: 'System Architecture (3-Tier MVC)',
        type: 'architecture',
        description: 'Presentation Tier (HTML/Bootstrap/JS), Logic Tier (Flask routes & services), and Data Tier (SQLite).'
      }
    ],
    contentSections: [
      {
        heading: 'Entity Relationships & Cardinality Details',
        body: 'The database design adheres to 3rd Normal Form (3NF) to eliminate redundancy and maintain relational integrity:',
        bullets: [
          'STUDENT (1) ──── (N) ATTEMPT: One student can attempt zero, one, or multiple examinations over time.',
          'EXAM (1) ──── (N) QUESTION: An examination consists of multiple MCQ questions (e.g. 10 questions).',
          'EXAM (1) ──── (N) ATTEMPT: Multiple students can take attempts of the same examination.',
          'ATTEMPT (1) ──── (N) ANSWER: Each attempt records the student’s selected options for each question.',
          'QUESTION (1) ──── (N) ANSWER: A question can have answers recorded across many student attempts.',
          'ATTEMPT (1) ──── (N) CHEATING_LOG: Any suspicious event during an attempt creates a forensic log entry.'
        ]
      }
    ],
    vivaQuestions: [
      {
        question: 'What is the difference between DFD Level 0 and DFD Level 1?',
        answer: 'DFD Level 0 (Context Diagram) abstracts the entire system into a single process bubble showing data flows into and out of external entities. DFD Level 1 decomposes that single bubble into major sub-processes (e.g. Authentication, Exam Session, Cheating Detection, Evaluation) and depicts internal data stores.'
      },
      {
        question: 'Why are Foreign Key constraints essential in this database design?',
        answer: 'Foreign Keys enforce referential integrity. For example, if an attempt record is deleted or a student is removed, ON DELETE CASCADE guarantees orphaned answers and cheating logs are automatically cleaned up, preventing dangling references.'
      }
    ]
  },
  {
    id: 3,
    partNumber: 'PART 3',
    title: 'Development Environment Setup',
    badge: 'Virtualenv & Pip',
    summary: 'Setting up the Python virtual environment, package manager, and required libraries for reproducible local development.',
    contentSections: [
      {
        heading: 'Step-by-Step Terminal Commands',
        body: 'Execute the following commands in your terminal or VS Code to bootstrap the environment:',
        bullets: [
          '1. Create Project Root: mkdir online-exam-system && cd online-exam-system',
          '2. Create Python Virtual Environment: python -m venv venv',
          '3. Activate Virtualenv on Windows: venv\\Scripts\\activate',
          '4. Activate Virtualenv on macOS/Linux: source venv/bin/activate',
          '5. Install Required Packages: pip install flask werkzeug jinja2',
          '6. Generate Requirements File: pip freeze > requirements.txt'
        ]
      }
    ],
    files: [
      {
        path: 'requirements.txt',
        language: 'text',
        description: 'Pinned Python dependencies for the microproject.',
        code: `Flask==3.0.2
Werkzeug==3.0.1
Jinja2==3.1.3`
      }
    ],
    vivaQuestions: [
      {
        question: 'Why do we use a Python Virtual Environment (venv)?',
        answer: 'A virtual environment isolates project dependencies from the global operating system Python installation. This avoids package version conflicts between different projects and ensures team/evaluator reproducibility.'
      }
    ]
  },
  {
    id: 4,
    partNumber: 'PART 4',
    title: 'Project Directory Structure',
    badge: 'Folder Architecture',
    summary: 'Modular organization separating concerns into Models, Views (Templates), Controllers (Routes), Services, and Database Assets.',
    contentSections: [
      {
        heading: 'Complete Directory Hierarchy',
        body: 'The project follows the standard Flask application package pattern:',
        bullets: [
          'app.py — Main Flask application factory and entry point',
          'config.py — Configuration settings, secret keys, database paths, and thresholds',
          'requirements.txt — Pinned Python library dependencies',
          'database/ — schema.sql and init_db.py SQLite initialization scripts',
          'models/ — Data access objects (Student, Exam, Question, Attempt, Result)',
          'routes/ — Blueprints for Auth (auth.py), Exam delivery (exam.py), and Results (result.py)',
          'services/ — Business logic for evaluation and anti-cheating rule validation',
          'templates/ — Jinja2 HTML templates extending base.html',
          'static/css/ — Custom stylesheets for academic blue/white aesthetic',
          'static/js/ — Client-side scripts for validation, exam engine, and anti-cheating listeners'
        ]
      }
    ],
    vivaQuestions: [
      {
        question: 'What is a Flask Blueprint?',
        answer: 'A Flask Blueprint is a way to organize related routes, handlers, and templates into modular components (e.g. auth_bp, exam_bp). It allows large applications to be cleanly split into separate files rather than cramming all endpoints into app.py.'
      }
    ]
  },
  {
    id: 5,
    partNumber: 'PART 5',
    title: 'Build the Database (schema.sql & init_db.py)',
    badge: 'SQLite Database',
    summary: 'Production-ready SQLite DDL definitions for all 6 tables with constraints, foreign keys, performance indices, and demo seed data.',
    files: [
      {
        path: 'database/schema.sql',
        language: 'sql',
        description: 'Complete SQL schema with tables for students, exams, questions, attempts, answers, and cheating_logs.',
        code: `-- ==========================================================
-- Online Examination System with Anti-Cheating Mechanism
-- Database Schema: SQLite Dialect
-- ==========================================================

PRAGMA foreign_keys = ON;

-- 1. Students Table
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    roll_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Exams Table
CREATE TABLE exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 10,
    duration_minutes INTEGER NOT NULL DEFAULT 10,
    total_marks INTEGER NOT NULL DEFAULT 10,
    passing_marks INTEGER NOT NULL DEFAULT 5,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Questions Table (MCQ Format)
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK(correct_option IN ('A', 'B', 'C', 'D')),
    marks INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE
);

-- 4. Attempts Table
CREATE TABLE attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    total_score REAL DEFAULT 0,
    percentage REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK(status IN ('IN_PROGRESS', 'SUBMITTED', 'DISQUALIFIED')),
    warning_count INTEGER DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE
);

-- 5. Answers Table
CREATE TABLE answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option TEXT CHECK(selected_option IN ('A', 'B', 'C', 'D', NULL)),
    is_correct INTEGER DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES attempts (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
);

-- 6. Cheating Logs Table
CREATE TABLE cheating_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attempt_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    event_type TEXT NOT NULL CHECK(event_type IN ('TAB_SWITCH', 'FULLSCREEN_EXIT', 'COPY_ATTEMPT', 'PASTE_ATTEMPT', 'RIGHT_CLICK_ATTEMPT', 'WINDOW_BLUR')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    warning_number INTEGER NOT NULL,
    FOREIGN KEY (attempt_id) REFERENCES attempts (id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX idx_student_email ON students (email);
CREATE INDEX idx_questions_exam ON questions (exam_id);
CREATE INDEX idx_attempts_student ON attempts (student_id);
CREATE INDEX idx_cheating_logs_attempt ON cheating_logs (attempt_id);`
      },
      {
        path: 'database/init_db.py',
        language: 'python',
        description: 'Python script to execute schema.sql and seed sample student and exams.',
        code: `import os
import sqlite3

def init_database():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'exam_system.db')
    schema_path = os.path.join(base_dir, 'schema.sql')

    print(f"[*] Initializing database at {db_path}...")
    conn = sqlite3.connect(db_path)
    with open(schema_path, 'r', encoding='utf-8') as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print("[+] Database initialized successfully with tables and demo data!")

if __name__ == '__main__':
    init_database()`
      }
    ],
    contentSections: [
      {
        heading: 'Why SQLite for Diploma Microprojects?',
        body: 'SQLite is serverless, zero-configuration, and stores the entire database in a single disk file (database/exam_system.db). It fully supports ACID transactions, parameterized queries, and foreign key cascades without needing external database servers.'
      }
    ],
    vivaQuestions: [
      {
        question: 'Why do we store password_hash instead of password in the students table?',
        answer: 'Storing plaintext passwords is a critical security vulnerability. If the database file is compromised, attackers could read every student password. Hashes (created with cryptographic salt) cannot be reversed back to the plaintext password.'
      }
    ]
  },
  {
    id: 6,
    partNumber: 'PART 6',
    title: 'Build the Backend Foundation',
    badge: 'Flask App & Config',
    summary: 'Building config.py, the Flask application factory in app.py, route registrations, and global error handlers.',
    files: [
      {
        path: 'config.py',
        language: 'python',
        description: 'Flask configuration file with database path and security settings.',
        code: `import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'online-exam-secret-key-diploma-2026'
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'exam_system.db')
    SESSION_PERMANENT = False
    SESSION_COOKIE_HTTPONLY = True
    MAX_WARNING_LIMIT = 3`
      },
      {
        path: 'app.py',
        language: 'python',
        description: 'Core Flask entry point with blueprint registrations and template context processors.',
        code: `import os
from flask import Flask, render_template, session
from config import Config
from routes.auth import auth_bp
from routes.exam import exam_bp
from routes.result import result_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(exam_bp)
    app.register_blueprint(result_bp)

    # Inject current student session into all templates
    @app.context_processor
    def inject_student():
        return {
            'current_student': {
                'id': session.get('student_id'),
                'name': session.get('student_name'),
                'email': session.get('student_email'),
                'roll': session.get('student_roll')
            } if 'student_id' in session else None
        }

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)`
      }
    ],
    contentSections: [
      {
        heading: 'Why use an Application Factory Pattern?',
        body: 'The create_app() function packages Flask setup cleanly. This allows tests to initialize instances with alternative test configurations and avoids circular imports between route modules.'
      }
    ],
    vivaQuestions: [
      {
        question: 'What does SESSION_COOKIE_HTTPONLY do?',
        answer: 'It flags the session cookie as HTTP-only, preventing client-side JavaScript (e.g. malicious XSS scripts) from accessing document.cookie and stealing the session ID.'
      }
    ]
  },
  {
    id: 7,
    partNumber: 'PART 7',
    title: 'Build Authentication (Models & Routes)',
    badge: 'Security & Sessions',
    summary: 'Implementing password hashing using Werkzeug security, Student model queries, login/logout routes, and the @login_required decorator.',
    files: [
      {
        path: 'models/student.py',
        language: 'python',
        description: 'Data model for Student queries and Werkzeug password verification.',
        code: `import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class Student:
    @staticmethod
    def get_by_email(email):
        conn = get_db_connection()
        student = conn.execute("SELECT * FROM students WHERE LOWER(email) = LOWER(?)", (email.strip(),)).fetchone()
        conn.close()
        return student

    @staticmethod
    def verify_password(stored_hash, password):
        return check_password_hash(stored_hash, password)`
      },
      {
        path: 'routes/auth.py',
        language: 'python',
        description: 'Authentication routes with session protection and login decorator.',
        code: `from functools import wraps
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from models.student import Student

auth_bp = Blueprint('auth', __name__)

def login_required(view):
    @wraps(view)
    def wrapped_view(**kwargs):
        if 'student_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login', next=request.url))
        return view(**kwargs)
    return wrapped_view

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if 'student_id' in session:
        return redirect(url_for('exam.dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()

        if not email or not password:
            flash('Both email and password are required.', 'danger')
            return render_template('login.html', email=email)

        student = Student.get_by_email(email)
        if not student or not Student.verify_password(student['password_hash'], password):
            flash('Invalid email or password.', 'danger')
            return render_template('login.html', email=email)

        session.clear()
        session['student_id'] = student['id']
        session['student_name'] = student['name']
        session['student_email'] = student['email']
        session['student_roll'] = student['roll_number']

        flash(f'Welcome back, {student["name"]}!', 'success')
        return redirect(url_for('exam.dashboard'))

    return render_template('login.html')

@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('auth.login'))`
      }
    ],
    contentSections: [
      {
        heading: 'How the @login_required Decorator Operates',
        body: 'The custom Python decorator wraps any protected view function. Before executing the view, it checks if "student_id" exists in Flask’s cryptographically signed session. If absent, it flashes an alert and redirects to the login screen with the return URL preserved.'
      }
    ],
    vivaQuestions: [
      {
        question: 'How does check_password_hash verify a password without decrypting the hash?',
        answer: 'Cryptographic hashes are one-way functions. When a student enters their password, check_password_hash extracts the salt from the stored hash, hashes the newly provided password using the identical algorithm, and compares the two resulting hashes. If they match, the password was correct.'
      }
    ]
  },
  {
    id: 8,
    partNumber: 'PART 8',
    title: 'Build the Base Frontend (base.html & style.css)',
    badge: 'Master Layout & CSS',
    summary: 'Master layout template implementing Bootstrap 5, responsive navigation bar, flash notification banners, and academic blue/white theme.',
    files: [
      {
        path: 'templates/base.html',
        language: 'html',
        description: 'Jinja2 base template extended by all pages with navbar, messages, and footer.',
        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Online Exam Portal{% endblock %}</title>
    <!-- Bootstrap 5 CSS & Icons -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
    {% block extra_css %}{% endblock %}
</head>
<body class="d-flex flex-column min-vh-100 bg-light">

    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm border-bottom">
        <div class="container">
            <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="{{ url_for('exam.dashboard') if current_student else url_for('auth.login') }}">
                <i class="bi bi-shield-check fs-4 text-warning"></i>
                <span>Online Exam Portal</span>
            </a>
            {% if current_student %}
            <div class="ms-auto d-flex align-items-center gap-3">
                <span class="text-white small d-none d-md-inline">{{ current_student.name }}</span>
                <a href="{{ url_for('auth.logout') }}" class="btn btn-outline-light btn-sm">Logout</a>
            </div>
            {% endif %}
        </div>
    </nav>

    <!-- Flash message alerts -->
    <div class="container mt-3">
        {% with messages = get_flashed_messages(with_categories=true) %}
            {% if messages %}
                {% for category, msg in messages %}
                    <div class="alert alert-{{ category }} alert-dismissible fade show" role="alert">
                        {{ msg }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                {% endfor %}
            {% endif %}
        {% endwith %}
    </div>

    <main class="flex-grow-1">
        {% block content %}{% endblock %}
    </main>

    <footer class="bg-white border-top py-3 text-center text-muted small">
        Online Examination System with Anti-Cheating &bull; Diploma IT Microproject
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    {% block extra_js %}{% endblock %}
</body>
</html>`
      },
      {
        path: 'static/css/style.css',
        language: 'css',
        description: 'Academic blue/white color variables and question palette styling.',
        code: `:root {
    --primary-blue: #1e3a8a;
    --accent-blue: #2563eb;
    --palette-grey: #64748b;
    --palette-green: #16a34a;
    --palette-orange: #ea580c;
    --palette-purple: #7c3aed;
}

body {
    background-color: #f8fafc;
    font-family: system-ui, -apple-system, sans-serif;
    color: #0f172a;
}

.navbar {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%) !important;
}

.card {
    border-color: #e2e8f0;
}`
      }
    ],
    contentSections: [
      {
        heading: 'Why Template Inheritance in Jinja2?',
        body: 'Template inheritance prevents duplicate code. Header navigation, stylesheet references, bootstrap scripts, and flash alerts are defined once in base.html; child pages merely insert their unique markup into {% block content %}.'
      }
    ],
    vivaQuestions: [
      {
        question: 'What is the purpose of get_flashed_messages() in Jinja2?',
        answer: 'Flask’s flash() function pushes one-time notifications into the session. In base.html, get_flashed_messages(with_categories=true) extracts these messages to render contextual Bootstrap alert banners, which automatically clear after rendering.'
      }
    ]
  },
  {
    id: 9,
    partNumber: 'PART 9',
    title: 'Build Login Page (HTML, CSS & JS)',
    badge: 'Login Interface',
    summary: 'Building login.html with project logo, email/password inputs, show/hide password toggle, remember-me checkbox, client-side validation, and security notice.',
    files: [
      {
        path: 'templates/login.html',
        language: 'html',
        description: 'Student login card with validation feedback and anti-cheating warning badge.',
        code: `{% extends "base.html" %}

{% block title %}Student Login - Online Examination System{% endblock %}

{% block content %}
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-12 col-md-6 col-lg-5">
            <div class="card shadow border-0 rounded-3 p-4">
                <div class="text-center mb-4">
                    <div class="bg-primary-subtle text-primary rounded-circle d-inline-flex p-3 mb-2">
                        <i class="bi bi-shield-lock-fill fs-2"></i>
                    </div>
                    <h4 class="fw-bold">Online Examination System</h4>
                    <p class="text-muted small">Enter student credentials to access examination portal</p>
                </div>

                <form id="loginForm" method="POST" action="{{ url_for('auth.login') }}" novalidate>
                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Email Address</label>
                        <input type="email" class="form-control" id="email" name="email" required placeholder="student@gmail.com">
                        <div class="invalid-feedback">Valid email required.</div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-semibold">Password</label>
                        <div class="input-group">
                            <input type="password" class="form-control" id="password" name="password" required placeholder="••••••">
                            <button class="btn btn-outline-secondary" type="button" id="togglePasswordBtn">
                                <i class="bi bi-eye" id="togglePasswordIcon"></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold mt-3">
                        Sign In to Examination
                    </button>
                </form>

                <div class="alert alert-info mt-4 small mb-0">
                    <i class="bi bi-shield-exclamation me-1"></i> Security: Anti-cheating monitoring is active during test sessions.
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}`
      },
      {
        path: 'static/js/login.js',
        language: 'javascript',
        description: 'Password visibility toggle and client-side form validation before POST.',
        code: `document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePasswordBtn');
    const toggleIcon = document.getElementById('togglePasswordIcon');

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            toggleIcon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
        });
    }
});`
      }
    ],
    contentSections: [
      {
        heading: 'Testing Validation Edge Cases',
        body: 'Students should test the following scenarios:',
        bullets: [
          'Empty Email: Triggers client feedback without contacting the server',
          'Malformed Email (e.g. student@): Prevented by HTML5 regex validation',
          'Invalid Password: Flask flashes "Invalid email or password" error banner',
          'Valid Login (student@gmail.com / 123456): Successfully creates session and redirects to /dashboard'
        ]
      }
    ],
    vivaQuestions: [
      {
        question: 'Why perform client-side validation if the backend already validates inputs?',
        answer: 'Client-side validation provides instant feedback to the user without making unnecessary network round-trips to the server. Backend validation remains mandatory as the true security guard against bypassed or spoofed requests.'
      }
    ]
  },
  {
    id: 10,
    partNumber: 'PART 10',
    title: 'Build Dashboard (dashboard.html & exam.py)',
    badge: 'Student Dashboard',
    summary: 'Developing the personalized student dashboard displaying welcome card, performance stats, and available examination cards with direct test launcher.',
    files: [
      {
        path: 'templates/dashboard.html',
        language: 'html',
        description: 'Dashboard template displaying welcome banner, metrics, and exam cards.',
        code: `{% extends "base.html" %}

{% block title %}Dashboard - Online Examination System{% endblock %}

{% block content %}
<div class="container py-4">
    <!-- Welcome Header -->
    <div class="card bg-primary text-white border-0 shadow-sm rounded-3 p-4 mb-4">
        <h3 class="fw-bold mb-1">Welcome, {{ student_name }}!</h3>
        <p class="mb-0 text-white-50">Email: {{ student_email }} &bull; Roll Number: {{ student_roll }}</p>
    </div>

    <!-- Available Exams List -->
    <h4 class="fw-bold mb-3"><i class="bi bi-journal-text me-2 text-primary"></i>Available Examinations</h4>
    <div class="row g-4">
        {% for exam in exams %}
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm rounded-3 p-3">
                <span class="badge bg-primary-subtle text-primary w-auto mb-2">{{ exam.subject }}</span>
                <h5 class="fw-bold">{{ exam.title }}</h5>
                <p class="text-muted small">{{ exam.description }}</p>

                <div class="bg-light p-3 rounded-3 small mb-3">
                    <div class="d-flex justify-content-between mb-1">
                        <span>Questions:</span> <strong>{{ exam.total_questions }} MCQs</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                        <span>Duration:</span> <strong>{{ exam.duration_minutes }} Minutes</strong>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Total Marks:</span> <strong>{{ exam.total_marks }}</strong>
                    </div>
                </div>

                <a href="{{ url_for('exam.instructions', exam_id=exam.id) }}" class="btn btn-primary w-100 mt-auto">
                    Start Examination <i class="bi bi-arrow-right ms-1"></i>
                </a>
            </div>
        </div>
        {% endfor %}
    </div>
</div>
{% endblock %}`
      },
      {
        path: 'models/exam.py',
        language: 'python',
        description: 'Exam queries for active test listings and student attempt statistics.',
        code: `import sqlite3
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class Exam:
    @staticmethod
    def get_all_active():
        conn = get_db_connection()
        exams = conn.execute("SELECT * FROM exams WHERE is_active = 1 ORDER BY id ASC").fetchall()
        conn.close()
        return exams`
      }
    ],
    contentSections: [
      {
        heading: 'Why Route to Instructions Instead of Starting Exam Immediately?',
        body: 'Launching an exam starts the official timer and creates an attempt entry in the database. Routing students first to instructions.html ensures they read rules, understand anti-cheating monitoring, and explicitly trigger Fullscreen mode before questions appear.'
      }
    ],
    vivaQuestions: [
      {
        question: 'How do you query active exams from SQLite using Python?',
        answer: 'We open a connection using sqlite3.connect(), set conn.row_factory = sqlite3.Row so columns can be accessed like Python dictionaries, and execute "SELECT * FROM exams WHERE is_active = 1".'
      }
    ]
  }
];
