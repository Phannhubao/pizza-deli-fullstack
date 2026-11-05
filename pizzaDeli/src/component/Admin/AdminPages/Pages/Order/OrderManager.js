import "../../css/style.css";
import "../../css/dataTables.bootstrap5.min.css";
import "../../AdminManager.css";
import "./OrderManager.css";
import { useEffect, useState, useCallback, useMemo } from "react";
import { GetAllOrders, PutOrderStatus, GetPaymentList } from "../../../../../services/ApiService";
import { Icon } from "@mui/material";
import {
  FaShoppingBag,
  FaClock,
  FaUtensils,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaSyncAlt,
  FaEye,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaMapMarkerAlt
} from "react-icons/fa";
import Swal from "sweetalert2";
import ReactPaginate from "react-paginate";
import AdminOrderDetailModal from "./AdminOrderDetailModal";

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // fetch orders + payment status
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GetAllOrders();
      let ordersData = Array.isArray(response)
        ? response
        : response?.content || response?.data || [];

      // lấy danh sách payment
      const paymentResponse = await GetPaymentList();
      const paymentList = Array.isArray(paymentResponse.data)
        ? paymentResponse.data
        : [];

      const ordersWithPayment = ordersData.map((order) => {
        const orderId = order.id || order.orderId;
        const payments = paymentList.filter((p) => p.orderId === orderId);
        const hasPaid = payments.some((p) => p.status === true);

        return {
          ...order,
          id: orderId,
          orderId: orderId,
          paymentStatus: hasPaid ? "Đã thanh toán online" : "Thanh toán khi nhận hàng (COD)",
          hasPaidOnline: hasPaid
        };
      });

      // Sắp xếp đơn mới nhất lên đầu
      ordersWithPayment.sort((a, b) => (b.id || 0) - (a.id || 0));

      setOrders(ordersWithPayment);
      setFilteredOrders(ordersWithPayment);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      setOrders([]);
      setFilteredOrders([]);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refresh]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const processing = orders.filter((o) => o.status === "PROCESSING").length;
    const shipping = orders.filter((o) => o.status === "SHIPPING").length;
    const completed = orders.filter((o) => o.status === "COMPLETED").length;
    const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
    const revenue = orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    return { total, pending, processing, shipping, completed, cancelled, revenue };
  }, [orders]);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    // Search filter (ID, username, phone, address)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const idMatch = String(item.id || "").includes(term);
        const nameMatch = item.username?.toLowerCase().includes(term);
        const phoneMatch = item.phone_number?.toLowerCase().includes(term);
        const addressMatch = item.address?.toLowerCase().includes(term);
        return idMatch || nameMatch || phoneMatch || addressMatch;
      });
    }

    // Status tab filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Payment method filter
    if (paymentFilter !== "ALL") {
      if (paymentFilter === "ONLINE") {
        filtered = filtered.filter((item) => item.hasPaidOnline);
      } else if (paymentFilter === "COD") {
        filtered = filtered.filter((item) => !item.hasPaidOnline);
      }
    }

    setFilteredOrders(filtered);
    setCurrentPage(0);
  }, [searchTerm, statusFilter, paymentFilter, orders]);

  const formatCurrency = (amount) =>
    (Number(amount) || 0).toLocaleString("vi-VN") + " ₫";

  const getStatusBadge = (status) => {
    switch (status) {
      case "PROCESSING":
        return <span className="custom-badge badge-processing">👨‍🍳 Đang xử lý</span>;
      case "SHIPPING":
        return <span className="custom-badge badge-shipping" style={{ background: "#ec4899", color: "#fff" }}>🛵 Đang giao</span>;
      case "PENDING":
        return <span className="custom-badge badge-pending">⏳ Chờ duyệt</span>;
      case "COMPLETED":
        return <span className="custom-badge badge-completed">✅ Hoàn thành</span>;
      case "CANCELLED":
        return <span className="custom-badge badge-cancelled">❌ Đã hủy</span>;
      default:
        return <span className="custom-badge badge-default">{status || "Unknown"}</span>;
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || isNaN(Number(orderId))) {
      return Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "ID đơn hàng không hợp lệ",
      });
    }

    const currentOrder = orders.find((o) => Number(o.id) === Number(orderId) || Number(o.orderId) === Number(orderId));
    if (currentOrder && (currentOrder.status === "COMPLETED" || currentOrder.status === "CANCELLED")) {
      return Swal.fire({
        icon: "warning",
        title: "Không thể thay đổi",
        text: `Đơn hàng #${orderId} đã ${currentOrder.status === "COMPLETED" ? "HOÀN THÀNH" : "BỊ HỦY"}, không thể thay đổi trạng thái nữa!`,
        confirmButtonColor: "#f97316"
      });
    }

    const statusNames = {
      PENDING: "Chờ xác nhận",
      PROCESSING: "Đang xử lý / Chế biến",
      SHIPPING: "Đang giao hàng",
      COMPLETED: "Đã hoàn thành",
      CANCELLED: "Hủy đơn hàng"
    };

    const result = await Swal.fire({
      title: "Cập nhật trạng thái đơn?",
      html: `Đổi trạng thái đơn hàng <b>#${orderId}</b> sang <b style="color: #c9a66b;">${statusNames[newStatus] || newStatus}</b>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
    });

    if (result.isConfirmed) {
      try {
        await PutOrderStatus(Number(orderId), newStatus);
        setRefresh((prev) => !prev);

        // Cập nhật selectedOrder nếu modal đang mở
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }

        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: `Đã đổi trạng thái sang "${statusNames[newStatus] || newStatus}"`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: error.response?.data?.message || "Cập nhật trạng thái thất bại",
        });
      }
    }
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const offset = currentPage * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <main className="order-manager-pro-container">
      <div className="container-fluid px-4 py-4">
        {/* Top Header */}
        <div className="admin-page-hero d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h2 className="admin-hero-title mb-1">
              <FaShoppingBag className="me-2 text-warning" /> Quản Lý Đơn Hàng Pizza Deli
            </h2>
            <p className="admin-hero-subtitle text-muted mb-0">
              Theo dõi, xác nhận và chế biến các đơn đặt hàng từ khách hàng theo thời gian thực
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
              onClick={() => setRefresh((prev) => !prev)}
              disabled={loading}
            >
              <FaSyncAlt className={loading ? "fa-spin" : ""} />
              {loading ? "Đang tải..." : "Làm mới dữ liệu"}
            </button>
          </div>
        </div>

        {/* KPI Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="kpi-card kpi-total shadow-sm">
              <div className="kpi-icon bg-light text-dark">
                <FaShoppingBag />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Tổng Đơn Hàng</span>
                <h4 className="kpi-value">{stats.total}</h4>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="kpi-card kpi-pending shadow-sm">
              <div className="kpi-icon bg-warning-subtle text-warning">
                <FaClock />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Chờ Duyệt</span>
                <h4 className="kpi-value text-warning">{stats.pending}</h4>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="kpi-card kpi-processing shadow-sm">
              <div className="kpi-icon bg-primary-subtle text-primary">
                <FaUtensils />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Đang Nấu / Xử Lý</span>
                <h4 className="kpi-value text-primary">{stats.processing}</h4>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="kpi-card kpi-completed shadow-sm">
              <div className="kpi-icon bg-success-subtle text-success">
                <FaCheckCircle />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Hoàn Thành</span>
                <h4 className="kpi-value text-success">{stats.completed}</h4>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="kpi-card kpi-cancelled shadow-sm">
              <div className="kpi-icon bg-danger-subtle text-danger">
                <FaTimesCircle />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Đã Hủy</span>
                <h4 className="kpi-value text-danger">{stats.cancelled}</h4>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-sm-6">
            <div className="kpi-card kpi-revenue shadow-sm">
              <div className="kpi-icon bg-gold-subtle text-gold">
                <FaMoneyBillWave />
              </div>
              <div className="kpi-data">
                <span className="kpi-label">Doanh Thu Giao Xong</span>
                <h5 className="kpi-value text-success mb-0">{formatCurrency(stats.revenue)}</h5>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="admin-card mb-4 shadow-sm">
          <div className="status-tabs-container">
            <button
              className={`status-tab-btn ${statusFilter === "ALL" ? "active" : ""}`}
              onClick={() => setStatusFilter("ALL")}
            >
              Tất cả <span className="tab-counter">{stats.total}</span>
            </button>
            <button
              className={`status-tab-btn tab-pending ${statusFilter === "PENDING" ? "active" : ""}`}
              onClick={() => setStatusFilter("PENDING")}
            >
              Chờ xác nhận <span className="tab-counter">{stats.pending}</span>
            </button>
            <button
              className={`status-tab-btn tab-processing ${statusFilter === "PROCESSING" ? "active" : ""}`}
              onClick={() => setStatusFilter("PROCESSING")}
            >
              Đang nấu <span className="tab-counter">{stats.processing}</span>
            </button>
            <button
              className={`status-tab-btn tab-shipping ${statusFilter === "SHIPPING" ? "active" : ""}`}
              onClick={() => setStatusFilter("SHIPPING")}
            >
              Đang giao <span className="tab-counter">{stats.shipping}</span>
            </button>
            <button
              className={`status-tab-btn tab-completed ${statusFilter === "COMPLETED" ? "active" : ""}`}
              onClick={() => setStatusFilter("COMPLETED")}
            >
              Hoàn thành <span className="tab-counter">{stats.completed}</span>
            </button>
            <button
              className={`status-tab-btn tab-cancelled ${statusFilter === "CANCELLED" ? "active" : ""}`}
              onClick={() => setStatusFilter("CANCELLED")}
            >
              Đã hủy <span className="tab-counter">{stats.cancelled}</span>
            </button>
          </div>

          {/* Search Controls */}
          <div className="p-3 border-top d-flex flex-wrap gap-3 align-items-center justify-content-between bg-light rounded-bottom">
            <div className="search-box-wrapper flex-grow-1" style={{ maxWidth: "480px" }}>
              <FaSearch className="search-icon text-muted" />
              <input
                type="text"
                className="form-control ps-5 py-2 search-input-pro"
                placeholder="Tìm theo Mã đơn (#20), Tên khách, SĐT, Địa chỉ..."
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
              <span className="small text-muted fw-semibold">Thanh toán:</span>
              <select
                className="form-select form-select-sm py-2 filter-select-pro"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                style={{ width: "180px" }}
              >
                <option value="ALL">Tất cả hình thức</option>
                <option value="ONLINE">Đã thanh toán online</option>
                <option value="COD">Thanh toán COD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="admin-card shadow-sm overflow-hidden mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 pro-order-table">
              <thead className="table-head-pro">
                <tr>
                  <th style={{ width: "80px" }}>Mã Đơn</th>
                  <th>Khách Hàng & Liên Hệ</th>
                  <th>Địa Chỉ Giao Hàng</th>
                  <th style={{ width: "130px" }}>Ngày Đặt</th>
                  <th style={{ width: "120px" }}>Tổng Tiền</th>
                  <th style={{ width: "160px" }}>Thanh Toán</th>
                  <th style={{ width: "150px" }}>Trạng Thái</th>
                  <th style={{ width: "180px" }} className="text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((item) => (
                    <tr
                      key={item.id}
                      className="order-row-pro"
                      onClick={() => handleOpenDetail(item)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <span className="order-id-badge">#{item.id}</span>
                      </td>

                      <td>
                        <div className="fw-bold text-dark">{item.username || "Chưa có tên"}</div>
                        {item.phone_number && (
                          <div className="small text-muted d-flex align-items-center gap-1 mt-1">
                            <FaPhoneAlt className="text-success" style={{ fontSize: "11px" }} />
                            <span>{item.phone_number}</span>
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="address-cell text-truncate" style={{ maxWidth: "240px" }} title={item.address}>
                          <FaMapMarkerAlt className="text-danger me-1" style={{ fontSize: "12px" }} />
                          <span>{item.address || "N/A"}</span>
                        </div>
                      </td>

                      <td>
                        <span className="small text-muted">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "N/A"}
                        </span>
                      </td>

                      <td>
                        <span className="fw-bold text-dark">
                          {formatCurrency(item.totalPrice)}
                        </span>
                        {item.voucherCode && (
                          <div>
                            <span className="badge bg-success-subtle text-success border border-success" style={{ fontSize: "10px" }}>
                              {item.voucherCode}
                            </span>
                          </div>
                        )}
                      </td>

                      <td>
                        {item.hasPaidOnline ? (
                          <span className="payment-badge payment-online">
                            💳 VNPay Online
                          </span>
                        ) : (
                          <span className="payment-badge payment-cod">
                            🚚 Tiền mặt (COD)
                          </span>
                        )}
                      </td>

                      <td>
                        {getStatusBadge(item.status)}
                      </td>

                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 px-2 py-1 shadow-sm"
                            title="Xem chi tiết đơn hàng và Topping"
                            onClick={() => handleOpenDetail(item)}
                          >
                            <FaEye /> Chi tiết
                          </button>

                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="form-select form-select-sm py-1 status-select-quick"
                            style={{
                              width: "125px",
                              fontSize: "12px",
                              opacity: item.status === "COMPLETED" || item.status === "CANCELLED" ? 0.65 : 1,
                              cursor: item.status === "COMPLETED" || item.status === "CANCELLED" ? "not-allowed" : "pointer"
                            }}
                            disabled={item.status === "COMPLETED" || item.status === "CANCELLED"}
                            title={
                              item.status === "COMPLETED" || item.status === "CANCELLED"
                                ? "Đơn hàng đã kết thúc, không thể thay đổi trạng thái"
                                : "Thay đổi trạng thái"
                            }
                          >
                            <option value="PENDING">Chờ duyệt</option>
                            <option value="PROCESSING">Đang nấu</option>
                            <option value="SHIPPING">Đang giao</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Hủy đơn</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      <div className="empty-orders-state py-4">
                        <Icon style={{ fontSize: "48px", color: "#cbd5e1" }}>receipt_long</Icon>
                        <h5 className="mt-2 text-secondary">Không tìm thấy đơn hàng nào</h5>
                        <p className="small text-muted">Hãy thử thay đổi từ khóa tìm kiếm hoặc chuyển tab trạng thái khác.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
              <span className="small text-muted">
                Hiển thị <strong>{offset + 1}</strong> - <strong>{Math.min(offset + itemsPerPage, filteredOrders.length)}</strong> trên tổng số <strong>{filteredOrders.length}</strong> đơn
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
      </div>

      {/* Admin Order Detail Modal */}
      <AdminOrderDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
      />
    </main>
  );
}
