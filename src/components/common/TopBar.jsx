import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import './TopBar.css';

const TopBar = () => {
    const { user, logout } = useAuth();
    const { seasons } = useData();

    const currentSeason = seasons.find(s => s.status === 'active');

    return (
        <header className="topbar">
            <div className="topbar-left">
                <h1 className="topbar-title">
                    {user?.role === 'admin' && 'Admin Portal'}
                    {user?.role === 'receptionist' && 'Reception Portal'}
                    {user?.role === 'operator' && 'Processing Portal'}
                    {user?.role === 'sustainability' && 'Quality & Sustainability Portal'}
                    {user?.role === 'finance' && 'Finance Portal'}
                </h1>
            </div>

            <div className="topbar-right">
                {currentSeason && (
                    <div className="topbar-season">
                        <span className="season-label">Season:</span>
                        <span className="season-value">{currentSeason.name}</span>
                    </div>
                )}

                <div className="topbar-user">
                    <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
                    <span className="user-name">{user?.name}</span>
                </div>

                <button onClick={logout} className="btn btn-outline topbar-logout">
                    Logout
                </button>
            </div>
        </header>
    );
};

export default TopBar;
