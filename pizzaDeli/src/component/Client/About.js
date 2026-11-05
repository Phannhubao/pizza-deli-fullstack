import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPizzaSlice, 
  FaFire, 
  FaLeaf, 
  FaAward, 
  FaClock, 
  FaHeart, 
  FaCheckCircle, 
  FaUtensils, 
  FaPhoneAlt 
} from 'react-icons/fa';
import '../../css/AboutModern.css';

const About = () => {
  const stats = [
    { num: '15+', label: 'Năm Gìn Giữ Hương Vị Ý' },
    { num: '50K+', label: 'Thực Khách Hài Lòng / Tháng' },
    { num: '48 Giờ', label: 'Bột Tươi Lên Men Tự Nhiên' },
    { num: '100%', label: 'Mozzarella & Cà Chua Hữu Cơ' }
  ];

  const craftPillars = [
    {
      step: '1',
      icon: <FaClock className="about-craft-icon" />,
      title: 'Bột Men Tươi Ủ 48 Giờ',
      desc: 'Bột mì Tipo 00 nhập khẩu từ Ý được ủ chậm tự nhiên trong 48 giờ ở nhiệt độ kiểm soát khắt khe, tạo nên lớp vỏ bánh giòn tan rỗng ruột (alvéoles) và cực kỳ dễ tiêu hóa.'
    },
    {
      step: '2',
      icon: <FaLeaf className="about-craft-icon" />,
      title: 'Nguyên Liệu Tươi Chuẩn Ý',
      desc: 'Cà chua San Marzano mọng nước thu hoạch từ sườn núi lửa Vesuvius kết hợp phô mai Mozzarella tươi được kéo sợi thủ công mỗi sớm mai.'
    },
    {
      step: '3',
      icon: <FaHeart className="about-craft-icon" />,
      title: 'Kỹ Thuật Nhào Bằng Tay',
      desc: 'Tuyệt đối không sử dụng máy cán. Từng chiếc bánh được các nghệ nhân nhào nặn bằng tay (kỹ thuật Neapolitan Slap) để giữ trọn bọt khí tự nhiên trong viền bánh.'
    },
    {
      step: '4',
      icon: <FaFire className="about-craft-icon" />,
      title: 'Nướng Lò Củi 400°C',
      desc: 'Bánh được nướng trên nền đá bazan trong lò củi sồi rực lửa ở 400°C chỉ trong đúng 90 giây, tạo nên những vết cháy xém "leopard spots" đặc trưng quyến rũ.'
    }
  ];

  const teamMembers = [
    {
      name: 'Antonio Moretti',
      role: 'Bếp Trưởng Điều Hành (Executive Chef)',
      image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80',
      bio: 'Sinh ra và lớn lên tại Napoli - cái nôi của Pizza thế giới. Với hơn 20 năm kinh nghiệm tại các nhà hàng Michelin tại Roma và Milan, Chef Antonio mang trọn linh hồn ẩm thực Ý đến từng công thức.',
      quote: '"Với tôi, pizza không chỉ là một món ăn, mà là bản giao hưởng của sự kiên nhẫn, lửa ấm và tình yêu thương."'
    },
    {
      name: 'Nguyễn Hải Đăng',
      role: 'Bậc Thầy Bột Men & Pizza Napoletana',
      image: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=600&q=80',
      bio: 'Từng đoạt giải Nhì tại Cuộc thi Pizza World Championship Asia 2022. Anh Đăng là chuyên gia kiểm định chất lượng lên men và người trực tiếp huấn luyện đội ngũ thợ làm bánh tại Pizza Deli.',
      quote: '"Độ xốp và mùi thơm tự nhiên của bột mì lên men chính là thước đo danh dự của một người thợ làm bánh chân chính."'
    },
    {
      name: 'Sofia Rossi',
      role: 'Chuyên Gia Tráng Miệng & Thảo Mộc',
      image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=600&q=80',
      bio: 'Tốt nghiệp thủ khoa Học viện Ẩm thực Alma (Ý). Cô là người sáng tạo nên các món Xốt Miso Độc Bản, Tiramisu truyền thống và dòng kem Gelato nức tiếng của chuỗi nhà hàng.',
      quote: '"Một bữa ăn chuẩn phong vị Ý chỉ trọn vẹn khi để lại dư vị ngọt ngào và êm ái trên đầu lưỡi thực khách."'
    }
  ];

  return (
    <div className="about-page-wrapper">
      {/* HERO SECTION */}
      <section 
        className="about-hero"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.88) 100%), url(/img/banner1.png)'
        }}
      >
        <div className="about-hero-inner">
          <div className="about-badge">
            <FaAward /> Di Sản Ẩm Thực Ý Từ 1985
          </div>
          <h1 className="about-hero-title">
            Nghệ Thuật Pizza Thủ Công & <span>Tình Yêu Ẩm Thực Nguyên Bản</span>
          </h1>
          <p className="about-hero-desc">
            Tại Pizza Deli, mỗi chiếc bánh ra lò là một tác phẩm được kết tinh từ sự tỉ mỉ của nghệ nhân làm bánh, 
            men bột tươi ủ chậm 48 giờ và ngọn lửa ấm áp của lò củi nướng bazan 400°C.
          </p>
        </div>
      </section>

      {/* STATS SECTION */}
      <div className="about-stats-container">
        <div className="about-stats-grid">
          {stats.map((st, idx) => (
            <div key={idx} className="about-stat-card">
              <div className="about-stat-num">{st.num}</div>
              <p className="about-stat-label">{st.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-container">
        {/* STORY ROW */}
        <section className="about-story-row">
          <div className="about-story-text">
            <span className="about-section-tag">Khởi Nguồn Đam Mê</span>
            <h2 className="about-section-heading">
              Hành Trình Mang Hương Vị Napoli Đến Mọi Gia Đình Việt
            </h2>
            <p>
              Khởi đầu từ một căn bếp nhỏ ven con phố cổ Roma vào những năm cuối thập niên 80, 
              những người sáng lập Pizza Deli đã ấp ủ giấc mơ: Đem trọn vẹn hương vị tinh khiết nhất 
              của đất nước hình chiếc ủng đến với thực khách trên khắp thế giới.
            </p>
            <p>
              Chúng tôi nói không với bột công nghiệp đông lạnh hay các chất tạo phồng nhân tạo. 
              Mỗi ngày, các đầu bếp của Pizza Deli đều dậy từ 5 giờ sáng để kiểm tra độ ẩm của men bột, 
              chọn lọc những mẻ phô mai Mozzarella tươi ngon nhất và điều chỉnh nhiệt độ than củi sồi.
            </p>

            <div className="about-quote-box">
              <p className="about-quote-text">
                "Chúng tôi không chỉ nướng bánh pizza, chúng tôi trao gửi những khoảnh khắc gắn kết 
                ấm áp và nụ cười rạng rỡ của gia đình bạn bên bàn ăn."
              </p>
              <div className="about-quote-author">— Nhà Sáng Lập Pizza Deli</div>
            </div>

            <div className="d-flex flex-wrap gap-3 mt-4">
              <div className="d-flex align-items-center gap-2 fw-semibold text-dark">
                <FaCheckCircle className="text-success" /> Nguyên liệu chuẩn hữu cơ
              </div>
              <div className="d-flex align-items-center gap-2 fw-semibold text-dark">
                <FaCheckCircle className="text-success" /> Thợ làm bánh đạt chứng chỉ Ý
              </div>
              <div className="d-flex align-items-center gap-2 fw-semibold text-dark">
                <FaCheckCircle className="text-success" /> Lò nướng nhập khẩu từ Napoli
              </div>
            </div>
          </div>

          <div className="about-story-image-wrap">
            <img 
              src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80" 
              alt="Pizza Craftsmanship" 
              className="about-main-img"
            />
            <div className="about-floating-badge">
              <FaFire className="about-floating-icon" />
              <div>
                <div className="about-floating-title">Lò Nướng Củi 400°C</div>
                <div className="about-floating-desc">Đốt bằng gỗ sồi tự nhiên cho hương vị thơm nồng tinh tế</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 PILLARS OF CRAFT */}
        <section className="about-craft-section">
          <div className="about-center-header">
            <span className="about-section-tag">Bí Quyết Ẩm Thực</span>
            <h2 className="about-section-heading">4 Trụ Cột Tạo Nên Chiếc Pizza Hoàn Hảo</h2>
            <p className="text-muted">
              Sự khác biệt của Pizza Deli đến từ quy trình thủ công nghiêm ngặt và sự tôn trọng tuyệt đối truyền thống ẩm thực Ý.
            </p>
          </div>

          <div className="about-craft-grid">
            {craftPillars.map((pillar, idx) => (
              <div key={idx} className="about-craft-card">
                <div className="about-craft-step">{pillar.step}</div>
                {pillar.icon}
                <h3 className="about-craft-title">{pillar.title}</h3>
                <p className="about-craft-desc">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TEAM SECTION */}
        <section className="about-team-section">
          <div className="about-center-header">
            <span className="about-section-tag">Bậc Thầy Ẩm Thực</span>
            <h2 className="about-section-heading">Đội Ngũ Nghệ Nhân Bếp Trưởng</h2>
            <p className="text-muted">
              Những con người tâm huyết đứng sau từng chiếc bánh nóng hổi và mỗi món ăn đậm đà tại Pizza Deli.
            </p>
          </div>

          <div className="about-team-grid">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="about-member-card">
                <div className="about-member-img-wrap">
                  <img src={member.image} alt={member.name} className="about-member-img" />
                  <span className="about-member-role-badge">{member.role}</span>
                </div>
                <div className="about-member-info">
                  <h3 className="about-member-name">{member.name}</h3>
                  <div className="about-member-subtitle">Chuyên gia ẩm thực Ý</div>
                  <p className="about-member-bio">{member.bio}</p>
                  <p className="about-member-quote">{member.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="about-cta-card">
          <div className="about-cta-content">
            <h3>Sẵn Sàng Thưởng Thức Pizza Ý Đích Thực?</h3>
            <p>
              Đặt món ngay hôm nay để nhận ưu đãi giảm 20% cho đơn hàng đầu tiên cùng dịch vụ giao hàng nhanh 30 phút nóng giòn!
            </p>
          </div>
          <div className="about-cta-actions">
            <Link to="/" className="about-btn-primary">
              <FaPizzaSlice /> Khám Phá Thực Đơn
            </Link>
            <Link to="/contact" className="about-btn-secondary">
              <FaPhoneAlt /> Đặt Bàn / Liên Hệ
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;