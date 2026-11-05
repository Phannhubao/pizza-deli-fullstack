import "../../css/style.css";
import "../../css/dataTables.bootstrap5.min.css";
import "../../AdminManager.css";
import "./CategoryManager.css";
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaTags,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSyncAlt,
  FaFolderOpen
} from "react-icons/fa";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import { GetCategoryList, DeleteCategory } from "../../../../../services/ApiService";
import UpdateCategoryModal from "./UpdateCategoryModal";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refresh, setRefresh] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await GetCategoryList();
        const data = Array.isArray(response)
          ? response
          : (Array.isArray(response?.data) ? response.data : []);
        setCategories(data);
        setFilteredCategories(data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể tải danh sách danh mục",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [refresh]);

  // Search filter
  useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const filtered = categories.filter((cat) => {
        const nameMatch = cat.categoryName?.toLowerCase().includes(term);
        const descMatch = cat.description?.toLowerCase().includes(term);
        const idMatch = String(cat.categoryId || "").includes(term);
        return nameMatch || descMatch || idMatch;
      });
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
    setCurrentPage(0);
  }, [searchTerm, categories]);

  // KPI stats
  const stats = useMemo(() => {
    const total = categories.length;
    return { total };
  }, [categories]);

  // Handle delete category
  const handleDelete = async (categoryId) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa danh mục?",
      text: "Các món ăn thuộc danh mục này có thể bị ảnh hưởng.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xóa danh mục",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await DeleteCategory(categoryId);
        setCategories((prev) => prev.filter((cat) => cat.categoryId !== categoryId));
        Swal.fire({
          icon: "success",
          title: "Đã xóa",
          text: "Đã xóa danh mục thành công",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể xóa danh mục vì đang chứa các sản phẩm liên quan.",
        });
      }
    }
  };

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const offset = currentPage * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredCategories.length / itemsPerPage);

  const handleOpenUpdateModal = (category) => {
    setSelectedCategory(category);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = (updatedCategory) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.categoryId === updatedCategory.categoryId ? updatedCategory : cat
      )
    );
    setShowUpdateModal(false);
  };

  return (
    <main className="category-manager-pro-container">
      <div className="container-fluid px-4 py-4">
        {/* Top Header */}
        <div className="admin-page-hero d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h2 className="admin-hero-title mb-1">
              <FaTags className="me-2 text-warning" /> Quản Lý Danh Mục Món Ăn
            </h2>
            <p className="admin-hero-subtitle text-muted mb-0">
              Phân loại thực đơn (Pizza, Mì Ý, Salad, Đồ uống, Khai vị, Tráng miệng)
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button
              className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
              onClick={() => setRefresh((prev) => !prev)}
              disabled={isLoading}
            >
              <FaSyncAlt className={isLoading ? "fa-spin" : ""} /> Làm mới
            </button>
            <Link
              to="create"
              className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
              style={{ background: "#c9a66b", borderColor: "#c9a66b" }}
            >
              <FaPlus /> Thêm Danh Mục
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="admin-card mb-4 shadow-sm p-3 bg-white">
          <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
            <div className="search-box-wrapper flex-grow-1" style={{ maxWidth: "450px" }}>
              <FaSearch className="search-icon text-muted" />
              <input
                type="text"
                className="form-control ps-5 py-2 search-input-pro"
                placeholder="Tìm kiếm danh mục theo tên hoặc mô tả..."
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

            <div className="text-muted small">
              Tổng số: <strong className="text-dark fs-6">{stats.total}</strong> danh mục
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="admin-card shadow-sm overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 pro-category-table">
              <thead className="table-head-pro">
                <tr>
                  <th style={{ width: "90px" }}>Mã DM</th>
                  <th style={{ width: "220px" }}>Tên Danh Mục</th>
                  <th>Mô Tả Danh Mục</th>
                  <th style={{ width: "180px" }}>Ngày Tạo</th>
                  <th style={{ width: "140px" }} className="text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((cat) => (
                    <tr key={cat.categoryId} className="category-row-pro">
                      <td>
                        <span className="order-id-badge">#{cat.categoryId}</span>
                      </td>

                      <td>
                        <div className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                          <span className="badge bg-warning-subtle text-dark border border-warning">
                            {cat.categoryName}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="text-muted">{cat.description || "Chưa có mô tả"}</span>
                      </td>

                      <td>
                        <span className="small text-muted">
                          {cat.createdAt
                            ? new Date(cat.createdAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "N/A"}
                        </span>
                      </td>

                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary btn-action-pro"
                            title="Sửa danh mục"
                            onClick={() => handleOpenUpdateModal(cat)}
                          >
                            <FaEdit /> Sửa
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger btn-action-pro"
                            title="Xóa danh mục"
                            onClick={() => handleDelete(cat.categoryId)}
                          >
                            <FaTrash /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <div className="empty-orders-state py-4">
                        <FaFolderOpen style={{ fontSize: "42px", color: "#cbd5e1" }} />
                        <h5 className="mt-2 text-secondary">Không tìm thấy danh mục nào</h5>
                        <p className="small text-muted">Hãy thử thay đổi từ khóa tìm kiếm.</p>
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
                Hiển thị <strong>{offset + 1}</strong> - <strong>{Math.min(offset + itemsPerPage, filteredCategories.length)}</strong> trên tổng số <strong>{filteredCategories.length}</strong> danh mục
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

        {/* Modal chỉnh sửa danh mục */}
        {selectedCategory && (
          <UpdateCategoryModal
            show={showUpdateModal}
            onHide={() => setShowUpdateModal(false)}
            category={selectedCategory}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </div>
    </main>
  );
}