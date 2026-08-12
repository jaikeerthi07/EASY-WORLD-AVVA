import os
import pymysql
from datetime import timedelta

# 🔹 Make PyMySQL act like MySQLdb (Windows fix)
pymysql.install_as_MySQLdb()

class Config:
    # Use DATABASE_URL if available, else fallback to local MySQL
    database_url = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:jaikeerthi07a@localhost/m3cars')
    # Fix postgres:// to postgresql:// for SQLAlchemy compatibility in Render
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.environ.get('SECRET_KEY', 'inventory-management-secret-key-2026')

    # File upload configuration
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'docx', 'xlsx'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)