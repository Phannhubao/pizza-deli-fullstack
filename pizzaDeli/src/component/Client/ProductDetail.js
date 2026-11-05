import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaMinus, FaCheck, FaUtensils, FaPizzaSlice, FaConciergeBell } from "react-icons/fa";
import axios from "axios";
import "../../css/detail.css";
import Swal from "sweetalert2";
import { Domain } from "../../services/Domain";
import { useCart } from "../../context/CartContext";
import ProductReviews from "./ProductReviews";

const SIZES = [
  { id: "s", name: "Nhỏ (S - 7\")", extraPrice: 0, desc: "4 miếng • 1 người ăn" },
  { id: "m", name: "Vừa (M - 9\")", extraPrice: 45000, desc: "6 miếng • 2 người ăn" },
  { id: "l", name: "Lớn (L - 12\")", extraPrice: 90000, desc: "8 miếng • 3-4 người ăn" },
];

const CRUSTS = [
  { id: "thin", name: "Đế Mỏng Giòn", extraPrice: 0, desc: "Chuẩn phong cách Napoli giòn tan" },
  { id: "thick", name: "Đế Dày Truyền Thống", extraPrice: 0, desc: "Xốp mềm thơm bơ béo ngậy" },
  { id: "cheese", name: "Viền Phô Mai Kéo Sợi", extraPrice: 35000, desc: "+35.000đ • Ngập tràn Mozzarella" },
  { id: "sausage_cheese", name: "Viền Xúc Xích Phô Mai", extraPrice: 45000, desc: "+45.000đ • Đậm đà thơm ngon" },
];

