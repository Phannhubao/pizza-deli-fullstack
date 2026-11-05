import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function AdminSidebar() {
  const location = useLocation();
  const [isManagementOpen, setIsManagementOpen] = useState(true);

  const isActiveLink = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const toggleManagement = () => {
    setIsManagementOpen(!isManagementOpen);
  };

  return (
    <>
      <div className="offcanvas offcanvas-start sidebar-nav bg-dark" tabIndex="-1" id="sidebar">
        <div className="offcanvas-body p-0">
          <nav className="navbar-dark">
            {/* Header */}
            <div className="sidebar-header text-center py-4">
              <div className="sidebar-brand">
                <i className="bi bi-speedometer2 fs-3 text-primary"></i>
                <span className="ms-2 fw-bold text-white">Admin Panel</span>
              </div>
            </div>

            <ul className="navbar-nav">
              {/* Store Link */}
              <li className="nav-item">
                <Link 
                  to="/" 
                  className={`nav-link px-4 py-3 d-flex align-items-center store-link ${isActiveLink("/")}`}
                >
                  <span className="me-3">
                    <i className="fa-solid fa-store text-warning"></i>
                  </span>
                  <span>Go to Store</span>
                  <span className="ms-auto">
                    <i className="fa-solid fa-external-link-alt small"></i>
                  </span>
                </Link>
              </li>

              {/* Dashboard */}
              <li className="nav-item">
                <Link 
                  to="/admin" 
                  className={`nav-link px-4 py-3 d-flex align-items-center ${isActiveLink("/admin")}`}
                >
                  <span className="me-3">
                    <i className="bi bi-house-door-fill text-primary"></i>
                  </span>
                  <span>Dashboard</span>
                </Link>
              </li>

              <li className="my-3">
                <hr className="dropdown-divider bg-light opacity-50 mx-4" />
              </li>

              {/* Management Section */}
              <li className="nav-item">
                <div className="text-muted small fw-bold text-uppercase px-4 mb-2">
                  Management
                </div>
              </li>

              {/* Collapsible Management Menu - Sử dụng button thay vì a */}
              <li className="nav-item">
                <button 
                  className="nav-link px-4 py-3 d-flex align-items-center sidebar-collapse-btn w-100 border-0 bg-transparent text-start"
                  onClick={toggleManagement}
                  aria-expanded={isManagementOpen}
                  aria-controls="managementCollapse"
                >
                  <span className="me-3">
                    <i className="bi bi-archive-fill text-info"></i>
                  </span>
                  <span>Manager</span>
                  <span className="ms-auto">
                    <i className={`bi bi-chevron-${isManagementOpen ? "down" : "right"} transition-all`}></i>
                  </span>
                </button>
                <div className={`collapse ${isManagementOpen ? "show" : ""}`} id="managementCollapse">
                  <ul className="navbar-nav ps-4">
                    <li className="nav-item">
                      <Link 
                        to="/admin/products" 
                        className={`nav-link px-3 py-2 d-flex align-items-center ${isActiveLink("/admin/products")}`}
                      >
                        <span className="me-3">
                          <i className="fa-solid fa-box text-success"></i>
                        </span>
                        <span>Products</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        to="/admin/categories" 
                        className={`nav-link px-3 py-2 d-flex align-items-center ${isActiveLink("/admin/categories")}`}
                      >
                        <span className="me-3">
                          <i className="fa-brands fa-bandcamp text-warning"></i>
                        </span>
                        <span>Categories</span>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        to="/admin/orders" 
                        className={`nav-link px-3 py-2 d-flex align-items-center ${isActiveLink("/admin/orders")}`}
                      >
                        <span className="me-3">
                          <i className="fa fa-shopping-cart text-danger" aria-hidden="true"></i>
                        </span>
                        <span>Orders</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              {/* Users */}
              <li className="nav-item">
                <Link 
                  to="/admin/users" 
                  className={`nav-link px-4 py-3 d-flex align-items-center ${isActiveLink("/admin/users")}`}
                >
                  <span className="me-3">
                    <i className="bi bi-people-fill text-success"></i>
                  </span>
                  <span>Users</span>
                </Link>
              </li>

              <li className="my-3">
                <hr className="dropdown-divider bg-light opacity-50 mx-4" />
              </li>

              {/* Addons Section */}
              <li className="nav-item">
                <div className="text-muted small fw-bold text-uppercase px-4 mb-2">
                  Analytics
                </div>
              </li>

              <li className="nav-item">
                <Link 
                  to="/admin#chart-js" 
                  className="nav-link px-4 py-3 d-flex align-items-center"
                >
                  <span className="me-3">
                    <i className="bi bi-graph-up-arrow text-info"></i>
                  </span>
                  <span>Charts</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link 
                  to="/admin#order-list" 
                  className="nav-link px-4 py-3 d-flex align-items-center"
                >
                  <span className="me-3">
                    <i className="bi bi-table text-purple"></i>
                  </span>
                  <span>Tables</span>
                </Link>
              </li>
            </ul>

            {/* Footer */}
            <div className="sidebar-footer mt-auto p-4">
              <div className="text-center text-muted small">
                <i className="bi bi-shield-check me-1"></i>
                Secure Admin Area
              </div>
            </div>
          </nav>
        </div>
      </div>

      <style jsx>{`
        .sidebar-nav {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
          min-height: 100vh;
        }
        .nav-link {
          border-radius: 0.5rem;
          margin: 0.2rem 0.5rem;
          transition: all 0.3s ease;
          color: #e9ecef !important;
        }
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          transform: translateX(5px);
        }
        .nav-link.active {
          background: rgba(255, 255, 255, 0.15) !important;
          border-left: 4px solid #0d6efd;
        }
        .store-link {
          background: rgba(255, 193, 7, 0.1) !important;
          border: 1px solid rgba(255, 193, 7, 0.3);
        }
        .store-link:hover {
          background: rgba(255, 193, 7, 0.2) !important;
        }
        .sidebar-collapse-btn {
          cursor: pointer;
        }
        .sidebar-collapse-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .text-purple {
          color: #6f42c1 !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* Style cho button để giống với link */
        button.nav-link {
          text-decoration: none;
        }
        button.nav-link:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.5);
        }
      `}</style>
    </>
  );
}