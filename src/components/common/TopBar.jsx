import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminImage from '../../assets/Admin-Image.jpg';
import './TopBar.css';

const TopBar = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        // Handle search logic here
        console.log('Search:', searchQuery);
    };

    return (
        <header className="topbar">
            <div className="topbar-left">
                <h1 className="topbar-title">Welcome Back, {user?.role === 'admin' ? 'Admin' : user?.name?.split(' ')[0] || 'User'}</h1>
            </div>

            <div className="topbar-center">
                <form onSubmit={handleSearch} className="topbar-search">
                    <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search anything"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </form>
            </div>

            <div className="topbar-right">
                <div className="topbar-user">
                    <div className="user-avatar">
                        {user?.role === 'admin' ? (
                            <img src={AdminImage} alt="Rukundo Furaha Divin" />
                        ) : user?.avatar ? (
                            <img src={user.avatar} alt={user?.name} />
                        ) : (
                            <span>{user?.name?.charAt(0) || 'U'}</span>
                        )}
                    </div>
                    <span className="user-name">
                        {user?.role === 'admin' ? 'Rukundo Furaha Divin' : (user?.name || 'User')}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
