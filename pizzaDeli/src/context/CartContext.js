import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { GetActiveCoupons, ValidateCouponAPI } from '../services/ApiService';

const CartContext = createContext();

const CART_STORAGE_KEY = 'pizza4ps_cart';
const COUPON_STORAGE_KEY = 'pizza4ps_coupon';

export const normalizeImagePath = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  let clean = path.replace(/^\.\.\//, '');
  if (!clean.startsWith('/')) {
    clean = '/' + clean;
  }
  return clean;
};

// Danh sách Voucher mặc định làm dự phòng
export const AVAILABLE_COUPONS = [
  {
    code: 'PIZZA50',
    title: 'Giảm 50.000đ',
    discountType: 'FIXED',
    discountValue: 50000,
    minOrder: 200000,
    description: 'Giảm ngay 50.000đ cho đơn hàng từ 200.000đ',
    badge: 'HOT'
  },
  {
    code: 'FREESHIP',
    title: 'Miễn phí vận chuyển',
    discountType: 'SHIPPING',
    discountValue: 30000,
    minOrder: 150000,
    description: 'Miễn phí giao hàng (tối đa 30.000đ) cho đơn từ 150.000đ',
    badge: 'TIẾT KIỆM'
  },
  {
    code: 'DELI10',
    title: 'Giảm 10% Tổng Đơn',
    discountType: 'PERCENT',
    discountValue: 10,
    maxDiscount: 60000,
    minOrder: 0,
    description: 'Giảm 10% (tối đa 60.000đ) áp dụng cho mọi đơn hàng',
    badge: 'CHO MỌI ĐƠN'
  },
  {
    code: 'VIP100',
    title: 'VIP Giảm 100.000đ',
    discountType: 'FIXED',
    discountValue: 100000,
    minOrder: 400000,
    description: 'Giảm 100.000đ cho hóa đơn từ 400.000đ trở lên',
    badge: 'VIP'
  }
];

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.error('Lỗi khi đọc giỏ hàng từ localStorage:', error);
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [couponsList, setCouponsList] = useState(AVAILABLE_COUPONS);

  // Tải danh sách coupon từ API backend khi ứng dụng khởi chạy
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const data = await GetActiveCoupons();
        if (Array.isArray(data) && data.length > 0) {
          setCouponsList(data);
        }
      } catch (err) {
        console.warn('Dùng danh sách coupon dự phòng:', err);
      }
    };
    fetchCoupons();
  }, []);

  // Đồng bộ giỏ hàng vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Lỗi khi lưu giỏ hàng vào localStorage:', error);
    }
  }, [cartItems]);

  // Đồng bộ coupon vào localStorage
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Lỗi khi lưu coupon:', error);
    }
  }, [appliedCoupon]);

  // Lắng nghe thay đổi từ các tab khác
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CART_STORAGE_KEY) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : [];
          setCartItems(Array.isArray(updated) ? updated : []);
        } catch (err) {
          console.error('Lỗi phân tích localStorage storage event:', err);
        }
      }
      if (e.key === COUPON_STORAGE_KEY) {
        try {
          setAppliedCoupon(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Thêm sản phẩm vào giỏ hàng (hỗ trợ tùy chọn Size, Đế, Toppings, Ghi chú)
  const addToCart = useCallback((product, quantity = 1, options = null) => {
    if (!product) return;
    const pid = product.productId ?? product.id;
    if (pid === undefined || pid === null) return;

    const pname = product.productName ?? product.name ?? 'Sản phẩm';
    const qtyToAdd = Math.max(1, Number(quantity) || 1);

    // Tính toán đơn giá có bao gồm các tùy chọn
    let calculatedUnitPrice = Number(product.price) || 0;
    let optionTags = [];

    if (options) {
      if (options.calculatedUnitPrice !== undefined) {
        calculatedUnitPrice = Number(options.calculatedUnitPrice) || calculatedUnitPrice;
      }
      if (options.size?.name) optionTags.push(`Size: ${options.size.name}`);
      if (options.crust?.name) optionTags.push(`Đế: ${options.crust.name}`);
      if (Array.isArray(options.toppings) && options.toppings.length > 0) {
        optionTags.push(`Topping: ${options.toppings.map(t => t.name).join(', ')}`);
      }
      if (options.note?.trim()) {
        optionTags.push(`Ghi chú: ${options.note.trim()}`);
      }
    }

    // Tạo mã cartItemId duy nhất dựa trên tùy chọn
    const toppingKeys = options?.toppings ? options.toppings.map(t => t.id).sort().join('_') : '';
    const cartItemId = options
      ? `${pid}_s${options.size?.id || 'm'}_c${options.crust?.id || 'thin'}_t${toppingKeys}_${encodeURIComponent(options.note || '')}`
      : `${pid}`;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => (item.cartItemId || item.productId || item.id) === cartItemId
      );

      if (existingIndex > -1) {
        return prevItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: (Number(item.quantity) || 0) + qtyToAdd }
            : item
        );
      }

      const formattedProduct = {
        ...product,
        cartItemId,
        productId: pid,
        id: pid,
        productName: pname,
        name: pname,
        image: normalizeImagePath(product.image),
        price: calculatedUnitPrice,
        originalPrice: Number(product.price) || 0,
        quantity: qtyToAdd,
        options: options || null,
        optionTags: optionTags
      };

      return [...prevItems, formattedProduct];
    });
  }, []);

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = useCallback((identifier) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        const itemId = item.cartItemId || item.productId || item.id;
        return itemId !== identifier && item.productId !== identifier && item.id !== identifier;
      })
    );
  }, []);

  // Cập nhật số lượng sản phẩm
  const updateQuantity = useCallback((identifier, newQuantity) => {
    const qty = Number(newQuantity);
    if (qty < 1) {
      removeFromCart(identifier);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        const itemId = item.cartItemId || item.productId || item.id;
        if (itemId === identifier || item.productId === identifier || item.id === identifier) {
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  // Xóa toàn bộ giỏ hàng
  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedCoupon(null);
  }, []);

  // Tổng số lượng món
  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  }, [cartItems]);

  // Tạm tính trước giảm giá
  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + ((Number(item.price) || 0) * (Number(item.quantity) || 0)),
      0
    );
  }, [cartItems]);

  // Phí vận chuyển tiêu chuẩn 30.000đ
  const DEFAULT_SHIPPING_FEE = 30000;

  // Tính số tiền được giảm từ coupon (chỉ giảm trên giá món)
  const discountAmount = useMemo(() => {
    if (!appliedCoupon || totalPrice <= 0) return 0;
    if (appliedCoupon.minOrder && totalPrice < appliedCoupon.minOrder) {
      return 0;
    }

    let discount = 0;
    if (appliedCoupon.discountType === 'PERCENT') {
      discount = Math.round(totalPrice * (appliedCoupon.discountValue / 100));
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.discountType === 'SHIPPING' || appliedCoupon.code === 'FREESHIP') {
      // Giảm trực tiếp ở phí vận chuyển, không trừ 2 lần
      discount = 0;
    } else {
      // FIXED
      discount = appliedCoupon.discountValue || 0;
    }

    return Math.min(totalPrice, discount);
  }, [appliedCoupon, totalPrice]);

  // Phí vận chuyển: 30.000đ khi có món trong giỏ, miễn phí khi áp mã FREESHIP
  const shippingFee = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    if (appliedCoupon?.discountType === 'SHIPPING' || appliedCoupon?.code === 'FREESHIP') {
      return 0;
    }
    return DEFAULT_SHIPPING_FEE;
  }, [cartItems, appliedCoupon]);

  // Tổng tiền thanh toán = Tiền món - Giảm giá + Phí vận chuyển (30k)
  const finalPrice = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    return Math.max(0, totalPrice - discountAmount + shippingFee);
  }, [totalPrice, discountAmount, shippingFee, cartItems]);

  // Áp dụng coupon - Gọi API backend để kiểm tra xác thực trước
  const applyCoupon = useCallback(async (couponCode) => {
    if (!couponCode) {
      return { success: false, message: 'Vui lòng nhập mã giảm giá' };
    }

    const cleanCode = couponCode.trim().toUpperCase();

    // 1. Thử xác thực qua API Backend
    try {
      const apiResult = await ValidateCouponAPI(cleanCode, totalPrice);
      if (apiResult) {
        if (apiResult.valid) {
          const couponObj = apiResult.coupon || {
            code: cleanCode,
            title: cleanCode,
            description: apiResult.message,
            discountValue: apiResult.discountAmount,
            discountType: 'FIXED'
          };
          setAppliedCoupon(couponObj);
          return {
            success: true,
            message: apiResult.message || `Áp dụng thành công mã ${cleanCode}!`
          };
        } else {
          return {
            success: false,
            message: apiResult.message || `Mã giảm giá ${cleanCode} không hợp lệ`
          };
        }
      }
    } catch (apiErr) {
      console.warn('API Validate Coupon lỗi, chuyển sang kiểm tra cục bộ:', apiErr);
    }

    // 2. Dự phòng kiểm tra cục bộ nếu API không khả dụng
    const foundCoupon = couponsList.find(c => c.code.toUpperCase() === cleanCode);

    if (!foundCoupon) {
      return { success: false, message: `Mã giảm giá "${couponCode}" không tồn tại hoặc đã hết hạn` };
    }

    if (foundCoupon.minOrder && totalPrice < foundCoupon.minOrder) {
      const needed = (foundCoupon.minOrder - totalPrice).toLocaleString('vi-VN');
      return {
        success: false,
        message: `Đơn hàng chưa đạt mức tối thiểu. Hãy mua thêm ${needed} đ để dùng mã ${foundCoupon.code}!`
      };
    }

    setAppliedCoupon(foundCoupon);
    return {
      success: true,
      message: `Áp dụng thành công mã ${foundCoupon.code}! ${foundCoupon.description}`
    };
  }, [totalPrice, couponsList]);

  // Hủy coupon
  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        appliedCoupon,
        discountAmount,
        shippingFee,
        finalPrice,
        applyCoupon,
        removeCoupon,
        availableCoupons: couponsList
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider');
  }
  return context;
};

export default CartContext;
