import React, { useEffect, useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => setUser({ name: data.name, email: data.email }))
      .catch(err => console.error('Profile load error:', err));
  }, [token]);

  const handleChange = e => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const updateField = field => {
    if (!user[field]) return alert(`Please enter a ${field}`);
    fetch('http://127.0.0.1:5000/api/user/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ [field]: user[field] }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Update failed');
        alert(`${field[0].toUpperCase() + field.slice(1)} updated!`);
      })
      .catch(err => {
        console.error(err);
        alert(`Failed to update ${field}`);
      });
  };

  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error('Password update failed');
      alert('Password updated!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      alert('Failed to change password');
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">My Profile</h2>

      <div className="profile-current-info">
        <h3>Current Information</h3>
        <p><strong>Name:</strong> {user.name || 'Not set'}</p>
        <p><strong>Email:</strong> {user.email || 'Not set'}</p>
    </div>

      <form className="profile-section" onSubmit={e => e.preventDefault()}>
        <label>Name</label>
        <input name="name" value={user.name} onChange={handleChange} />
        <button type="button" onClick={() => updateField('name')}>Update Name</button>
      </form>

      <form className="profile-section" onSubmit={e => e.preventDefault()}>
        <label>Email</label>
        <input name="email" value={user.email} onChange={handleChange} />
        <button type="button" onClick={() => updateField('email')}>Update Email</button>
      </form>

      <hr className="profile-divider" />

      <div className="profile-section">
        <label>New Password</label>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {password && confirmPassword && password !== confirmPassword && (
          <p style={{ color: 'red', fontSize: '0.9rem' }}>Passwords do not match</p>
        )}

        <button
          type="button"
          onClick={handlePasswordChange}
          disabled={!password || password !== confirmPassword}
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Profile;
