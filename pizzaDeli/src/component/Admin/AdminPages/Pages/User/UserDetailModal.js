import { useEffect, useState, useCallback } from "react";
import { Modal } from "react-bootstrap";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBan,
  FaUnlockAlt
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  GetUserByID,
  PostBanUser,
  PostUnbanUser
} from "../../../../../services/ApiService";
import "../../AdminCrud.css";

const UserDetailModal = ({ show, onHide, userId, onStatusChanged }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await GetUserByID(userId);
      if (response.status === 200) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết người dùng:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (show && userId) {
      fetchUserDetails();
    } else {
      setUser(null);
    }
  }, [show, userId, fetchUserDetails]);

  const handleToggleBan = async () => {
    if (!user) return;
    const isBanning = user.status === "ACTIVE";

    const confirm = await Swal.fire({
      title: isBanning ? "Khóa tài khoản này?" : "Mở khóa tài khoản?",
      text: isBanning
        ? "Người dùng này sẽ không thể đăng nhập hoặc đặt hàng nữa."
        : "Người dùng sẽ có thể đăng nhập và mua sắm lại bình thường.",
      icon: isBanning ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: isBanning ? "#ef4444" : "#10b981",
      cancelButtonColor: "#64748b",
      confirmButtonText: isBanning ? "Khóa ngay" : "Mở khóa",
      cancelButtonText: "Hủy"
    });

    if (!confirm.isConfirmed) return;

    setActionLoading(true);
    try {
      if (isBanning) {
        await PostBanUser(userId);
      } else {
        await PostUnbanUser(userId);
      }

      Swal.fire({
        icon: "success",
        title: isBanning ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
        timer: 1400,
        showConfirmButton: false
      });

      await fetchUserDetails();
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      console.error("Lỗi khi đổi trạng thái user:", err);
      Swal.fire("Lỗi", "Không thể thực hiện thao tác. Vui lòng thử lại sau.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <div className="modal-header-pro">
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="modal-title">
            <FaUser className="text-primary me-2" />
            <span>Hồ Sơ Người Dùng #{userId}</span>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onHide}
            aria-label="Close"
          ></button>
        </div>
      </div>

      <div className="modal-body-pro">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small">Đang tải thông tin hồ sơ...</p>
          </div>
        ) : user ? (
          <div>
            {/* User Profile Hero */}
            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 border mb-4">
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background:
                    user.role === "ADMIN"
                      ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                      : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.35rem",
                  fontWeight: "bold",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                }}
              >
                {getInitials(user.name)}
              </div>

              <div>
                <h5 className="fw-bold mb-1 text-dark">{user.name || "Chưa có tên"}</h5>
                <div className="d-flex align-items-center gap-2">
                  <span
                    className={`badge px-2 py-1 ${
                      user.role === "ADMIN"
                        ? "bg-danger-subtle text-danger border border-danger-subtle"
                        : "bg-primary-subtle text-primary border border-primary-subtle"
                    }`}
                  >
                    {user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
                  </span>

                  <span
                    className={`badge px-2 py-1 ${
                      user.status === "ACTIVE"
                        ? "bg-success-subtle text-success border border-success-subtle"
                        : "bg-secondary-subtle text-secondary border"
                    }`}
                  >
                    {user.status === "ACTIVE" ? "Đang hoạt động" : "Đã bị khóa"}
                  </span>
                </div>
              </div>
            </div>

            {/* User Details Grid */}
            <div className="list-group list-group-flush rounded-3 border">
              <div className="list-group-item d-flex align-items-center py-3">
                <FaEnvelope className="text-muted me-3" style={{ fontSize: "1.1rem" }} />
                <div>
                  <div className="text-muted small">Địa chỉ Email</div>
                  <div className="fw-semibold text-dark">{user.email || "---"}</div>
                </div>
              </div>

              <div className="list-group-item d-flex align-items-center py-3">
                <FaMapMarkerAlt className="text-muted me-3" style={{ fontSize: "1.1rem" }} />
                <div>
                  <div className="text-muted small">Địa chỉ nhận hàng</div>
                  <div className="fw-semibold text-dark">{user.address || "Chưa cập nhật"}</div>
                </div>
              </div>

              <div className="list-group-item d-flex align-items-center py-3">
                <FaCalendarAlt className="text-muted me-3" style={{ fontSize: "1.1rem" }} />
                <div>
                  <div className="text-muted small">Ngày sinh</div>
                  <div className="fw-semibold text-dark">
                    {user.birthDate
                      ? new Date(user.birthDate).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            Không tìm thấy thông tin người dùng
          </div>
        )}
      </div>

      <div className="modal-footer-pro">
        <button type="button" className="crud-btn-secondary" onClick={onHide}>
          Đóng
        </button>

        {user && user.role !== "ADMIN" && (
          <button
            type="button"
            className={user.status === "ACTIVE" ? "crud-btn-danger" : "crud-btn-primary"}
            onClick={handleToggleBan}
            disabled={actionLoading}
          >
            {user.status === "ACTIVE" ? (
              <>
                <FaBan />
                <span>Khóa tài khoản</span>
              </>
            ) : (
              <>
                <FaUnlockAlt />
                <span>Mở khóa tài khoản</span>
              </>
            )}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailModal;