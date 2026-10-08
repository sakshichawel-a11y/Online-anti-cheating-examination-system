"""
Question Model & Database Queries.
Handles fetching exam questions with or without correct answers.
"""

import sqlite3
from config import Config
from models.attempt import Attempt

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

__all__ = ['Question', 'Attempt']
