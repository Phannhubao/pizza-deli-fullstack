import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaPizzaSlice,
  FaCloudUploadAlt,
  FaTimes,
  FaEye,
  FaTags
} from "react-icons/fa";
import Swal from "sweetalert2";
import { PostProduct, PostImage, GetCategoryList } from "../../../../../services/ApiService";
import "../../AdminCrud.css";

export default function CreateProduct() {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    productName: "",
    price: "",
    stock: "50",
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
    active: true,
    categoryId: ""
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await GetCategoryList();
        const list = Array.isArray(data) ? data : data?.data || [];
        setCategories(list);
        if (list.length > 0 && !product.categoryId) {
          setProduct((prev) => ({
            ...prev,
            categoryId: String(list[0].categoryId || list[0].id)
          }));
        }
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };
    fetchCats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update image preview URLs
  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const validateForm = () => {
    const errs = {};
    if (!product.productName || product.productName.trim().length < 2) {
      errs.productName = "Tên món ăn phải có ít nhất 2 ký tự";
    }
    if (!product.price || Number(product.price) <= 0) {
      errs.price = "Giá bán phải lớn hơn 0 ₫";
    }
    if (product.stock === "" || Number(product.stock) < 0) {
      errs.stock = "Số lượng tồn kho không được âm";
    }
    if (!product.description || product.description.trim().length < 5) {
      errs.description = "Mô tả món ăn nên có ít nhất 5 ký tự";
    }
    if (!product.categoryId) {
      errs.categoryId = "Vui lòng chọn danh mục món ăn";
    }
    return errs;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFiles = (files) => {
    const validFiles = [];
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validTypes.includes(file.type)) {
        Swal.fire("Lỗi định dạng", `File ${file.name} không phải là JPEG/PNG/WEBP.`, "warning");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire("File quá lớn", `File ${file.name} vượt quá 10MB.`, "warning");
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({
        icon: "warning",
        title: "Thông tin chưa hoàn tất",
        text: "Vui lòng kiểm tra lại các trường được đánh dấu đỏ."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        productName: product.productName.trim(),
        price: Number(product.price),
        stock: Number(product.stock),
        description: product.description.trim(),
        ingredients: product.ingredients?.trim() || "",
        spicyLevel: Number(product.spicyLevel) || 0,
        cheeseLevel: Number(product.cheeseLevel) || 3,
        calories: product.calories ? Number(product.calories) : null,
        servingSize: product.servingSize?.trim() || "",
        isVegetarian: Boolean(product.isVegetarian),
        allergens: product.allergens?.trim() || "",
        occasions: product.occasions?.trim() || "",
        pairsWith: product.pairsWith?.trim() || "",
        active: product.active,
        category: { categoryId: Number(product.categoryId) }
      };

      // 1. Tạo sản phẩm
      const response = await PostProduct(payload);
      const newProductId = response?.data?.productId || response?.data?.id;

      if (!newProductId) {
        throw new Error("Không nhận được mã sản phẩm mới từ máy chủ");
      }

      // 2. Upload các ảnh đã chọn
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const formData = new FormData();
          formData.append("file", selectedFiles[i]);
          formData.append("productId", newProductId);
          formData.append(
            "caption",
            `${product.productName.trim()} - Ảnh ${i + 1}`
          );
          formData.append("isPrimary", i === 0 ? "true" : "false");
          await PostImage(formData);
        }
      }

      await Swal.fire({
        icon: "success",
        title: "Tạo món mới thành công!",
        text: `Món "${product.productName}" đã được thêm vào thực đơn.`,
        timer: 1800,
        showConfirmButton: false
      });

      navigate("/admin/products");
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      Swal.fire({
        icon: "error",
        title: "Tạo món thất bại",
        text: error.response?.data?.message || error.message || "Lỗi máy chủ khi tạo món."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper category name
  const currentCategoryName =
    categories.find(
      (c) => String(c.categoryId || c.id) === String(product.categoryId)
    )?.categoryName || "Danh mục";

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
              <span className="badge bg-primary-subtle text-primary border px-2 py-1">
                Tạo mới
              </span>
            </div>
            <h1 className="crud-page-title">
              <FaPizzaSlice className="text-warning" />
              <span>Thêm Món Ăn Mới Vào Thực Đơn</span>
            </h1>
            <p className="crud-page-subtitle">
              Điền thông tin và tải ảnh món ăn lên hệ thống bán hàng
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
                  <FaPlus />
                  <span>Tạo món ăn</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="row g-4">
          {/* Left Column: Form info */}
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
                    id="productActiveSwitch"
                    name="active"
                    checked={product.active}
                    onChange={handleInputChange}
                  />
                  <label
                    className="form-check-label ms-2 small fw-semibold"
                    htmlFor="productActiveSwitch"
                  >
                    {product.active ? "Đang mở bán" : "Tạm ngưng"}
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
                    placeholder="Ví dụ: Pizza Hải Sản Sốt Pesto, Pizza Bò Băm..."
                    value={product.productName}
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
                        value={product.categoryId}
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
                      <div className="position-relative">
                        <input
                          type="number"
                          name="price"
                          step="1000"
                          min="0"
                          className={`crud-input ${errors.price ? "is-invalid" : ""}`}
                          placeholder="Ví dụ: 189000"
                          value={product.price}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.price && (
                        <div className="crud-feedback-error">
                          <span>{errors.price}</span>
                        </div>
                      )}
                      {Number(product.price) > 0 && (
                        <div className="crud-helper-text text-success fw-semibold">
                          Giá hiển thị: {Number(product.price).toLocaleString("vi-VN")} ₫
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
                    placeholder="50"
                    value={product.stock}
                    onChange={handleInputChange}
                  />
                  {errors.stock && (
                    <div className="crud-feedback-error">
                      <span>{errors.stock}</span>
                    </div>
                  )}
                  <div className="crud-helper-text">
                    Số phần có thể phục vụ trong ngày. Khi hết (0), hệ thống sẽ báo hết hàng.
                  </div>
                </div>

                {/* Mô tả chi tiết */}
                <div className="crud-form-group mb-0">
                  <label className="crud-label">
                    Mô tả chi tiết món ăn <span className="required">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    className={`crud-textarea ${errors.description ? "is-invalid" : ""}`}
                    placeholder="Mô tả nguyên liệu, hương vị, phong cách nướng..."
                    value={product.description}
                    onChange={handleInputChange}
                  ></textarea>
                  {errors.description && (
                    <div className="crud-feedback-error">
                      <span>{errors.description}</span>
                    </div>
                  )}
                  <div className="crud-char-counter">
                    {product.description?.length || 0} ký tự
                  </div>
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
                    value={product.ingredients}
                    onChange={handleInputChange}
                  />
                  <div className="crud-helper-text">Giúp AI nhận diện thành phần món, sở thích và tránh dị ứng.</div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="crud-form-group">
                      <label className="crud-label">Độ cay (0: Không cay, 3: Cay nồng)</label>
                      <select name="spicyLevel" className="crud-select" value={product.spicyLevel} onChange={handleInputChange}>
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
                      <select name="cheeseLevel" className="crud-select" value={product.cheeseLevel} onChange={handleInputChange}>
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
                        value={product.calories}
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
                        value={product.servingSize}
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
                        value={product.allergens}
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
                        value={product.occasions}
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
                    value={product.pairsWith}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isVegetarianSwitch"
                    name="isVegetarian"
                    checked={product.isVegetarian}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label text-success fw-bold" htmlFor="isVegetarianSwitch">
                    🌱 Món chay (Vegetarian)
                  </label>
                </div>
              </div>
            </div>

            {/* Upload Ảnh */}
            <div className="crud-card">
              <div className="crud-card-header">
                <div className="crud-card-title">
                  <FaCloudUploadAlt className="text-primary" />
                  <span>Hình Ảnh Món Ăn</span>
                </div>
                <span className="small text-muted">
                  Đã chọn: <strong>{selectedFiles.length}</strong> ảnh
                </span>
              </div>

              <div className="crud-card-body">
                <div
                  className={`image-manager-dropzone ${isDragOver ? "dragover" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("createProdFileInput").click()}
                >
                  <input
                    id="createProdFileInput"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={handleFileInputChange}
                  />
                  <div className="dropzone-icon-box">
                    <FaCloudUploadAlt />
                  </div>
                  <div className="fw-bold text-dark mb-1">
                    Kéo thả ảnh vào đây hoặc nhấp chuột để chọn
                  </div>
                  <div className="small text-muted">
                    Hỗ trợ JPG, PNG, WEBP (tối đa 10MB). Ảnh đầu tiên sẽ là ảnh chính.
                  </div>
                </div>

                {/* Thumbnails of selected files */}
                {previewUrls.length > 0 && (
                  <div className="mt-3">
                    <div className="small fw-bold text-dark mb-2">
                      Xem trước ảnh đã chọn:
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="upload-preview-item">
                          <img
                            src={url}
                            alt="Preview"
                            className="upload-preview-thumb"
                          />
                          <button
                            type="button"
                            className="upload-preview-remove"
                            onClick={() => handleRemoveFile(idx)}
                            title="Xóa ảnh này"
                          >
                            <FaTimes />
                          </button>
                          {idx === 0 && (
                            <span className="image-primary-ribbon">Chính</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                {previewUrls.length > 0 ? (
                  <img src={previewUrls[0]} alt="Preview món ăn" />
                ) : (
                  <div className="text-center p-4">
                    <FaPizzaSlice style={{ fontSize: "3rem", color: "#cbd5e1" }} />
                    <div className="small text-muted mt-2">Chưa có ảnh món ăn</div>
                  </div>
                )}
              </div>

              <div className="preview-card-body">
                <span className="preview-category-tag">
                  {currentCategoryName}
                </span>

                <h3 className="preview-product-name">
                  {product.productName || "Tên Món Ăn Mẫu"}
                </h3>

                <p className="preview-product-desc">
                  {product.description ||
                    "Mô tả món ăn sẽ hiển thị tại đây khi khách hàng xem chi tiết hoặc duyệt thực đơn."}
                </p>

                <div className="preview-price-row">
                  <div>
                    <div className="preview-price">
                      {product.price && Number(product.price) > 0
                        ? Number(product.price).toLocaleString("vi-VN") + " ₫"
                        : "--- ₫"}
                    </div>
                  </div>

                  <span
                    className={`preview-stock-badge ${
                      Number(product.stock) > 0
                        ? "bg-success-subtle text-success border border-success-subtle"
                        : "bg-danger-subtle text-danger border border-danger-subtle"
                    }`}
                  >
                    {Number(product.stock) > 0
                      ? `Còn ${product.stock} phần`
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