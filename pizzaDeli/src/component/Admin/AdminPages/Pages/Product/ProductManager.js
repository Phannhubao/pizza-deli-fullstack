import "../../css/style.css";
import "../../css/dataTables.bootstrap5.min.css";
import "./ProductManager.css";
import {
  GetProductList,
  PutProductActive,
  GetCategoryList,
  DeleteProduct,
  GetImageList
} from "../../../../../services/ApiService";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaPizzaSlice,
  FaCheckCircle,
  FaBan,
  FaExclamationTriangle,
  FaSearch,
  FaPlus,
  FaEdit,
  FaEye,
  FaImages,
  FaTrash,
  FaSyncAlt,
  FaBoxes
} from "react-icons/fa";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import ImageUploadModal from "./ImageUploadModal";
import ProductDetailModal from "./ProductDetailModal";

export default function ProductManager() {
  // State quản lý dữ liệu
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imagesMap, setImagesMap] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [refresh, setRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  // State quản lý modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProductDetailId, setSelectedProductDetailId] = useState(null);

  // Fetch dữ liệu sản phẩm, danh mục và ảnh
  const fetchProductsAndMedia = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, imgRes] = await Promise.all([
        GetProductList(),
        GetCategoryList(),
        GetImageList().catch(() => ({ data: [] }))
      ]);

      const productsData = Array.isArray(prodRes.data)
        ? prodRes.data
        : (Array.isArray(prodRes.data?.data) ? prodRes.data.data : []);

      const categoriesData = Array.isArray(catRes)
        ? catRes
        : (Array.isArray(catRes?.data) ? catRes.data : []);

      const imagesData = Array.isArray(imgRes.data)
        ? imgRes.data
        : (Array.isArray(imgRes) ? imgRes : []);

      // Tạo map ảnh chính theo productId
      const imgMap = {};
      imagesData.forEach((img) => {
        const pid = img.productId || img.product?.productId;
        if (pid && (!imgMap[pid] || img.isPrimary)) {
          imgMap[pid] = img.imageUrl;
        }
      });

      setImagesMap(imgMap);
      setCategories(categoriesData);
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách sản phẩm",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductsAndMedia();
  }, [fetchProductsAndMedia, refresh]);

  // Thống kê KPI
  const stats = useMemo(() => {
    const total = products.length;
    const activeCount = products.filter((p) => p.active).length;
    const inactiveCount = total - activeCount;
    const outOfStock = products.filter((p) => (Number(p.stock) || 0) <= 0).length;
    const totalCats = categories.length;

    return { total, activeCount, inactiveCount, outOfStock, totalCats };
  }, [products, categories]);

  // Lọc sản phẩm theo từ khóa, danh mục và trạng thái
  useEffect(() => {
    let filtered = products;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((p) => {
        const nameMatch = p.productName?.toLowerCase().includes(term);
        const idMatch = String(p.productId || "").includes(term);
        const descMatch = p.description?.toLowerCase().includes(term);
        return nameMatch || idMatch || descMatch;
      });
    }

    if (categoryFilter !== "ALL") {
      filtered = filtered.filter(
        (p) => String(p.categoryId || p.category?.categoryId) === String(categoryFilter)
      );
    }

    if (statusFilter !== "ALL") {
      if (statusFilter === "ACTIVE") {
        filtered = filtered.filter((p) => p.active);
      } else if (statusFilter === "INACTIVE") {
        filtered = filtered.filter((p) => !p.active);
      } else if (statusFilter === "OUT_OF_STOCK") {
        filtered = filtered.filter((p) => (Number(p.stock) || 0) <= 0);
      }
    }

    setFilteredProducts(filtered);
    setCurrentPage(0);
  }, [searchTerm, categoryFilter, statusFilter, products]);

  // Helper danh mục
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Không có";
    const category = categories.find(
      (cat) =>
        cat.id === categoryId ||
        cat._id === categoryId ||
        cat.categoryId === categoryId
    );
    return category ? category.categoryName : "Chung";
  };

  const formatCurrency = (amount) =>
    (Number(amount) || 0).toLocaleString("vi-VN") + " ₫";

  // Xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Món ăn này sẽ bị xóa hoàn toàn khỏi thực đơn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const response = await DeleteProduct(id);
        if (response.status === 200 || response.data) {
          setRefresh((prev) => !prev);
          Swal.fire({
            icon: "success",
            title: "Đã xóa",
            text: "Xóa món ăn thành công",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: error.response?.data?.message || "Xóa sản phẩm thất bại",
        });
      }
    }
  };

  // Cập nhật trạng thái hiển thị
  const handleChangeStatus = async (id) => {
    const currentProduct = products.find((p) => p.productId === id);
    if (!currentProduct) return;

    try {
      const newActiveStatus = !currentProduct.active;
      const response = await PutProductActive(id, newActiveStatus);

      if (response.status === 200 || response.data) {
        setRefresh((prev) => !prev);
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: `Đã ${newActiveStatus ? "mở bán" : "tạm ngưng"} món ăn`,
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: error.response?.data?.message || "Cập nhật thất bại",
      });
    }
  };

  // Modal handlers
  const handleOpenImageModal = (productId) => {
    setSelectedProductId(productId);
    setShowImageModal(true);
  };

  const handleOpenDetailModal = (productId) => {
    setSelectedProductDetailId(productId);
    setShowDetailModal(true);
  };

  // Phân trang
  const handlePageClick = ({ selected }) => setCurrentPage(selected);
  const offset = currentPage * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <main className="product-manager-pro-container">
      <div className="container-fluid px-4 py-4">
        {/* Top Header */}
        <div className="admin-page-hero d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h2 className="admin-hero-title mb-1">
              <FaPizzaSlice className="me-2 text-warning" /> Quản Lý Thực Đơn & Món Ăn
            </h2>
            <p className="admin-hero-subtitle text-muted mb-0">
              Quản lý danh sách pizza, đồ uống, món khai vị, giá bán và hình ảnh hiển thị
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button
              className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
              onClick={() => setRefresh((prev) => !prev)}
              disabled={loading}
            >
              <FaSyncAlt className={loading ? "fa-spin" : ""} /> Làm mới
            </button>
            <Link
              to="create"
              className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
              style={{ background: "#c9a66b", borderColor: "#c9a66b" }}
            >
              <FaPlus /> Thêm Món Mới
            </Link>
          </div>
        </div>

        {/* KPI Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-xl-3 col-sm-6">
            <div className="kpi-card shadow-sm">
              <div className="kpi-icon bg-light text-dark">
                <FaBoxes />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Tổng Số Món Ăn</span>
                <h4 className="kpi-value text-dark">{stats.total}</h4>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-sm-6">
            <div className="kpi-card shadow-sm">
              <div className="kpi-icon bg-success-subtle text-success">
                <FaCheckCircle />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Đang Kinh Doanh</span>
                <h4 className="kpi-value text-success">{stats.activeCount}</h4>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-sm-6">
            <div className="kpi-card shadow-sm">
              <div className="kpi-icon bg-warning-subtle text-warning">
                <FaBan />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Tạm Ngưng Bán</span>
                <h4 className="kpi-value text-warning">{stats.inactiveCount}</h4>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-sm-6">
            <div className="kpi-card shadow-sm">
              <div className="kpi-icon bg-danger-subtle text-danger">
                <FaExclamationTriangle />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Hết Hàng Trong Kho</span>
                <h4 className="kpi-value text-danger">{stats.outOfStock}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="admin-card mb-4 shadow-sm">
          {/* Category Tabs */}
          <div className="status-tabs-container">
            <button
              className={`status-tab-btn ${categoryFilter === "ALL" ? "active" : ""}`}
              onClick={() => setCategoryFilter("ALL")}
            >
              Tất cả danh mục <span className="tab-counter">{products.length}</span>
            </button>
            {categories.map((cat) => {
              const catId = cat.categoryId || cat.id;
              const count = products.filter(
                (p) => String(p.categoryId || p.category?.categoryId) === String(catId)
              ).length;
              return (
                <button
                  key={catId}
                  className={`status-tab-btn ${String(categoryFilter) === String(catId) ? "active" : ""}`}
                  onClick={() => setCategoryFilter(catId)}
                >
                  {cat.categoryName} <span className="tab-counter">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Status Filters */}
          <div className="p-3 border-top d-flex flex-wrap gap-3 align-items-center justify-content-between bg-light rounded-bottom">
            <div className="search-box-wrapper flex-grow-1" style={{ maxWidth: "450px" }}>
              <FaSearch className="search-icon text-muted" />
              <input
                type="text"
                className="form-control ps-5 py-2 search-input-pro"
                placeholder="Tìm món theo tên, mã món hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-sm btn-link text-muted clear-search-btn"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted fw-semibold">Trạng thái:</span>
              <select
                className="form-select form-select-sm py-2 filter-select-pro"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: "170px" }}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang kinh doanh</option>
                <option value="INACTIVE">Tạm ngưng</option>
                <option value="OUT_OF_STOCK">Hết hàng (Stock 0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="admin-card shadow-sm overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 pro-product-table">
              <thead className="table-head-pro">
                <tr>
                  <th style={{ width: "70px" }}>Mã SP</th>
                  <th style={{ width: "70px" }}>Ảnh</th>
                  <th>Tên Món Ăn</th>
                  <th>Danh Mục</th>
                  <th style={{ width: "130px" }}>Giá Bán</th>
                  <th style={{ width: "110px" }}>Tồn Kho</th>
                  <th style={{ width: "120px" }}>Kinh Doanh</th>
                  <th style={{ width: "170px" }} className="text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => {
                    const imgUrl =
                      imagesMap[product.productId] ||
                      product.images?.[0]?.imageUrl ||
                      "/img/default-product.png";

                    return (
                      <tr
                        key={product.productId}
                        className={`product-row-pro ${!product.active ? "table-light opacity-75" : ""}`}
                      >
                        <td>
                          <span className="order-id-badge">#{product.productId}</span>
                        </td>

                        <td>
                          <img
                            src={imgUrl}
                            alt={product.productName}
                            className="product-thumb-pro"
                            onError={(e) => { e.target.src = "/img/default-product.png"; }}
                          />
                        </td>

                        <td>
                          <div className="fw-bold text-dark">{product.productName || "Không tên"}</div>
                          {product.description && (
                            <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: "260px" }}>
                              {product.description}
                            </small>
                          )}
                        </td>

                        <td>
                          <span className="badge bg-light text-dark border px-2 py-1">
                            {getCategoryName(product.categoryId || product.category?.categoryId)}
                          </span>
                        </td>

                        <td>
                          <span className="fw-bold text-danger">
                            {formatCurrency(product.price)}
                          </span>
                        </td>

                        <td>
                          <span className={`badge px-2 py-1 ${Number(product.stock) > 0 ? "bg-secondary-subtle text-dark border" : "bg-danger text-white"}`}>
                            {product.stock} {Number(product.stock) <= 0 ? "(Hết)" : ""}
                          </span>
                        </td>

                        <td>
                          <div className="form-check form-switch mb-0">
                            <input
                              className="form-check-input pro-switch"
                              type="checkbox"
                              role="switch"
                              checked={product.active}
                              onChange={() => handleChangeStatus(product.productId)}
                              title={product.active ? "Đang mở bán (Click để ngưng)" : "Đang ngưng (Click để bán lại)"}
                            />
                          </div>
                        </td>

                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <Link
                              to={`update/${product.productId}`}
                              className="btn btn-sm btn-outline-primary btn-action-pro"
                              title="Chỉnh sửa sản phẩm"
                            >
                              <FaEdit />
                            </Link>

                            <button
                              onClick={() => handleOpenDetailModal(product.productId)}
                              className="btn btn-sm btn-outline-info btn-action-pro"
                              title="Xem chi tiết"
                            >
                              <FaEye />
                            </button>

                            <button
                              onClick={() => handleOpenImageModal(product.productId)}
                              className="btn btn-sm btn-outline-success btn-action-pro"
                              title="Quản lý ảnh món ăn"
                            >
                              <FaImages />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(product.productId)}
                              className="btn btn-sm btn-outline-danger btn-action-pro"
                              title="Xóa món ăn"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      <div className="empty-orders-state py-4">
                        <FaPizzaSlice style={{ fontSize: "42px", color: "#cbd5e1" }} />
                        <h5 className="mt-2 text-secondary">Không tìm thấy món ăn nào</h5>
                        <p className="small text-muted">Hãy thử thay đổi danh mục hoặc từ khóa tìm kiếm.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pageCount > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
              <span className="small text-muted">
                Hiển thị <strong>{offset + 1}</strong> - <strong>{Math.min(offset + itemsPerPage, filteredProducts.length)}</strong> trên tổng số <strong>{filteredProducts.length}</strong> món
              </span>
              <ReactPaginate
                previousLabel="‹ Trước"
                nextLabel="Sau ›"
                breakLabel="..."
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName="pagination pagination-sm mb-0 gap-1"
                activeClassName="active"
                pageClassName="page-item"
                pageLinkClassName="page-link rounded"
                previousClassName="page-item"
                previousLinkClassName="page-link rounded"
                nextClassName="page-item"
                nextLinkClassName="page-link rounded"
                breakClassName="page-item"
                breakLinkClassName="page-link rounded"
              />
            </div>
          )}
        </div>

        {/* Modal upload & quản lý ảnh */}
        <ImageUploadModal
          show={showImageModal}
          onHide={() => setShowImageModal(false)}
          productId={selectedProductId}
          productName={products.find((p) => p.productId === selectedProductId)?.productName}
          onUploadSuccess={() => setRefresh((prev) => !prev)}
        />

        {/* Modal chi tiết sản phẩm */}
        <ProductDetailModal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          productId={selectedProductDetailId}
        />
      </div>
    </main>
  );
}