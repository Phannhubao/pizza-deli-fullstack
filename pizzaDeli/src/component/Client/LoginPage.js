import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Admin/AdminPages/Context/AuthContext';
import Swal from 'sweetalert2'; // Import SweetAlert2
import '../../css/register.css'; // Sử dụng cùng CSS với RegisterPage

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
    
  //   if (validateForm()) {
  //     setIsSubmitting(true);
  //     try {
  //       const result = await login({ email: formData.email, password: formData.password });
  //       if (result.success) {
  //         const from = location.state?.from?.pathname || '/admin';
  //         // Hiển thị thông báo thành công
  //         await Swal.fire({
  //           icon: 'success',
  //           title: 'Thành công!',
  //           text: 'Đăng nhập thành công.',
  //           timer: 1500,
  //           showConfirmButton: false,
  //         });
  //         navigate(from, { replace: true });
  //       } else {
  //         // Hiển thị thông báo thất bại
  //         await Swal.fire({
  //           icon: 'error',
  //           title: 'Thất bại!',
  //           text: result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.',
  //         });
  //         setErrors({ password: result.message || 'Đăng nhập thất bại' });
  //       }
  //     } catch (error) {
  //       // Hiển thị thông báo lỗi
  //       await Swal.fire({
  //         icon: 'error',
  //         title: 'Lỗi!',
  //         text: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.',
  //       });
  //       setErrors({ password: 'Đã xảy ra lỗi khi đăng nhập' });
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   }
  // };
const handleSubmit = async (e) => {
  e.preventDefault();

  if (validateForm()) {
    setIsSubmitting(true);
    try {
      const result = await login({ email: formData.email, password: formData.password });
      if (result.success) {
        // Lưu thông tin user vào localStorage
        localStorage.setItem("userToken", JSON.stringify({
          token: result.token,
          email: result.email,
          role: result.role,
          id: result.id,
        }));

        // Hiển thị thông báo thành công
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đăng nhập thành công.',
          timer: 1500,
          showConfirmButton: false,
        });

        // Điều hướng theo role
        if (result.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true }); // hoặc điều hướng tới trang dành cho user
        }
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Thất bại!',
          text: result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.',
        });
        setErrors({ password: result.message || 'Đăng nhập thất bại' });
      }
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.',
      });
      setErrors({ password: 'Đã xảy ra lỗi khi đăng nhập' });
    } finally {
      setIsSubmitting(false);
    }
  }
};

  return (
    <div className="vintage-register">
      <div className="vr-container">
        <div className="vr-header">
          <h1 className="vr-title">Đăng Nhập</h1>
          <p className="vr-subtitle">Chào mừng bạn trở lại với Pizza Deli</p>
        </div>

        <form onSubmit={handleSubmit} className="vr-form" noValidate>
          {/* Email */}
          <div className="vr-form-group">
            <label className="vr-label">
              <FaEnvelope className="vr-icon" />
              <span>Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`vr-input ${errors.email ? 'error' : ''}`}
              placeholder="Nhập email"
              required
            />
            {errors.email && <span className="vr-error">{errors.email}</span>}
          </div>

          {/* Mật khẩu */}
          <div className="vr-form-group">
            <label className="vr-label">
              <FaLock className="vr-icon" />
              <span>Mật khẩu</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`vr-input ${errors.password ? 'error' : ''}`}
              placeholder="Nhập mật khẩu"
              required
            />
            {errors.password && <span className="vr-error">{errors.password}</span>}
          </div>

          {/* Nút đăng nhập */}
          <button 
            type="submit" 
            className="vr-submit-btn" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>

          {/* Liên kết đăng ký */}
          <div className="vr-login-link">
            Chưa có tài khoản? <a href="/signup">Đăng ký ngay</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;