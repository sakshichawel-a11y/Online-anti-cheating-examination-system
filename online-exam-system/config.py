import os

class Config:
    """Application configuration parameters for Online Examination System."""
    # In production, replace with an environment variable or random secret key
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'online-exam-secret-key-diploma-2026'
    
    # Path to SQLite database file
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'exam_system.db')
    
    # Session lifetime and cookie security
    SESSION_PERMANENT = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Anti-cheating threshold
    MAX_WARNING_LIMIT = 3
