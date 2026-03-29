// Sidebar - Main navigation component
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Newspaper,
  GitBranch,
  Bookmark,
  LogOut,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: <Home />, label: 'Home' },
    { to: '/feed', icon: <Newspaper />, label: 'My Feed' },
    { to: '/story-tracker', icon: <GitBranch />, label: 'Story Tracker' },
    { to: '/saved', icon: <Bookmark />, label: 'Saved News' },
  ];

  const roleLabels = {
    investor: 'Investor',
    startup_founder: 'Startup Founder',
    student: 'Student',
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 60 }}
        id="mobile-menu-toggle"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 45,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} id="sidebar-nav">
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Zap size={18} />
            </div>
            <div>
              <div className="sidebar-logo-text">Smart News OS</div>
              <div className="sidebar-logo-badge">AI Powered</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
              end={item.to === '/'}
              id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="sidebar-section-title" style={{ marginTop: 16 }}>
            Account
          </div>
          <button
            className="sidebar-link"
            onClick={handleLogout}
            id="nav-logout"
          >
            <LogOut />
            <span>Logout</span>
          </button>
        </nav>

        {/* User info */}
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-role">
                  {roleLabels[user.role] || user.role}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
