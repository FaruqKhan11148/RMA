import './Password.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Password() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem('rma_owner_token');

      if (!token) {
        navigate('/owner/login');
        return;
      }

      const response = await fetch(
        'http://localhost:5000/api/owners/settings/password',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setSuccess('Password updated successfully.');
    } catch (error) {
      console.error('Update password failed:', error);

      setError(error.message || 'Unable to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="owner_setting_page">
      <section className="owner_setting_card">
        <button
          type="button"
          className="owner_setting_back"
          onClick={() => navigate('/owner/settings/account')}
        >
          ← Account Settings
        </button>

        <div className="owner_setting_header">
          <h1>Password</h1>

          <p>Change the password used to sign in to your RMA owner account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="owner_setting_label">
            Current Password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
              required
            />
          </label>

          <label className="owner_setting_label">
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              required
            />
          </label>

          <label className="owner_setting_label">
            Confirm New Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              required
            />
          </label>

          <p className="owner_password_hint">
            Password must contain at least 8 characters.
          </p>

          {error && <p className="owner_setting_error">{error}</p>}

          {success && <p className="owner_setting_success">{success}</p>}

          <button
            type="submit"
            className="owner_setting_save"
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Password;
