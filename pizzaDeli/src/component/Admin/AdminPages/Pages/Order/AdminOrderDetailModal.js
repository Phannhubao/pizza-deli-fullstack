import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Badge, Spinner } from "react-bootstrap";
import { FaPhoneAlt, FaMapMarkerAlt, FaUser, FaMoneyBillWave, FaReceipt, FaPrint, FaCheck, FaTimes, FaPizzaSlice } from "react-icons/fa";
import Swal from "sweetalert2";
import { GetDetailListByOrder } from "../../../../../services/ApiService";

export default function AdminOrderDetailModal({ show, onHide, order, onStatusChange }) {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (show && order?.id) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const res = await GetDetailListByOrder(order.id);
          const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          setDetails(data);
        } catch (err) {
          console.error("Lỗi khi tải chi tiết đơn hàng:", err);
          setDetails([]);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    } else {
      setDetails([]);
    }
  }, [show, order]);

  if (!order) return null;

  const formatPrice = (amount) =>
    (Number(amount) || 0).toLocaleString("vi-VN") + " ₫";

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <Badge bg="warning" text="dark" className="px-3 py-2 fs-6">⏳ Chờ xác nhận</Badge>;
      case "PROCESSING":
        return <Badge bg="primary" className="px-3 py-2 fs-6">👨‍🍳 Đang xử lý / Nấu</Badge>;
      case "SHIPPING":
        return <Badge bg="info" className="px-3 py-2 fs-6 text-white">🛵 Đang giao hàng</Badge>;
      case "COMPLETED":
        return <Badge bg="success" className="px-3 py-2 fs-6">✅ Đã hoàn thành</Badge>;
      case "CANCELLED":
        return <Badge bg="danger" className="px-3 py-2 fs-6">❌ Đã hủy</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2 fs-6">{status || "Unknown"}</Badge>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleQuickStatus = async (newStatus) => {
    if (order.status === "COMPLETED" || order.status === "CANCELLED") {
      return Swal.fire({
        icon: "warning",
        title: "Không thể thay đổi",
        text: `Đơn hàng đã ${order.status === "COMPLETED" ? "hoàn thành" : "bị hủy"}, không thể thay đổi trạng thái nữa!`
      });
    }
    setUpdatingStatus(true);
    try {
      await onStatusChange(order.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="admin-order-modal">
      <Modal.Header closeButton className="border-0 pb-0" style={{ background: "#f8fafc" }}>
        <Modal.Title className="d-flex align-items-center gap-2">
          <FaReceipt className="text-warning" />
          <span className="fw-bold">Chi Tiết Đơn Hàng #{order.id}</span>
          <span className="ms-2">{getStatusBadge(order.status)}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4" style={{ background: "#f8fafc" }}>
        {/* Customer & Order Summary Grid */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="p-3 bg-white rounded-3 shadow-sm border h-100">
              <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center gap-2">
                <FaUser className="text-primary" /> Thông Tin Khách Hàng
              </h6>
              <div className="mb-2">
                <strong className="text-dark fs-6">{order.username || "Chưa có tên"}</strong>
              </div>
              <div className="mb-2 text-muted d-flex align-items-center gap-2">
                <FaPhoneAlt className="text-success" />
                {order.phone_number ? (
                  <a href={`tel:${order.phone_number}`} className="fw-semibold text-decoration-none text-dark">
                    {order.phone_number}
                  </a>
                ) : (
                  <span>N/A</span>
                )}
              </div>
              <div className="text-muted d-flex align-items-start gap-2">
                <FaMapMarkerAlt className="text-danger mt-1" />
                <span className="small">{order.address || "Chưa có địa chỉ"}</span>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 bg-white rounded-3 shadow-sm border h-100">
              <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center gap-2">
                <FaMoneyBillWave className="text-warning" /> Thanh Toán & Thời Gian
              </h6>
              <div className="mb-2 d-flex justify-content-between">
                <span className="text-muted">Thời gian đặt:</span>
                <span className="fw-semibold">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "N/A"}
                </span>
              </div>
              <div className="mb-2 d-flex justify-content-between align-items-center">
                <span className="text-muted">Hình thức:</span>
                <Badge bg={order.paymentStatus?.includes("online") ? "info" : "secondary"}>
                  {order.paymentStatus || "COD"}
                </Badge>
              </div>
              {order.voucherCode && (
                <div className="mb-2 d-flex justify-content-between text-success">
                  <span>Mã ưu đãi:</span>
                  <span className="fw-bold">{order.voucherCode} (-{formatPrice(order.discountAmount)})</span>
                </div>
              )}
              <div className="pt-2 border-top d-flex justify-content-between align-items-center">
                <span className="fw-bold">Tổng thanh toán:</span>
                <span className="fs-5 fw-bold text-danger">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details List */}
        <div className="bg-white rounded-3 shadow-sm border p-3">
          <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <FaPizzaSlice className="text-danger" /> Danh Sách Món Ăn ({details.length} món)
          </h6>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="warning" />
              <p className="mt-2 text-muted small">Đang tải món ăn của đơn hàng...</p>
            </div>
          ) : details.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <p className="mb-0">Không tìm thấy chi tiết món ăn trong đơn hàng này.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "60px" }}>Ảnh</th>
                    <th>Tên Món & Tùy Chọn</th>
                    <th className="text-center" style={{ width: "90px" }}>Số Lượng</th>
                    <th className="text-end" style={{ width: "120px" }}>Đơn Giá</th>
                    <th className="text-end" style={{ width: "130px" }}>Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((item, idx) => (
                    <tr key={item.detailId || idx}>
                      <td>
                        <img
                          src={
                            item.image?.startsWith("../")
                              ? item.image.substring(2)
                              : item.image || "/img/default-product.png"
                          }
                          alt={item.produc_name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0"
                          }}
                          onError={(e) => { e.target.src = "/img/default-product.png"; }}
                        />
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{item.produc_name}</div>
                        
                        {/* Options: Size, Đế, Topping */}
                        {item.options && (
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {item.options.split("|").map((opt, i) => (
                              <span
                                key={i}
                                className="badge bg-warning-subtle text-dark border border-warning"
                                style={{ fontSize: "11px", fontWeight: "500", padding: "3px 6px" }}
                              >
                                {opt.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Special Note */}
                        {item.note && (
                          <div className="text-muted small fst-italic mt-1">
                            📝 <strong>Ghi chú:</strong> {item.note}
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border fs-6 px-2 py-1">
                          x{item.quantity || 1}
                        </span>
                      </td>
                      <td className="text-end text-muted">
                        {formatPrice(item.price)}
                      </td>
                      <td className="text-end fw-bold text-dark">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between align-items-center bg-white border-top">
        <Button variant="outline-secondary" onClick={handlePrint} className="d-flex align-items-center gap-1">
          <FaPrint /> In Phiếu Đơn
        </Button>

        <div className="d-flex align-items-center gap-2">
          {order.status === "COMPLETED" && (
            <Badge bg="success" className="px-3 py-2 fs-6">
              ✓ Đơn hàng đã hoàn tất (Đã khóa trạng thái)
            </Badge>
          )}

          {order.status === "CANCELLED" && (
            <Badge bg="danger" className="px-3 py-2 fs-6">
              ✕ Đơn hàng đã bị hủy (Đã khóa trạng thái)
            </Badge>
          )}

          {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
            <>
              {order.status === "PENDING" && (
                <Button
                  variant="primary"
                  onClick={() => handleQuickStatus("PROCESSING")}
                  disabled={updatingStatus}
                  className="d-flex align-items-center gap-1"
                >
                  👩‍🍳 Bắt Đầu Chế Biến
                </Button>
              )}

              {order.status === "PROCESSING" && (
                <Button
                  variant="info"
                  className="text-white d-flex align-items-center gap-1"
                  onClick={() => handleQuickStatus("SHIPPING")}
                  disabled={updatingStatus}
                >
                  🛵 Bắt Đầu Giao Hàng
                </Button>
              )}

              <Button
                variant="success"
                onClick={() => handleQuickStatus("COMPLETED")}
                disabled={updatingStatus}
                className="d-flex align-items-center gap-1"
              >
                <FaCheck /> Hoàn Thành Đơn
              </Button>

              <Button
                variant="outline-danger"
                onClick={() => handleQuickStatus("CANCELLED")}
                disabled={updatingStatus}
                className="d-flex align-items-center gap-1"
              >
                <FaTimes /> Hủy Đơn
              </Button>
            </>
          )}

          <Button variant="secondary" onClick={onHide}>
            Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
