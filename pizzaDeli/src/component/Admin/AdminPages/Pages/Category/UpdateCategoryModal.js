import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FaTags, FaSave } from "react-icons/fa";
import Swal from "sweetalert2";
import { PutCategory } from "../../../../../services/ApiService";
import "../../AdminCrud.css";

export default function UpdateCategoryModal({
  show,
  onHide,
  category,
  onUpdateSuccess
}) {
  const [formData, setFormData] = useState({
    categoryName: "",
    description: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (show && category) {
      setFormData({
        categoryName: category.categoryName || "",
        description: category.description || ""
      });
      setErrors({});
    }
  }, [show, category]);

  const validateForm = () => {
    const errs = {};
    if (!formData.categoryName.trim()) {
      errs.categoryName = "Tên danh mục không được để trống";
    } else if (formData.categoryName.trim().length < 2) {
      errs.categoryName = "Tên danh mục phải có ít nhất 2 ký tự";
    }

    if (!formData.description.trim()) {
      errs.description = "Mô tả danh mục không được để trống";
    } else if (formData.description.trim().length < 5) {
      errs.description = "Mô tả danh mục nên có ít nhất 5 ký tự";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const categoryId = category.categoryId || category.id;
      const response = await PutCategory(categoryId, {
        categoryName: formData.categoryName.trim(),
        description: formData.description.trim()
      });

      if (response?.status === 200 || response?.data) {
        await Swal.fire({
          icon: "success",
          title: "Đã cập nhật danh mục!",
          timer: 1400,
          showConfirmButton: false
        });
        if (onUpdateSuccess) onUpdateSuccess();
        onHide();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
        text: error.response?.data?.message || "Có lỗi xảy ra khi cập nhật."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <div className="modal-header-pro">
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="modal-title">
            <FaTags className="text-primary me-2" />
            <span>Cập Nhật Danh Mục #{category?.categoryId || category?.id}</span>
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
          <div className="crud-form-group">
            <label className="crud-label">
              Tên danh mục <span className="required">*</span>
            </label>
            <input
              type="text"
              name="categoryName"
              className={`crud-input ${errors.categoryName ? "is-invalid" : ""}`}
              value={formData.categoryName}
              onChange={handleInputChange}
            />
            {errors.categoryName && (
              <div className="crud-feedback-error">
                <span>{errors.categoryName}</span>
              </div>
            )}
          </div>

          <div className="crud-form-group mb-0">
            <label className="crud-label">
              Mô tả danh mục <span className="required">*</span>
            </label>
            <textarea
              name="description"
              rows="4"
              className={`crud-textarea ${errors.description ? "is-invalid" : ""}`}
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
            {errors.description && (
              <div className="crud-feedback-error">
                <span>{errors.description}</span>
              </div>
            )}
            <div className="crud-char-counter">
              {formData.description.length} ký tự
            </div>
          </div>
        </div>

        <div className="modal-footer-pro">
          <button
            type="button"
            className="crud-btn-secondary"
            onClick={onHide}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="crud-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}