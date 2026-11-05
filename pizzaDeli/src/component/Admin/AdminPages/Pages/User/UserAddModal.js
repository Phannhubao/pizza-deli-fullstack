import { useState } from "react";
import { Modal } from "react-bootstrap";
import {
  FaUserPlus,
  FaUser,
  FaShieldAlt,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import Swal from "sweetalert2";
import { PostRegister } from "../../../../../services/ApiService";
import "../../AdminCrud.css";

const UserAddModal = ({ show, onHide, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthDate: "",
    address: "",
    role: "CUSTOMER",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Họ tên không được để trống";
    if (!formData.email.trim()) errs.email = "Email không được để trống";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Địa chỉ email không đúng định dạng";

    if (!formData.password.trim()) errs.password = "Mật khẩu không được để trống";
    else if (formData.password.length < 6)
      errs.password = "Mật khẩu phải có ít nhất 6 ký tự";

    if (!formData.address.trim()) errs.address = "Địa chỉ không được để trống";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        status: "ACTIVE",
        birthDate: formData.birthDate
          ? new Date(formData.birthDate).toISOString().split("T")[0]
          : null
      };

      const response = await PostRegister(payload);
      if (response.status === 200 || response.status === 201) {
        await Swal.fire({
          icon: "success",
          title: "Thêm thành công!",
          text: `Đã tạo tài khoản cho ${formData.name}`,
          timer: 1500,
          showConfirmButton: false
        });

        setFormData({
          name: "",
          email: "",
          birthDate: "",
          address: "",
          role: "CUSTOMER",
          password: ""
        });
        if (onUserAdded) onUserAdded();
        onHide();
      }
    } catch (error) {
      console.error("Lỗi khi thêm người dùng:", error);
      Swal.fire({
        icon: "error",
        title: "Tạo tài khoản thất bại",
        text:
          error.response?.data?.message ||
          "Email có thể đã được đăng ký trong hệ thống."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <div className="modal-header-pro">
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="modal-title">
            <FaUserPlus className="text-primary me-2" />
            <span>Thêm Tài Khoản Người Dùng Mới</span>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onHide}
            aria-label="Close"
          ></button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body-pro">
          {/* Role Selection Cards */}
          <label className="crud-label mb-2">Vai trò tài khoản:</label>
          <div className="role-select-cards">
            <div
              className={`role-card-option ${
                formData.role === "CUSTOMER" ? "selected" : ""
              }`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: "CUSTOMER" }))
              }
            >
              <div className="role-card-icon text-primary">
                <FaUser />
              </div>
              <div className="role-card-title">Khách Hàng (CUSTOMER)</div>
              <div className="role-card-desc">
                Đặt hàng, tích điểm, nhận khuyến mãi
              </div>
            </div>

            <div
              className={`role-card-option ${
                formData.role === "ADMIN" ? "selected" : ""
              }`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: "ADMIN" }))
              }
            >
              <div className="role-card-icon text-danger">
                <FaShieldAlt />
              </div>
              <div className="role-card-title">Quản Trị Viên (ADMIN)</div>
              <div className="role-card-desc">
                Toàn quyền quản lý đơn, thực đơn, khách hàng
              </div>
            </div>
          </div>

          <div className="row g-3">
            {/* Họ và tên */}
            <div className="col-md-6">
              <div className="crud-form-group">
                <label className="crud-label">
                  Họ và tên <span className="required">*</span>
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    name="name"
                    className={`crud-input ${errors.name ? "is-invalid" : ""}`}
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && (
                  <div className="crud-feedback-error">
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="col-md-6">
              <div className="crud-form-group">
                <label className="crud-label">
                  Địa chỉ Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className={`crud-input ${errors.email ? "is-invalid" : ""}`}
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="crud-feedback-error">
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="col-md-6">
              <div className="crud-form-group">
                <label className="crud-label">
                  Mật khẩu đăng nhập <span className="required">*</span>
                </label>
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`crud-input ${errors.password ? "is-invalid" : ""}`}
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-muted position-absolute top-50 end-0 translate-middle-y me-2 p-0"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <div className="crud-feedback-error">
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ngày sinh */}
            <div className="col-md-6">
              <div className="crud-form-group">
                <label className="crud-label">Ngày sinh (Tùy chọn)</label>
                <input
                  type="date"
                  name="birthDate"
                  className="crud-input"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="col-12">
              <div className="crud-form-group mb-0">
                <label className="crud-label">
                  Địa chỉ giao hàng <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  className={`crud-input ${errors.address ? "is-invalid" : ""}`}
                  placeholder="Số nhà, tên đường, phường, quận/huyện..."
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && (
                  <div className="crud-feedback-error">
                    <span>{errors.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer-pro">
          <button
            type="button"
            className="crud-btn-secondary"
            onClick={onHide}
            disabled={loading}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="crud-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <FaUserPlus />
                <span>Tạo tài khoản</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserAddModal;