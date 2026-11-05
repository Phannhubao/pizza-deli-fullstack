import React, { useState, useEffect, useMemo } from "react";
import { 
  Form, 
  Button, 
  Container, 
  Card, 
  Spinner, 
  Row, 
  Col, 
  Modal,
  Badge
} from "react-bootstrap";
import { 
  FaEnvelope, 
  FaBirthdayCake, 
  FaMapMarkerAlt, 
  FaFilePdf, 
  FaPizzaSlice, 
  FaCheckCircle, 
  FaClock, 
  FaTruck, 
  FaTimesCircle, 
  FaCrown, 
  FaCoins, 
  FaEye, 
  FaEdit, 
  FaReceipt,
  FaCheck,
  FaTimes
} from "react-icons/fa";
import Swal from "sweetalert2";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";
import { useNavigate } from "react-router-dom";
import { GetUserByID, PutUser, GetOrdersByUserID, GetDetailListByOrder, GetPaymentList } from "../../services/ApiService";
import { normalizeImagePath } from "../../context/CartContext";
import "../../css/profile.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", birthDate: "", address: "" });
  
  // Tab lọc đơn hàng: ALL, PENDING, PROCESSING, DELIVERED, COMPLETED, CANCELLED
  const [activeTab, setActiveTab] = useState("ALL");

  // State cho modal và chi tiết đơn hàng
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.id || userData?.userId;

  // Tải thông tin user & danh sách đơn hàng
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        if (!userId) {
          navigate("/login");
          return;
        }
        const userRes = await GetUserByID(userId);
        const u = userRes?.data || userRes;
        setUser(u);
        setEditFormData({
          name: u?.name || "",
          birthDate: u?.birthDate ? u.birthDate.split("T")[0] : "",
          address: u?.address || ""
        });

        const [ordersRes, paymentRes] = await Promise.all([
          GetOrdersByUserID(userId),
          GetPaymentList().catch(() => ({ data: [] }))
        ]);

        const orderList = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data || []);
        const paymentList = Array.isArray(paymentRes?.data) ? paymentRes.data : Array.isArray(paymentRes) ? paymentRes : [];

        // Map phương thức thanh toán vào đơn hàng
        const mappedOrders = orderList.map((order) => {
          const oId = order.id || order.orderId;
          const payment = paymentList.find((p) => p.orderId === oId || p.orderPayment?.orderId === oId);
          const isPaidOnline = payment?.Status === true || payment?.status === true;

          return {
            ...order,
            hasPaidOnline: isPaidOnline,
            paymentMethod: isPaidOnline ? "VNPay Online" : "COD"
          };
        });

        // Sắp xếp đơn hàng mới nhất lên đầu
        const sorted = [...mappedOrders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setOrders(sorted);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, navigate]);

  // Thống kê khách hàng VIP
  const userStats = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === "COMPLETED" || o.status === "DELIVERED"
    ).length;
    const totalSpent = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    let tierName = "THÀNH VIÊN MỚI";
    let tierColor = "#94a3b8";
    if (totalSpent >= 2000000 || completedOrders >= 8) {
      tierName = "DIAMOND VIP";
      tierColor = "#06b6d4";
    } else if (totalSpent >= 800000 || completedOrders >= 3) {
      tierName = "GOLD MEMBER";
      tierColor = "#f59e0b";
    } else if (completedOrders >= 1) {
      tierName = "SILVER MEMBER";
      tierColor = "#cbd5e1";
    }

    return { totalOrders, completedOrders, totalSpent, tierName, tierColor };
  }, [orders]);

  // Lọc đơn hàng theo tab
  const filteredOrders = useMemo(() => {
    if (activeTab === "ALL") return orders;
    return orders.filter((o) => {
      const st = (o.status || "").toUpperCase();
      if (activeTab === "PROCESSING") return st === "PROCESSING" || st === "PENDING";
      if (activeTab === "DELIVERING") return st === "SHIPPED" || st === "DELIVERING";
      if (activeTab === "COMPLETED") return st === "COMPLETED" || st === "DELIVERED";
      if (activeTab === "CANCELLED") return st === "CANCELLED";
      return true;
    });
  }, [orders, activeTab]);

  // Reset trang khi đổi tab lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Phân trang
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Mở modal chi tiết đơn
  const handleShowOrderDetail = async (order) => {
    setSelectedOrder(order);
    setDetailLoading(true);
    setShowOrderDetail(true);
    
    try {
      const detailRes = await GetDetailListByOrder(order.orderId);
      if (detailRes && detailRes.data) {
        setOrderDetails(Array.isArray(detailRes.data) ? detailRes.data : []);
      } else if (Array.isArray(detailRes)) {
        setOrderDetails(detailRes);
      } else {
        setOrderDetails([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", err);
      Swal.fire("Lỗi", "Không thể tải chi tiết đơn hàng", "error");
      setOrderDetails([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseOrderDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
    setOrderDetails([]);
  };

  // Cập nhật thông tin profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = { ...user, ...editFormData };
      const res = await PutUser(userId, updatedUser);
      if (res.status === 200 || res) {
        setUser(updatedUser);
        setEditMode(false);
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Thông tin tài khoản đã được cập nhật thành công.",
          timer: 1800,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật profile:", err);
      Swal.fire("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại!", "error");
    }
  };

  // Format giá VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(price || 0)
      .replace("₫", " ₫");
  };

  // Badge trạng thái
  const getStatusBadge = (status) => {
    const st = (status || "").toUpperCase();
    switch (st) {
      case "COMPLETED":
      case "DELIVERED":
        return <span className="status-pill completed"><FaCheckCircle /> Hoàn tất</span>;
      case "SHIPPED":
      case "DELIVERING":
        return <span className="status-pill shipped"><FaTruck /> Đang giao</span>;
      case "PROCESSING":
        return <span className="status-pill processing"><FaClock /> Đang làm bánh</span>;
      case "PENDING":
        return <span className="status-pill pending"><FaClock /> Chờ xác nhận</span>;
      case "CANCELLED":
        return <span className="status-pill cancelled"><FaTimesCircle /> Đã hủy</span>;
      default:
        return <span className="status-pill processing">{status}</span>;
    }
  };

  // Tính tổng tiền từ orderDetails
  const calculateTotalFromDetails = (details) => {
    if (!Array.isArray(details)) return 0;
    return details.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
  };

  // =========================================================================
  // XUẤT HÓA ĐƠN ĐIỆN TỬ & PHIẾU GIAO HÀNG (E-INVOICE PDF CAO CẤP)
  // Thiết kế tông màu Sang trọng, Chuẩn thương hiệu Pizza Deli
  // =========================================================================
  const handleExportPDF = async () => {
    if (!selectedOrder || !Array.isArray(orderDetails) || orderDetails.length === 0) {
      Swal.fire("Lỗi", "Không có dữ liệu chi tiết để xuất hóa đơn", "error");
      return;
    }

    setExporting(true);

    try {
      const subtotal = calculateTotalFromDetails(orderDetails);
      const discount = selectedOrder.discountAmount || 0;
      const finalPrice = selectedOrder.totalPrice || (subtotal - discount);
      const orderDateStr = new Date(selectedOrder.createdAt).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const exportDateStr = new Date().toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Xây dựng template hóa đơn nhà hàng chuẩn ẩm thực
      const invoiceHTML = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 32px 36px; max-width: 800px; margin: 0 auto; color: #1e293b; background: #ffffff;">
          
          <!-- HEADER THƯƠNG HIỆU PIZZA DELI -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #f59e0b;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 26px;">🍕</span>
                <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #b45309; letter-spacing: -0.5px;">PIZZA DELI</h1>
              </div>
              <p style="margin: 4px 0 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1.5px;">
                Artisan Handcrafted Pizza & Italian Cuisine
              </p>
              <div style="margin-top: 8px; font-size: 11px; color: #475569; line-height: 1.5;">
                <p style="margin: 0;">📍 123 Đường Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
                <p style="margin: 0;">📞 Hotline CSKH: <strong>1900 1234</strong> • 🌐 Website: <strong>www.pizzadeli.vn</strong></p>
                <p style="margin: 0;">📧 Email: cskh@pizzadeli.vn • MST: 0314567890</p>
              </div>
            </div>

            <!-- MÃ HÓA ĐƠN & PHIẾU GIAO -->
            <div style="text-align: right; background: #fef3c7; border: 1px solid #fde68a; padding: 12px 18px; border-radius: 12px;">
              <span style="display: block; font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">
                HÓA ĐƠN BÁN HÀNG
              </span>
              <span style="display: block; font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                #PD-${selectedOrder.orderId}
              </span>
              <span style="display: block; font-size: 11px; color: #64748b; margin-top: 4px;">
                Ngày in: ${exportDateStr}
              </span>
            </div>
          </div>

          <!-- THÔNG TIN ĐƠN HÀNG VÀ BÊN NHẬN HÀNG (2 CỘT HIỆN ĐẠI) -->
          <div style="display: flex; gap: 18px; margin: 22px 0;">
            <!-- Cột người nhận -->
            <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px;">
              <h3 style="margin: 0 0 10px; font-size: 12px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">
                👤 THÔNG TIN KHÁCH HÀNG
              </h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Họ tên:</strong> ${selectedOrder.username || user?.name || "Khách hàng Pizza Deli"}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Số điện thoại:</strong> ${selectedOrder.phone_number || "Chưa cập nhật"}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Địa chỉ giao:</strong> ${selectedOrder.address || "Nhận tại nhà hàng"}</p>
              ${user?.email ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Email:</strong> ${user.email}</p>` : ""}
            </div>

            <!-- Cột thông tin đơn -->
            <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px;">
              <h3 style="margin: 0 0 10px; font-size: 12px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 CHI TIẾT GIAO DỊCH
              </h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Thời gian đặt món:</strong> ${orderDateStr}</p>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong>Hình thức thanh toán:</strong> 
                <span style="color: #0284c7; font-weight: 600;">
                  ${selectedOrder.paymentMethod ? selectedOrder.paymentMethod : "Thanh toán khi nhận hàng (COD)"}
                </span>
              </p>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong>Trạng thái:</strong> 
                <span style="background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px;">
                  ${(selectedOrder.status || "COMPLETED").toUpperCase()}
                </span>
              </p>
              ${selectedOrder.voucherCode ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Voucher ưu đãi:</strong> <span style="color: #e11d48; font-weight: 700;">${selectedOrder.voucherCode}</span></p>` : ""}
            </div>
          </div>

          <!-- BẢNG DANH SÁCH MÓN ĂN -->
          <div style="margin-top: 10px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
              <thead>
                <tr style="background: #1e2330; color: #ffffff;">
                  <th style="padding: 10px 12px; text-align: center; border-radius: 8px 0 0 0; width: 45px;">STT</th>
                  <th style="padding: 10px 12px; text-align: left;">MÓN ĂN & TÙY CHỌN BÁNH</th>
                  <th style="padding: 10px 12px; text-align: center; width: 70px;">SỐ LƯỢNG</th>
                  <th style="padding: 10px 12px; text-align: right; width: 110px;">ĐƠN GIÁ</th>
                  <th style="padding: 10px 12px; text-align: right; border-radius: 0 8px 0 0; width: 120px;">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody>
                ${orderDetails.map((item, idx) => `
                  <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? "#ffffff" : "#fbfcfe"};">
                    <td style="padding: 12px; text-align: center; color: #64748b; font-weight: 600;">${idx + 1}</td>
                    <td style="padding: 12px;">
                      <strong style="color: #0f172a; font-size: 13px;">${item.produc_name || "Món ăn Deli"}</strong>
                      ${item.options ? `
                        <div style="margin-top: 4px;">
                          ${item.options.split("|").map(opt => `
                            <span style="display: inline-block; background: #fef3c7; color: #92400e; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; margin-right: 4px; margin-bottom: 2px;">
                              ${opt.trim()}
                            </span>
                          `).join("")}
                        </div>
                      ` : ""}
                      ${item.note ? `
                        <div style="margin-top: 3px; font-size: 11px; color: #64748b; font-style: italic;">
                          Ghi chú: ${item.note}
                        </div>
                      ` : ""}
                    </td>
                    <td style="padding: 12px; text-align: center; font-weight: 700; color: #0f172a;">
                      ${item.quantity || 1}
                    </td>
                    <td style="padding: 12px; text-align: right; color: #475569;">
                      ${Number(item.price || 0).toLocaleString("vi-VN")} ₫
                    </td>
                    <td style="padding: 12px; text-align: right; font-weight: 700; color: #0f172a;">
                      ${Number((item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")} ₫
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <!-- BẢNG TỔNG TIỀN THANH TOÁN -->
          <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
            <div style="width: 320px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12.5px; color: #475569;">
                <span>Tạm tính món:</span>
                <span>${subtotal.toLocaleString("vi-VN")} ₫</span>
              </div>
              ${discount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12.5px; color: #16a34a; font-weight: 600;">
                  <span>Giảm giá Voucher:</span>
                  <span>-${discount.toLocaleString("vi-VN")} ₫</span>
                </div>
              ` : ""}
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12.5px; color: #475569;">
                <span>Phí giao hàng:</span>
                <span style="color: #16a34a; font-weight: 600;">Miễn phí (Freeship)</span>
              </div>
              <div style="border-top: 2px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 13.5px; font-weight: 800; color: #0f172a; text-transform: uppercase;">TỔNG THANH TOÁN:</span>
                <span style="font-size: 18px; font-weight: 800; color: #b45309;">
                  ${Number(finalPrice).toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div style="text-align: right; font-size: 10.5px; color: #94a3b8; margin-top: 4px;">
                (Đã bao gồm 8% thuế GTGT & phí phục vụ)
              </div>
            </div>
          </div>

          <!-- CHÂN TRANG CẢM ƠN VÀ CHỮ KÝ -->
          <div style="margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 1px dashed #f59e0b; border-radius: 10px; padding: 12px 18px; text-align: center;">
              <p style="margin: 0; font-size: 12.5px; font-weight: 600; color: #92400e;">
                ❤️ Cảm ơn quý khách đã tin chọn Pizza Deli! Chúc quý khách bữa ăn ngon miệng và trọn vẹn!
              </p>
              <p style="margin: 4px 0 0; font-size: 11px; color: #b45309;">
                Món ăn được chế biến thủ công và bảo quản trong túi giữ nhiệt để luôn nóng hổi khi đến tay bạn.
              </p>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 40px; padding: 0 40px; text-align: center;">
              <div>
                <p style="margin: 0 0 50px; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase;">
                  NGƯỜI GIAO HÀNG
                </p>
                <div style="border-top: 1px solid #94a3b8; width: 140px; margin: 0 auto;"></div>
                <small style="color: #94a3b8; font-size: 10px;">(Ký và ghi rõ họ tên)</small>
              </div>

              <div>
                <p style="margin: 0 0 50px; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase;">
                  KHÁCH HÀNG NHẬN BÁNH
                </p>
                <div style="border-top: 1px solid #94a3b8; width: 140px; margin: 0 auto;"></div>
                <small style="color: #94a3b8; font-size: 10px;">(Ký và ghi rõ họ tên)</small>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #94a3b8;">
              Mã tra cứu hóa đơn điện tử: <strong>PD-EINV-${selectedOrder.orderId}-${Date.now().toString().slice(-6)}</strong> • Hệ thống lưu trữ hóa đơn Pizza Deli
            </div>
          </div>

        </div>
      `;

      const element = document.createElement("div");
      element.innerHTML = invoiceHTML;

      const opt = {
        margin: [8, 8, 8, 8],
        filename: `HoaDon-PizzaDeli-DH${selectedOrder.orderId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(opt).from(element).save();

      Swal.fire({
        title: "Xuất hóa đơn thành công!",
        text: `Hóa đơn đơn hàng #${selectedOrder.orderId} đã được tải về máy của bạn.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Lỗi xuất hóa đơn PDF:", err);
      Swal.fire("Lỗi", "Không thể xuất hóa đơn PDF. Vui lòng thử lại!", "error");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-wrapper d-flex align-items-center justify-content-center">
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" style={{ width: "3rem", height: "3rem" }} />
          <h5 className="mt-3 text-dark fw-bold">Đang tải hồ sơ ẩm thực của bạn...</h5>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page-wrapper">
        <Container className="text-center py-5">
          <h4>Không tìm thấy thông tin tài khoản</h4>
          <Button variant="warning" onClick={() => navigate("/login")} className="mt-3">
            Đăng nhập lại
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      <Container className="profile-container">
        <Row>
          {/* =========================================================================
              CỘT TRÁI: THẺ HỘI VIÊN VIP & THÔNG TIN CÁ NHÂN
              ========================================================================= */}
          <Col lg={4} className="mb-4">
            <Card className="vip-profile-card">
              {/* Thẻ VIP Banner */}
              <div className="vip-card-banner">
                <div className="vip-chip-badge">
                  <FaCrown /> {userStats.tierName}
                </div>

                <div className="vip-avatar-container">
                  <div className="vip-avatar-circle">
                    <FaPizzaSlice />
                  </div>
                  <span className="vip-status-online" title="Đang trực tuyến"></span>
                </div>

                <h4 className="vip-user-name">{user.name || "Khách Hàng"}</h4>
                <p className="vip-user-email">{user.email}</p>
              </div>

              {/* Thống kê nhanh đơn hàng & chi tiêu */}
              <div className="vip-stats-bar">
                <div className="vip-stat-item">
                  <div className="vip-stat-val">{userStats.totalOrders}</div>
                  <div className="vip-stat-label">Tổng đơn hàng</div>
                </div>
                <div className="vip-stat-item">
                  <div className="vip-stat-val gold">{formatPrice(userStats.totalSpent)}</div>
                  <div className="vip-stat-label">Tổng chi tiêu</div>
                </div>
              </div>

              {/* Chi tiết tài khoản */}
              <div className="vip-details-body">
                {!editMode ? (
                  <div className="profile-info-list">
                    <div className="info-tile">
                      <div className="info-tile-icon"><FaEnvelope /></div>
                      <div className="info-tile-content">
                        <label>Địa chỉ Email</label>
                        <p>{user.email || "Chưa cập nhật"}</p>
                      </div>
                    </div>

                    <div className="info-tile">
                      <div className="info-tile-icon"><FaBirthdayCake /></div>
                      <div className="info-tile-content">
                        <label>Ngày sinh (Nhận quà ưu đãi)</label>
                        <p>{user.birthDate ? new Date(user.birthDate).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</p>
                      </div>
                    </div>

                    <div className="info-tile">
                      <div className="info-tile-icon"><FaMapMarkerAlt /></div>
                      <div className="info-tile-content">
                        <label>Địa chỉ giao hàng</label>
                        <p>{user.address || "Chưa cập nhật địa chỉ"}</p>
                      </div>
                    </div>

                    <div className="info-tile">
                      <div className="info-tile-icon"><FaCoins /></div>
                      <div className="info-tile-content">
                        <label>Trạng thái tài khoản</label>
                        <div>
                          <span className={`status-indicator ${(user.status || "ACTIVE").toLowerCase()}`}>
                            ● {user.status || "Hoạt động"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="btn-pd-edit"
                      onClick={() => setEditMode(true)}
                    >
                      <FaEdit /> Chỉnh sửa thông tin
                    </button>
                  </div>
                ) : (
                  /* Form Chỉnh sửa thông tin */
                  <Form onSubmit={handleSaveProfile} className="mt-1">
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-secondary">Họ và tên</Form.Label>
                      <Form.Control
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-secondary">Ngày sinh</Form.Label>
                      <Form.Control
                        type="date"
                        value={editFormData.birthDate}
                        onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-secondary">Địa chỉ nhận hàng</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        placeholder="Nhập địa chỉ nhận bánh thường xuyên..."
                      />
                    </Form.Group>

                    <div className="d-flex gap-2 mt-3">
                      <Button variant="success" type="submit" className="btn-pd-save flex-grow-1">
                        <FaCheck className="me-1" /> Lưu thay đổi
                      </Button>
                      <Button variant="outline-secondary" onClick={() => setEditMode(false)}>
                        <FaTimes className="me-1" /> Hủy
                      </Button>
                    </div>
                  </Form>
                )}
              </div>
            </Card>
          </Col>

          {/* =========================================================================
              CỘT PHẢI: LỊCH SỬ ĐẶT MÓN & QUẢN LÝ ĐƠN HÀNG
              ========================================================================= */}
          <Col lg={8}>
            <div className="orders-management-card">
              {/* Header */}
              <div className="orders-hero-header">
                <div>
                  <h3 className="orders-hero-title">
                    <span className="food-icon">🍕</span> Lịch Sử Đặt Món
                  </h3>
                  <small className="text-muted">Theo dõi tiến trình và quản lý các đơn hàng bạn đã đặt</small>
                </div>
                <Badge bg="warning" text="dark" className="px-3 py-2 fs-6 rounded-pill">
                  {orders.length} đơn hàng
                </Badge>
              </div>

              {/* Bộ lọc đơn hàng theo trạng thái */}
              <div className="orders-filter-tabs">
                <button
                  type="button"
                  className={`order-tab-btn ${activeTab === "ALL" ? "active" : ""}`}
                  onClick={() => setActiveTab("ALL")}
                >
                  Tất cả <span className="tab-count">{orders.length}</span>
                </button>
                <button
                  type="button"
                  className={`order-tab-btn ${activeTab === "PROCESSING" ? "active" : ""}`}
                  onClick={() => setActiveTab("PROCESSING")}
                >
                  Đang làm bánh / Chờ <span className="tab-count">{orders.filter(o => o.status === "PROCESSING" || o.status === "PENDING").length}</span>
                </button>
                <button
                  type="button"
                  className={`order-tab-btn ${activeTab === "DELIVERING" ? "active" : ""}`}
                  onClick={() => setActiveTab("DELIVERING")}
                >
                  Đang giao <span className="tab-count">{orders.filter(o => o.status === "SHIPPED" || o.status === "DELIVERING").length}</span>
                </button>
                <button
                  type="button"
                  className={`order-tab-btn ${activeTab === "COMPLETED" ? "active" : ""}`}
                  onClick={() => setActiveTab("COMPLETED")}
                >
                  Đã hoàn tất <span className="tab-count">{orders.filter(o => o.status === "COMPLETED" || o.status === "DELIVERED").length}</span>
                </button>
                <button
                  type="button"
                  className={`order-tab-btn ${activeTab === "CANCELLED" ? "active" : ""}`}
                  onClick={() => setActiveTab("CANCELLED")}
                >
                  Đã hủy <span className="tab-count">{orders.filter(o => o.status === "CANCELLED").length}</span>
                </button>
              </div>

              {/* Danh sách đơn hàng */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: "50px", opacity: 0.6 }} className="mb-2">📦</div>
                  <h5 className="text-secondary fw-bold">Không có đơn hàng nào trong mục này</h5>
                  <p className="text-muted small">Hãy khám phá thực đơn Pizza Deli hảo hạng ngay nhé!</p>
                  <Button variant="warning" onClick={() => navigate("/")} className="mt-2 fw-semibold px-4">
                    Xem Menu Đặt Món
                  </Button>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="orders-table-modern">
                      <thead>
                        <tr>
                          <th>Đơn hàng</th>
                          <th>Ngày đặt</th>
                          <th>Địa chỉ giao</th>
                          <th>Trạng thái</th>
                          <th>Tổng tiền</th>
                          <th className="text-end">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentOrders.map((order) => (
                          <tr key={order.orderId} onClick={() => handleShowOrderDetail(order)}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="order-thumb-wrapper">
                                  <img
                                    src={normalizeImagePath(order.image || "img/default-product.png")}
                                    alt="Pizza"
                                    onError={(e) => { e.target.src = "img/default-product.png"; }}
                                  />
                                </div>
                                <div>
                                  <span className="order-id-badge">#{order.orderId}</span>
                                  <div className="text-muted" style={{ fontSize: "11px" }}>
                                    {order.quantity || 1} món
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="text-secondary" style={{ fontSize: "13px" }}>
                              {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                              })}
                            </td>

                            <td style={{ maxWidth: "180px" }}>
                              <span className="text-truncate d-inline-block" style={{ maxWidth: "180px", fontSize: "12.5px" }} title={order.address}>
                                {order.address || "Nhận tại cửa hàng"}
                              </span>
                            </td>

                            <td>
                              {getStatusBadge(order.status)}
                            </td>

                            <td>
                              <span className="order-total-price">
                                {formatPrice(order.totalPrice)}
                              </span>
                            </td>

                            <td className="text-end">
                              <button
                                type="button"
                                className="btn-view-order"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowOrderDetail(order);
                                }}
                              >
                                <FaEye /> Xem đơn
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Phân trang */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      >
                        « Trước
                      </Button>
                      <span className="text-muted small px-2">
                        Trang <strong>{currentPage}</strong> / {totalPages}
                      </span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      >
                        Sau »
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* =========================================================================
          MODAL CHI TIẾT ĐƠN HÀNG & NÚT XUẤT HÓA ĐƠN PDF
          ========================================================================= */}
      <Modal 
        show={showOrderDetail} 
        onHide={handleCloseOrderDetail} 
        size="lg" 
        centered
      >
        <Modal.Header closeButton className="order-modal-header">
          <Modal.Title>
            <FaReceipt className="text-warning" /> Chi Tiết Đơn Hàng #{selectedOrder?.orderId}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          {detailLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="warning" />
              <p className="mt-2 text-muted">Đang tải món ăn trong đơn hàng...</p>
            </div>
          ) : (
            <>
              {/* Tóm tắt đơn */}
              {selectedOrder && (
                <div className="modal-summary-box">
                  <Row className="g-2">
                    <Col sm={6}>
                      <div className="text-secondary small">Người nhận:</div>
                      <div className="fw-bold text-dark">{selectedOrder.username || user?.name} ({selectedOrder.phone_number})</div>
                      <div className="text-secondary small mt-2">Địa chỉ nhận hàng:</div>
                      <div className="text-dark small">{selectedOrder.address}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-secondary small">Thời gian đặt món:</div>
                      <div className="fw-semibold text-dark">
                        {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                      </div>
                      <div className="text-secondary small mt-2">Trạng thái & Thanh toán:</div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        {getStatusBadge(selectedOrder.status)}
                        <span className={`badge ${selectedOrder.hasPaidOnline || selectedOrder.paymentMethod === "VNPay Online" ? "bg-primary-subtle text-primary border border-primary-subtle" : "bg-light text-dark border"}`}>
                          {selectedOrder.hasPaidOnline || selectedOrder.paymentMethod === "VNPay Online" ? "💳 VNPay Online" : "🚚 Tiền mặt (COD)"}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Danh sách món ăn */}
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <span>🍕</span> Danh Sách Món Ăn ({orderDetails.length} món)
              </h6>

              {orderDetails.length === 0 ? (
                <p className="text-muted text-center py-3">Không tìm thấy chi tiết món ăn</p>
              ) : (
                <div className="modal-products-list">
                  {orderDetails.map((item, idx) => (
                    <div key={item.detailId || item.productId || idx} className="modal-product-item">
                      <img
                        src={normalizeImagePath(item.image || "img/default-product.png")}
                        alt={item.produc_name}
                        className="modal-product-thumb"
                        onError={(e) => { e.target.src = "img/default-product.png"; }}
                      />

                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong className="text-dark fs-6">{item.produc_name || "Món ăn Deli"}</strong>
                            <span className="text-warning fw-bold ms-2">x{item.quantity || 1}</span>
                          </div>
                          <div className="fw-bold text-danger">
                            {formatPrice((item.price || 0) * (item.quantity || 1))}
                          </div>
                        </div>

                        {/* Tùy chọn size, đế bánh, topping */}
                        {item.options && (
                          <div className="mt-1">
                            {item.options.split("|").map((opt, i) => (
                              <span key={i} className="modal-opt-tag">
                                {opt.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Ghi chú */}
                        {item.note && (
                          <div className="small text-muted fst-italic mt-1">
                            Ghi chú: {item.note}
                          </div>
                        )}

                        {/* Nút đánh giá nếu đơn hoàn tất */}
                        {(selectedOrder?.status === "COMPLETED" || selectedOrder?.status === "DELIVERED") && item.productId && (
                          <div className="mt-2">
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="text-dark fw-semibold py-0 px-2"
                              style={{ fontSize: "11px", borderRadius: "20px" }}
                              onClick={() => {
                                handleCloseOrderDetail();
                                navigate(`/product/${item.productId}`);
                              }}
                            >
                              ⭐ Đánh giá món này
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tổng cộng */}
              <div className="modal-receipt-total">
                <span className="fw-bold text-dark fs-6">Tổng Thanh Toán:</span>
                <span className="fw-bold text-danger fs-5">
                  {formatPrice(selectedOrder?.totalPrice || calculateTotalFromDetails(orderDetails))}
                </span>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-light d-flex justify-content-between">
          <Button variant="secondary" onClick={handleCloseOrderDetail}>
            Đóng
          </Button>

          <button
            type="button"
            className="btn-export-pdf-gold"
            onClick={handleExportPDF}
            disabled={exporting || !selectedOrder || orderDetails.length === 0}
          >
            {exporting ? (
              <>
                <Spinner animation="border" size="sm" /> Đang tạo PDF...
              </>
            ) : (
              <>
                <FaFilePdf /> Xuất Hóa Đơn PDF
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfilePage;