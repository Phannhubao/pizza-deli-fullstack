import React, { useState } from 'react';
import { 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaClock, 
  FaPaperPlane, 
  FaCar, 
  FaChild, 
  FaUsers, 
  FaWifi, 
  FaQuestionCircle, 
  FaHeadset,
  FaExternalLinkAlt
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import '../../css/ContactModern.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    topic: 'Đặt Bàn Trước',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.message.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Nội dung tin nhắn!',
        confirmButtonColor: '#ea580c'
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate sending contact request
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = 'PD-' + Math.floor(100000 + Math.random() * 900000);

      Swal.fire({
        icon: 'success',
        title: 'Gửi Tin Nhắn Thành Công!',
        html: `
          <div style="text-align: left; font-size: 0.95rem; color: #475569;">
            <p>Cảm ơn <b>${formData.fullName}</b> đã liên hệ với <b>Pizza Deli</b>.</p>
            <p>Mã yêu cầu của bạn: <b style="color: #ea580c; font-size: 1.1rem;">#${ticketId}</b></p>
            <p style="margin-bottom: 0;">Bộ phận CSKH sẽ gọi lại cho bạn qua số <b>${formData.phone}</b> trong vòng 15 phút.</p>
          </div>
        `,
        confirmButtonText: 'Tuyệt vời',
        confirmButtonColor: '#ea580c'
      });

      setFormData({
        fullName: '',
        phone: '',
        email: '',
        topic: 'Đặt Bàn Trước',
        message: ''
      });
    }, 600);
  };

  const quickContacts = [
    {
      icon: <FaMapMarkerAlt />,
      title: 'Địa Chỉ Nhà Hàng',
      text: '17 Lê Thánh Tôn, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      btnText: 'Chỉ Đường',
      btnHref: 'https://maps.google.com/?q=17+Le+Thanh+Ton+Quan+1+Ho+Chi+Minh',
      isExternal: true
    },
    {
      icon: <FaPhoneAlt />,
      title: 'Tổng Đài Hotline',
      text: '1900 6043 - 0336 040 785 (Hỗ trợ 24/7)',
      btnText: 'Gọi Ngay',
      btnHref: 'tel:19006043',
      isExternal: false
    },
    {
      icon: <FaEnvelope />,
      title: 'Hòm Thư Hỗ Trợ',
      text: 'contact@pizzadeli.vn - support@pizzadeli.vn',
      btnText: 'Gửi Email',
      btnHref: 'mailto:contact@pizzadeli.vn',
      isExternal: false
    },
    {
      icon: <FaClock />,
      title: 'Giờ Hoạt Động',
      text: 'Tất cả các ngày: 10:00 - 22:30 (Cao điểm: 11:30 - 13:30 & 18:30 - 20:30)',
      btnText: 'Đặt Bàn Ngay',
      btnHref: '#contact-form',
      isExternal: false
    }
  ];

  const amenities = [
    {
      icon: <FaCar />,
      title: 'Bãi Đỗ Xe Tiện Lợi',
      desc: 'Hỗ trợ giữ xe máy và ô tô miễn phí ngay trước khuôn viên nhà hàng với nhân viên hướng dẫn tận tâm.'
    },
    {
      icon: <FaUsers />,
      title: 'Phòng VIP Riêng Tư',
      desc: 'Không gian tiệc sang trọng từ 10 - 45 khách, trang bị máy chiếu và âm thanh riêng biệt.'
    },
    {
      icon: <FaChild />,
      title: 'Khu Trẻ Em & Ghế Ăn Dặm',
      desc: 'Khu vui chơi an toàn sạch sẽ, có ghế ăn chuyên dụng cho trẻ nhỏ và set thực đơn nhí hấp dẫn.'
    },
    {
      icon: <FaWifi />,
      title: 'Wifi Tốc Độ Cao & Máy Lạnh',
      desc: 'Hạ tầng mạng cáp quang mạnh mẽ, hệ thống điều hòa thanh lọc không khí tươi 24/24.'
    }
  ];

  const faqs = [
    {
      q: 'Thời gian giao pizza trung bình là bao lâu?',
      a: 'Pizza Deli cam kết giao hàng trong 30 phút kể từ lúc xác nhận đơn. Bánh được bảo quản trong túi giữ nhiệt chuyên dụng để đảm bảo độ nóng giòn nguyên bản khi đến tay bạn.'
    },
    {
      q: 'Tôi muốn đặt bàn cho tiệc sinh nhật hoặc công ty thì sao?',
      a: 'Bạn chỉ cần điền form bên trên chọn "Đặt Tiệc / Sự Kiện" hoặc gọi hotline 1900 6043. Chúng tôi sẽ hỗ trợ thiết kế thực đơn theo ngân sách và trang trí bàn tiệc miễn phí.'
    },
    {
      q: 'Nhà hàng có các món ăn chay (Vegetarian) không?',
      a: 'Có, thực đơn Pizza Deli phục vụ hơn 8 món chay đặc sắc như Pizza Nấm Truffle Phô Mai, Pizza Rau Củ Nướng Lò Củi và các dòng Salad sốt chanh leo tươi mát.'
    },
    {
      q: 'Các hình thức thanh toán được hỗ trợ?',
      a: 'Chúng tôi hỗ trợ đa dạng phương thức: Tiền mặt khi nhận hàng (COD), Cổng thanh toán trực tuyến VNPAY, Thẻ tín dụng/ghi nợ quốc tế (Visa, MasterCard) và Ví điện tử.'
    }
  ];

  return (
    <div className="contact-page-wrapper">
      {/* HERO SECTION */}
      <section 
        className="contact-hero"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.88) 100%), url(/img/banner2.png)'
        }}
      >
        <div className="contact-hero-inner">
          <div className="contact-badge">
            <FaHeadset /> Kết Nối & Trải Nghiệm
          </div>
          <h1 className="contact-hero-title">
            Liên Hệ & <span>Đặt Bàn Tại Pizza Deli</span>
          </h1>
          <p className="contact-hero-desc">
            Chúng tôi luôn lắng nghe mọi góp ý từ bạn và hân hạnh được đồng hành cùng những bữa tiệc 
            ẩm thực Ý ấm cúng, trọn vẹn của gia đình và người thân.
          </p>
        </div>
      </section>

      {/* QUICK CONTACT CARDS */}
      <div className="contact-container contact-cards-container">
        <div className="contact-cards-grid">
          {quickContacts.map((c, idx) => (
            <div key={idx} className="contact-quick-card">
              <div className="contact-quick-icon-wrap">{c.icon}</div>
              <h3 className="contact-quick-title">{c.title}</h3>
              <p className="contact-quick-text">{c.text}</p>
              <a 
                href={c.btnHref} 
                className="contact-quick-btn"
                target={c.isExternal ? "_blank" : "_self"}
                rel={c.isExternal ? "noopener noreferrer" : ""}
              >
                {c.btnText} {c.isExternal && <FaExternalLinkAlt size={11} />}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="contact-container">
        {/* MAIN ROW: FORM & AMENITIES */}
        <section className="contact-main-row" id="contact-form">
          {/* FORM CARD */}
          <div className="contact-form-card">
            <h2 className="contact-form-heading">Gửi Tin Nhắn / Đặt Bàn Nhanh</h2>
            <p className="contact-form-subtitle">
              Điền thông tin bên dưới, chuyên viên tư vấn của Pizza Deli sẽ liên hệ xác nhận lại ngay lập tức.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="contact-form-grid">
                <div className="contact-form-group">
                  <label className="contact-label">Họ và tên của bạn *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="contact-input"
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label className="contact-label">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ví dụ: 0912 345 678"
                    className="contact-input"
                    required
                  />
                </div>
              </div>

              <div className="contact-form-grid">
                <div className="contact-form-group">
                  <label className="contact-label">Địa chỉ Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ví dụ: yourname@email.com"
                    className="contact-input"
                  />
                </div>

                <div className="contact-form-group">
                  <label className="contact-label">Nhu cầu liên hệ *</label>
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="contact-select"
                  >
                    <option value="Đặt Bàn Trước">Đặt Bàn Trước (Dưới 10 khách)</option>
                    <option value="Đặt Tiệc / Sự Kiện">Đặt Tiệc Sinh Nhật / Công Ty</option>
                    <option value="Góp Ý Dịch Vụ">Góp Ý & Phản Hồi Chất Lượng</option>
                    <option value="Hợp Tác Kinh Doanh">Hợp Tác Cung Ứng / Doanh Nghiệp</option>
                  </select>
                </div>
              </div>

              <div className="contact-form-group">
                <label className="contact-label">Nội dung chi tiết / Thời gian & Số lượng khách *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Vui lòng ghi rõ thời gian bạn muốn đặt bàn, số lượng người hoặc yêu cầu đặc biệt..."
                  className="contact-textarea"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="contact-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Đang xử lý...'
                ) : (
                  <>
                    <FaPaperPlane /> Gửi Thông Tin Liên Hệ
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AMENITIES CARD */}
          <div className="contact-amenities-card">
            <h3 className="contact-amenities-heading">
              Tiện Ích Tại Nhà Hàng
            </h3>

            <div>
              {amenities.map((item, idx) => (
                <div key={idx} className="contact-amenity-item">
                  <div className="contact-amenity-icon">{item.icon}</div>
                  <div>
                    <div className="contact-amenity-title">{item.title}</div>
                    <p className="contact-amenity-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-emergency-box">
              <div className="contact-emergency-title">Hotline Đặt Hàng Giao Nhanh 24/7</div>
              <a href="tel:19006043" className="contact-emergency-phone">
                1900 6043
              </a>
              <small style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                Miễn phí cước gọi từ mọi nhà mạng
              </small>
            </div>
          </div>
        </section>

        {/* MAP SECTION */}
        <section className="contact-map-section">
          <div className="text-center mb-4">
            <span style={{ color: '#ea580c', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Vị Trí Cửa Hàng
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
              Tìm Đường Đến Pizza Deli
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Tọa lạc tại khu phố ẩm thực sầm uất bậc nhất trung tâm Quận 1, TP. Hồ Chí Minh
            </p>
          </div>

          <div className="contact-map-wrapper">
            <iframe
              src="https://maps.google.com/maps?q=17%20Le%20Thanh%20Ton,%20Ben%20Nghe,%20Quan%201,%20Ho%20Chi%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="contact-map-iframe"
              allowFullScreen=""
              loading="lazy"
              title="Bản Đồ Pizza Deli"
            ></iframe>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="contact-faq-section">
          <div className="contact-faq-heading-wrap">
            <span style={{ color: '#ea580c', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Giải Đáp Nhanh
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
              Câu Hỏi Thường Gặp
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Những câu hỏi phổ biến của khách hàng khi đặt bàn và đặt món tại Pizza Deli.
            </p>
          </div>

          <div className="contact-faq-grid">
            {faqs.map((faq, idx) => (
              <div key={idx} className="contact-faq-item">
                <div className="contact-faq-q">
                  <FaQuestionCircle className="contact-faq-q-icon" />
                  {faq.q}
                </div>
                <p className="contact-faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;