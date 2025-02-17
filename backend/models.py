"""
models.py - Database Models

This module defines the database schema and models for the GreekGather application,
implementing the data structure for users, chapters, events, and related entities.

Authors: Elizabeth Soltis, Aaditing Chinawalkar, Taylor Slade, Kaitlyn Clements, Sam Muehlebach

Revised:
- 02/02 - Initial implementation
- 02/04 - Added event monitoring
- 02/09 - Added chapter management
- 02/13 - Implemented join requests

Preconditions:
- Database must be initialized
- SQLAlchemy must be configured
- Werkzeug security must be available for password hashing

Models:
- User: Application users with authentication and roles
- Chapter: Greek organization chapters
- Event: Chapter events and activities
- EventMonitor: Event participation tracking
- JoinRequest: Chapter membership requests

Input Validation:
- Email format validation
- Password strength requirements
- Required fields enforcement

Error Conditions:
- Duplicate email addresses
- Invalid foreign key references
- Constraint violations

Side Effects:
- Automatic password hashing
- Relationship cascades
- Database constraints enforcement

Known Limitations:
- No soft delete
- Basic password hashing
- Limited role system
"""
# Define tables for users, events, and event monitors

from database import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class Chapter(db.Model):
    """
    Chapter model representing a Greek organization's chapter.
    Manages chapter information and member relationships.
    
    Attributes:
        id (Integer): Primary key
        organization_name (String): Name of the organization (e.g., 'AXO')
        chapter_name (String): Specific chapter name (e.g., 'Phi Chapter')
        admin_id (Integer): Foreign key to the chapter administrator
        members (Relationship): Relationship to User model for chapter members
    """
    id = db.Column(db.Integer, primary_key=True)
    organization_name = db.Column(db.String(100), nullable=False)  # e.g., AXO
    chapter_name = db.Column(db.String(100), nullable=False)  # e.g., Phi Chapter
    admin_id = db.Column(db.Integer, db.ForeignKey("user.id"))

     # Relationship to chapter members
    members = db.relationship(
        "User",
        backref="chapter",
        lazy=True,
        foreign_keys="User.chapter_id" # Specify the foreign_keys parameter to resolve ambiguity
    )

    def __repr__(self):
        """String representation of Chapter"""
        return f"<Chapter {self.organization_name} - {self.chapter_name}>"


class User(db.Model):
    """
    User model representing application users.
    Handles user authentication, roles, and chapter membership.
    
    Attributes:
        id (Integer): Primary key
        name (String): User's full name
        email (String): Unique email address
        password (String): Hashed password
        role (String): User role (member, vp, admin)
        chapter_id (Integer): Foreign key to associated chapter
        
    Methods:
        set_password: Hashes and sets user password
        check_password: Verifies password against hash
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), default="member")  # Roles: member, exec, admin
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=True)  

    def set_password(self, password):
        """
        Hash and set the user's password
        
        Args:
            password (str): Plain text password
            
        Side Effects:
            - Updates password field with hash
        """
        self.password = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
         """
        Verify a password against the hash
        
        Args:
            password (str): Plain text password to verify
            
        Returns:
            bool: True if password matches, False otherwise
        """
        return check_password_hash(self.password, password)

    def __repr__(self):
        """String representation of User"""
        return f'<User {self.name}>'


class Event(db.Model):
    """
    Event model representing chapter events and activities.
    
    Attributes:
        id (Integer): Primary key
        name (String): Event name
        description (Text): Detailed event description
        date (String): Event date
        location (String): Event location
        eventType (String): Type of event (Social, Service, Academics, etc.)
        
    Methods:
        to_dict: Converts event to dictionary for API responses
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(150), nullable=False)
    eventType = db.Column(db.String(50), nullable=False)  # Social, Service, Academics, etc.

    def to_dict(self):
        """
        Convert event to dictionary format
        
        Returns:
            dict: Event data in dictionary format for JSON serialization
        """
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "date": self.date,
            "location": self.location,
            "eventType": self.eventType
        }


class EventMonitor(db.Model):
    """
    EventMonitor model for tracking event participation.
    Creates a many-to-many relationship between users and events.
    
    Attributes:
        id (Integer): Primary key
        user_id (Integer): Foreign key to participating user
        event_id (Integer): Foreign key to associated event
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False)


class JoinRequest(db.Model):
    """
    JoinRequest model for managing chapter membership requests.
    Tracks the status of user requests to join chapters.
    
    Attributes:
        id (Integer): Primary key
        user_id (Integer): Foreign key to requesting user
        chapter_id (Integer): Foreign key to requested chapter
        status (String): Request status (pending, approved, rejected)
        
    Relationships:
        user: Relationship to requesting User
        chapter: Relationship to requested Chapter
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapter.id"), nullable=False)
    status = db.Column(
        db.String(20), default="pending"
    )  # "pending", "approved", "rejected"

    user = db.relationship("User", backref="join_requests")
    chapter = db.relationship("Chapter", backref="join_requests")
