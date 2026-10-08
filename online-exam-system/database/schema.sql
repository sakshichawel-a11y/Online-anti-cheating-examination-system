-- ==========================================================
-- Online Examination System with Anti-Cheating Mechanism
-- Database Schema: SQLite Dialect
-- Diploma IT Microproject Development Roadmap
-- ==========================================================

PRAGMA foreign_keys = ON;

-- Drop tables in dependency order if re-initializing
DROP TABLE IF EXISTS cheating_logs;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS attempts;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS students;

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

-- 4. Attempts Table (One student's single attempt at an exam)
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

-- 5. Answers Table (Student selected choices per question)
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

-- 6. Cheating Logs Table (Suspicious browser activities during exam)
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

-- Indices for rapid queries
CREATE INDEX idx_student_email ON students (email);
CREATE INDEX idx_questions_exam ON questions (exam_id);
CREATE INDEX idx_attempts_student ON attempts (student_id);
CREATE INDEX idx_attempts_exam ON attempts (exam_id);
CREATE INDEX idx_cheating_logs_attempt ON cheating_logs (attempt_id);

-- ==========================================================
-- SEED DATA (Demo Student & Sample Examination)
-- Password for demo student is '123456'
-- Werkzeug pbkdf2 hash for '123456':
-- scrypt:32768:8:1$uB2tZ5yE6oP9q4A0$4fa95e1e07b5e4086ea7be0e49aa5cf525164f77242c70da15c7e1ae7146ce367468beaa32b2e882a9d45a90d4da4d59a7226f9bb697c11f7ca4e650dfc331ec
-- ==========================================================

INSERT INTO students (id, name, email, password_hash, roll_number) VALUES
(1, 'Demo Student', 'student@gmail.com', 'scrypt:32768:8:1$uB2tZ5yE6oP9q4A0$4fa95e1e07b5e4086ea7be0e49aa5cf525164f77242c70da15c7e1ae7146ce367468beaa32b2e882a9d45a90d4da4d59a7226f9bb697c11f7ca4e650dfc331ec', 'IT-2026-042');

INSERT INTO exams (id, title, subject, total_questions, duration_minutes, total_marks, passing_marks, description, is_active) VALUES
(1, 'Java Programming', 'Core Java & OOP Concepts', 10, 10, 10, 5, 'Comprehensive assessment on Java basics, OOP pillars, memory management, and exception handling.', 1),
(2, 'Python Programming', 'Advanced Python & Data Structures', 10, 10, 10, 5, 'Assessment covering Python syntax, lists, tuples, dictionaries, functions, and file I/O.', 1),
(3, 'Database Management Systems', 'Relational DB & SQL', 10, 10, 10, 5, 'Assessment on RDBMS architecture, normalization, ACID properties, and SQL queries.', 1);

-- 10 Questions for Java Programming (Exam ID 1)
INSERT INTO questions (id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) VALUES
(1, 1, 'Which component of Java is responsible for executing the bytecode and provides platform independence?', 'JDK', 'JVM', 'JRE', 'JIT', 'B', 1),
(2, 1, 'What is the default value of a boolean primitive variable in Java when declared as an instance variable?', 'true', 'false', '0', 'null', 'B', 1),
(3, 1, 'Which of the following is NOT an Object-Oriented Programming (OOP) feature in Java?', 'Inheritance', 'Polymorphism', 'Pointers', 'Encapsulation', 'C', 1),
(4, 1, 'Which keyword is used in Java to prevent a class from being inherited?', 'static', 'final', 'abstract', 'private', 'B', 1),
(5, 1, 'Which collection class in Java does NOT allow duplicate elements?', 'ArrayList', 'LinkedList', 'HashSet', 'Vector', 'C', 1),
(6, 1, 'What is the size of an int data type in Java?', '16 bit', '32 bit', '64 bit', '8 bit', 'B', 1),
(7, 1, 'Which block in Java is ALWAYS executed whether an exception is handled or not?', 'try block', 'catch block', 'finally block', 'throw block', 'C', 1),
(8, 1, 'What happens when a thread sleep() method is called in Java?', 'It releases all locks and stops', 'It goes to runnable state', 'It pauses execution without releasing locks', 'It terminates permanently', 'C', 1),
(9, 1, 'Which package is automatically imported into every Java program by default?', 'java.util', 'java.io', 'java.lang', 'java.net', 'C', 1),
(10, 1, 'Can an abstract class in Java have constructor methods?', 'Yes, it can have constructors', 'No, abstract classes cannot have constructors', 'Only if the class is private', 'Only in Java 17 and above', 'A', 1);
