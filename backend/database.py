"""
database.py - Database Configuration

This module initializes the SQLAlchemy instance for database operations
in the GreekGather application.

Author: Elizabeth Soltis, Aaditi Chinawalkar, Taylor Slade, Kaityln Clements, Sam Muehlebach
Revised:
- 02/02 - Initial implementation


Preconditions:
- Flask application must be initialized
- SQLAlchemy must be installed
- Database URI must be configured in app.py

Dependencies:
- Flask-SQLAlchemy

Side Effects:
- Initializes database connection
- Creates database session

Known Limitations:
- Single database instance
- No connection pooling configuration
- No explicit error handling
"""
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

