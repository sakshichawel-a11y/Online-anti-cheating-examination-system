"""
Question, Attempt, and Result Models.
"""

import sqlite3
from datetime import datetime
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class Question:
    @staticmethod
    def get_by_exam_id(exam_id, include_correct=False):
        conn = get_db_connection()
        if include_correct:
            questions = conn.execute(
                "SELECT * FROM questions WHERE exam_id = ? ORDER BY id ASC",
                (exam_id,)
            ).fetchall()
        else:
            # SECURITY: Do NOT expose correct_option to the client before exam submission
            questions = conn.execute(
                "SELECT id, exam_id, question_text, option_a, option_b, option_c, option_d, marks FROM questions WHERE exam_id = ? ORDER BY id ASC",
                (exam_id,)
            ).fetchall()
        conn.close()
        return questions

class Attempt:
    @staticmethod
    def create(student_id, exam_id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO attempts (student_id, exam_id, status, warning_count) VALUES (?, ?, 'IN_PROGRESS', 0)",
            (student_id, exam_id)
        )
        conn.commit()
        attempt_id = cursor.lastrowid
        conn.close()
        return attempt_id

    @staticmethod
    def get_by_id(attempt_id):
        conn = get_db_connection()
        attempt = conn.execute("SELECT * FROM attempts WHERE id = ?", (attempt_id,)).fetchone()
        conn.close()
        return attempt

    @staticmethod
    def increment_warning(attempt_id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE attempts SET warning_count = warning_count + 1 WHERE id = ?", (attempt_id,))
        conn.commit()
        updated = conn.execute("SELECT warning_count FROM attempts WHERE id = ?", (attempt_id,)).fetchone()
        conn.close()
        return updated['warning_count'] if updated else 0

    @staticmethod
    def log_cheating(attempt_id, student_id, exam_id, event_type, description, warning_number):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO cheating_logs (attempt_id, student_id, exam_id, event_type, description, warning_number)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (attempt_id, student_id, exam_id, event_type, description, warning_number))
        conn.commit()
        conn.close()

    @staticmethod
    def get_cheating_logs(attempt_id):
        conn = get_db_connection()
        logs = conn.execute("SELECT * FROM cheating_logs WHERE attempt_id = ? ORDER BY timestamp ASC", (attempt_id,)).fetchall()
        conn.close()
        return logs
