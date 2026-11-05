import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope, FaHome, FaBirthdayCake } from "react-icons/fa";
import Swal from "sweetalert2";
import { PostRegister } from "../../services/ApiService";
import "../../css/register.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Email không hợp lệ";

    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";

    if (!formData.birthDate) newErrors.birthDate = "Vui lòng chọn ngày sinh";

    if (!formData.password.trim()) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (!passwordRegex.test(formData.password))
      newErrors.password = "Mật khẩu tối thiểu 8 ký tự, có chữ , số và ký tự đặc biệt";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setLoading(true);
      try {
        const newData = {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          birthDate: formData.birthDate,
          password: formData.password,
          status: "ACTIVE",
          role: "CUSTOMER",
        };

        console.log("👉 Dữ liệu gửi:", newData);
        const response = await PostRegister(newData);
        console.log("👉 Server trả về:", response);

        if (response.status === 201 || response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Thành công",
            text: "Đăng ký tài khoản thành công!",
            timer: 2000,
            showConfirmButton: false,
          });

          setFormData({
            name: "",
            email: "",
            address: "",
            birthDate: "",
            password: "",
            confirmPassword: "",
          });

          setTimeout(() => navigate("/login"), 2000);
        } else {
          throw new Error(`Email đã được sử dụng`);
        }
      } catch (err) {
        console.error("Email đã được sử dụng");
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Email đã được sử dụng",
        });
      } finally {
        setLoading(false);
      }
    },
    [formData, navigate, validateForm]
  );

  return (
    <div className="vintage-register">
      <div className="vr-container">
        <div className="vr-header">
          <h1 className="vr-title">Đăng Ký Thành Viên</h1>
          <p className="vr-subtitle">Tham gia cùng Pizza Deli để nhận ưu đãi đặc biệt</p>
        </div>

        <form onSubmit={handleSubmit} className="vr-form" noValidate>
          {/* Họ và tên */}
          <div className="vr-form-group">
            <label className="vr-label"><FaUser className="vr-icon" /> Họ và tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`vr-input ${errors.name ? "error" : ""}`}
              placeholder="Nhập họ và tên"
            />
            {errors.name && <span className="vr-error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="vr-form-group">
            <label className="vr-label"><FaEnvelope className="vr-icon" /> Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`vr-input ${errors.email ? "error" : ""}`}
              placeholder="Nhập email"
            />
            {errors.email && <span className="vr-error">{errors.email}</span>}
          </div>

          {/* Địa chỉ */}
          <div className="vr-form-group">
            <label className="vr-label"><FaHome className="vr-icon" /> Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`vr-input ${errors.address ? "error" : ""}`}
              placeholder="Nhập địa chỉ"
            />
            {errors.address && <span className="vr-error">{errors.address}</span>}
          </div>

          {/* Ngày sinh */}
          <div className="vr-form-group">
            <label className="vr-label"><FaBirthdayCake className="vr-icon" /> Ngày sinh</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={`vr-input ${errors.birthDate ? "error" : ""}`}
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.birthDate && <span className="vr-error">{errors.birthDate}</span>}
          </div>

          {/* Mật khẩu */}
          <div className="vr-form-group">
            <label className="vr-label"><FaLock className="vr-icon" /> Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`vr-input ${errors.password ? "error" : ""}`}
              placeholder="Nhập mật khẩu"
            />
            {errors.password && <span className="vr-error">{errors.password}</span>}
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="vr-form-group">
            <label className="vr-label"><FaLock className="vr-icon" /> Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`vr-input ${errors.confirmPassword ? "error" : ""}`}
              placeholder="Nhập lại mật khẩu"
            />
            {errors.confirmPassword && <span className="vr-error">{errors.confirmPassword}</span>}
          </div>

          {/* Nút submit */}
          <button type="submit" className="vr-submit-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng Ký"}
          </button>

          <div className="vr-login-link">
            Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
