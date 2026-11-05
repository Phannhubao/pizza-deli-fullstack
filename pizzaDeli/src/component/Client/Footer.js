import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaFacebook, FaInstagram, FaSpotify, FaPhone, FaMapMarkerAlt, FaCertificate, FaFileContract } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer bg-dark text-light pt-5 pb-4">
      <div className="container">
        <div className="row g-4">
          {/* Company Info */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-section">
              <div className="brand-section mb-4">
                <h4 className="brand-title text-warning fw-bold mb-3">
                  <span className="brand-icon">🍕</span>
                  PIZZA DELI
                </h4>
                <p className="text-light mb-3 opacity-75">
                  Công ty cổ phần PIZZA Deli - Mang đến hương vị Ý đích thực
                </p>
              </div>
              
              <div className="contact-info">
                <div className="contact-item d-flex align-items-start mb-3">
                  <FaMapMarkerAlt className="text-warning mt-1 me-3" />
                  <div>
                    <p className="mb-1 fw-semibold">Địa chỉ</p>
                    <p className="mb-0 opacity-75">
                      17 Lê Thánh Tôn, Bến Nghé, Quận 1<br />
                      TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>
                
                <div className="contact-item d-flex align-items-start mb-3">
                  <FaPhone className="text-warning mt-1 me-3" />
                  <div>
                    <p className="mb-1 fw-semibold">Đường dây nóng</p>
                    <p className="mb-0 opacity-75">1900 6043</p>
                    <small className="text-muted">Hỗ trợ 24/7</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificates */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-section">
              <div className="certificates mb-4">
                <div className="certificate-item mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <FaCertificate className="text-success me-2" />
                    <h6 className="fw-bold mb-0 text-warning">Giấy chứng nhận CSĐĐKATTP</h6>
                  </div>
                  <p className="opacity-75 mb-0 small">
                    Số 2895/2018/ATTP-CNDK do Ban Quản lý An toàn thực phẩm 
                    thành phố Hồ Chí Minh cấp ngày 05/07/2018
                  </p>
                </div>
                
                <div className="certificate-item">
                  <div className="d-flex align-items-center mb-2">
                    <FaFileContract className="text-info me-2" />
                    <h6 className="fw-bold mb-0 text-warning">Giấy chứng nhận ĐKKD</h6>
                  </div>
                  <p className="opacity-75 mb-0 small">
                    Số 0313168515 do Sở Kế Hoạch và Đầu tư cấp ngày 19/03/2015
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Policies & Services */}
          <div className="col-lg-4 col-md-12">
            <div className="row">
              <div className="col-sm-6 col-12 mb-4">
                <div className="footer-section">
                  <h6 className="fw-bold text-warning mb-3">Chính sách & Quy định</h6>
                  <ul className="list-unstyled footer-links">
                    <li className="mb-2">
                      <a href="/policy" className="text-light text-decoration-none opacity-75 hover-warning">
                        Chính sách & quy định chung
                      </a>
                    </li>
                    <li className="mb-2">
                      <a href="/payment" className="text-light text-decoration-none opacity-75 hover-warning">
                        Chính sách thanh toán
                      </a>
                    </li>
                    <li className="mb-2">
                      <a href="/voucher" className="text-light text-decoration-none opacity-75 hover-warning">
                        Chính sách E-Voucher
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="col-sm-6 col-12">
                <div className="footer-section">
                  <h6 className="fw-bold text-warning mb-3">Dịch vụ khách hàng</h6>
                  <ul className="list-unstyled footer-links">
                    <li className="mb-2">
                      <a href="/delivery" className="text-light text-decoration-none opacity-75 hover-warning">
                        Chính sách giao hàng
                      </a>
                    </li>
                    <li className="mb-2">
                      <a href="/return" className="text-light text-decoration-none opacity-75 hover-warning">
                        Chính sách đổi trả
                      </a>
                    </li>
                    <li className="mb-2">
                      <a href="/refund" className="text-light text-decoration-none opacity-75 hover-warning">
                        Chính sách hoàn tiền
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="footer-bottom mt-5 pt-4 border-top border-secondary">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <div className="social-section">
                <h6 className="fw-semibold mb-3">Theo dõi chúng tôi</h6>
                <div className="social-links">
                  <a 
                    href="https://facebook.com" 
                    className="social-link mx-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook className="social-icon" />
                  </a>
                  <a 
                    href="https://instagram.com" 
                    className="social-link mx-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram className="social-icon" />
                  </a>
                  <a 
                    href="https://spotify.com" 
                    className="social-link mx-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaSpotify className="social-icon" />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="col-md-6 text-center text-md-end">
              <p className="copyright-text mb-0 opacity-75">
                &copy; 2025 <span className="text-warning">Pizza Deli</span>. Đã đăng ký Bản quyền
              </p>
              <small className="text-muted">Mang đến hương vị Ý hoàn hảo</small>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        }
        
        .brand-title {
          font-size: 1.5rem;
          letter-spacing: 1px;
        }
        
        .brand-icon {
          font-size: 1.8rem;
          margin-right: 0.5rem;
        }
        
        .footer-links a {
          transition: all 0.3s ease;
          position: relative;
          padding-left: 0.5rem;
        }
        
        .footer-links a:hover {
          color: #ffc107 !important;
          padding-left: 1rem;
        }
        
        .footer-links a::before {
          content: '•';
          position: absolute;
          left: 0;
          color: #ffc107;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .footer-links a:hover::before {
          opacity: 1;
        }
        
        .social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        
        .social-link:hover {
          background: #ffc107;
          transform: translateY(-3px);
        }
        
        .social-icon {
          font-size: 1.2rem;
          color: #fff;
          transition: all 0.3s ease;
        }
        
        .social-link:hover .social-icon {
          color: #000;
        }
        
        .contact-item {
          transition: transform 0.3s ease;
        }
        
        .contact-item:hover {
          transform: translateX(5px);
        }
        
        .certificate-item {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          border-left: 3px solid #ffc107;
        }
        
        @media (max-width: 768px) {
          .footer-section {
            text-align: center;
          }
          
          .contact-item {
            justify-content: center;
            text-align: center;
          }
          
          .brand-title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer;