import { useEffect, useState, useCallback } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaPizzaSlice,
  FaEdit,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import {
  GetProductByID,
  GetImageByProductId,
  GetCategoryList
} from "../../../../../services/ApiService";
import "../../AdminCrud.css";

const ProductDetailModal = ({ show, onHide, productId }) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchDetails = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const [prodRes, imgRes, catRes] = await Promise.allSettled([
        GetProductByID(productId),
        GetImageByProductId(productId),
        GetCategoryList()
      ]);

      if (prodRes.status === "fulfilled" && prodRes.value?.data) {
        setProduct(prodRes.value.data);
      }

      if (imgRes.status === "fulfilled" && imgRes.value) {
        const raw = imgRes.value.data || imgRes.value || [];
        const validImgs = Array.isArray(raw) ? raw : [];
        setImages(validImgs);

        // Find primary image index
        const pIndex = validImgs.findIndex((img) => img.isPrimary);
        setActiveImageIndex(pIndex >= 0 ? pIndex : 0);
      }

      if (catRes.status === "fulfilled" && catRes.value) {
        const rawCats = catRes.value.data || catRes.value || [];
        setCategories(Array.isArray(rawCats) ? rawCats : []);
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (show && productId) {
      fetchDetails();
    } else {
      setProduct(null);
      setImages([]);
      setActiveImageIndex(0);
    }
  }, [show, productId, fetchDetails]);

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Không có";
    const found = categories.find(
      (c) =>
        c.categoryId === categoryId ||
        c.id === categoryId ||
        c._id === categoryId
    );
    return found ? found.categoryName : "Chung";
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleGoToEdit = () => {
    onHide();
    navigate(`/admin/products/update/${productId}`);
  };

  const activeImg =
    images[activeImageIndex]?.imageUrl || "/img/default-product.png";

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <div className="modal-header-pro">
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="modal-title">
            <FaPizzaSlice className="text-warning me-2" />
            <span>Chi Tiết Món Ăn #{productId}</span>
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
            <p className="mt-2 text-muted small">Đang tải thông tin món ăn...</p>
          </div>
        ) : product ? (
          <div className="row g-4">
            {/* Left: Image Gallery */}
            <div className="col-md-6">
              <div className="position-relative bg-light rounded-3 overflow-hidden border">
                <img
                  src={activeImg}
                  alt={product.productName}
                  className="w-100"
                  style={{ height: "300px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "/img/default-product.png";
                  }}
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-light position-absolute top-50 start-0 translate-middle-y ms-2 shadow-sm rounded-circle p-2"
                      onClick={handlePrevImage}
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-light position-absolute top-50 end-0 translate-middle-y me-2 shadow-sm rounded-circle p-2"
                      onClick={handleNextImage}
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}

                {images[activeImageIndex]?.isPrimary && (
                  <span className="image-primary-ribbon">
                    <FaCheckCircle /> Ảnh đại diện
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="d-flex gap-2 mt-2 overflow-auto pb-1">
                  {images.map((img, idx) => (
                    <img
                      key={img.imageId || idx}
                      src={img.imageUrl || "/img/default-product.png"}
                      alt="Thumbnail"
                      className="rounded border"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        cursor: "pointer",
                        borderColor:
                          idx === activeImageIndex
                            ? "#3b82f6 !important"
                            : "#e2e8f0",
                        borderWidth: idx === activeImageIndex ? "2px" : "1px",
                        opacity: idx === activeImageIndex ? 1 : 0.6
                      }}
                      onClick={() => setActiveImageIndex(idx)}
                      onError={(e) => {
                        e.target.src = "/img/default-product.png";
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-primary-subtle text-primary border px-2 py-1">
                  {getCategoryName(
                    product.categoryId || product.category?.categoryId
                  )}
                </span>
                <span
                  className={`badge px-2 py-1 ${
                    product.active
                      ? "bg-success-subtle text-success border border-success-subtle"
                      : "bg-secondary-subtle text-secondary border"
                  }`}
                >
                  {product.active ? "Đang mở bán" : "Tạm ngưng"}
                </span>
              </div>

              <h3 className="fw-bold text-dark mb-2">{product.productName}</h3>

              <div className="d-flex align-items-baseline gap-2 mb-3">
                <span className="fs-3 fw-bold text-danger">
                  {(Number(product.price) || 0).toLocaleString("vi-VN")} ₫
                </span>
              </div>

              <div className="p-3 bg-light rounded-3 mb-3 border">
                <div className="row g-2 small">
                  <div className="col-6">
                    <span className="text-muted d-block">Tồn kho:</span>
                    <strong className="text-dark">
                      {product.stock}{" "}
                      {Number(product.stock) <= 0 ? (
                        <span className="text-danger">(Hết hàng)</span>
                      ) : (
                        "phần"
                      )}
                    </strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Mã sản phẩm:</span>
                    <strong className="text-dark">#{product.productId}</strong>
                  </div>
                  {product.createdAt && (
                    <div className="col-12 mt-2">
                      <span className="text-muted d-block">Ngày tạo:</span>
                      <strong className="text-dark">
                        {new Date(product.createdAt).toLocaleString("vi-VN")}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="small fw-bold text-muted mb-1">Mô tả món ăn:</label>
                <p className="small text-secondary mb-0" style={{ lineHeight: 1.6 }}>
                  {product.description || "Không có mô tả cho món ăn này."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            Không tìm thấy thông tin sản phẩm
          </div>
        )}
      </div>

      <div className="modal-footer-pro">
        <button type="button" className="crud-btn-secondary" onClick={onHide}>
          Đóng
        </button>
        <button
          type="button"
          className="crud-btn-primary"
          onClick={handleGoToEdit}
        >
          <FaEdit />
          <span>Chỉnh sửa món này</span>
        </button>
      </div>
    </Modal>
  );
};

export default ProductDetailModal;