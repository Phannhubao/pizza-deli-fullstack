import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaSpinner,
  FaTag,
  FaShieldAlt,
  FaMotorcycle,
  FaReceipt,
  FaCheck,
  FaArrowRight
} from "react-icons/fa";
import axios from "axios";
import CryptoJS from "crypto-js";
import "../../css/checkout.css";
import Swal from "sweetalert2";
import { useCart } from "../../context/CartContext";
import { Domain } from "../../services/Domain";
import { GetUserByID, GetOrdersByUserID } from "../../services/ApiService";

// Hàm format datetime theo chuẩn VNPay (yyyyMMddHHmmss, GMT+7)
const formatDateVN = (date) => {
  const tzOffset = 7 * 60 * 60000; // GMT+7
  const localDate = new Date(date.getTime() + tzOffset);

  const yyyy = localDate.getUTCFullYear();
  const MM = String(localDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(localDate.getUTCDate()).padStart(2, "0");
  const HH = String(localDate.getUTCHours()).padStart(2, "0");
  const mm = String(localDate.getUTCMinutes()).padStart(2, "0");
  const ss = String(localDate.getUTCSeconds()).padStart(2, "0");

  return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
};

// Hàm lấy base URL động
const getBaseUrl = () => {
  return window.location.origin;
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    totalItems,
    totalPrice,
    appliedCoupon,
    discountAmount,
    shippingFee,
    finalPrice,
    clearCart
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const [customerInfo, setCustomerInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    createdAt: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Cấu hình VNPay Sandbox (Đã được phê duyệt)
  const vnpayConfig = {
    tmnCode: "ZSS7Y0O5",
    secretKey: "BNQNJZLHEKPIWOUEDCVOZEFZWNVFYCWO",
    vnpayUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl: `${getBaseUrl()}/vnpay-return`
  };

  useEffect(() => {
    // 1. Chỉ chuyển về giỏ hàng khi chưa hoàn thành đặt hàng và giỏ hàng trống
    if (!orderSuccess && (!cartItems || cartItems.length === 0)) {
      navigate("/cart");
      return;
    }

    // 2. Tự động lấy thông tin từ tài khoản đăng nhập & đơn hàng gần nhất
    const loadRegisteredUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = storedUser?.id || storedUser?.userId;

        let defaultName = storedUser?.name || storedUser?.fullName || "";
        let defaultEmail = storedUser?.email || "";
        let defaultAddress = localStorage.getItem("saved_checkout_address") || "";
        let defaultPhone = localStorage.getItem("saved_checkout_phone") || "";

        if (userId) {
          try {
            const userRes = await GetUserByID(userId);
            const uData = userRes?.data || userRes;
            if (uData) {
              if (uData.name) defaultName = uData.name;
              if (uData.email) defaultEmail = uData.email;
              if (uData.address) defaultAddress = uData.address;
            }
          } catch (e) {
            console.error("Lỗi lấy thông tin user đăng ký:", e);
          }

          // Lấy thêm số điện thoại / địa chỉ từ đơn hàng gần nhất nếu có
          try {
            const orders = await GetOrdersByUserID(userId);
            if (Array.isArray(orders) && orders.length > 0) {
              const lastOrder = orders[0];
              if (!defaultPhone && lastOrder.phone_number) {
                defaultPhone = lastOrder.phone_number;
              }
              if (!defaultAddress && lastOrder.address) {
                defaultAddress = lastOrder.address;
              }
            }
          } catch (e) {
            console.error("Lỗi lấy lịch sử đơn hàng:", e);
          }
        }

        setCustomerInfo((prev) => ({
          ...prev,
          fullName: prev.fullName || defaultName,
          email: prev.email || defaultEmail,
          address: prev.address || defaultAddress,
          phone: prev.phone || defaultPhone
        }));
      } catch (err) {
        console.error("Lỗi tự động điền thông tin đăng ký:", err);
      }
    };

    loadRegisteredUserData();
  }, [navigate, cartItems, orderSuccess]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(price || 0)
      .replace("₫", " đ");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!customerInfo.fullName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập họ và tên người nhận hàng!",
        confirmButtonColor: "#ea580c"
      });
      return false;
    }
    if (!customerInfo.phone.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập số điện thoại người nhận để shipper tiện liên hệ!",
        confirmButtonColor: "#ea580c"
      });
      return false;
    }
    if (!customerInfo.address.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập địa chỉ giao nhận món ăn!",
        confirmButtonColor: "#ea580c"
      });
      return false;
    }
    return true;
  };

  // Hàm tạo checksum VNPay
  const createVnpayChecksum = (params, secretKey) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
          result[key] = params[key];
        }
        return result;
      }, {});

    const signData = new URLSearchParams(sortedParams).toString();
    return CryptoJS.HmacSHA512(signData, secretKey).toString();
  };

  // Hàm tạo đơn hàng CHO COD
  const createOrderForCOD = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = currentUser.id || currentUser.userId;
    const currentTime = new Date().toISOString();
    const totalQuantity = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

    try {
      const orderData = {
        phone_number: customerInfo.phone,
        address: customerInfo.address,
        username: currentUser.username || customerInfo.fullName,
        quantity: totalQuantity,
        totalPrice: finalPrice,
        voucherCode: appliedCoupon?.code || null,
        discountAmount: discountAmount || 0,
        image: cartItems[0]?.image || "img/default-product.png",
        userId: userId,
        createdAt: currentTime
      };

      const orderRes = await axios.post(`${Domain}/api/Order/AddOrder`, orderData, {
        headers: { "Content-Type": "application/json" }
      });

      let orderId = null;
      if (orderRes.data?.orderId) {
        orderId = orderRes.data.orderId;
      } else if (orderRes.data?.id) {
        orderId = orderRes.data.id;
      } else if (orderRes.data?.OrderId) {
        orderId = orderRes.data.OrderId;
      } else if (orderRes.data?.data?.orderId) {
        orderId = orderRes.data.data.orderId;
      } else if (typeof orderRes.data === "number") {
        orderId = orderRes.data;
      }

      if (!orderId || isNaN(orderId)) {
        throw new Error("Không nhận được ID đơn hàng hợp lệ từ server");
      }
      orderId = Number(orderId);

      const orderDetailList = cartItems.map((item) => ({
        quantity: item.quantity || 1,
        price: item.price || 0,
        produc_name: item.productName || item.name || "Món ăn Deli",
        options: item.optionTags && item.optionTags.length > 0 ? item.optionTags.join(" | ") : null,
        note: item.options?.note || null,
        image: item.image?.startsWith("../") ? item.image.substring(2) : item.image || "img/default-product.png",
        orderId: orderId,
        productId: item.productId || item.id,
        canFeedBack: false
      }));

      await axios.post(`${Domain}/api/OrderDeTail/AddOrderDetailList`, orderDetailList, {
        headers: { "Content-Type": "application/json" }
      });

      const paymentData = {
        orderId: orderId,
        fullname: customerInfo.fullName,
        status: false
      };
      await axios.post(`${Domain}/api/Payment/AddPayment`, paymentData, {
        headers: { "Content-Type": "application/json" }
      });

      return orderId;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const handleCheckout = async () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser || !currentUser.token) {
      Swal.fire({
        icon: "warning",
        title: "Bạn chưa đăng nhập!",
        text: "Vui lòng đăng nhập tài khoản để tiếp tục đặt hàng.",
        confirmButtonText: "Đăng nhập ngay",
        confirmButtonColor: "#ea580c",
        showCancelButton: true,
        cancelButtonText: "Hủy",
        cancelButtonColor: "#94a3b8"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (!validateForm()) return;

    if (customerInfo.phone) localStorage.setItem("saved_checkout_phone", customerInfo.phone);
    if (customerInfo.address) localStorage.setItem("saved_checkout_address", customerInfo.address);

    setLoading(true);

    try {
      if (paymentMethod === "COD") {
        const createdOrderId = await createOrderForCOD();

        const summary = {
          orderId: createdOrderId,
          fullName: customerInfo.fullName,
          phone: customerInfo.phone,
          address: customerInfo.address,
          finalPrice: finalPrice,
          discountAmount: discountAmount,
          voucherCode: appliedCoupon?.code || null
        };
        setCompletedOrder(summary);
        setOrderSuccess(true);
        clearCart();
        window.scrollTo(0, 0);

        Swal.fire({
          icon: "success",
          title: "Đặt Hàng Thành Công!",
          html: `
            <div style="font-size: 15px; text-align: left; margin-top: 10px; line-height: 1.7;">
              <p style="margin-bottom: 6px;"><b>Mã đơn hàng:</b> <span style="color: #ea580c; font-weight: 800;">#${createdOrderId}</span></p>
              <p style="margin-bottom: 6px;"><b>Người nhận:</b> ${customerInfo.fullName}</p>
              <p style="margin-bottom: 6px;"><b>Số điện thoại:</b> ${customerInfo.phone}</p>
              <p style="margin-bottom: 6px;"><b>Địa chỉ:</b> ${customerInfo.address}</p>
              <p style="margin-bottom: 6px;"><b>Tổng thanh toán:</b> <span style="color: #ea580c; font-weight: 800;">${formatPrice(finalPrice)}</span></p>
              <p style="margin-bottom: 0;"><b>Hình thức:</b> Thanh toán tiền mặt khi nhận hàng (COD)</p>
            </div>
          `,
          confirmButtonText: "Xem Lịch Sử Đơn",
          confirmButtonColor: "#ea580c",
          showCancelButton: true,
          cancelButtonText: "Về Trang Chủ",
          cancelButtonColor: "#64748b",
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/profile");
          } else {
            navigate("/");
          }
        });
      } else if (paymentMethod === "BANK_TRANSFER") {
        const transactionId = `VNPAY_${Date.now()}`;

        const vnpParams = {
          vnp_Version: "2.1.0",
          vnp_Command: "pay",
          vnp_TmnCode: vnpayConfig.tmnCode,
          vnp_Amount: Math.round(finalPrice * 100),
          vnp_CurrCode: "VND",
          vnp_TxnRef: transactionId,
          vnp_OrderInfo: `Thanh toan don hang ${transactionId}`,
          vnp_OrderType: "other",
          vnp_Locale: "vn",
          vnp_ReturnUrl: vnpayConfig.returnUrl,
          vnp_IpAddr: "127.0.0.1",
          vnp_CreateDate: formatDateVN(new Date()),
          vnp_ExpireDate: formatDateVN(new Date(Date.now() + 15 * 60 * 1000))
        };

        const secureHash = createVnpayChecksum(vnpParams, vnpayConfig.secretKey);

        const vnpUrl = new URL(vnpayConfig.vnpayUrl);
        Object.keys(vnpParams).forEach((key) => {
          vnpUrl.searchParams.append(key, vnpParams[key]);
        });
        vnpUrl.searchParams.append("vnp_SecureHash", secureHash);

        const pendingOrder = {
          customerInfo,
          cartItems,
          totalPrice: finalPrice,
          originalPrice: totalPrice,
          discountAmount,
          voucherCode: appliedCoupon?.code || null,
          totalItems,
          paymentMethod,
          transactionId: transactionId,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem("pending_vnpay_order", JSON.stringify(pendingOrder));

        window.location.href = vnpUrl.toString();
      }
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err.message);
      Swal.fire({
        icon: "error",
        title: "Lỗi Đặt Hàng",
        text: `Có lỗi xảy ra: ${err.response?.data?.message || err.message}. Vui lòng thử lại!`,
        confirmButtonColor: "#ea580c"
      });
    } finally {
      setLoading(false);
    }
  };

  // MÀN HÌNH ĐẶT HÀNG THÀNH CÔNG
  if (orderSuccess) {
    const displayOrder = completedOrder || {
      orderId: "",
      fullName: customerInfo.fullName,
      phone: customerInfo.phone,
      address: customerInfo.address,
      finalPrice: finalPrice,
      discountAmount: discountAmount,
      voucherCode: appliedCoupon?.code
    };

    return (
      <div className="checkout-page">
        <div className="checkout-main-container">
          <div className="checkout-success-card">
            <div className="success-badge-circle">
              <FaCheck className="success-badge-icon" />
            </div>
            <h2 className="success-main-title">Đặt Hàng Thành Công!</h2>
            <p className="success-sub-text">
              Cảm ơn bạn đã lựa chọn <strong>Pizza Deli</strong>! Bếp trưởng đang chuẩn bị những chiếc bánh thơm giòn nóng hổi nhất cho bạn.
            </p>

            {displayOrder.voucherCode && (
              <div className="voucher-savings-badge">
                <FaTag /> Bạn đã tiết kiệm <strong>{formatPrice(displayOrder.discountAmount)}</strong> với mã <strong>{displayOrder.voucherCode}</strong>
              </div>
            )}

            <div className="order-receipt-box">
              <div className="receipt-header">
                <FaReceipt className="receipt-icon" />
                <span>Chi Tiết Đơn Hàng</span>
              </div>
              <div className="receipt-list">
                {displayOrder.orderId && (
                  <div className="receipt-row">
                    <span className="receipt-label">Mã đơn hàng:</span>
                    <span className="receipt-code">#{displayOrder.orderId}</span>
                  </div>
                )}
                <div className="receipt-row">
                  <span className="receipt-label">Người nhận:</span>
                  <span className="receipt-value">{displayOrder.fullName}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Số điện thoại:</span>
                  <span className="receipt-value">{displayOrder.phone}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Địa chỉ giao:</span>
                  <span className="receipt-value">{displayOrder.address}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Hình thức:</span>
                  <span className="receipt-value">Thanh toán khi nhận hàng (COD)</span>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-row total-receipt-row">
                  <span className="receipt-label">Tổng thanh toán:</span>
                  <span className="receipt-total-highlight">{formatPrice(displayOrder.finalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="success-action-buttons">
              <button className="cta-home-btn" onClick={() => navigate("/")}>
                Về Trang Chủ
              </button>
              <button className="cta-profile-btn" onClick={() => navigate("/profile")}>
                Xem Lịch Sử Đơn Hàng &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MÀN HÌNH THANH TOÁN CHÍNH (2 CỘT CHUYÊN NGHIỆP)
  return (
    <div className="checkout-page">
      <div className="checkout-main-container">
        {/* Header điều hướng */}
        <div className="checkout-header-bar">
          <button className="checkout-back-link" onClick={() => navigate("/cart")}>
            <FaArrowLeft className="back-arrow-icon" />
            <span>Quay lại giỏ hàng</span>
          </button>
          <div className="checkout-header-title-box">
            <h1 className="checkout-heading">
              <FaReceipt className="heading-icon" />
              <span>Xác Nhận & Thanh Toán</span>
            </h1>
            <span className="step-tag">Bước 2 / 2</span>
          </div>
        </div>

        <div className="checkout-two-columns-grid">
          {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN & PHƯƠNG THỨC THANH TOÁN */}
          <div className="checkout-forms-column">
            {/* 1. Thông tin người nhận */}
            <div className="checkout-panel-card">
              <div className="panel-header">
                <div className="panel-icon-wrap">
                  <FaUser />
                </div>
                <div>
                  <h3 className="panel-title">1. Thông Tin Người Nhận</h3>
                  <p className="panel-desc">Thông tin liên lạc để Deli xác nhận và giao hàng tận nơi</p>
                </div>
                {customerInfo.fullName && (
                  <span className="auto-fill-pill">
                    <FaCheck /> Đã điền sẵn
                  </span>
                )}
              </div>

              <div className="form-fields-grid">
                <div className="form-field-group">
                  <label className="field-label">
                    Họ và tên <span className="req">*</span>
                  </label>
                  <div className="field-input-wrap">
                    <FaUser className="field-icon" />
                    <input
                      type="text"
                      name="fullName"
                      className="field-text-input"
                      placeholder="Nguyễn Văn A..."
                      value={customerInfo.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="field-label">
                    Số điện thoại <span className="req">*</span>
                  </label>
                  <div className="field-input-wrap">
                    <FaPhoneAlt className="field-icon" />
                    <input
                      type="tel"
                      name="phone"
                      className="field-text-input"
                      placeholder="0912 345 678..."
                      value={customerInfo.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-field-group full-span">
                  <label className="field-label">
                    Địa chỉ Email <span className="opt">(Để nhận hóa đơn điện tử)</span>
                  </label>
                  <div className="field-input-wrap">
                    <FaEnvelope className="field-icon" />
                    <input
                      type="email"
                      name="email"
                      className="field-text-input"
                      placeholder="example@gmail.com..."
                      value={customerInfo.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Địa chỉ giao hàng */}
            <div className="checkout-panel-card">
              <div className="panel-header">
                <div className="panel-icon-wrap">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h3 className="panel-title">2. Địa Chỉ Giao Hàng</h3>
                  <p className="panel-desc">Địa chỉ chi tiết để shipper mang pizza nóng hổi đến cho bạn</p>
                </div>
              </div>

              <div className="form-fields-grid">
                <div className="form-field-group full-span">
                  <label className="field-label">
                    Địa chỉ nhận hàng chi tiết <span className="req">*</span>
                  </label>
                  <div className="field-input-wrap textarea-wrap">
                    <textarea
                      name="address"
                      className="field-text-area"
                      rows="2"
                      placeholder="Số nhà, tên đường, ngõ ngách, tên tòa nhà hoặc phòng (Ví dụ: P.402 Tòa A1, 123 Đường Cầu Giấy...)"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-field-group full-span">
                  <label className="field-label">
                    Ghi chú cho shipper <span className="opt">(Tùy chọn)</span>
                  </label>
                  <div className="field-input-wrap textarea-wrap">
                    <textarea
                      name="note"
                      className="field-text-area"
                      rows="2"
                      placeholder="Ví dụ: Gọi trước khi đến 5 phút, để trước cửa nhà, giao gấp..."
                      value={customerInfo.note}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Phương thức thanh toán */}
            <div className="checkout-panel-card">
              <div className="panel-header">
                <div className="panel-icon-wrap">
                  <FaCreditCard />
                </div>
                <div>
                  <h3 className="panel-title">3. Phương Thức Thanh Toán</h3>
                  <p className="panel-desc">Lựa chọn hình thức thanh toán an toàn, bảo mật và thuận tiện nhất</p>
                </div>
              </div>

              <div className="payment-options-grid">
                {/* Lựa chọn 1: COD */}
                <label
                  className={`payment-method-card ${paymentMethod === "COD" ? "is-selected" : ""}`}
                  onClick={() => setPaymentMethod("COD")}
                >
                  <div className="payment-card-radio">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="custom-radio-check"></span>
                  </div>
                  <div className="payment-method-icon-box cod-icon-box">
                    <FaMoneyBillWave />
                  </div>
                  <div className="payment-method-text">
                    <strong className="payment-name">Thanh toán khi nhận hàng (COD)</strong>
                    <span className="payment-desc">Kiểm tra món ăn nóng giòn và thanh toán tiền mặt cho shipper</span>
                  </div>
                  {paymentMethod === "COD" && (
                    <span className="selected-check-badge">
                      <FaCheck />
                    </span>
                  )}
                </label>

                {/* Lựa chọn 2: VNPay */}
                <label
                  className={`payment-method-card ${paymentMethod === "BANK_TRANSFER" ? "is-selected" : ""}`}
                  onClick={() => setPaymentMethod("BANK_TRANSFER")}
                >
                  <div className="payment-card-radio">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={paymentMethod === "BANK_TRANSFER"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="custom-radio-check"></span>
                  </div>
                  <div className="payment-method-icon-box vnpay-icon-box">
                    <FaCreditCard />
                  </div>
                  <div className="payment-method-text">
                    <strong className="payment-name">Cổng Thanh Toán VNPay Sandbox</strong>
                    <span className="payment-desc">Hỗ trợ QR Pay, Thẻ ATM nội địa, Thẻ quốc tế Visa/Mastercard</span>
                  </div>
                  {paymentMethod === "BANK_TRANSFER" && (
                    <span className="selected-check-badge">
                      <FaCheck />
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (STICKY SUMMARY) */}
          <div className="checkout-summary-column">
            <div className="checkout-summary-card">
              <div className="checkout-summary-header">
                <h3 className="summary-title">Đơn Hàng Của Bạn</h3>
                <span className="summary-badge">{totalItems} món</span>
              </div>

              {/* Danh sách các món ăn cuộn gọn */}
              <div className="checkout-order-items-scroll">
                {cartItems.map((item, idx) => {
                  const itemId = item.cartItemId || item.productId || idx;
                  const itemImg = item.image?.startsWith("../")
                    ? item.image.substring(2)
                    : item.image || "img/default-product.png";
                  const itemName = item.productName || item.name || "Món ăn Deli";
                  const itemTotal = (item.price || 0) * (item.quantity || 1);

                  return (
                    <div key={itemId} className="checkout-item-row">
                      <div className="checkout-item-thumb">
                        <img
                          src={itemImg}
                          alt={itemName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80";
                          }}
                        />
                        <span className="checkout-qty-tag">x{item.quantity || 1}</span>
                      </div>
                      <div className="checkout-item-info">
                        <h4 className="checkout-item-name">{itemName}</h4>
                        {item.optionTags && item.optionTags.length > 0 && (
                          <div className="checkout-item-options">
                            {item.optionTags.map((opt, i) => (
                              <span key={i} className="mini-option-pill">
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="checkout-item-unit-price">{formatPrice(item.price || 0)}</span>
                      </div>
                      <div className="checkout-item-total">{formatPrice(itemTotal)}</div>
                    </div>
                  );
                })}
              </div>

              {/* Bảng tính chi phí */}
              <div className="checkout-breakdown">
                <div className="breakdown-row">
                  <span className="label">Tạm tính ({totalItems} phần):</span>
                  <span className="value">{formatPrice(totalPrice)}</span>
                </div>

                {appliedCoupon && (
                  <div className="breakdown-row discount-highlight-row">
                    <span className="label">
                      Voucher giảm giá <span className="coupon-code-pill">{appliedCoupon.code}</span>:
                    </span>
                    <span className="value discount-number">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="breakdown-row">
                  <span className="label">Phí giao hàng:</span>
                  <span className="value">
                    {shippingFee === 0 ? (
                      <div className="free-shipping-tag">
                        <s className="old-fee">{formatPrice(30000)}</s>
                        <span className="free-text">Miễn phí (Freeship)</span>
                      </div>
                    ) : (
                      <span className="fee-standard">{formatPrice(shippingFee ?? 30000)}</span>
                    )}
                  </span>
                </div>

                <div className="breakdown-divider"></div>

                <div className="breakdown-row total-pay-section">
                  <div className="total-title-box">
                    <span className="total-title">Tổng thanh toán:</span>
                    <small className="vat-notice">(Đã bao gồm VAT & ưu đãi)</small>
                  </div>
                  <span className="final-total-price">{formatPrice(finalPrice)}</span>
                </div>
              </div>

              {/* Nút hành động đặt hàng */}
              <button
                className="confirm-order-action-btn"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spin-icon" />
                    <span>Đang xử lý đơn hàng...</span>
                  </>
                ) : (
                  <>
                    <span>Xác Nhận Đặt Hàng</span>
                    <span className="btn-final-price">• {formatPrice(finalPrice)}</span>
                    <FaArrowRight className="btn-arrow-right" />
                  </>
                )}
              </button>

              {/* Cam kết tin cậy */}
              <div className="checkout-trust-box">
                <div className="trust-row">
                  <FaMotorcycle className="trust-icon" />
                  <span>Giao nhanh 30 phút nóng giòn tận nơi</span>
                </div>
                <div className="trust-row">
                  <FaShieldAlt className="trust-icon" />
                  <span>Bảo mật 100% thông tin & thanh toán an toàn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;