import { useState, useEffect, useCallback } from "react";
import { Modal } from "react-bootstrap";
import {
  FaCloudUploadAlt,
  FaTrashAlt,
  FaStar,
  FaRegStar,
  FaImage,
  FaCheckCircle,
  FaTimes
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  GetImageByProductId,
  PostImage,
  DeleteImage,
  PutImage,
  GetProductByID
} from "../../../../../services/ApiService";
import "../../AdminCrud.css";

const ImageUploadModal = ({
  show,
  onHide,
  productId,
  productName: initialProductName,
  onUploadSuccess
}) => {
  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState(initialProductName || "");
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageCaption, setImageCaption] = useState("");
  const [isPrimaryForNew, setIsPrimaryForNew] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch images and product title
  const fetchCurrentImages = useCallback(async () => {
    if (!productId) return;
    setLoadingImages(true);
    try {
      const [imgRes, prodRes] = await Promise.allSettled([
        GetImageByProductId(productId),
        !initialProductName ? GetProductByID(productId) : Promise.resolve(null)
      ]);

      if (imgRes.status === "fulfilled" && imgRes.value) {
        const raw = imgRes.value.data || imgRes.value || [];
        setImages(Array.isArray(raw) ? raw : []);
      }

      if (prodRes.status === "fulfilled" && prodRes.value?.data?.productName) {
        setProductName(prodRes.value.data.productName);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách ảnh:", err);
    } finally {
      setLoadingImages(false);
    }
  }, [productId, initialProductName]);

  useEffect(() => {
    if (show && productId) {
      setSelectedFiles([]);
      setImageCaption("");
      setIsPrimaryForNew(false);
      fetchCurrentImages();
    } else {
      setImages([]);
    }
  }, [show, productId, fetchCurrentImages]);

  // Handle files selection
  const handleFilesSelect = (files) => {
    const validFiles = [];
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validTypes.includes(file.type)) {
        Swal.fire("Định dạng không hợp lệ", `File ${file.name} không phải là ảnh hợp lệ (JPEG, PNG, WEBP).`, "warning");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire("Kích thước quá lớn", `File ${file.name} vượt quá 10MB.`, "warning");
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      if (images.length === 0 && selectedFiles.length === 0) {
        setIsPrimaryForNew(true);
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files) {
      handleFilesSelect(e.target.files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleRemoveDraftFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload files to Cloudinary via backend
  const handleUploadImages = async () => {
    if (!productId || selectedFiles.length === 0) {
      Swal.fire("Chưa chọn ảnh", "Vui lòng chọn ít nhất một file ảnh để tải lên", "info");
      return;
    }

    setIsUploading(true);
    let successCount = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`Đang tải ảnh ${i + 1}/${selectedFiles.length}...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("productId", productId);
        formData.append(
          "caption",
          imageCaption || `${productName || "Sản phẩm"} - Ảnh ${i + 1}`
        );
        formData.append("isPrimary", i === 0 && isPrimaryForNew ? "true" : "false");

        await PostImage(formData);
        successCount++;
      }

      Swal.fire({
        icon: "success",
        title: "Tải lên thành công!",
        text: `Đã thêm thành công ${successCount} ảnh cho món ăn.`,
        timer: 1600,
        showConfirmButton: false
      });

      setSelectedFiles([]);
      setImageCaption("");
      setIsPrimaryForNew(false);
      await fetchCurrentImages();
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Lỗi khi tải ảnh:", error);
      Swal.fire({
        icon: "error",
        title: "Tải lên thất bại",
        text: error.response?.data?.message || "Có lỗi xảy ra khi kết nối server upload."
      });
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  // Delete an existing image
  const handleDeleteExistingImage = async (imageId) => {
    const confirm = await Swal.fire({
      title: "Xóa hình ảnh này?",
      text: "Ảnh sẽ bị xóa hoàn toàn khỏi sản phẩm.",
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
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error("Lỗi khi xóa ảnh:", err);
      Swal.fire("Lỗi", "Không thể xóa ảnh. Vui lòng thử lại sau.", "error");
    }
  };

  // Set image as primary
  const handleSetPrimary = async (imageId) => {
    try {
      const formData = new FormData();
      formData.append("isPrimary", "true");
      await PutImage(imageId, formData);

      // Update state locally
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
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error("Lỗi khi đổi ảnh chính:", err);
      // Even if put failed with multipart, try re-fetching
      fetchCurrentImages();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <div className="modal-header-pro">
        <div className="d-flex align-items-center justify-content-between w-100">
          <div>
            <div className="modal-title">
              <FaImage className="text-primary me-2" />
              <span>Quản Lý Hình Ảnh Món Ăn</span>
            </div>
            <div className="small text-muted mt-1">
              Món: <strong>{productName || "Đang tải..."}</strong> — Mã SP:{" "}
              <span className="badge bg-light text-dark border">#{productId}</span>
            </div>
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
        {/* Section 1: Existing images */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <span>Ảnh hiện tại của món ăn</span>
              <span className="badge bg-secondary-subtle text-dark border rounded-pill px-2">
                {images.length}
              </span>
            </h6>
            <small className="text-muted">
              Click ngôi sao để chọn làm ảnh chính, click thùng rác để xóa
            </small>
          </div>

          {loadingImages ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary me-2"></div>
              <span className="text-muted small">Đang tải danh sách ảnh...</span>
            </div>
          ) : images.length > 0 ? (
            <div className="images-gallery-grid">
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
                    alt={img.caption || "Ảnh sản phẩm"}
                    className="image-gallery-thumb"
                    onError={(e) => {
                      e.target.src = "/img/default-product.png";
                    }}
                  />
                  {img.caption && (
                    <div className="image-card-caption" title={img.caption}>
                      {img.caption}
                    </div>
                  )}
                  <div className="image-card-actions">
                    <button
                      type="button"
                      className={`btn-image-primary ${img.isPrimary ? "active" : ""}`}
                      onClick={() => handleSetPrimary(img.imageId)}
                      title={
                        img.isPrimary ? "Đang là ảnh chính" : "Đặt làm ảnh chính"
                      }
                    >
                      {img.isPrimary ? <FaStar /> : <FaRegStar />}
                    </button>
                    <button
                      type="button"
                      className="btn-image-delete"
                      onClick={() => handleDeleteExistingImage(img.imageId)}
                      title="Xóa ảnh này khỏi món ăn"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-light rounded-3 border border-dashed">
              <FaImage className="text-muted" style={{ fontSize: "2rem" }} />
              <p className="mt-2 text-muted small mb-0">
                Sản phẩm này chưa có hình ảnh nào. Hãy thêm ảnh bên dưới!
              </p>
            </div>
          )}
        </div>

        <hr className="my-4 text-muted opacity-25" />

        {/* Section 2: Upload new images */}
        <div>
          <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
            <FaCloudUploadAlt className="text-primary" />
            <span>Thêm ảnh mới từ máy tính</span>
          </h6>

          {/* Drag & Drop Area */}
          <div
            className={`image-manager-dropzone ${isDragOver ? "dragover" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("proImageModalInput").click()}
          >
            <input
              id="proImageModalInput"
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
              Kéo thả hình ảnh vào đây hoặc nhấp để duyệt file
            </div>
            <div className="small text-muted">
              Hỗ trợ JPG, PNG, WEBP (tối đa 10MB mỗi file). Có thể chọn nhiều ảnh cùng lúc.
            </div>
          </div>

          {/* Selected draft previews */}
          {selectedFiles.length > 0 && (
            <div className="mt-3">
              <div className="small fw-bold text-dark mb-2">
                Ảnh đã chọn chuẩn bị tải lên ({selectedFiles.length}):
              </div>
              <div className="d-flex flex-wrap gap-2 mb-3">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="upload-preview-item">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="upload-preview-thumb"
                    />
                    <button
                      type="button"
                      className="upload-preview-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDraftFile(idx);
                      }}
                      title="Bỏ chọn ảnh này"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>

              <div className="row g-2 align-items-center">
                <div className="col-md-7">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Mô tả ảnh (không bắt buộc)..."
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <div className="form-check form-check-inline mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isPrimaryModalCheck"
                      checked={isPrimaryForNew}
                      onChange={(e) => setIsPrimaryForNew(e.target.checked)}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor="isPrimaryModalCheck"
                    >
                      Đặt làm ảnh đại diện chính
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="modal-footer-pro">
        <button
          type="button"
          className="crud-btn-secondary"
          onClick={onHide}
          disabled={isUploading}
        >
          Đóng
        </button>

        <button
          type="button"
          className="crud-btn-primary"
          onClick={handleUploadImages}
          disabled={isUploading || selectedFiles.length === 0}
        >
          {isUploading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              ></span>
              <span>{uploadProgress || "Đang tải lên Cloudinary..."}</span>
            </>
          ) : (
            <>
              <FaCloudUploadAlt />
              <span>Tải lên {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}</span>
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ImageUploadModal;