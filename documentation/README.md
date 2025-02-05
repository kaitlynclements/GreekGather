# GreekGather Setup Guide

## 1. Backend Setup (Flask)

### Prerequisites
- Python 3.9 or higher
- pip (Python package installer)

### Setup Steps

1. Navigate to the backend directory:

cd backend

2. Create a virtual environment:

python -m venv venv

3. Activate the virtual environment:

#### On MacOS/Linux:
source venv/bin/activate

#### On Windows:
venv\Scripts\activate

4. Install dependencies:  

pip install flask flask_sqlalchemy flask_migrate flask_jwt_extended
pip install flask-cors
pip install flask-bcrypt

5. Initialize the database:

python database.py

6. Run the Flask server:

python app.py

The backend will be running on http://127.0.0.1:5000.


## 2. Frontend Setup (React)

### Setup Steps

1. Navigate to the frontend directory:

cd frontend

2. Install dependencies:

npm install
npm install react-calendar

3. Start the frontend development server:

npm start

The frontend will be running on http://localhost:3000.
