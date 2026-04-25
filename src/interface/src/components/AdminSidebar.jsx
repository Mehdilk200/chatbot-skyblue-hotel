import { Link, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className="premium-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <i className="fas fa-crown"></i>
        </div>
        <div className="brand-info">
          <span className="brand-name">SkyBlue</span>
          <span className="brand-status">Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group">
          <span className="group-title">MANAGEMENT</span>
          <Link className={`sidebar-link ${isActive('/admin')}`} to="/admin">
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </Link>
          <Link className={`sidebar-link ${isActive('/admin/operations')}`} to="/admin/operations">
            <i className="fas fa-calendar-check"></i>
            <span>Operations</span>
          </Link>
          <Link className={`sidebar-link ${isActive('/admin/rooms')}`} to="/admin/rooms">
            <i className="fas fa-bed"></i>
            <span>Room Management</span>
          </Link>
        </div>

        <div className="nav-group">
          <span className="group-title">INTERACTIONS</span>
          <Link className={`sidebar-link ${isActive('/assistant')}`} to="/assistant">
            <i className="fas fa-robot"></i>
            <span>AI Concierge</span>
          </Link>
          <a className="sidebar-link" href="#">
            <i className="fas fa-users"></i>
            <span>Guests</span>
          </a>
        </div>

        <div className="nav-group settings-group">
          <span className="group-title">SYSTEM</span>
          <a className="sidebar-link" href="#">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </a>
          <a className="sidebar-link logout-link" href="#" onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </a>
        </div>
      </nav>
    </aside>
  );
}
