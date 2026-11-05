import Carousel from "react-bootstrap/Carousel";
import { FaPizzaSlice, FaFire, FaMotorcycle, FaArrowRight, FaTicketAlt } from "react-icons/fa";
import "../../css/HomeModern.css";

function Banner() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="hero-banner-carousel">
      <Carousel fade interval={5000} indicators={true} controls={true}>
        {/* Slide 1 */}
        <Carousel.Item>
          <div className="hero-slide-wrapper">
            <img src="/img/banner1.png" alt="Pizza Nướng Củi" className="hero-slide-img" />
            <div className="hero-slide-overlay">
              <div className="hero-content-box">
                <span className="hero-badge-tag">
                  <FaPizzaSlice /> Nướng Củi Chuẩn Vị Ý
                </span>
                <h1 className="hero-title">
                  Ngon Tròn Vị Ý <br /> Nóng Hổi Từng Lát Bánh
                </h1>
                <p className="hero-subtitle">
                  Được chế biến từ bột ủ tự nhiên 48 giờ, phô mai Mozzarella tươi béo ngậy
                  và sốt cà chua San Marzano trứ danh nướng ở 400°C.
                </p>
                <div className="hero-cta-group">
                  <button
                    className="btn-hero-primary"
                    onClick={() => scrollToSection("menu-section")}
                  >
                    <span>Khám Phá Menu</span>
                    <FaArrowRight />
                  </button>
                  <button
                    className="btn-hero-secondary"
                    onClick={() => scrollToSection("features-section")}
                  >
                    <span>Tìm Hiểu Thêm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Carousel.Item>

        {/* Slide 2 */}
        <Carousel.Item>
          <div className="hero-slide-wrapper">
            <img src="/img/banner2.png" alt="Siêu Ưu Đãi" className="hero-slide-img" />
            <div className="hero-slide-overlay">
              <div className="hero-content-box">
                <span className="hero-badge-tag">
                  <FaFire /> Siêu Ưu Đãi Độc Quyền
                </span>
                <h2 className="hero-title">
                  Giảm Ngay 50.000đ <br /> Cho Mọi Đơn Hàng
                </h2>
                <p className="hero-subtitle">
                  Sử dụng mã ưu đãi <strong>PIZZA50</strong> khi thanh toán để được giảm ngay 50.000đ.
                  Hỗ trợ thanh toán nhanh bằng VNPay và tiền mặt khi nhận hàng.
                </p>
                <div className="hero-cta-group">
                  <button
                    className="btn-hero-primary"
                    onClick={() => scrollToSection("coupons-section")}
                  >
                    <FaTicketAlt />
                    <span>Lấy Mã Giảm Giá</span>
                  </button>
                  <button
                    className="btn-hero-secondary"
                    onClick={() => scrollToSection("menu-section")}
                  >
                    <span>Xem Món Ngon</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Carousel.Item>

        {/* Slide 3 */}
        <Carousel.Item>
          <div className="hero-slide-wrapper">
            <img src="/img/banner3.png" alt="Giao Hàng Siêu Tốc" className="hero-slide-img" />
            <div className="hero-slide-overlay">
              <div className="hero-content-box">
                <span className="hero-badge-tag">
                  <FaMotorcycle /> Giao Nhanh 30 Phút
                </span>
                <h2 className="hero-title">
                  Giao Hàng Siêu Tốc <br /> Bánh Luôn Giòn Nóng
                </h2>
                <p className="hero-subtitle">
                  Hộp giữ nhiệt chuyên dụng cao cấp cam kết pizza luôn nóng sốt và thơm lừng
                  khi đến tận cửa nhà bạn.
                </p>
                <div className="hero-cta-group">
                  <button
                    className="btn-hero-primary"
                    onClick={() => scrollToSection("menu-section")}
                  >
                    <span>Đặt Món Ngay</span>
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Carousel.Item>
      </Carousel>
    </div>
  );
}

export default Banner;