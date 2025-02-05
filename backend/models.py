# Define tables for users, events, and event monitors

from database import db
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


from database import db


class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    organization_name = db.Column(db.String(100), nullable=False)  # e.g., AXO
    chapter_name = db.Column(db.String(100), nullable=False)  # e.g., Phi Chapter
    admin_id = db.Column(db.Integer, db.ForeignKey("user.id"))

    members = db.relationship(
        "User",
        backref="chapter",
        lazy=True,
        foreign_keys="User.chapter_id" # Specify the foreign_keys parameter to resolve ambiguity
    )

    def __repr__(self):
        return f"<Chapter {self.organization_name} - {self.chapter_name}>"


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default="member")  # Roles: member, vp, admin
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapter.id"))

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(100), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapter.id"), nullable=False)

    def __repr__(self):
        return f"<Event {self.name}>"


class EventMonitor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False)


class JoinRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapter.id"), nullable=False)
    status = db.Column(
        db.String(20), default="pending"
    )  # "pending", "approved", "rejected"

    user = db.relationship("User", backref="join_requests")
    chapter = db.relationship("Chapter", backref="join_requests")
