import React, { useEffect, useState } from 'react';
import { Badge, Collapse } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ transparent = false }) => {
  const { user, logout, unreadCount, updateUnreadCount, adminUnreadCount, resetAdminUnread } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('#user-profile-dropdown') && !event.target.closest('#user-profile-toggle')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    if (user) {
      updateUnreadCount();
    }
  }, [user, updateUnreadCount]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const go = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const navStyle = transparent
    ? { background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', position: 'absolute', width: '100%', zIndex: 1000 }
    : { backgroundColor: '#dc3545' };

  return (
    <nav
      className={`navbar navbar-dark px-3 px-md-4 ${transparent ? '' : 'sticky-top'}`}
      style={navStyle}
      aria-label="Main navigation"
    >
      {/* Brand + hamburger row */}
      <div className="d-flex justify-content-between align-items-center w-100">
        <span
          id="navbar-brand"
          className="navbar-brand fw-bold fs-3 mb-0"
          style={{ cursor: 'pointer' }}
          onClick={() => go('/')}
        >
          🍕 Pizza Store
        </span>

        {/* Hamburger – only visible below lg */}
        <button
          id="navbar-toggler"
          className="navbar-toggler border-0 d-lg-none"
          type="button"
          aria-controls="navbarMenu"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Desktop nav links – hidden below lg */}
        <div className="d-none d-lg-flex gap-2 align-items-center">
          {renderLinks(user, unreadCount, adminUnreadCount, resetAdminUnread, go, handleLogout, false, userMenuOpen, setUserMenuOpen)}
        </div>
      </div>

      {/* Mobile collapse – visible below lg */}
      <Collapse in={menuOpen}>
        <div 
          id="navbarMenu" 
          className="d-lg-none position-absolute end-0 mt-2 p-3 shadow-lg"
          style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            width: '200px',
            zIndex: 1050,
            top: '100%',
            marginRight: '1rem'
          }}
        >
          <div className="d-flex flex-column gap-2">
            {renderLinks(user, unreadCount, adminUnreadCount, resetAdminUnread, go, handleLogout, true, userMenuOpen, setUserMenuOpen)}
          </div>
        </div>
      </Collapse>
    </nav>
  );
};