const EXTRA_TOPPINGS = [
  { id: "cheese", name: "Thêm Phô Mai Mozzarella", price: 20000, icon: "🧀" },
  { id: "bacon", name: "Thịt Xông Khói (Bacon)", price: 25000, icon: "🥓" },
  { id: "beef", name: "Bò Băm Xốt Tiêu", price: 25000, icon: "🥩" },
  { id: "mushroom", name: "Nấm Mỡ Tươi Nhập Khẩu", price: 15000, icon: "🍄" },
  { id: "peppers", name: "Ớt Chuông & Hành Tây Nướng", price: 10000, icon: "🫑" },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tùy chỉnh Pizza
  const [selectedSize, setSelectedSize] = useState(SIZES[1]); // Mặc định size M
  const [selectedCrust, setSelectedCrust] = useState(CRUSTS[0]); // Mặc định đế mỏng giòn
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [specialNote, setSpecialNote] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${Domain}/api/products/${id}`);

        // Fetch image separately
        const imageResponse = await axios.get(`${Domain}/api/images/product/${id}`);
        const imageUrl = imageResponse.data?.[0]?.imageUrl || "img/default-product.png";

        setProduct({
          ...response.data,
          image: imageUrl,
        });
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Kiểm tra xem sản phẩm có phải là Pizza hay không
  const isPizza = useMemo(() => {
    if (!product) return false;
    const name = (product.productName || product.name || "").toLowerCase();
    return name.includes("pizza") || product.categoryId === 1;
  }, [product]);

  // Toggle topping
  const handleToggleTopping = (topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      }
      return [...prev, topping];
    });
  };

  // Tính đơn giá sau khi cộng options
  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const base = Number(product.price) || 0;
    if (!isPizza) return base;

    const sizeExtra = selectedSize.extraPrice || 0;
    const crustExtra = selectedCrust.extraPrice || 0;
    const toppingsExtra = selectedToppings.reduce((sum, t) => sum + (t.price || 0), 0);

    return base + sizeExtra + crustExtra + toppingsExtra;
  }, [product, isPizza, selectedSize, selectedCrust, selectedToppings]);

  const totalCalculatedPrice = unitPrice * quantity;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price || 0) + " đ";
  };

  const handleAddToCart = () => {
    if (!product) return;

    const options = isPizza
      ? {
          size: selectedSize,
          crust: selectedCrust,
          toppings: selectedToppings,
          note: specialNote,
          calculatedUnitPrice: unitPrice,
        }
      : null;

    addToCart(product, quantity, options);

    let detailsText = `${quantity}x ${product.productName || "Món ăn"}`;
    if (isPizza) {
      detailsText += ` [${selectedSize.name}, ${selectedCrust.name}]`;
    }

    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Đã thêm vào giỏ hàng!",
      text: detailsText,
      showConfirmButton: false,
      timer: 2000,
      toast: true,
      background: "#fffdf9",
      iconColor: "#c9a66b",
    });
  };

  if (isLoading) {
    return (
      <div className="pd-loading">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Đang tải chi tiết món ăn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pd-error text-center py-5">
        <p className="text-danger">{error}</p>
        <button className="btn btn-outline-dark" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-not-found text-center py-5">
        <p>Sản phẩm không tồn tại</p>
        <button className="btn btn-warning" onClick={() => navigate("/products")}>
          Xem sản phẩm khác
        </button>
      </div>
    );
  }

  return (
    <div className="pd-container">
      <button className="pd-back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Quay lại thực đơn
      </button>

      <div className="pd-grid">
        {/* Cột hình ảnh */}
        <div className="pd-image-col">
          <div className="pd-image-wrapper">
            <img
              src={product.image}
              alt={product.productName}
              className="product-image pd-main-image"
            />
            {isPizza && <span className="pd-badge-floating">🍕 Pizza Tùy Chỉnh</span>}
          </div>

          <div className="pd-badges-row mt-3">
            <span className="badge bg-warning text-dark me-2">Giao nhanh 30 phút</span>
            <span className="badge bg-success me-2">Nguyên liệu nhập khẩu</span>
            {product.stock > 0 ? (
              <span className="badge bg-info text-dark">Còn {product.stock} phần</span>
            ) : (
              <span className="badge bg-danger">Hết hàng</span>
            )}
          </div>
        </div>

        {/* Cột thông tin & bộ tùy chỉnh */}
        <div className="pd-info-col">
          <h1 className="pd-product-title">{product.productName}</h1>

          <div className="pd-price-container">
            <span className="pd-product-price">{formatPrice(unitPrice)}</span>
            {isPizza && (
              <span className="pd-base-price-hint">
                (Giá gốc: {formatPrice(product.price)})
              </span>
            )}
          </div>

          <div className="pd-section pd-desc-section">
            <p className="pd-section-content">
              {product.description || "Hương vị ẩm thực Ý truyền thống kết hợp nguyên liệu cao cấp tươi ngon."}
            </p>
          </div>

          {/* === BỘ TÙY CHỌN CHO PIZZA === */}
          {isPizza && (
            <div className="pd-customizer-box">
              {/* 1. CHỌN SIZE */}
              <div className="customizer-group">
                <div className="customizer-header">
                  <FaPizzaSlice className="group-icon" />
                  <h4>1. Chọn kích thước bánh:</h4>
                </div>
                <div className="size-options-grid">
                  {SIZES.map((size) => (
                    <div
                      key={size.id}
                      className={`size-card ${selectedSize.id === size.id ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      <div className="size-name">{size.name}</div>
                      <div className="size-desc">{size.desc}</div>
                      <div className="size-price">
                        {size.extraPrice === 0 ? "Giá gốc" : `+${formatPrice(size.extraPrice)}`}
                      </div>
                      {selectedSize.id === size.id && <FaCheck className="selected-check" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. CHỌN ĐẾ BÁNH */}
              <div className="customizer-group mt-4">
                <div className="customizer-header">
                  <FaUtensils className="group-icon" />
                  <h4>2. Chọn loại đế bánh:</h4>
                </div>
                <div className="crust-options-list">
                  {CRUSTS.map((crust) => (
                    <label
                      key={crust.id}
                      className={`crust-item ${selectedCrust.id === crust.id ? "active" : ""}`}
                    >
                      <input
                        type="radio"
                        name="crust"
                        checked={selectedCrust.id === crust.id}
                        onChange={() => setSelectedCrust(crust)}
                      />
                      <div className="crust-info">
                        <span className="crust-name">{crust.name}</span>
                        <span className="crust-desc">{crust.desc}</span>
                      </div>
                      <span className="crust-price">
                        {crust.extraPrice === 0 ? "+0 đ" : `+${formatPrice(crust.extraPrice)}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. THÊM TOPPINGS */}
              <div className="customizer-group mt-4">
                <div className="customizer-header">
                  <span className="group-icon">🧀</span>
                  <h4>3. Thêm topping hảo hạng (tùy chọn):</h4>
                </div>
                <div className="topping-chips-grid">
                  {EXTRA_TOPPINGS.map((topping) => {
                    const isSelected = selectedToppings.some((t) => t.id === topping.id);
                    return (
                      <button
                        key={topping.id}
                        type="button"
                        className={`topping-chip ${isSelected ? "selected" : ""}`}
                        onClick={() => handleToggleTopping(topping)}
                      >
                        <span className="topping-icon">{topping.icon}</span>
                        <span className="topping-name">{topping.name}</span>
                        <span className="topping-extra">+{formatPrice(topping.price)}</span>
                        {isSelected && <FaCheck className="chip-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. GHI CHÚ BẾP */}
              <div className="customizer-group mt-4">
                <div className="customizer-header">
                  <FaConciergeBell className="group-icon" />
                  <h4>4. Ghi chú cho đầu bếp:</h4>
                </div>
                <input
                  type="text"
                  className="form-control custom-note-input"
                  placeholder="Ví dụ: Cắt làm 8 miếng, không hành tây, xốt ít cay..."
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  maxLength={150}
                />
              </div>
            </div>
          )}

          {/* ĐIỀU KHIỂN SỐ LƯỢNG VÀ THÊM VÀO GIỎ */}
          <div className="pd-action-box mt-4">
            <div className="pd-quantity-row">
              <span className="quantity-label">Số lượng:</span>
              <div className="pd-quantity-control">
                <button
                  type="button"
                  className="pd-quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <FaMinus />
                </button>
                <span className="pd-quantity-value">{quantity}</span>
                <button
                  type="button"
                  className="pd-quantity-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <FaPlus />
                </button>
              </div>
              <div className="pd-calculated-total">
                <span>Tổng:</span>
                <strong>{formatPrice(totalCalculatedPrice)}</strong>
              </div>
            </div>

            <button
              className="pd-add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.active === false || product.stock === 0}
            >
              <FaPlus />
              {product.active !== false && product.stock !== 0
                ? `Thêm Vào Giỏ Hàng • ${formatPrice(totalCalculatedPrice)}`
                : "Sản phẩm tạm hết hàng"}
            </button>
          </div>
        </div>
      </div>

      {/* Đánh Giá & Nhận Xét Sản Phẩm */}
      <ProductReviews
        productId={product.productId || id}
        productName={product.productName || product.name}
      />
    </div>
  );
};

export default ProductDetail;