import "../../css/style.css";
import "../../css/dataTables.bootstrap5.min.css";
import "../../AdminManager.css";
import "./UserManager.css";
import {
  GetUserList,
  PostBanUser,
  PostUnbanUser,
} from "../../../../../services/ApiService";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaUserShield,
  FaSearch,
  FaUserPlus,
  FaEye,
  FaBan,
  FaCheck,
  FaSyncAlt,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import UserDetailModal from "./UserDetailModal";
import UserAddModal from "./UserAddModal";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(8);
  const [refresh, setRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GetUserList();
      const usersData = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data?.data) ? response.data.data : []);
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      setUsers([]);
      setFilteredUsers([]);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách người dùng",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refresh]);

  // KPI Stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const banned = users.filter((u) => u.status === "BANNED").length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    return { total, active, banned, admins };
  }, [users]);

  // Filtering
  useEffect(() => {
    let filtered = users;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((u) => {
        const nameMatch = u.name?.toLowerCase().includes(term);
        const emailMatch = u.email?.toLowerCase().includes(term);
        const idMatch = String(u.id || "").includes(term);
        const addressMatch = u.address?.toLowerCase().includes(term);
        return nameMatch || emailMatch || idMatch || addressMatch;
      });
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(0);
  }, [searchTerm, statusFilter, roleFilter, users]);

  // Ban / Unban
  const handleChangeStatus = async (id, action) => {
    const currentUser = users.find((u) => u.id === id);
    if (!currentUser) return;

    const isBan = action === "ban";
    const result = await Swal.fire({
      title: isBan ? "Khóa tài khoản?" : "Mở khóa tài khoản?",
      html: `Bạn có chắc muốn ${isBan ? "khóa quyền truy cập" : "kích hoạt lại tài khoản"} của <b>${currentUser.name || currentUser.email}</b>?`,
      icon: isBan ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: isBan ? "#ef4444" : "#10b981",
      cancelButtonColor: "#64748b",
      confirmButtonText: isBan ? "Khóa tài khoản" : "Mở khóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const response = isBan ? await PostBanUser(id) : await PostUnbanUser(id);
        if (response.status === 200 || response.data) {
          const newStatus = isBan ? "BANNED" : "ACTIVE";
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
          );
          Swal.fire({
            icon: "success",
            title: "Thành công",
            text: isBan ? "Đã khóa người dùng thành công" : "Đã mở khóa người dùng thành công",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: error.response?.data?.message || "Thao tác thất bại",
        });
      }
    }
  };

  const handleOpenDetailModal = (userId) => {
    setSelectedUserId(userId);
    setShowDetailModal(true);
  };

  const handleOpenAddModal = () => setShowAddModal(true);

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const offset = currentPage * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <main className="user-manager-pro-container">
      <div className="container-fluid px-4 py-4">
        {/* Top Header */}
        <div className="admin-page-hero d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h2 className="admin-hero-title mb-1">
              <FaUsers className="me-2 text-warning" /> Quản Lý Người Dùng & Tài Khoản
            </h2>
            <p className="admin-hero-subtitle text-muted mb-0">
              Quản trị danh sách khách hàng, nhân viên, phân quyền vai trò và bảo mật tài khoản
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button
              className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
              onClick={() => setRefresh((prev) => !prev)}
              disabled={loading}
            >
              <FaSyncAlt className={loading ? "fa-spin" : ""} /> Làm mới
            </button>
            <button
              onClick={handleOpenAddModal}
              className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
              style={{ background: "#c9a66b", borderColor: "#c9a66b" }}
            >
              <FaUserPlus /> Thêm Người Dùng
            </button>
          </div>
        </div>

        {/* KPI Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-xl-3 col-sm-6">
            <div className="kpi-card shadow-sm">
              <div className="kpi-icon bg-light text-dark">
                <FaUsers />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Tổng Tài Khoản</span>
                <h4 className="kpi-value text-dark">{stats.total}</h4>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-sm-6">
            <div className="kpi-card shadow-sm">
              <div className="kpi-icon bg-success-subtle text-success">
                <FaUserCheck />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Đang Hoạt Động</span>
                <h4 className="kpi-value text-success">{stats.active}</h4>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-sm-6">
            <div className="kpi-card shadow-sm">
              <div className="kpi-icon bg-danger-subtle text-danger">
                <FaUserSlash />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Bị Khóa / Cấm</span>
                <h4 className="kpi-value text-danger">{stats.banned}</h4>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-sm-6">
            <div className="kpi-card shadow-sm">
              <div className="kpi-icon bg-primary-subtle text-primary">
                <FaUserShield />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Quản Trị Viên (Admin)</span>
                <h4 className="kpi-value text-primary">{stats.admins}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div className="admin-card mb-4 shadow-sm">
          <div className="status-tabs-container">
            <button
              className={`status-tab-btn ${statusFilter === "ALL" ? "active" : ""}`}
              onClick={() => setStatusFilter("ALL")}
            >
              Tất cả <span className="tab-counter">{users.length}</span>
            </button>
            <button
              className={`status-tab-btn ${statusFilter === "ACTIVE" ? "active" : ""}`}
              onClick={() => setStatusFilter("ACTIVE")}
            >
              Hoạt động <span className="tab-counter">{stats.active}</span>
            </button>
            <button
              className={`status-tab-btn ${statusFilter === "BANNED" ? "active" : ""}`}
              onClick={() => setStatusFilter("BANNED")}
            >
              Bị cấm <span className="tab-counter">{stats.banned}</span>
            </button>
          </div>

          <div className="p-3 border-top d-flex flex-wrap gap-3 align-items-center justify-content-between bg-light rounded-bottom">
            <div className="search-box-wrapper flex-grow-1" style={{ maxWidth: "450px" }}>
              <FaSearch className="search-icon text-muted" />
              <input
                type="text"
                className="form-control ps-5 py-2 search-input-pro"
                placeholder="Tìm theo tên, email hoặc địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-sm btn-link text-muted clear-search-btn"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Vai trò:</span>
              <select
                className="form-select form-select-sm py-2 filter-select-pro"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ width: "160px" }}
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="CUSTOMER">Khách hàng</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-card shadow-sm overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 pro-user-table">
              <thead className="table-head-pro">
                <tr>
                  <th style={{ width: "70px" }}>ID</th>
                  <th>Họ Tên & Ngày Sinh</th>
                  <th>Email Liên Hệ</th>
                  <th>Địa Chỉ</th>
                  <th style={{ width: "130px" }}>Vai Trò</th>
                  <th style={{ width: "130px" }}>Trạng Thái</th>
                  <th style={{ width: "150px" }} className="text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`user-row-pro ${user.status === "BANNED" ? "table-danger opacity-75" : ""}`}
                    >
                      <td>
                        <span className="order-id-badge">#{user.id}</span>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="user-avatar-pro">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{user.name || "Chưa có tên"}</div>
                            <small className="text-muted">{user.birthDate || "N/A"}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <a href={`mailto:${user.email}`} className="text-decoration-none text-dark d-flex align-items-center gap-1">
                          <FaEnvelope className="text-muted" style={{ fontSize: "12px" }} />
                          <span>{user.email || "N/A"}</span>
                        </a>
                      </td>

                      <td>
                        <div className="text-truncate" style={{ maxWidth: "220px" }} title={user.address}>
                          <FaMapMarkerAlt className="text-danger me-1" style={{ fontSize: "11px" }} />
                          <small className="text-muted">{user.address || "Chưa cập nhật"}</small>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge px-2 py-1 ${
                            user.role === "ADMIN"
                              ? "bg-primary-subtle text-primary border border-primary"
                              : "bg-light text-dark border"
                          }`}
                        >
                          {user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`custom-badge ${
                            user.status === "ACTIVE" ? "badge-completed" : "badge-cancelled"
                          }`}
                        >
                          {user.status === "ACTIVE" ? "Hoạt động" : "Bị cấm"}
                        </span>
                      </td>

                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            onClick={() => handleOpenDetailModal(user.id)}
                            className="btn btn-sm btn-outline-info btn-action-pro"
                            title="Xem chi tiết người dùng"
                          >
                            <FaEye /> Chi tiết
                          </button>

                          {user.status === "ACTIVE" ? (
                            <button
                              onClick={() => handleChangeStatus(user.id, "ban")}
                              className="btn btn-sm btn-outline-danger btn-action-pro"
                              title="Khóa tài khoản này"
                            >
                              <FaBan /> Khóa
                            </button>
                          ) : (
                            <button
                              onClick={() => handleChangeStatus(user.id, "unban")}
                              className="btn btn-sm btn-outline-success btn-action-pro"
                              title="Mở khóa tài khoản này"
                            >
                              <FaCheck /> Mở khóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <div className="empty-orders-state py-4">
                        <FaUsers style={{ fontSize: "42px", color: "#cbd5e1" }} />
                        <h5 className="mt-2 text-secondary">Không tìm thấy người dùng nào</h5>
                        <p className="small text-muted">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pageCount > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
              <span className="small text-muted">
                Hiển thị <strong>{offset + 1}</strong> - <strong>{Math.min(offset + itemsPerPage, filteredUsers.length)}</strong> trên tổng số <strong>{filteredUsers.length}</strong> người dùng
              </span>
              <ReactPaginate
                previousLabel="‹ Trước"
                nextLabel="Sau ›"
                breakLabel="..."
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName="pagination pagination-sm mb-0 gap-1"
                activeClassName="active"
                pageClassName="page-item"
                pageLinkClassName="page-link rounded"
                previousClassName="page-item"
                previousLinkClassName="page-link rounded"
                nextClassName="page-item"
                nextLinkClassName="page-link rounded"
                breakClassName="page-item"
                breakLinkClassName="page-link rounded"
              />
            </div>
          )}
        </div>

        {/* Modal chi tiết người dùng */}
        <UserDetailModal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          userId={selectedUserId}
          onStatusChanged={() => setRefresh((prev) => !prev)}
        />

        {/* Modal thêm người dùng */}
        <UserAddModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          onUserAdded={() => setRefresh((prev) => !prev)}
        />
      </div>
    </main>
  );
}