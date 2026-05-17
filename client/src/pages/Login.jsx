import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="auth-page container">
            <div className="auth-card">
                <h1>LOGIN</h1>
                <p>Welcome back to Luxvestment.</p>
                {error && <p className="error-msg">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>EMAIL ADDRESS</label>
                        <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <div className="password-header">
                            <label>PASSWORD</label>
                            <Link to="#" className="forgot-pw">Forgot Password?</Link>
                        </div>
                        <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="premium-btn login-btn">LOGIN NOW</button>
                </form>
                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Join us</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
