import "../../css/style.css";
import "../../css/dataTables.bootstrap5.min.css";
import "../../AdminManager.css";
import { useEffect, useState, useMemo, useCallback } from "react";
import ReactPaginate from "react-paginate";
import { GetFeebackList, DeleteReview, GetProductList } from "services/ApiService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaStar,
  FaTrashAlt,
  FaExternalLinkAlt,
  FaSearch,
  FaFilter,
  FaComments,
  FaSyncAlt
} from "react-icons/fa";

export default function ReviewManager() {
  const [reviews, setReviews] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [starFilter, setStarFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Load reviews & products
  const fetchReviewsAndProducts = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch reviews
      const reviewRes = await GetFeebackList();
      const reviewData = reviewRes.data || [];
      setReviews(reviewData);

      // 2. Fetch products to map productName
      try {
        const prodRes = await GetProductList();
        const prodList = prodRes.data || prodRes || [];
        const mapping = {};
        prodList.forEach((p) => {
          mapping[p.productId || p.id] = p.productName || p.name;
        });
        setProductsMap(mapping);
      } catch (e) {
        console.warn("Could not fetch product list for mapping:", e);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách đánh giá:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách đánh giá từ máy chủ!",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviewsAndProducts();
  }, [fetchReviewsAndProducts]);

  // Handle Delete Review
  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: "Xóa đánh giá này?",
      text: "Hành động này sẽ xóa vĩnh viễn đánh giá của khách hàng khỏi hệ thống!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy"
    });

    if (result.isConfirmed) {
      try {
        await DeleteReview(reviewId);
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Đánh giá đã được gỡ bỏ thành công.",
          timer: 1500,
          showConfirmButton: false
        });
        fetchReviewsAndProducts();
      } catch (err) {
        console.error("Lỗi xóa đánh giá:", err);
        Swal.fire({
          icon: "error",
          title: "Không thể xóa",
          text: err.response?.data?.message || "Đã xảy ra lỗi khi xóa đánh giá!",
        });
      }
    }
  };

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        (r.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.comment || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (productsMap[r.productId] || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchStar =
        starFilter === "ALL" || String(r.rating) === String(starFilter);

      return matchSearch && matchStar;
    });
  }, [reviews, searchTerm, starFilter, productsMap]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage) || 1;
  const currentReviews = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  }, [filteredReviews, currentPage, itemsPerPage]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleGotoProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Stats calculation
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: "0.0", total: 0 };
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return {
      avg: (sum / reviews.length).toFixed(1),
      total: reviews.length
    };
  }, [reviews]);

  return (
    <main className="mt-5 pt-3 mb-5">
      <div className="container-fluid px-4 pt-3">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <FaComments className="text-warning" />
              QUẢN LÝ ĐÁNH GIÁ SẢN PHẨM
            </h2>
            <p className="text-muted small mb-0">
              Kiểm duyệt, theo dõi và quản lý phản hồi thực tế từ thực khách
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span className="badge bg-warning text-dark px-3 py-2 fs-6 rounded-pill">
              ⭐ Điểm trung bình: {stats.avg} / 5.0 ({stats.total} đánh giá)
            </span>
            <button
              className="btn btn-outline-secondary rounded-pill btn-sm d-flex align-items-center gap-1"
              onClick={fetchReviewsAndProducts}
              title="Làm mới dữ liệu"
            >
              <FaSyncAlt /> Làm mới
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body p-3">
            <div className="row g-3 align-items-center">
              <div className="col-md-6 col-lg-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Tìm theo tên khách hàng, nội dung nhận xét, món ăn..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(0);
                    }}
                  />
                </div>
              </div>

              <div className="col-md-4 col-lg-3">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaFilter className="text-muted" />
                  </span>
                  <select
                    className="form-select"
                    value={starFilter}
                    onChange={(e) => {
                      setStarFilter(e.target.value);
                      setCurrentPage(0);
                    }}
                  >
                    <option value="ALL">Tất cả số sao</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                    <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                    <option value="3">⭐⭐⭐ (3 sao)</option>
                    <option value="2">⭐⭐ (2 sao)</option>
                    <option value="1">⭐ (1 sao)</option>
                  </select>
                </div>
              </div>

              <div className="col-md-2 col-lg-4 text-md-end text-muted small">
                Hiển thị <strong>{filteredReviews.length}</strong> / {reviews.length} đánh giá
              </div>
            </div>
          </div>
        </div>

        {/* Table of Reviews */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
          <div className="table-responsive" style={{ minHeight: "450px" }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "50px" }} className="text-center">STT</th>
                  <th style={{ width: "160px" }}>Khách hàng</th>
                  <th style={{ width: "140px" }}>Số sao</th>
                  <th style={{ width: "200px" }}>Món ăn</th>
                  <th>Nội dung đánh giá</th>
                  <th style={{ width: "160px" }}>Thời gian</th>
                  <th style={{ width: "130px" }} className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-warning" role="status"></div>
                      <p className="mt-2 text-muted small">Đang tải danh sách đánh giá...</p>
                    </td>
                  </tr>
                ) : currentReviews.length > 0 ? (
                  currentReviews.map((item, index) => {
                    const stt = currentPage * itemsPerPage + index + 1;
                    const prodName = productsMap[item.productId] || `Món ăn #${item.productId}`;
                    const formattedDate = item.createdAt
                      ? new Date(item.createdAt).toLocaleString("vi-VN", {
                          dateStyle: "short",
                          timeStyle: "short"
                        })
                      : "—";

                    return (
                      <tr key={item.id || index}>
                        <td className="text-center fw-bold text-muted">{stt}</td>
                        <td>
                          <div className="fw-semibold text-dark">{item.userName || "Khách hàng"}</div>
                          <small className="text-muted">UID: #{item.userId || "—"}</small>
                        </td>
                        <td>
                          <div className="text-warning d-flex align-items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <FaStar
                                key={s}
                                size={13}
                                color={s <= item.rating ? "#f59e0b" : "#e2e8f0"}
                              />
                            ))}
                            <span className="ms-1 fw-bold text-dark small">{item.rating}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="badge bg-light text-dark border cursor-pointer text-wrap text-start"
                            style={{ cursor: "pointer", maxWidth: "180px", display: "inline-block" }}
                            onClick={() => handleGotoProduct(item.productId)}
                            title="Bấm để xem sản phẩm"
                          >
                            {prodName} <FaExternalLinkAlt size={10} className="ms-1 text-primary" />
                          </span>
                        </td>
                        <td>
                          <p className="mb-0 text-secondary" style={{ fontSize: "0.92rem", lineHeight: "1.5" }}>
                            {item.comment}
                          </p>
                        </td>
                        <td>
                          <small className="text-muted">{formattedDate}</small>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-outline-danger btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1"
                            onClick={() => handleDeleteReview(item.id)}
                            title="Xóa đánh giá này"
                          >
                            <FaTrashAlt size={12} /> Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <FaComments className="text-muted opacity-50 mb-2" size={40} />
                      <h6 className="fw-bold text-secondary">Không có đánh giá nào phù hợp</h6>
                      <p className="text-muted small mb-0">
                        {reviews.length === 0
                          ? "Hiện tại chưa có khách hàng nào để lại đánh giá."
                          : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc sao."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mb-5">
            <ReactPaginate
              breakLabel="..."
              nextLabel=">"
              onPageChange={handlePageClick}
              pageRangeDisplayed={5}
              pageCount={totalPages}
              forcePage={currentPage}
              previousLabel="<"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              containerClassName="pagination"
              activeClassName="active"
            />
          </div>
        )}
      </div>
    </main>
  );
}
