import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const { user } = useAuth();

    const getMenuItems = () => {
        const menus = {
            admin: [
                { path: '/admin', label: 'Dashboard', icon: '📊' },
                { path: '/admin/users', label: 'User Management', icon: '👥' },
                { path: '/admin/seasons', label: 'Season Management', icon: '📅' },
                { path: '/admin/pricing', label: 'Pricing Config', icon: '💰' },
                { path: '/admin/farmers', label: 'Farmer Registry', icon: '🌱' },
                { path: '/admin/lots', label: 'Lot Overview', icon: '📦' },
                { path: '/admin/reports', label: 'Reports', icon: '📄' },
                { path: '/admin/audit', label: 'Audit Logs', icon: '🔍' },
            ],
            receptionist: [
                { path: '/receptionist', label: 'Delivery Entry', icon: '📝' },
                { path: '/receptionist/history', label: 'Delivery History', icon: '📋' },
            ],
            operator: [
                { path: '/operator', label: 'Lot Processing', icon: '⚙️' },
                { path: '/operator/logs', label: 'Processing Logs', icon: '📑' },
                { path: '/operator/bags', label: 'Bag Management', icon: '🛍️' },
            ],
            sustainability: [
                { path: '/sustainability', label: 'Quality Checks (CPQI)', icon: '✅' },
                { path: '/sustainability/compliance', label: 'Compliance (CPSI)', icon: '🌿' },
                { path: '/sustainability/approval', label: 'Lot Approval', icon: '✔️' },
            ],
            finance: [
                { path: '/finance', label: 'Expense Management', icon: '💵' },
                { path: '/finance/labor', label: 'Labor Costs', icon: '👷' },
                { path: '/finance/assets', label: 'Asset Management', icon: '🏭' },
                { path: '/finance/revenue', label: 'Revenue', icon: '💹' },
                { path: '/finance/statements', label: 'Financial Statements', icon: '📊' },
                { path: '/finance/kpis', label: 'KPIs & Alerts', icon: '📈' },
            ],
        };

        return menus[user?.role] || [];
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">☕</div>
                <h2 className="sidebar-title">CWS Manager</h2>
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
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
