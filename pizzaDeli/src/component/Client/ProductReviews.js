import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaStar, FaCheckCircle, FaUserCheck, FaCommentDots, FaPaperPlane, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { GetReviewsByProductId, PostReview, CheckCanReview } from "../../services/ApiService";
import "../../css/ProductReviews.css";

const RATING_LABELS = {
  1: "Rất không hài lòng",
  2: "Chưa hài lòng",
  3: "Bình thường",
  4: "Hài lòng, vị ngon",
  5: "Tuyệt hảo! Chuẩn vị Ý"
};

export default function ProductReviews({ productId, productName }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const userId = currentUser?.id || currentUser?.userId;

  // 1. Fetch reviews for product
  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setIsLoading(true);
      const data = await GetReviewsByProductId(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đánh giá:", err);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // 2. Check if current user has purchased this product
  useEffect(() => {
    if (userId && productId) {
      CheckCanReview(userId, productId)
        .then((allowed) => setCanReview(Boolean(allowed)))
        .catch(() => setCanReview(false));
    } else {
      setCanReview(false);
    }
  }, [userId, productId]);

  // Calculations for average & breakdown
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { avg: 5.0, total: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };

    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = (sum / total).toFixed(1);

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = r.rating || 5;
      if (counts[star] !== undefined) counts[star]++;
    });

    return { avg, total, counts };
  }, [reviews]);

  // Handle submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!userId) {
      return Swal.fire({
        icon: "warning",
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để gửi đánh giá!",
        confirmButtonColor: "#f97316"
      });
    }

    if (!comment.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Thiếu nội dung",
        text: "Vui lòng viết đôi lời cảm nhận về món ăn bạn đã thưởng thức!",
        confirmButtonColor: "#f97316"
      });
    }

    setIsSubmitting(true);
    try {
      const reviewPayload = {
        rating: Number(rating),
        comment: comment.trim(),
        userId: Number(userId),
        userName: currentUser.name || currentUser.fullName || currentUser.email?.split("@")[0] || "Khách hàng",
        productId: Number(productId)
      };

      await PostReview(reviewPayload);

      Swal.fire({
        icon: "success",
        title: "Cảm ơn bạn!",
        text: "Đánh giá của bạn đã được ghi nhận và hiển thị.",
        timer: 2000,
        showConfirmButton: false
      });

      setComment("");
      setRating(5);
      fetchReviews();
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.response?.data?.message || "Không thể gửi đánh giá lúc này, vui lòng thử lại sau!",
        confirmButtonColor: "#d33"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="product-reviews-container my-5">
      <div className="reviews-card-wrapper shadow-sm rounded-4 p-4 p-lg-5">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 pb-3 border-bottom">
          <div>
            <h3 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <FaCommentDots className="text-warning" />
              Đánh Giá & Nhận Xét Thực Khách
            </h3>
            <p className="text-muted small mb-0">
              Phản hồi thực tế từ những khách hàng đã đặt và trải nghiệm món {productName || "này"}
            </p>
          </div>
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">
            ⭐ {stats.avg} / 5.0 ({stats.total} nhận xét)
          </span>
        </div>

        {/* 1. Rating Summary Box */}
        <div className="row g-4 align-items-center mb-5 review-summary-box p-4 rounded-4">
          <div className="col-md-4 text-center border-end-md">
            <div className="display-3 fw-bold text-warning mb-1">{stats.avg}</div>
            <div className="d-flex justify-content-center gap-1 mb-2 text-warning fs-5">
              {[1, 2, 3, 4, 5].map((s) => (
                <FaStar
                  key={s}
                  className={s <= Math.round(stats.avg) ? "star-filled" : "star-empty"}
                />
              ))}
            </div>
            <div className="text-muted small">
              Dựa trên <strong>{stats.total}</strong> lượt đánh giá
            </div>
          </div>

          <div className="col-md-8">
            <div className="star-breakdown-list">
              {[5, 4, 3, 2, 1].map((s) => {
                const count = stats.counts[s] || 0;
                const percent = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={s} className="d-flex align-items-center gap-3 mb-2">
                    <span className="star-label text-muted small" style={{ width: "45px" }}>
                      {s} sao
                    </span>
                    <div className="progress flex-grow-1" style={{ height: "8px" }}>
                      <div
                        className="progress-bar bg-warning"
                        role="progressbar"
                        style={{ width: `${percent}%` }}
                        aria-valuenow={percent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <span className="star-count text-muted small" style={{ width: "35px" }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Review Form Section */}
        <div className="review-form-section mb-5 p-4 rounded-4 border">
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <FaPaperPlane className="text-warning" />
            Để Lại Cảm Nhận Của Bạn
          </h5>

          {!currentUser ? (
            <div className="text-center py-4 bg-light rounded-3">
              <FaLock className="text-muted mb-2 fs-3" />
              <p className="text-muted mb-3">Vui lòng đăng nhập để có thể viết đánh giá cho món ăn.</p>
              <Link to="/login" className="btn btn-warning text-dark fw-bold px-4 rounded-pill">
                Đăng Nhập Ngay
              </Link>
            </div>
          ) : !canReview ? (
            <div className="alert alert-info d-flex align-items-center gap-3 mb-0 rounded-3">
              <FaUserCheck className="fs-3 text-info flex-shrink-0" />
              <div>
                <strong>Hệ thống đánh giá đã mua hàng (Verified Purchase):</strong>
                <p className="mb-0 small text-muted">
                  Để đảm bảo tính khách quan và uy tín, chỉ những khách hàng đã từng đặt món này và đơn hàng đã hoàn tất mới có thể gửi nhận xét. Hãy đặt ngay để thưởng thức nhé!
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <label className="form-label fw-bold small text-muted">Bạn chấm món này mấy sao?</label>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="star-picker">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FaStar
                        key={s}
                        className={`star-choice ${(hoverRating || rating) >= s ? "active" : ""}`}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(s)}
                      />
                    ))}
                  </div>
                  <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle ms-2 px-3 py-2 rounded-pill fw-semibold">
                    {RATING_LABELS[hoverRating || rating]}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-muted">
                  Nội dung nhận xét chi tiết:
                </label>
                <textarea
                  className="form-control review-textarea"
                  rows="3"
                  placeholder="Vỏ bánh có giòn không? Phô mai có béo ngậy? Giao bánh có đúng giờ không?..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-pill shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi Đánh Giá Ngay"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 3. Review List */}
        <div className="reviews-list-section">
          <h5 className="fw-bold mb-4">
            Tất Cả Nhận Xét ({reviews.length})
          </h5>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status"></div>
              <p className="mt-2 text-muted small">Đang tải đánh giá...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4">
              <FaStar className="text-muted opacity-50 mb-2" style={{ fontSize: "3rem" }} />
              <h6 className="fw-bold text-secondary">Chưa có đánh giá nào cho món ăn này</h6>
              <p className="text-muted small mb-0">
                Hãy là một trong những thực khách đầu tiên thưởng thức và chia sẻ cảm nhận bạn nhé!
              </p>
            </div>
          ) : (
            <div className="row g-3">
              {reviews.map((rev) => {
                const userInitial = (rev.userName || "U").charAt(0).toUpperCase();
                return (
                  <div key={rev.id} className="col-12">
                    <div className="review-item-card p-3 p-md-4 rounded-4 border bg-white">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-3">
                          <div className="user-avatar-circle">{userInitial}</div>
                          <div>
                            <div className="fw-bold text-dark d-flex align-items-center gap-2">
                              {rev.userName || "Khách hàng"}
                              <span className="badge bg-success-subtle text-success small border border-success-subtle d-inline-flex align-items-center gap-1">
                                <FaCheckCircle size={10} /> Đã mua tại Pizza Deli
                              </span>
                            </div>
                            <div className="text-muted small" style={{ fontSize: "12px" }}>
                              {rev.createdAt
                                ? new Date(rev.createdAt).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })
                                : "Khách hàng"}
                            </div>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="text-warning d-flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FaStar
                              key={s}
                              className={s <= (rev.rating || 5) ? "star-filled" : "star-empty"}
                              size={14}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="review-comment-text mb-0 mt-3 text-secondary" style={{ lineHeight: 1.6 }}>
                        {rev.comment}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
