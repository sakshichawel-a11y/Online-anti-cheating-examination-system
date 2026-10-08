"""
Exam Model & Database Queries.
Handles fetching exams, exam details, and student statistics.
"""

import sqlite3
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
        return exams

    @staticmethod
    def get_by_id(exam_id):
        conn = get_db_connection()
        exam = conn.execute("SELECT * FROM exams WHERE id = ?", (exam_id,)).fetchone()
        conn.close()
        return exam

    @staticmethod
    def get_student_dashboard_stats(student_id):
        conn = get_db_connection()
        total_completed = conn.execute(
            "SELECT COUNT(*) as count FROM attempts WHERE student_id = ? AND status = 'SUBMITTED'",
            (student_id,)
        ).fetchone()['count']

        avg_score = conn.execute(
            "SELECT AVG(percentage) as avg_p FROM attempts WHERE student_id = ? AND status = 'SUBMITTED'",
            (student_id,)
        ).fetchone()['avg_p']

        recent_attempts = conn.execute("""
            SELECT a.*, e.title as exam_title, e.subject, e.total_marks
            FROM attempts a
            JOIN exams e ON a.exam_id = e.id
            WHERE a.student_id = ?
            ORDER BY a.start_time DESC
            LIMIT 5
        """, (student_id,)).fetchall()

        conn.close()
        return {
            'completed_exams': total_completed or 0,
            'average_percentage': round(avg_score, 1) if avg_score is not None else 0,
            'recent_attempts': recent_attempts
        }
