import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaHome, FaShoppingCart } from "react-icons/fa";
import axios from "axios";
import '../../css/vnpay-return.css';
import { Domain } from "../../services/Domain";

const VNPayReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState("processing");
  const [message, setMessage] = useState("Đang xử lý kết quả thanh toán...");
  const [orderInfo, setOrderInfo] = useState(null);
  
  // Thêm biến ref để theo dõi đã xử lý chưa
  const isProcessed = useRef(false);


  const createOrderAfterPayment = useCallback(async (pendingOrder) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = currentUser.id || currentUser.userId;
      const currentTime = new Date().toISOString();
      const totalQuantity = pendingOrder.cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

      // 1. Tạo đơn hàng
      const orderData = {
        phone_number: pendingOrder.customerInfo.phone,
        address: pendingOrder.customerInfo.address,
        username: currentUser.username || pendingOrder.customerInfo.fullName,
        quantity: totalQuantity,
        totalPrice: pendingOrder.totalPrice,
        image: pendingOrder.cartItems[0]?.image || "img/default-product.png",
        userId: userId,
        createdAt: currentTime
      };

      const orderRes = await axios.post(`${Domain}/api/Order/AddOrder`, orderData, {
        headers: { "Content-Type": "application/json" }
      });

      // 2. Lấy orderId
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

      // 3. Tạo OrderDetail kèm options và note
      const orderDetailList = pendingOrder.cartItems.map(item => ({
        quantity: item.quantity || 1,
        price: item.price || 0,
        produc_name: item.productName || item.name || "Unknown Product",
        options: item.optionTags && item.optionTags.length > 0 ? item.optionTags.join(' | ') : null,
        note: item.options?.note || null,
        image: item.image?.startsWith("../") ? item.image.substring(2) : item.image || "img/default-product.png",
        orderId: orderId,
        productId: item.productId || item.id,
        canFeedBack: false
      }));

      await axios.post(`${Domain}/api/OrderDeTail/AddOrderDetailList`, orderDetailList, {
        headers: { "Content-Type": "application/json" }
      });

      // 4. Gửi thông tin thanh toán (status = true vì đã thanh toán thành công)
      const paymentData = {
        orderId: orderId,
        fullname: pendingOrder.customerInfo.fullName,
        status: true
      };
      await axios.post(`${Domain}/api/Payment/AddPayment`, paymentData, {
        headers: { "Content-Type": "application/json" }
      });

      return orderId;
    } catch (error) {
      console.error("Error creating order after payment:", error);
      throw error;
    }
  }, [Domain]);

  useEffect(() => {
    const processPaymentResult = async () => {
      // Kiểm tra đã xử lý chưa để tránh trùng lặp
      if (isProcessed.current) {
        console.log("Đã xử lý thanh toán trước đó, bỏ qua...");
        return;
      }
      
      isProcessed.current = true;

      try {
        // Lấy các tham số từ URL trả về
        const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
        const vnp_TransactionNo = searchParams.get("vnp_TransactionNo");
        const vnp_Amount = searchParams.get("vnp_Amount");
        const vnp_OrderInfo = searchParams.get("vnp_OrderInfo");
        const vnp_BankCode = searchParams.get("vnp_BankCode");
        const vnp_PayDate = searchParams.get("vnp_PayDate");
        const vnp_TxnRef = searchParams.get("vnp_TxnRef");

        console.log("VNPay Return Params:", {
          vnp_ResponseCode,
          vnp_TransactionNo,
          vnp_Amount,
          vnp_OrderInfo,
          vnp_BankCode,
          vnp_PayDate,
          vnp_TxnRef
        });

        if (vnp_ResponseCode === "00") {
          // Thanh toán thành công
          try {
            // Lấy thông tin đơn hàng tạm thời từ localStorage
            const pendingOrder = JSON.parse(localStorage.getItem("pending_vnpay_order") || "{}");
            
            if (pendingOrder.customerInfo && pendingOrder.cartItems) {
              // Tạo đơn hàng thực sự sau khi thanh toán thành công
              const orderId = await createOrderAfterPayment(pendingOrder);
              
              // Xóa thông tin tạm và giỏ hàng
              localStorage.removeItem("pending_vnpay_order");
              localStorage.removeItem("pizza4ps_cart");

              setPaymentStatus("success");
              setMessage("Thanh toán thành công! Đơn hàng đã được tạo.");
              setOrderInfo({
                orderId: orderId,
                transactionNo: vnp_TransactionNo,
                amount: parseInt(vnp_Amount) / 100,
                bankCode: vnp_BankCode,
                payDate: vnp_PayDate
              });

            } else {
              // Không tìm thấy thông tin đơn hàng tạm
              setPaymentStatus("success");
              setMessage("Thanh toán thành công! Tuy nhiên có lỗi khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ với mã giao dịch: " + vnp_TransactionNo);
              setOrderInfo({
                orderId: null,
                transactionNo: vnp_TransactionNo,
                amount: parseInt(vnp_Amount) / 100,
                bankCode: vnp_BankCode,
                payDate: vnp_PayDate
              });
            }

          } catch (createOrderError) {
            console.error("Error creating order after payment:", createOrderError);
            setPaymentStatus("success");
            setMessage("Thanh toán thành công! Tuy nhiên có lỗi khi tạo đơn hàng. Vui lòng liên hệ hỗ trợ.");
            setOrderInfo({
              orderId: null,
              transactionNo: vnp_TransactionNo,
              amount: parseInt(vnp_Amount) / 100,
              bankCode: vnp_BankCode,
              payDate: vnp_PayDate
            });
          }
        } else {
          // Thanh toán thất bại
          setPaymentStatus("failed");
          
          // Xóa thông tin đơn hàng tạm nếu thanh toán thất bại
          localStorage.removeItem("pending_vnpay_order");
          
          switch(vnp_ResponseCode) {
            case "01":
              setMessage("Giao dịch bị hủy bởi người dùng.");
              break;
            case "02":
              setMessage("Giao dịch bị từ chối bởi ngân hàng.");
              break;
            case "04":
              setMessage("Giao dịch đang chờ xử lý.");
              break;
            case "05":
              setMessage("Giao dịch đang được xử lý tại VNPAY.");
              break;
            case "06":
              setMessage("Giao dịch đã được gửi sang ngân hàng xử lý.");
              break;
            case "07":
              setMessage("Giao dịch bị nghi ngờ gian lận.");
              break;
            case "09":
              setMessage("Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.");
              break;
            case "10":
              setMessage("Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.");
              break;
            case "11":
              setMessage("Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.");
              break;
            case "12":
              setMessage("Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.");
              break;
            case "13":
              setMessage("Giao dịch không thành công do: Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.");
              break;
            case "24":
              setMessage("Giao dịch không thành công do: Khách hàng hủy giao dịch.");
              break;
            case "51":
              setMessage("Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.");
              break;
            case "65":
              setMessage("Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.");
              break;
            case "75":
              setMessage("Ngân hàng thanh toán đang bảo trì.");
              break;
            case "79":
              setMessage("Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch.");
              break;
            case "99":
              setMessage("Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê).");
              break;
            default:
              setMessage("Thanh toán không thành công. Vui lòng thử lại.");
          }
        }
      } catch (error) {
        console.error("Error processing payment result:", error);
        setPaymentStatus("failed");
        setMessage("Có lỗi xảy ra khi xử lý kết quả thanh toán. Vui lòng liên hệ hỗ trợ.");
        
        // Xóa thông tin tạm nếu có lỗi
        localStorage.removeItem("pending_vnpay_order");
      }
    };

    processPaymentResult();
  }, [searchParams, Domain, createOrderAfterPayment]);

  const formatPrice = price =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(price)
      .replace("₫", " đ");

  const formatPayDate = (payDate) => {
    if (!payDate) return "";
    const year = payDate.substring(0, 4);
    const month = payDate.substring(4, 6);
    const day = payDate.substring(6, 8);
    const hour = payDate.substring(8, 10);
    const minute = payDate.substring(10, 12);
    const second = payDate.substring(12, 14);
    
    return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
  };

  return (
    <div className="vnpay-return-page">
      <div className="vnpay-return-container">
        <div className="payment-result-card">
          {paymentStatus === "processing" && (
            <div className="processing-state">
              <FaSpinner className="spinner-icon" />
              <h2>Đang xử lý...</h2>
              <p>{message}</p>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="success-state">
              <FaCheckCircle className="success-icon" />
              <h2>Thanh Toán Thành Công!</h2>
              <p>{message}</p>
              
              {orderInfo && (
                <div className="payment-details">
                  <h3>Thông tin giao dịch</h3>
                  <div className="detail-grid">
                    {orderInfo.orderId && (
                      <div className="detail-item">
                        <span>Mã đơn hàng:</span>
                        <strong>#{orderInfo.orderId}</strong>
                      </div>
                    )}
                    <div className="detail-item">
                      <span>Mã giao dịch:</span>
                      <span>{orderInfo.transactionNo}</span>
                    </div>
                    <div className="detail-item">
                      <span>Số tiền:</span>
                      <strong>{formatPrice(orderInfo.amount)}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Ngân hàng:</span>
                      <span>{orderInfo.bankCode}</span>
                    </div>
                    <div className="detail-item">
                      <span>Thời gian:</span>
                      <span>{formatPayDate(orderInfo.payDate)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="failed-state">
              <FaTimesCircle className="failed-icon" />
              <h2>Thanh Toán Không Thành Công</h2>
              <p>{message}</p>
            </div>
          )}

          <div className="action-buttons">
            <button 
              className="btn-home" 
              onClick={() => navigate("/")}
            >
              <FaHome /> Về trang chủ
            </button>
            
            {paymentStatus === "failed" && (
              <button 
                className="btn-retry" 
                onClick={() => navigate("/cart")}
              >
                <FaShoppingCart /> Thử lại thanh toán
              </button>
            )}
            
            {paymentStatus === "success" && (
              <button 
                className="btn-retry" 
                onClick={() => navigate("/profile")}
              >
                📋 Xem đơn hàng
              </button>
            )}
          </div>

          <div className="support-info">
            <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ:</p>
            <p>📞 Hotline: 1900 1234</p>
            <p>📧 Email: support@pizza4ps.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VNPayReturn;