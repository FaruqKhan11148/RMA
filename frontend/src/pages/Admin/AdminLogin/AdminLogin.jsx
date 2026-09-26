import './AdminLogin.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminLoginHeader from './components/AdminLoginHeader';
import AdminLoginForm from './components/AdminLoginForm';
import AdminLoginSecurity from './components/AdminLoginSecurity';

import { loginAdmin } from './utils/adminLoginApi';
import { validateAdminLogin } from './utils/adminLoginHelpers';

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    setError('');

    const validationError = validateAdminLogin(username, password);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const data = await loginAdmin(username.trim(), password);

      console.log('Admin login successful:', data);

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Admin login error:', error);

      setError(error.message || 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <AdminLoginHeader />

        <AdminLoginForm
          username={username}
          password={password}
          loading={loading}
          error={error}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onSubmit={handleLogin}
        />

        <AdminLoginSecurity />
      </div>
    </div>
  );
}

export default AdminLogin;
