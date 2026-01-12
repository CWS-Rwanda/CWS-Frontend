import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import LoginImage from '../assets/Login-Image.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const result = login(email, password);

        if (result.success) {
            const roleRoutes = {
                admin: '/admin',
                receptionist: '/receptionist',
                operator: '/operator',
                sustainability: '/sustainability',
                finance: '/finance',
            };
            navigate(roleRoutes[result.user.role]);
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-modal">
                <div className="login-image-section">
                    <div className="login-brand">CWS</div>
                    <div className="login-image-wrapper">
                        <img src={LoginImage} alt="Coffee Farmer" className="login-image" />
                    </div>
                </div>
                <div className="login-form-section">
                    <div className="login-header">
                        <h1>Hi, Farmer</h1>
                        <p>Welcome back to CWS</p>
                    </div>
                    <form onSubmit={handleSubmit} className="login-form">
                        {error && <div className="login-error">{error}</div>}
                        <div className="form-group">
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                            />
                        </div>
                        <div className="form-group password-group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div className="forgot-password">
                            <a href="#forgot">Forgot password?</a>
                        </div>
                        <button type="submit" className="btn-login">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
