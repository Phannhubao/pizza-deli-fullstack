import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPizzaSlice,
  FaBolt,
  FaLeaf,
  FaFire,
  FaTicketAlt,
  FaCopy,
  FaCheck,
  FaSearch,
  FaStar,
  FaPhoneAlt,
  FaShoppingBag,
  FaUtensils,
  FaMotorcycle
} from "react-icons/fa";
import Swal from "sweetalert2";
import Banner from "./Banner";
import ProductCard from "./ProductCard";
import {
  GetProductList,
  GetImageByProductId,
  GetCategoryList
} from "../../services/ApiService";
import { Domain } from "../../services/Domain";
import axios from "axios";
import "../../css/HomeModern.css";

function Home() {
  const navigate = useNavigate();

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState("");

  // 1. Fetch initial data (Products, Images, Categories, Coupons)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes, coupRes] = await Promise.allSettled([
          GetProductList(),
          GetCategoryList(),
          axios.get(`${Domain}/api/coupons`)
        ]);

        // Products
        let prodList = [];
        if (prodRes.status === "fulfilled" && prodRes.value?.data) {
          const rawProds = Array.isArray(prodRes.value.data) ? prodRes.value.data : [];
          prodList = rawProds.filter((p) => p.active);
        }

        // Fetch images for each product
        const imagesMap = {};
        for (const p of prodList) {
          try {
            const imgRes = await GetImageByProductId(p.productId);
            const imgs = imgRes?.data || [];
            if (imgs.length > 0) {
              const primary = imgs.find((i) => i.isPrimary) || imgs[0];
              imagesMap[p.productId] = primary.imageUrl;
            } else {
              imagesMap[p.productId] = "/img/default-product.png";
            }
          } catch {
            imagesMap[p.productId] = "/img/default-product.png";
          }
        }

        const processed = prodList.map((p) => ({
          ...p,
          image: imagesMap[p.productId] || "/img/default-product.png"
        }));
        setProducts(processed);

        // Categories
        if (catRes.status === "fulfilled") {
          const cats = Array.isArray(catRes.value)
            ? catRes.value
            : catRes.value?.data || [];
          setCategories(Array.isArray(cats) ? cats : []);
        }

        // Coupons
        if (coupRes.status === "fulfilled" && coupRes.value?.data) {
          const coups = Array.isArray(coupRes.value.data)
            ? coupRes.value.data
            : coupRes.value.data?.data || [];
          setCoupons(Array.isArray(coups) ? coups : []);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Filter products by category and search term
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;

      // Category filter
      if (selectedCategory !== "ALL") {
        const pCatId = String(p.categoryId || p.category?.categoryId);
        if (pCatId !== String(selectedCategory)) {
          return false;
        }
      }

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const nameMatch = p.productName?.toLowerCase().includes(term);
        const descMatch = p.description?.toLowerCase().includes(term);
        return nameMatch || descMatch;
      }

      return true;
    });
  }, [products, selectedCategory, searchTerm]);

  // 3. Copy coupon code
  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: `Đã sao chép mã ${code}!`,
      text: "Nhập mã này tại bước thanh toán để nhận giảm giá.",
      showConfirmButton: false,
      timer: 1800,
      toast: true,
      background: "#0f172a",
      color: "#ffffff",
      iconColor: "#f97316"
    });
    setTimeout(() => setCopiedCoupon(""), 2500);
  };

  // 4. Chef's signature product
  const signatureProduct = useMemo(() => {
    return (
      products.find((p) => p.productName?.toLowerCase().includes("miso")) ||
      products[0] ||
      null
    );
  }, [products]);

  return (
    <div className="home-modern-container">
      {/* 1. Hero Carousel Banner */}
      <Banner />

      <div className="container py-4">
        {/* 2. Feature Highlights Section */}
        <section id="features-section" className="home-section-features">
          <div className="row g-3">
            <div className="col-lg-3 col-sm-6">
              <div className="feature-highlight-card">
                <div className="feature-icon-wrapper icon-orange">
                  <FaPizzaSlice />
                </div>
                <div>
                  <h4 className="feature-title">100% Mozzarella Tươi</h4>
                  <p className="feature-desc">Chuẩn vị Ý, béo ngậy và thơm lừng kéo sợi tự nhiên.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div className="feature-highlight-card">
                <div className="feature-icon-wrapper icon-green">
                  <FaBolt />
                </div>
                <div>
                  <h4 className="feature-title">Giao Nhanh 30 Phút</h4>
                  <p className="feature-desc">Hộp giữ nhiệt chuyên dụng, bánh luôn nóng hổi giòn rụm.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div className="feature-highlight-card">
                <div className="feature-icon-wrapper icon-gold">
                  <FaLeaf />
                </div>
                <div>
                  <h4 className="feature-title">Nguyên Liệu Organic</h4>
                  <p className="feature-desc">Rau củ tươi sạch thu hoạch trực tiếp từ nông trại mỗi ngày.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-sm-6">
              <div className="feature-highlight-card">
                <div className="feature-icon-wrapper icon-red">
                  <FaFire />
                </div>
                <div>
                  <h4 className="feature-title">Nướng Lò Củi 400°C</h4>
                  <p className="feature-desc">Vỏ bánh giòn xốp bên ngoài, mềm dai đậm vị khói củi đặc trưng.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Coupon Voucher Bar */}
        <section id="coupons-section">
          <div className="home-coupon-strip">
            <div className="coupon-strip-info">
              <div className="coupon-strip-icon">
                <FaTicketAlt />
              </div>
              <div>
                <h3 className="coupon-strip-title">Ưu Đãi Đặc Quyền Hôm Nay</h3>
                <p className="coupon-strip-desc">
                  Nhấp vào mã ưu đãi để sao chép và áp dụng ngay khi thanh toán:
                </p>
              </div>
            </div>

            <div className="coupon-tags-list">
              {(coupons.length > 0
                ? coupons
                : [
                    { code: "PIZZA50", description: "Giảm ngay 50.000đ" },
                    { code: "FREESHIP", description: "Freeship toàn thành phố" },
                    { code: "DELI10", description: "Giảm 10% tổng đơn" },
                    { code: "VIP100", description: "VIP giảm 100.000đ" }
                  ]
              ).map((c) => (
                <div
                  key={c.code}
                  className="coupon-pill-tag"
                  onClick={() => handleCopyCoupon(c.code)}
                  title="Nhấp để sao chép mã"
                >
                  <span>Mã: <strong>{c.code}</strong></span>
                  <small className="opacity-75">({c.description || "Ưu đãi hot"})</small>
                  {copiedCoupon === c.code ? (
                    <FaCheck className="text-success" />
                  ) : (
                    <FaCopy className="opacity-50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Chef's Signature Spotlight */}
        {signatureProduct && (
          <section className="home-section-spotlight mb-5">
            <div className="container px-4">
              <div className="row align-items-center g-4">
                <div className="col-lg-6">
                  <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase mb-3">
                    ⭐ Món Đặc Biệt Của Bếp Trưởng (Chef's Signature)
                  </span>
                  <h2 className="display-6 fw-bold mb-3">
                    {signatureProduct.productName}
                  </h2>
                  <p className="lead text-light opacity-90 mb-4" style={{ lineHeight: 1.7 }}>
                    {signatureProduct.description ||
                      "Sự kết hợp tinh tế giữa ẩm thực Ý truyền thống và hương vị Nhật Bản hiện đại. Cá hồi Nauy tươi phi lê áp chảo kết hợp xốt kem miso béo ngậy, nướng trên nền phô mai Mozzarella chảy giòn rụm."}
                  </p>

                  <div className="d-flex align-items-baseline gap-3 mb-4">
                    <span className="fs-2 fw-bold text-warning">
                      {(Number(signatureProduct.price) || 0).toLocaleString("vi-VN")} ₫
                    </span>
                    <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill">
                      Nướng củi thủ công
                    </span>
                  </div>

                  <div className="d-flex gap-3 flex-wrap">
                    <button
                      className="btn-hero-primary"
                      onClick={() => navigate(`/product/${signatureProduct.productId}`)}
                    >
                      <FaUtensils />
                      <span>Xem Chi Tiết & Tùy Biến Bánh</span>
                    </button>
                    <button
                      className="btn-hero-secondary"
                      onClick={() => {
                        const el = document.getElementById("menu-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <span>Xem Toàn Bộ Thực Đơn</span>
                    </button>
                  </div>
                </div>

                <div className="col-lg-6 text-center">
                  <div className="spotlight-img-box">
                    <img
                      src={signatureProduct.image || "/img/default-product.png"}
                      alt={signatureProduct.productName}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5. Main Menu & Product Grid */}
        <section id="menu-section" className="py-4">
          <div className="section-header-modern">
            <span className="section-pill-badge">Thực Đơn Đa Dạng</span>
            <h2 className="section-main-title">Khám Phá Hương Vị Pizza Deli</h2>
            <p className="section-sub-title">
              Từ các loại pizza nướng củi cổ điển đến mì Ý sốt kem thơm ngậy, salad thanh mát và đồ uống giải nhiệt.
            </p>
          </div>

          {/* Search bar */}
          <div className="home-search-bar">
            <FaSearch className="home-search-icon" />
            <input
              type="text"
              className="home-search-input"
              placeholder="Tìm kiếm món ngon theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="category-nav-pills">
            <button
              type="button"
              className={`category-tab-btn ${selectedCategory === "ALL" ? "active" : ""}`}
              onClick={() => setSelectedCategory("ALL")}
            >
              <span>Tất cả món</span>
              <span className="category-tab-count">{products.length}</span>
            </button>

            {categories.map((cat) => {
              const catId = cat.categoryId || cat.id;
              const count = products.filter(
                (p) => String(p.categoryId || p.category?.categoryId) === String(catId)
              ).length;

              return (
                <button
                  key={catId}
                  type="button"
                  className={`category-tab-btn ${
                    String(selectedCategory) === String(catId) ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(catId)}
                >
                  <span>{cat.categoryName}</span>
                  <span className="category-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status"></div>
              <p className="mt-3 text-muted">Đang chuẩn bị thực đơn nóng hổi...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="row g-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onClick={() => navigate(`/product/${product.productId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-5 bg-white rounded-4 border shadow-sm my-4">
              <FaPizzaSlice style={{ fontSize: "3.5rem", color: "#cbd5e1" }} />
              <h4 className="mt-3 text-secondary fw-bold">Không tìm thấy món ăn phù hợp</h4>
              <p className="text-muted small">
                Hãy thử chọn danh mục khác hoặc nhập từ khóa tìm kiếm món ăn bạn muốn thưởng thức.
              </p>
              <button
                className="btn btn-outline-warning text-dark mt-2"
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSearchTerm("");
                }}
              >
                Xem lại tất cả món ăn
              </button>
            </div>
          )}
        </section>

        {/* 6. Testimonials Section */}
        <section className="py-5 my-4">
          <div className="section-header-modern">
            <span className="section-pill-badge">Đánh Giá Thực Tế</span>
            <h2 className="section-main-title">Khách Hàng Nói Gì Về Pizza Deli?</h2>
            <p className="section-sub-title">
              Hàng ngàn thực khách đã yêu mến và tin tưởng hương vị pizza nướng củi chuẩn Ý của chúng tôi.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="testimonial-card-modern">
                <div>
                  <div className="testimonial-stars">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <p className="testimonial-quote">
                    "Pizza nướng củi ở đây vị ngon xuất sắc, vỏ bánh mỏng giòn thơm mùi khói đặc trưng. Phô mai Mozzarella tươi béo ngậy ăn không hề ngấy. Giao hàng cực nhanh, lúc nhận bánh vẫn nóng hổi!"
                  </p>
                </div>
                <div className="testimonial-user">
                  <div className="testimonial-avatar">HA</div>
                  <div>
                    <div className="testimonial-user-name">Hoàng Anh</div>
                    <div className="testimonial-user-sub">Khách hàng thân thiết • Hà Nội</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="testimonial-card-modern">
                <div>
                  <div className="testimonial-stars">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <p className="testimonial-quote">
                    "Món Pizza cá hồi xốt miso là cực phẩm! Cả nhà mình cuối tuần nào cũng đặt combo kèm mỳ Ý và salad. Áp mã PIZZA50 tiết kiệm được 50k, thanh toán VNPay tiện lợi vô cùng."
                  </p>
                </div>
                <div className="testimonial-user">
                  <div className="testimonial-avatar">MT</div>
                  <div>
                    <div className="testimonial-user-name">Minh Trang</div>
                    <div className="testimonial-user-sub">Đặt hơn 20 đơn tại Deli</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="testimonial-card-modern">
                <div>
                  <div className="testimonial-stars">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <p className="testimonial-quote">
                    "Dịch vụ chăm sóc khách hàng rất chu đáo. Bánh đóng hộp sang trọng, có kèm đồ chấm và ớt bột đầy đủ. Rất thích phong cách ẩm thực chuẩn Ý của quán!"
                  </p>
                </div>
                <div className="testimonial-user">
                  <div className="testimonial-avatar">TD</div>
                  <div>
                    <div className="testimonial-user-name">Tuấn Dũng</div>
                    <div className="testimonial-user-sub">Thực khách sành ăn</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Delivery Call-To-Action Banner */}
        <section className="home-delivery-cta">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 className="delivery-cta-title">
                Thèm Pizza Nóng Hổi? Đặt Ngay Trong 30 Giây!
              </h2>
              <p className="delivery-cta-desc">
                Cam kết giao bánh nóng giòn tận nơi trong vòng 30 phút. Đầy đủ quà tặng và mã giảm giá cho mọi đơn hàng hôm nay.
              </p>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <button
                  className="btn btn-light text-dark fw-bold px-4 py-3 rounded-pill shadow-sm"
                  onClick={() => {
                    const el = document.getElementById("menu-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <FaShoppingBag className="me-2 text-warning" /> Đặt Món Ngay
                </button>
                <a
                  href="tel:19006868"
                  className="btn btn-outline-light px-4 py-3 rounded-pill fw-semibold text-decoration-none"
                >
                  <FaPhoneAlt className="me-2" /> Hotline: 1900 6868
                </a>
              </div>
            </div>
            <div className="col-lg-4 text-center mt-4 mt-lg-0">
              <FaMotorcycle style={{ fontSize: "7rem", opacity: 0.85 }} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
