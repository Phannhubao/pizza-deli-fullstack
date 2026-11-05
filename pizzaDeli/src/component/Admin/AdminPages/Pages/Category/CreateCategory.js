import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaFolderPlus,
  FaTags,
  FaEye,
  FaCheckCircle
} from "react-icons/fa";
import Swal from "sweetalert2";
import { PostCategory } from "../../../../../services/ApiService";
import "../../AdminCrud.css";

export default function CreateCategory() {
  const navigate = useNavigate();
  const [category, setCategory] = useState({
    categoryName: "",
    description: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errs = {};
    if (!category.categoryName || category.categoryName.trim().length < 2) {
      errs.categoryName = "Tên danh mục phải có ít nhất 2 ký tự";
    } else if (category.categoryName.trim().length > 50) {
      errs.categoryName = "Tên danh mục không được vượt quá 50 ký tự";
    }

    if (!category.description || category.description.trim().length < 5) {
      errs.description = "Mô tả danh mục nên có ít nhất 5 ký tự";
    }

    return errs;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({
        icon: "warning",
        title: "Thông tin chưa hợp lệ",
        text: "Vui lòng điền đầy đủ các thông tin được đánh dấu."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await PostCategory({
        categoryName: category.categoryName.trim(),
        description: category.description.trim()
      });

      if (response?.status === 200 || response?.status === 201 || response?.data?.id || response?.data?.categoryId) {
        await Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: `Danh mục "${category.categoryName}" đã được tạo.`,
          timer: 1500,
          showConfirmButton: false
        });
        navigate("/admin/categories");
      } else {
        throw new Error(response?.data?.message || "Tạo danh mục thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi tạo danh mục:", error);
      Swal.fire({
        icon: "error",
        title: "Tạo thất bại",
        text: error.response?.data?.message || error.message || "Lỗi máy chủ"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-crud-container py-4">
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="crud-page-header d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Link to="/admin/categories" className="crud-back-btn">
                <FaArrowLeft />
                <span>Quay lại danh mục</span>
              </Link>
              <span className="badge bg-primary-subtle text-primary border px-2 py-1">
                Tạo mới
              </span>
            </div>
            <h1 className="crud-page-title">
              <FaFolderPlus className="text-primary" />
              <span>Thêm Danh Mục Món Ăn Mới</span>
            </h1>
            <p className="crud-page-subtitle">
              Phân loại thực đơn giúp khách hàng dễ dàng tìm kiếm món ưa thích
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="crud-btn-secondary"
              onClick={() => navigate("/admin/categories")}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="crud-btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FaFolderPlus />
                  <span>Tạo danh mục</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="crud-card">
              <div className="crud-card-header">
                <div className="crud-card-title">
                  <FaTags className="text-primary" />
                  <span>Thông Tin Danh Mục</span>
                </div>
              </div>

              <div className="crud-card-body">
                {/* Tên danh mục */}
                <div className="crud-form-group">
                  <label className="crud-label">
                    Tên danh mục <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="categoryName"
                    className={`crud-input ${errors.categoryName ? "is-invalid" : ""}`}
                    placeholder="Ví dụ: Pizza Truyền Thống, Pizza Hải Sản, Mỳ Ý, Đồ Uống..."
                    value={category.categoryName}
                    onChange={handleInputChange}
                  />
                  {errors.categoryName && (
                    <div className="crud-feedback-error">
                      <span>{errors.categoryName}</span>
                    </div>
                  )}
                </div>

                {/* Mô tả danh mục */}
                <div className="crud-form-group mb-0">
                  <label className="crud-label">
                    Mô tả danh mục <span className="required">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows="5"
                    className={`crud-textarea ${errors.description ? "is-invalid" : ""}`}
                    placeholder="Mô tả phong cách ẩm thực, đối tượng món ăn trong nhóm này..."
                    value={category.description}
                    onChange={handleInputChange}
                  ></textarea>
                  {errors.description && (
                    <div className="crud-feedback-error">
                      <span>{errors.description}</span>
                    </div>
                  )}
                  <div className="crud-char-counter">
                    {category.description?.length || 0} ký tự
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview Badge */}
          <div className="col-lg-5">
            <div className="crud-card">
              <div className="crud-card-header">
                <div className="crud-card-title">
                  <FaEye className="text-primary" />
                  <span>Xem Trước Thẻ Danh Mục</span>
                </div>
              </div>

              <div className="crud-card-body text-center py-4">
                <div className="d-inline-flex align-items-center gap-2 p-3 bg-light rounded-4 border shadow-sm mb-3">
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem"
                    }}
                  >
                    <FaTags />
                  </div>
                  <div className="text-start">
                    <h5 className="fw-bold mb-0 text-dark">
                      {category.categoryName || "Tên danh mục"}
                    </h5>
                    <small className="text-muted">
                      {category.description
                        ? category.description.slice(0, 45) + "..."
                        : "Mô tả ngắn danh mục"}
                    </small>
                  </div>
                </div>

                <div className="p-3 bg-light rounded-3 text-start small text-muted border">
                  <div className="d-flex align-items-center gap-2 mb-2 text-dark fw-semibold">
                    <FaCheckCircle className="text-success" />
                    <span>Lợi ích khi phân loại rõ ràng:</span>
                  </div>
                  <ul className="mb-0 ps-3">
                    <li>Khách hàng lọc món nhanh chóng trên trang chủ</li>
                    <li>Thống kê doanh thu theo từng nhóm sản phẩm chính xác</li>
                    <li>Dễ dàng quản lý khuyến mãi cho toàn bộ danh mục</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
