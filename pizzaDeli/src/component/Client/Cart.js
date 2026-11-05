import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaShoppingCart,
  FaTicketAlt,
  FaCheckCircle,
  FaTimes,
  FaMotorcycle,
  FaShieldAlt,
  FaArrowRight,
  FaFire,
  FaPizzaSlice
} from "react-icons/fa";
import "../../css/cart.css";
import { useCart } from "../../context/CartContext";
import Swal from "sweetalert2";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    appliedCoupon,
    discountAmount,
    shippingFee,
    finalPrice,
    applyCoupon,
    removeCoupon,
    availableCoupons
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // Định dạng giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(price || 0)
      .replace("₫", " đ");
  };

  // Mục tiêu freeship (ví dụ 200.000đ)
  const FREESHIP_THRESHOLD = 200000;
  const progressPercent = Math.min(100, Math.round((totalPrice / FREESHIP_THRESHOLD) * 100));
  const remainingForFreeship = Math.max(0, FREESHIP_THRESHOLD - totalPrice);

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponInput;
    if (!code || !code.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Chưa nhập mã",
        text: "Vui lòng nhập mã giảm giá để áp dụng!",
        timer: 1800,
        showConfirmButton: false,
        toast: true,
        position: "top-end"
      });
      return;
    }

    setIsApplying(true);
    const result = await applyCoupon(code);
    setIsApplying(false);

    if (result.success) {
      setCouponInput("");
      Swal.fire({
        icon: "success",
        title: "Áp dụng thành công!",
        text: result.message,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end"
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Không thể áp dụng",
        text: result.message,
        confirmButtonColor: "#ea580c"
      });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    Swal.fire({
      icon: "info",
      title: "Đã hủy mã giảm giá",
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: "top-end"
    });
  };

  const handleClearCart = () => {
    Swal.fire({
      title: "Xóa toàn bộ giỏ hàng?",
      text: "Bạn có chắc chắn muốn dọn sạch tất cả sản phẩm khỏi giỏ hàng?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ea580c",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Đồng ý, xóa hết",
      cancelButtonText: "Không, giữ lại",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
        Swal.fire({
          icon: "success",
          title: "Đã xóa toàn bộ giỏ hàng",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end"
        });
      }
    });
  };

  const handleRemoveItem = (itemId, itemName) => {
    Swal.fire({
      title: "Xóa món này?",
      text: `Bạn có chắc muốn bỏ "${itemName || "món ăn này"}" khỏi giỏ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ea580c",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(itemId);
      }
    });
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Thanh Header của Giỏ hàng */}
        <div className="cart-header-card">
          <div className="header-left">
            <button className="back-navigation-btn" onClick={() => navigate("/products")}>
              <FaArrowLeft className="back-icon" />
              <span>Tiếp tục chọn món</span>
            </button>
            <div className="cart-title-wrapper">
              <h1 className="cart-title">
                <FaShoppingCart className="cart-heading-icon" />
                <span>Giỏ Hàng Của Bạn</span>
              </h1>
              {cartItems.length > 0 && (
                <span className="cart-count-pill">{totalItems} món</span>
              )}
            </div>
          </div>

          {cartItems.length > 0 && (
            <button className="clear-cart-outline-btn" onClick={handleClearCart}>
              <FaTrash className="btn-icon" />
              <span>Xóa toàn bộ</span>
            </button>
          )}
        </div>

        {/* Thanh tiến độ Freeship */}
        {cartItems.length > 0 && (
          <div className="freeship-banner-box">
            <div className="freeship-header">
              <div className="freeship-icon-wrap">
                <FaMotorcycle className="freeship-icon" />
              </div>
              <div className="freeship-text">
                {remainingForFreeship > 0 ? (
                  <span>
                    Mua thêm <strong>{formatPrice(remainingForFreeship)}</strong> để được{" "}
                    <strong className="text-highlight">MIỄN PHÍ VẬN CHUYỂN</strong>!
                  </span>
                ) : (
                  <span className="text-success-bold">
                    🎉 Tuyệt vời! Bạn đã đủ điều kiện nhận <strong>MIỄN PHÍ VẬN CHUYỂN</strong>
                  </span>
                )}
              </div>
              <span className="freeship-badge">{progressPercent}%</span>
            </div>
            <div className="freeship-progress-bar">
              <div
                className="freeship-progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Trạng thái giỏ hàng trống */}
        {cartItems.length === 0 ? (
          <div className="empty-cart-card">
            <div className="empty-cart-illustration">
              <div className="empty-cart-circle">
                <FaShoppingCart className="empty-cart-main-icon" />
              </div>
              <div className="empty-sparkle sparkle-1">✨</div>
              <div className="empty-sparkle sparkle-2">🍕</div>
            </div>
            <h2 className="empty-title">Giỏ hàng của bạn đang trống</h2>
            <p className="empty-subtitle">
              Chưa có món ngon nào được chọn. Hãy khám phá thực đơn Pizza & Mỳ Ý thơm nức mũi của Deli ngay thôi!
            </p>
            <Link to="/products" className="empty-shop-cta-btn">
              <FaPizzaSlice className="btn-icon-spin" />
              <span>Khám Phá Thực Đơn Ngay</span>
              <FaArrowRight className="btn-arrow" />
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* Cột trái: Danh sách các món ăn + Mã giảm giá */}
            <div className="cart-left-column">
              <div className="cart-items-wrapper">
                <div className="items-header-bar">
                  <span>MÓN ĂN & TÙY CHỌN</span>
                  <span className="header-total-label">THÀNH TIỀN</span>
                </div>

                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const itemId = item.cartItemId || item.productId || item.id;
                    const itemImage = item.image?.startsWith("../")
                      ? item.image.substring(2)
                      : item.image || "img/default-product.png";
                    const itemName = item.productName || item.name || "Món ăn Deli";
                    const itemSubtotal = (item.price || 0) * (item.quantity || 1);

                    return (
                      <div key={itemId} className="cart-item-card">
                        {/* Ảnh sản phẩm */}
                        <div className="item-thumbnail-box">
                          <img
                            src={itemImage}
                            alt={itemName}
                            className="item-thumbnail-img"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80";
                            }}
                          />
                        </div>

                        {/* Thông tin sản phẩm */}
                        <div className="item-main-info">
                          <h3 className="item-title">{itemName}</h3>

                          {/* Nhãn tùy chọn Size / Đế / Topping / Ghi chú */}
                          {item.optionTags && item.optionTags.length > 0 && (
                            <div className="item-customization-tags">
                              {item.optionTags.map((tag, idx) => (
                                <span key={idx} className="custom-option-pill">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="item-price-and-controls">
                            <span className="item-unit-price">{formatPrice(item.price || 0)}</span>

                            {/* Bộ chỉnh số lượng */}
                            <div className="item-stepper-control">
                              <button
                                className="stepper-btn stepper-btn-decrease"
                                onClick={() => updateQuantity(itemId, (item.quantity || 1) - 1)}
                                disabled={item.quantity <= 1}
                                title="Giảm số lượng"
                              >
                                <FaMinus />
                              </button>
                              <span className="stepper-display-value">{item.quantity || 1}</span>
                              <button
                                className="stepper-btn stepper-btn-increase"
                                onClick={() => updateQuantity(itemId, (item.quantity || 1) + 1)}
                                title="Tăng số lượng"
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Thành tiền & Nút xóa */}
                        <div className="item-subtotal-column">
                          <span className="item-subtotal-price">{formatPrice(itemSubtotal)}</span>
                          <button
                            className="item-delete-btn"
                            title="Xóa món này khỏi giỏ"
                            onClick={() => handleRemoveItem(itemId, itemName)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* KHỐI MÃ GIẢM GIÁ & VOUCHER */}
              <div className="cart-voucher-section-card">
                <div className="voucher-section-header">
                  <div className="voucher-header-title">
                    <div className="voucher-icon-badge">
                      <FaTicketAlt />
                    </div>
                    <div>
                      <h4 className="voucher-title">Ưu Đãi & Mã Khuyến Mãi</h4>
                      <p className="voucher-subtitle">Chọn hoặc nhập mã giảm giá độc quyền từ Pizza Deli</p>
                    </div>
                  </div>
                </div>

                {appliedCoupon ? (
                  <div className="active-voucher-banner">
                    <div className="active-voucher-left">
                      <div className="voucher-applied-icon">
                        <FaCheckCircle />
                      </div>
                      <div className="voucher-applied-details">
                        <div className="applied-tag-row">
                          <span className="applied-code-badge">{appliedCoupon.code}</span>
                          <span className="applied-success-label">Đã áp dụng thành công</span>
                        </div>
                        <p className="applied-desc-text">
                          {appliedCoupon.description || appliedCoupon.title || "Ưu đãi giảm giá đơn hàng"}
                        </p>
                        <span className="applied-savings-text">
                          Tiết kiệm: <strong>-{formatPrice(discountAmount)}</strong>
                        </span>
                      </div>
                    </div>
                    <button className="remove-voucher-btn" onClick={handleRemoveCoupon} title="Hủy mã ưu đãi">
                      <FaTimes />
                      <span>Gỡ bỏ</span>
                    </button>
                  </div>
                ) : (
                  <div className="voucher-input-wrapper">
                    <div className="voucher-input-group">
                      <FaTicketAlt className="input-leading-icon" />
                      <input
                        type="text"
                        className="voucher-text-input"
                        placeholder="Nhập mã ưu đãi (Ví dụ: PIZZA50, DELI10)..."
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      />
                      <button
                        className="apply-voucher-action-btn"
                        onClick={() => handleApplyCoupon()}
                        disabled={isApplying}
                      >
                        {isApplying ? "Đang áp dụng..." : "Áp Dụng"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Danh sách các voucher có sẵn gợi ý cho khách */}
                {availableCoupons && availableCoupons.length > 0 && (
                  <div className="suggested-vouchers-container">
                    <div className="suggested-vouchers-label">
                      <FaFire className="hot-voucher-icon" />
                      <span>Mã ưu đãi hot gợi ý cho bạn:</span>
                    </div>
                    <div className="vouchers-cards-grid">
                      {availableCoupons.map((coupon) => {
                        const isCurrentlyApplied = appliedCoupon?.code === coupon.code;
                        const isEligible = totalPrice >= (coupon.minOrder || 0);

                        return (
                          <div
                            key={coupon.code}
                            className={`suggested-voucher-card ${isCurrentlyApplied ? "is-applied" : ""} ${
                              !isEligible && !isCurrentlyApplied ? "not-eligible" : ""
                            }`}
                            onClick={() => !isCurrentlyApplied && handleApplyCoupon(coupon.code)}
                            title={isCurrentlyApplied ? "Mã đang được sử dụng" : "Nhấn để áp dụng ngay"}
                          >
                            <div className="voucher-card-top">
                              <span className="v-code">{coupon.code}</span>
                              {coupon.badge && (
                                <span className={`v-badge ${coupon.badge === "HOT" ? "v-badge-hot" : ""}`}>
                                  {coupon.badge}
                                </span>
                              )}
                            </div>
                            <div className="v-title">{coupon.title || coupon.description}</div>
                            {coupon.minOrder > 0 && (
                              <div className="v-condition">
                                Đơn từ {formatPrice(coupon.minOrder)}
                              </div>
                            )}
                            <div className="v-action-row">
                              {isCurrentlyApplied ? (
                                <span className="v-status-applied">
                                  <FaCheckCircle /> Đang dùng
                                </span>
                              ) : (
                                <span className="v-status-use">
                                  Áp dụng ngay &rarr;
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cột phải: Tóm tắt đơn hàng (Order Summary - Sticky) */}
            <div className="cart-right-column">
              <div className="order-summary-card">
                <div className="summary-card-header">
                  <h3 className="summary-heading">Tổng Quan Đơn Hàng</h3>
                  <span className="summary-items-count">{totalItems} món</span>
                </div>

                <div className="summary-calculation-body">
                  <div className="calc-row">
                    <span className="calc-label">Tạm tính:</span>
                    <span className="calc-value">{formatPrice(totalPrice)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="calc-row discount-calc-row">
                      <span className="calc-label">
                        Giảm giá voucher <span className="applied-code-inline">({appliedCoupon.code})</span>:
                      </span>
                      <span className="calc-value discount-val">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="calc-row">
                    <span className="calc-label">Phí giao hàng:</span>
                    <span className="calc-value">
                      {shippingFee === 0 ? (
                        <div className="shipping-free-box">
                          <s className="original-fee">{formatPrice(30000)}</s>
                          <span className="free-fee-badge">0 đ (Freeship)</span>
                        </div>
                      ) : (
                        <span className="standard-fee">{formatPrice(shippingFee ?? 30000)}</span>
                      )}
                    </span>
                  </div>

                  <div className="calc-divider"></div>

                  <div className="calc-row total-pay-row">
                    <div className="total-label-box">
                      <span className="total-text">Tổng thanh toán:</span>
                      <small className="vat-hint">(Đã bao gồm VAT & ưu đãi)</small>
                    </div>
                    <span className="final-price-highlight">{formatPrice(finalPrice)}</span>
                  </div>
                </div>

                <Link to="/checkout" className="proceed-to-checkout-btn">
                  <span>Tiến Hành Đặt Hàng</span>
                  <FaArrowRight className="checkout-arrow-icon" />
                </Link>

                <div className="trust-badges-wrapper">
                  <div className="trust-item">
                    <FaMotorcycle className="trust-icon" />
                    <div className="trust-text">
                      <strong>Giao Nhanh 30 Phút</strong>
                      <span>Đảm bảo nóng giòn tận tay</span>
                    </div>
                  </div>
                  <div className="trust-item">
                    <FaShieldAlt className="trust-icon" />
                    <div className="trust-text">
                      <strong>Cam Kết Chất Lượng</strong>
                      <span>100% nguyên liệu tươi chuẩn Ý</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;