/* ── Shared link renderer for both desktop & mobile ────────────── */
function renderLinks(user, unreadCount, adminUnreadCount, resetAdminUnread, go, handleLogout, mobile = false, userMenuOpen, setUserMenuOpen) {
  const btn = (label, path, variant = 'outline-light', id) => {
    // For mobile (which now has white background), use red outline instead of light outline
    const finalVariant = mobile ? 'outline-danger' : variant;
    
    return (
      <button
        key={path}
        id={id || `nav-${label.toLowerCase().replace(/\s/g, '-')}`}
        className={`btn btn-sm btn-${finalVariant} rounded-pill px-3 ${mobile ? 'w-100 text-start border-0' : ''}`}
        onClick={() => go(path)}
        style={mobile ? { color: '#dc3545', fontWeight: '500' } : {}}
      >
        {label}
      </button>
    );
  };

  if (user) {
    return (
      <>
        {!mobile && (
          <span className="text-white fw-medium d-none d-md-inline me-1">
            Hello, {user.name}!
          </span>
        )}
        {mobile && (
          <span className="text-dark fw-bold px-2 mb-2 small border-bottom pb-2">Hello, {user.name}!</span>
        )}

        {user.role === 'admin' ? (
          <>
            <button
              id="nav-dashboard"
              className={`btn btn-sm btn-${mobile ? 'outline-danger' : 'outline-light'} rounded-pill px-3 position-relative ${mobile ? 'w-100 text-start border-0' : ''}`}
              onClick={() => { resetAdminUnread(); go('/admin'); }}
              style={mobile ? { color: '#dc3545', fontWeight: '500' } : {}}
            >
              Dashboard
              {adminUnreadCount > 0 && (
                <Badge
                  pill
                  bg="warning"
                  text="dark"
                  className={mobile ? 'ms-2' : 'position-absolute top-0 start-100 translate-middle border border-light'}
                  style={{ fontSize: '0.65rem' }}
                >
                  {adminUnreadCount}
                </Badge>
              )}
            </button>

            {btn('Monthly Revenue', '/admin/revenue', 'outline-light', 'nav-admin-revenue')}
            {btn('User Management', '/admin/users', 'outline-light', 'nav-admin-users')}
            {btn('Menu Management', '/admin/menu', 'outline-light', 'nav-menu-mgmt')}
          </>
        ) : (
          <>
            {btn('Home', '/', 'outline-light', 'nav-home')}
            {btn('Menu', '/menu', 'outline-light', 'nav-menu')}
            {btn('Cart', '/cart', 'outline-light', 'nav-cart')}
            {btn('My Orders', '/orders', 'outline-light', 'nav-orders')}
            <button
              id="nav-notifications"
              className={`btn btn-sm btn-${mobile ? 'outline-danger' : 'outline-light'} rounded-pill px-3 position-relative ${mobile ? 'w-100 text-start border-0' : ''}`}
              onClick={() => go('/notifications')}
              style={mobile ? { color: '#dc3545', fontWeight: '500' } : {}}
            >
              Notifications
              {unreadCount > 0 && (
                <Badge
                  pill
                  bg="warning"
                  text="dark"
                  className={mobile ? 'ms-2' : 'position-absolute top-0 start-100 translate-middle border border-light'}
                  style={{ fontSize: '0.65rem' }}
                >
                  {unreadCount}
                </Badge>
              )}
            </button>
          </>
        )}
        
        {/* User Profile Dropdown Toggle */}
        <div className="position-relative ms-2">
          <button
            id="user-profile-toggle"
            className="btn btn-link p-0 text-white border-0 d-flex align-items-center"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{ textDecoration: 'none' }}
          >
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name || 'Profile'}
                className={`rounded-circle border ${mobile ? 'border-danger' : 'border-white'}`}
                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill={mobile ? '#dc3545' : 'currentColor'} className="bi bi-person-circle" viewBox="0 0 16 16">
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
              </svg>
            )}
            {!mobile && <i className={`bi bi-chevron-${userMenuOpen ? 'up' : 'down'} ms-1 small`}></i>}
            {mobile && <span className="ms-2 fw-medium text-dark small">Profile & Account</span>}
          </button>

          {/* Actual Dropdown Menu */}
          {userMenuOpen && (
            <div
              id="user-profile-dropdown"
              className="position-absolute end-0 mt-2 py-2 shadow-lg border-0"
              style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                minWidth: '160px',
                zIndex: 1100,
                top: '100%'
              }}
            >
              {user.role === 'customer' && (
                <button
                  className="dropdown-item px-4 py-2 fw-medium d-flex align-items-center"
                  onClick={() => { go('/profile'); setUserMenuOpen(false); }}
                >
                  <i className="bi bi-person me-2"></i> Profile
                </button>
              )}

              <div className="dropdown-divider mx-3"></div>
              
              <button
                className="dropdown-item px-4 py-2 fw-bold text-danger d-flex align-items-center"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  // Guest links
  return (
    <>
      {btn('Home', '/', 'outline-light', 'nav-home-guest')}
      {btn('Menu', '/menu', 'outline-light', 'nav-menu-guest')}
      <button
        id="nav-login"
        className={`btn btn-sm btn-${mobile ? 'outline-danger' : 'light'} rounded-pill px-4 ${mobile ? 'text-start border-0' : 'text-danger fw-bold'} ${mobile ? 'w-100' : ''}`}
        onClick={() => go('/login')}
        style={mobile ? { color: '#dc3545', fontWeight: 'bold' } : {}}
      >
        Login
      </button>
      <button
        id="nav-register"
        className={`btn btn-sm btn-danger rounded-pill px-4 border-light ${mobile ? 'w-100 text-start mt-1' : ''}`}
        onClick={() => go('/register')}
      >
        Register
      </button>
    </>
  );
}

export default Navbar;
