import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaPizzaSlice,
  FaCloudUploadAlt,
  FaTrashAlt,
  FaStar,
  FaRegStar,
  FaCheckCircle,
  FaTags,
  FaEye,
  FaTimes
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  GetProductByID,
  PutProduct,
  GetCategoryList,
  GetImageByProductId,
  PostImage,
  DeleteImage,
  PutImage
} from "../../../../../services/ApiService";
import "../../AdminCrud.css";

export default function UpdateProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    stock: "",
    description: "",
    ingredients: "",
    spicyLevel: 0,
    cheeseLevel: 3,
    calories: "",
    servingSize: "2-3 người",
    isVegetarian: false,
    allergens: "",
    occasions: "",
    pairsWith: "",
    categoryId: "",
    active: true
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New image upload states
  const [newFiles, setNewFiles] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch images for this product
  const fetchProductImages = useCallback(async () => {
    try {
      const res = await GetImageByProductId(id);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setImages(list);
    } catch (err) {
      console.error("Lỗi khi tải ảnh sản phẩm:", err);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productRes, categoriesRes] = await Promise.all([
          GetProductByID(id),
          GetCategoryList()
        ]);

        const categoriesData = categoriesRes?.data || categoriesRes || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        if (productRes?.data) {
          const p = productRes.data;
          setFormData({
            productName: p.productName || "",
            price: p.price || "",
            stock: p.stock ?? 50,
            description: p.description || "",
            ingredients: p.ingredients || "",
            spicyLevel: p.spicyLevel ?? 0,
            cheeseLevel: p.cheeseLevel ?? 3,
            calories: p.calories || "",
            servingSize: p.servingSize || "2-3 người",
            isVegetarian: p.isVegetarian ?? false,
            allergens: p.allergens || "",
            occasions: p.occasions || "",
            pairsWith: p.pairsWith || "",
            categoryId: String(p.category?.categoryId || p.categoryId || ""),
            active: p.active ?? true
          });
        }

        await fetchProductImages();
      } catch (error) {
        console.error("Fetch error:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: error.response?.data?.message || "Không thể tải thông tin sản phẩm"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, fetchProductImages]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productName || !formData.productName.trim()) {
      newErrors.productName = "Tên món ăn không được để trống";
    }
    if (!formData.price || Number(formData.price) <= 0) {
      newErrors.price = "Giá bán phải lớn hơn 0 ₫";
    }
    if (formData.stock === "" || Number(formData.stock) < 0) {
      newErrors.stock = "Số lượng tồn kho không được âm";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire("Lỗi", "Vui lòng kiểm tra lại thông tin được đánh dấu đỏ", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        productName: formData.productName.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        description: formData.description?.trim() || "",
        ingredients: formData.ingredients?.trim() || "",
        spicyLevel: Number(formData.spicyLevel) || 0,
        cheeseLevel: Number(formData.cheeseLevel) || 3,
        calories: formData.calories ? Number(formData.calories) : null,
        servingSize: formData.servingSize?.trim() || "",
        isVegetarian: Boolean(formData.isVegetarian),
        allergens: formData.allergens?.trim() || "",
        occasions: formData.occasions?.trim() || "",
        pairsWith: formData.pairsWith?.trim() || "",
        active: formData.active,
        category: { categoryId: Number(formData.categoryId) }
      };

      const response = await PutProduct(id, payload);
      if (response.status === 200 || response.data) {
        await Swal.fire({
          icon: "success",
          title: "Đã lưu thay đổi!",
          text: "Thông tin món ăn đã được cập nhật thành công.",
          timer: 1500,
          showConfirmButton: false
        });
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
        text: error.response?.data?.message || error.message || "Lỗi máy chủ"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an existing image
  const handleDeleteImage = async (imageId) => {
    const confirm = await Swal.fire({
      title: "Xóa hình ảnh này?",
      text: "Ảnh sẽ bị xóa khỏi món ăn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy"
    });

    if (!confirm.isConfirmed) return;

    try {
      await DeleteImage(imageId);
      Swal.fire({
        icon: "success",
        title: "Đã xóa ảnh",
        timer: 1200,
        showConfirmButton: false
      });
      setImages((prev) => prev.filter((img) => img.imageId !== imageId));
    } catch (err) {
      console.error("Lỗi khi xóa ảnh:", err);
      Swal.fire("Lỗi", "Không thể xóa ảnh. Vui lòng thử lại sau.", "error");
    }
  };

  // Set image as primary
  const handleSetPrimary = async (imageId) => {
    try {
      const form = new FormData();
      form.append("isPrimary", "true");
      await PutImage(imageId, form);

      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.imageId === imageId
        }))
      );

      Swal.fire({
        icon: "success",
        title: "Đã đặt làm ảnh chính",
        timer: 1200,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Lỗi khi đặt ảnh chính:", err);
      fetchProductImages();
    }
  };

  // Upload new image immediately
  const handleUploadNewImages = async () => {
    if (newFiles.length === 0) return;
    setIsUploadingImage(true);
    try {
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("productId", id);
        formData.append(
          "caption",
          `${formData.productName || "Món ăn"} - Ảnh mới ${i + 1}`
        );
        formData.append("isPrimary", images.length === 0 && i === 0 ? "true" : "false");
        await PostImage(formData);
      }

      Swal.fire({
        icon: "success",
        title: "Đã tải lên!",
        text: `Đã thêm ${newFiles.length} ảnh mới cho món ăn.`,
        timer: 1400,
        showConfirmButton: false
      });
      setNewFiles([]);
      await fetchProductImages();
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      Swal.fire("Lỗi tải ảnh", "Có lỗi xảy ra khi tải ảnh lên Cloudinary.", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSelectFiles = (e) => {
    if (e.target.files) {
      const list = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...list]);
    }
  };

  const currentCategoryName =
    categories.find(
      (c) => String(c.categoryId || c.id) === String(formData.categoryId)
    )?.categoryName || "Danh mục";

  const primaryImage =
    images.find((img) => img.isPrimary)?.imageUrl ||
    images[0]?.imageUrl ||
    "/img/default-product.png";

  if (isLoading) {
    return (
      <div className="admin-crud-container py-5 mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Đang tải thông tin món ăn...</p>
      </div>
    );
  }

  return (
    <div className="admin-crud-container py-4">
      <div className="container-fluid px-4">
        {/* Header */}
        <div className="crud-page-header d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Link to="/admin/products" className="crud-back-btn">
                <FaArrowLeft />
                <span>Quay lại thực đơn</span>
              </Link>
              <span className="badge bg-secondary-subtle text-dark border px-2 py-1">
                Mã món: #{id}
              </span>
            </div>
            <h1 className="crud-page-title">
              <FaPizzaSlice className="text-warning" />
              <span>Cập Nhật Món Ăn: {formData.productName}</span>
            </h1>
            <p className="crud-page-subtitle">
              Chỉnh sửa thông tin, giá bán và quản lý hình ảnh món ăn
            </p>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="crud-btn-secondary"
              onClick={() => navigate("/admin/products")}
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
                  <FaSave />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="row g-4">
          {/* Left Column: Product Info Form */}
          <div className="col-lg-7">
            <div className="crud-card">
              <div className="crud-card-header">
                <div className="crud-card-title">
                  <FaTags className="text-primary" />
                  <span>Thông Tin Món Ăn</span>
                </div>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input pro-switch"
                    type="checkbox"
                    role="switch"
                    id="updateProductActiveSwitch"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  <label
                    className="form-check-label ms-2 small fw-semibold"
                    htmlFor="updateProductActiveSwitch"
                  >
                    {formData.active ? "Đang mở bán" : "Tạm ngưng"}
                  </label>
                </div>
              </div>

              <div className="crud-card-body">
                {/* Tên sản phẩm */}
                <div className="crud-form-group">
                  <label className="crud-label">
                    Tên món ăn <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    className={`crud-input ${errors.productName ? "is-invalid" : ""}`}
                    value={formData.productName}
                    onChange={handleInputChange}
                  />
                  {errors.productName && (
                    <div className="crud-feedback-error">
                      <span>{errors.productName}</span>
                    </div>
                  )}
                </div>

                {/* Danh mục & Giá */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="crud-form-group">
                      <label className="crud-label">
                        Danh mục <span className="required">*</span>
                      </label>
                      <select
                        name="categoryId"
                        className={`crud-select ${errors.categoryId ? "is-invalid" : ""}`}
                        value={formData.categoryId}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((c) => (
                          <option
                            key={c.categoryId || c.id}
                            value={c.categoryId || c.id}
                          >
                            {c.categoryName}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <div className="crud-feedback-error">
                          <span>{errors.categoryId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="crud-form-group">
                      <label className="crud-label">
                        Giá bán (VNĐ) <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        step="1000"
                        min="0"
                        className={`crud-input ${errors.price ? "is-invalid" : ""}`}
                        value={formData.price}
                        onChange={handleInputChange}
                      />
                      {errors.price && (
                        <div className="crud-feedback-error">
                          <span>{errors.price}</span>
                        </div>
                      )}
                      {Number(formData.price) > 0 && (
                        <div className="crud-helper-text text-success fw-semibold">
                          Giá hiển thị: {Number(formData.price).toLocaleString("vi-VN")} ₫
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tồn kho */}
                <div className="crud-form-group">
                  <label className="crud-label">
                    Số lượng tồn kho <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    className={`crud-input ${errors.stock ? "is-invalid" : ""}`}
                    value={formData.stock}
                    onChange={handleInputChange}
                  />
                  {errors.stock && (
                    <div className="crud-feedback-error">
                      <span>{errors.stock}</span>
                    </div>
                  )}
                </div>

                {/* Mô tả chi tiết */}
                <div className="crud-form-group mb-0">
                  <label className="crud-label">Mô tả chi tiết món ăn</label>
                  <textarea
                    name="description"
                    rows="4"
                    className="crud-textarea"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Thuộc tính RAG / AI Recommendation Metadata */}
            <div className="crud-card">
              <div className="crud-card-header">
                <div className="crud-card-title">
                  <span style={{ fontSize: "1.2rem" }}>🤖</span>
                  <span>Thuộc Tính Đề Xuất AI (RAG Metadata)</span>
                </div>
                <span className="badge bg-warning text-dark">RAG Powered</span>
              </div>
              <div className="crud-card-body">
                {/* Nguyên liệu chi tiết */}
                <div className="crud-form-group">
                  <label className="crud-label">Nguyên liệu chi tiết (Cho RAG phân tích)</label>
                  <input
                    type="text"
                    name="ingredients"
                    className="crud-input"
                    placeholder="VD: Tôm sú, mực tươi, phô mai Mozzarella, sốt Pesto..."
                    value={formData.ingredients}
                    onChange={handleInputChange}
                  />
                  <div className="crud-helper-text">Giúp AI nhận diện thành phần món, sở thích và tránh dị ứng.</div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="crud-form-group">
                      <label className="crud-label">Độ cay (0: Không cay, 3: Cay nồng)</label>
                      <select name="spicyLevel" className="crud-select" value={formData.spicyLevel} onChange={handleInputChange}>
                        <option value="0">0 - Không cay (Trẻ em ăn được)</option>
                        <option value="1">1 - Cay nhẹ</option>
                        <option value="2">2 - Cay vừa</option>
                        <option value="3">3 - Cay nồng</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="crud-form-group">
                      <label className="crud-label">Độ béo phô mai (1 - 5)</label>
                      <select name="cheeseLevel" className="crud-select" value={formData.cheeseLevel} onChange={handleInputChange}>
                        <option value="1">1 - Rất ít phô mai / Thanh nhẹ</option>
                        <option value="2">2 - Vừa phải</option>
                        <option value="3">3 - Tiêu chuẩn</option>
                        <option value="4">4 - Ngập tràn phô mai</option>
                        <option value="5">5 - Siêu béo ngậy</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="crud-form-group">
                      <label className="crud-label">Năng lượng ước tính (Calo - kcal)</label>
                      <input
                        type="number"
                        name="calories"
                        className="crud-input"
                        placeholder="VD: 850"
                        value={formData.calories}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="crud-form-group">
                      <label className="crud-label">Khẩu phần ăn</label>
                      <input
                        type="text"
                        name="servingSize"
                        className="crud-input"
                        placeholder="VD: 1-2 người hoặc 3-4 người"
                        value={formData.servingSize}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="crud-form-group">
                      <label className="crud-label">Cảnh báo dị ứng</label>
                      <input
                        type="text"
                        name="allergens"
                        className="crud-input"
                        placeholder="VD: Hải sản, Lactose, Gluten"
                        value={formData.allergens}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="crud-form-group">
                      <label className="crud-label">Dịp & Đối tượng phù hợp</label>
                      <input
                        type="text"
                        name="occasions"
                        className="crud-input"
                        placeholder="VD: Cặp đôi, Trẻ em, Gia đình, Tiệc tùng"
                        value={formData.occasions}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="crud-form-group">
                  <label className="crud-label">Gợi ý món ăn kèm (Food Pairing)</label>
                  <input
                    type="text"
                    name="pairsWith"
                    className="crud-input"
                    placeholder="VD: Coca-Cola Zero, Salad cá ngừ"
                    value={formData.pairsWith}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isVegetarianUpdateSwitch"
                    name="isVegetarian"
                    checked={formData.isVegetarian}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label text-success fw-bold" htmlFor="isVegetarianUpdateSwitch">
                    🌱 Món chay (Vegetarian)
                  </label>
                </div>
              </div>
            </div>

            {/* Quản lý ảnh trực tiếp */}
            <div className="crud-card">
              <div className="crud-card-header">
                <div className="crud-card-title">
                  <FaCloudUploadAlt className="text-primary" />
                  <span>Quản Lý Hình Ảnh Món Ăn ({images.length} ảnh)</span>
                </div>
                <small className="text-muted">
                  Click thùng rác để xóa ảnh trực tiếp
                </small>
              </div>

              <div className="crud-card-body">
                {/* Existing Images Gallery */}
                {images.length > 0 ? (
                  <div className="images-gallery-grid mb-4">
                    {images.map((img) => (
                      <div
                        key={img.imageId}
                        className={`image-gallery-card ${
                          img.isPrimary ? "is-primary-card" : ""
                        }`}
                      >
                        {img.isPrimary && (
                          <div className="image-primary-ribbon">
                            <FaCheckCircle /> Chính
                          </div>
                        )}
                        <img
                          src={img.imageUrl || "/img/default-product.png"}
                          alt={img.caption || "Ảnh món ăn"}
                          className="image-gallery-thumb"
                          onError={(e) => {
                            e.target.src = "/img/default-product.png";
                          }}
                        />
                        <div className="image-card-actions">
                          <button
                            type="button"
                            className={`btn-image-primary ${img.isPrimary ? "active" : ""}`}
                            onClick={() => handleSetPrimary(img.imageId)}
                            title={img.isPrimary ? "Ảnh chính" : "Đặt làm ảnh chính"}
                          >
                            {img.isPrimary ? <FaStar /> : <FaRegStar />}
                          </button>
                          <button
                            type="button"
                            className="btn-image-delete"
                            onClick={() => handleDeleteImage(img.imageId)}
                            title="Xóa ảnh này"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-light rounded-3 border border-dashed mb-4">
                    <p className="text-muted mb-0 small">
                      Chưa có hình ảnh nào cho món này. Hãy thêm ảnh bên dưới!
                    </p>
                  </div>
                )}

                {/* Upload New Image Zone */}
                <div className="border-top pt-3">
                  <label className="crud-label mb-2">Thêm hình ảnh mới:</label>
                  <div
                    className={`image-manager-dropzone ${isDragOver ? "dragover" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files) {
                        setNewFiles((prev) => [
                          ...prev,
                          ...Array.from(e.dataTransfer.files)
                        ]);
                      }
                    }}
                    onClick={() =>
                      document.getElementById("updateProductFileInput").click()
                    }
                  >
                    <input
                      id="updateProductFileInput"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={handleSelectFiles}
                    />
                    <div className="dropzone-icon-box">
                      <FaCloudUploadAlt />
                    </div>
                    <div className="fw-bold text-dark mb-1">
                      Kéo thả hoặc nhấp để chọn ảnh tải lên
                    </div>
                    <div className="small text-muted">
                      JPG, PNG, WEBP (tối đa 10MB)
                    </div>
                  </div>

                  {newFiles.length > 0 && (
                    <div className="mt-3">
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {newFiles.map((file, idx) => (
                          <div key={idx} className="upload-preview-item">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Draft"
                              className="upload-preview-thumb"
                            />
                            <button
                              type="button"
                              className="upload-preview-remove"
                              onClick={() =>
                                setNewFiles((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="crud-btn-primary"
                        onClick={handleUploadNewImages}
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1"></span>
                            <span>Đang tải lên Cloudinary...</span>
                          </>
                        ) : (
                          <>
                            <FaCloudUploadAlt />
                            <span>Tải lên {newFiles.length} ảnh này</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Customer Preview */}
          <div className="col-lg-5">
            <div className="product-live-preview">
              <div className="preview-badge-header">
                <FaEye className="text-primary" />
                <span>Xem Trước Hiển Thị Khách Hàng</span>
              </div>

              <div className="preview-image-box">
                <img
                  src={primaryImage}
                  alt={formData.productName}
                  onError={(e) => {
                    e.target.src = "/img/default-product.png";
                  }}
                />
              </div>

              <div className="preview-card-body">
                <span className="preview-category-tag">
                  {currentCategoryName}
                </span>

                <h3 className="preview-product-name">
                  {formData.productName || "Tên món ăn"}
                </h3>

                <p className="preview-product-desc">
                  {formData.description ||
                    "Mô tả món ăn sẽ hiển thị tại đây khi khách hàng xem chi tiết hoặc duyệt thực đơn."}
                </p>

                <div className="preview-price-row">
                  <div>
                    <div className="preview-price">
                      {formData.price && Number(formData.price) > 0
                        ? Number(formData.price).toLocaleString("vi-VN") + " ₫"
                        : "--- ₫"}
                    </div>
                  </div>

                  <span
                    className={`preview-stock-badge ${
                      Number(formData.stock) > 0
                        ? "bg-success-subtle text-success border border-success-subtle"
                        : "bg-danger-subtle text-danger border border-danger-subtle"
                    }`}
                  >
                    {Number(formData.stock) > 0
                      ? `Còn ${formData.stock} phần`
                      : "Tạm hết hàng"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}