import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/Logo.png';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const getMenuItems = () => {
        const menus = {
            admin: [
                { path: '/admin', label: 'Dashboard', icon: 'grid' },
                { path: '/admin/users', label: 'Users', icon: 'users' },
                { path: '/admin/seasons', label: 'Season', icon: 'calendar' },
                { path: '/admin/farmers', label: 'Farmers', icon: 'farmer' },
                { path: '/admin/pricing', label: 'Pricing', icon: 'pricing' },
                { path: '/admin/lots', label: 'Lot', icon: 'lot' },
                { path: '/admin/reports', label: 'Report', icon: 'report' },
                { path: '/admin/audit', label: 'Report', icon: 'audit' },
            ],
            receptionist: [
                { path: '/receptionist', label: 'Delivery Entry', icon: 'grid' },
                { path: '/receptionist/history', label: 'Delivery History', icon: 'report' },
            ],
            operator: [
                { path: '/operator', label: 'Lot Processing', icon: 'grid' },
                { path: '/operator/logs', label: 'Processing Logs', icon: 'report' },
                { path: '/operator/bags', label: 'Bag Management', icon: 'lot' },
            ],
            sustainability: [
                { path: '/sustainability', label: 'Quality Checks (CPQI)', icon: 'grid' },
                { path: '/sustainability/compliance', label: 'Compliance (CPSI)', icon: 'report' },
                { path: '/sustainability/approval', label: 'Lot Approval', icon: 'lot' },
            ],
            finance: [
                { path: '/finance', label: 'Expense Management', icon: 'grid' },
                { path: '/finance/labor', label: 'Labor Costs', icon: 'users' },
                { path: '/finance/assets', label: 'Asset Management', icon: 'lot' },
                { path: '/finance/revenue', label: 'Revenue', icon: 'pricing' },
                { path: '/finance/statements', label: 'Financial Statements', icon: 'report' },
                { path: '/finance/kpis', label: 'KPIs & Alerts', icon: 'calendar' },
            ],
        };

        return menus[user?.role] || [];
    };

    const renderIcon = (iconType) => {
        const iconStyles = {
            grid: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                </svg>
            ),
            users: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
            calendar: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            ),
            farmer: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            ),
            pricing: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            lot: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
            ),
            report: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
            audit: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            ),
        };
        return iconStyles[iconType] || iconStyles.grid;
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src={Logo} alt="Coffee Washing Station Logo" />
                </div>
                <h2 className="sidebar-title">Coffee Washing Station</h2>
            </div>

            <nav className="sidebar-nav">
                {getMenuItems().map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                        end={item.path === `/${user?.role}`}
                    >
                        <span className="sidebar-icon">{renderIcon(item.icon)}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
                <button onClick={logout} className="sidebar-link sidebar-logout">
                    <span className="sidebar-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </span>
                    <span className="sidebar-label">Logout</span>
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;
