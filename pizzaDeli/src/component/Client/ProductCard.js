import React from "react";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { useCart } from "../../context/CartContext";
import "../../css/HomeModern.css";

const ProductCard = ({ product, onClick }) => {
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price || 0) + " đ";
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const pid = product?.productId ?? product?.id;
    if (!product || pid === undefined || pid === null) {
      return;
    }

    if (product.active === false) {
      Swal.fire({
        icon: "info",
        title: "Tạm ngưng phục vụ",
        text: `Món "${product.productName || 'sản phẩm'}" hiện đang tạm ngưng phục vụ.`,
        timer: 1800,
        showConfirmButton: false
      });
      return;
    }

    if (product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Hết hàng",
        text: `Món "${product.productName || 'sản phẩm'}" hiện đã hết hàng. Vui lòng chọn món khác!`,
        timer: 1800,
        showConfirmButton: false
      });
      return;
    }

    try {
      addToCart(product, 1);

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Đã thêm vào giỏ hàng!",
        text: `${product.productName || 'Món ăn'} (1 phần)`,
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        background: "#fffdf9",
        iconColor: "#ea580c",
      });
    } catch (error) {
      console.error("Error handling cart:", error);
    }
  };

  const isOutOfStock =
    product?.stock !== undefined && product?.stock !== null && Number(product.stock) <= 0;

  const imgSrc =
    product.image?.startsWith("../")
      ? product.image.substring(2)
      : product.image || "/img/default-product.png";

  return (
    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-4">
      <div
        className={`product-card-modern ${isOutOfStock ? "opacity-75" : ""}`}
        onClick={onClick}
      >
        {/* Image Box */}
        <div className="product-card-img-box">
          {isOutOfStock ? (
            <span className="product-card-badge out-of-stock">Hết hàng</span>
          ) : product.tag ? (
            <span className="product-card-badge">{product.tag}</span>
          ) : null}

          <img
            src={imgSrc}
            alt={product.productName || "Product"}
            onError={(e) => {
              e.target.src = "/img/default-product.png";
            }}
          />
        </div>

        {/* Info */}
        <div className="product-card-body">
          <h3 className="product-card-title text-truncate" title={product.productName}>
            {product.productName || "Món ăn chưa có tên"}
          </h3>

          <p className="product-card-desc">
            {product.description || "Hương vị ẩm thực Ý truyền thống kết hợp nguyên liệu cao cấp tươi ngon."}
          </p>

          <div className="product-card-footer">
            <span className="product-card-price">
              {formatPrice(product.price)}
            </span>

            <button
              type="button"
              className="btn-card-add-cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock || product.active === false}
              title={isOutOfStock ? "Đã hết hàng" : "Thêm vào giỏ"}
            >
              <FaPlus />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;