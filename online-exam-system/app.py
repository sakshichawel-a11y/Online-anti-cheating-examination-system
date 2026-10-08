"""
Online Examination System with Anti-Cheating Mechanism.
Main Flask Entry Point (Part 6).
"""

import os
from flask import Flask, render_template, redirect, url_for, session
from config import Config
from routes.auth import auth_bp
from routes.exam import exam_bp
from routes.result import result_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure database directory exists
    os.makedirs(os.path.join(app.root_path, 'database'), exist_ok=True)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(exam_bp)
    app.register_blueprint(result_bp)

    # Global context processor for templates
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

    # Error Handlers (Part 28)
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('base.html', error_message="Page Not Found (404)"), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template('base.html', error_message="Internal Server Error (500)"), 500

    return app

app = create_app()

if __name__ == '__main__':
    # Initial setup: check if DB exists, if not initialize it
    if not os.path.exists(Config.DATABASE_PATH):
        print("[!] Database not found. Initializing...")
        from database.init_db import init_database
        init_database()

    print("[*] Online Examination System is running on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
