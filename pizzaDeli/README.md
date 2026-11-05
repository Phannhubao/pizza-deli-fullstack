# 🍕 Pizza Deli - Frontend Web Application (`pizzaDeli`)

> **Giao diện Web đặt Pizza & Quản trị nhà hàng trực quan, hiện đại**, xây dựng bằng **React 19**, **Bootstrap 5**, **Material-UI (MUI)**, **Chart.js**, tích hợp thanh toán đa phương thức (**VNPay**, **PayPal**, **QR Code**) và **Trợ lý AI tư vấn món ăn thông minh (RAG Menu Assistant)**.

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React%20Router-v7-red.svg)](https://reactrouter.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-purple.svg)](https://getbootstrap.com/)
[![Material UI](https://img.shields.io/badge/MUI-v7-007FFF.svg)](https://mui.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-v4-FF6384.svg)](https://www.chartjs.org/)

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng nổi bật](#-tính-năng-nổi-bật)
- [Công nghệ & Thư viện sử dụng](#-công-nghệ--thư-viện-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cấu hình kết nối Backend](#-cấu-hình-kết-nối-backend)
- [Hướng dẫn cài đặt & Khởi chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
- [Hình ảnh & Trải nghiệm người dùng](#-hình-ảnh--trải-nghiệm-người-dùng)
- [Lưu ý khi triển khai & Build](#-lưu-ý-khi-triển-khai--build)

---

## 🌟 Tổng quan

`pizzaDeli` là ứng dụng Single Page Application (SPA) phía Client, mang đến trải nghiệm mua sắm đồ ăn trực tuyến tiện lợi cho thực khách và bảng điều khiển quản trị chuyên sâu cho nhà hàng. Giao diện được thiết kế tương thích hoàn hảo trên cả máy tính để bàn (Desktop), máy tính bảng (Tablet) và điện thoại di động (Mobile).

---

## 🚀 Tính năng nổi bật

### 🛍️ Phân hệ Khách hàng (Client Portal)
1. **Trang chủ lôi cuốn**: Banner trình chiếu mượt mà (Swiper & Slick Carousel), danh mục nổi bật, thực đơn món bán chạy (Best Sellers), chương trình ưu đãi mới nhất.
2. **Khám phá Thực đơn (Menu & Filtering)**:
   - Phân loại theo danh mục: Pizza, Khai vị, Salad, Tráng miệng, Nước ngọt,...
   - Tìm kiếm theo từ khóa và lọc sản phẩm linh hoạt.
3. **Chi tiết món ăn (Product Detail)**:
   - Tùy biến kích thước bánh (Size S, M, L) và loại đế bánh (Mỏng giòn, Dày xốp, Viền phô mai).
   - Xem và gửi đánh giá (Rating sao & nhận xét thực tế từ người đã mua).
4. **Giỏ hàng thông minh (Smart Cart)**:
   - Tự động lưu giỏ hàng vào `localStorage` giúp dữ liệu không bị mất khi tải lại trang.
   - Thêm, bớt, xóa món ăn tức thì và cập nhật số tiền động.
5. **Thanh toán đa kênh (Checkout)**:
   - Hỗ trợ thanh toán khi nhận hàng (**COD**).
   - Thanh toán trực tuyến qua **VNPay** và **PayPal**.
   - Tự động sinh mã **VietQR Code** cho phép chuyển khoản nhanh không cần nhập số tài khoản.
   - Hỗ trợ nhập và kiểm tra **Mã giảm giá (Coupon/Voucher)** trực tiếp.
6. **Theo dõi đơn hàng & Xuất hóa đơn**:
   - Quản lý lịch sử đơn hàng cá nhân.
   - Xuất hóa đơn bán lẻ dạng file **PDF** chuyên nghiệp (`jspdf`, `html2pdf.js`).
   - Quét mã QR đơn hàng để kiểm tra tính hợp lệ.
7. **Trợ lý thực đơn RAG AI (RAG Menu Assistant)**:
   - Chatbot AI thông minh sẵn sàng gợi ý bữa ăn lý tưởng theo ngân sách, số lượng thành viên và sở thích ăn uống.

---

### 📊 Phân hệ Quản trị viên (Admin Portal)
1. **Bảng điều khiển (Dashboard)**:
   - Biểu đồ phân tích doanh thu theo ngày/tháng với **Chart.js**.
   - Thống kê tổng số đơn hàng, doanh số, số lượng người dùng mới và phản hồi đánh giá.
2. **Quản lý Sản phẩm & Danh mục**:
   - Thêm mới, chỉnh sửa thông tin món ăn, định giá các biến thể size.
   - Tải ảnh món ăn trực tiếp lên đám mây Cloudinary với cơ chế kéo thả (`react-dropzone`).
   - Bật / tắt trạng thái hiển thị của món ăn trong thực đơn.
3. **Quản lý Đơn hàng**:
   - Danh sách đơn hàng trực quan với phân trang.
   - Cập nhật trạng thái xử lý đơn hàng và trạng thái thanh toán.
4. **Quản lý Khách hàng**:
   - Xem danh sách người dùng đã đăng ký.
   - Khóa (Ban) hoặc mở khóa (Unban) tài khoản người dùng vi phạm.
5. **Quản lý Mã giảm giá (Coupons)**:
   - Tạo mã khuyến mãi mới, thiết lập thời hạn và điều kiện tối thiểu.
6. **Quản lý Đánh giá (Reviews)**:
   - Giám sát toàn bộ đánh giá của khách hàng về từng sản phẩm.

---

## 🛠 Công nghệ & Thư viện sử dụng

| Thư viện / Công cụ | Phiên bản | Mục đích sử dụng |
| :--- | :---: | :--- |
| **React** | `19.0.0` | Thư viện UI cốt lõi xây dựng SPA |
| **React Router DOM** | `7.4.0` | Quản lý điều hướng và định tuyến trang |
| **Axios** | `1.20.0` | Thư viện HTTP Client giao tiếp REST API |
| **Bootstrap / React-Bootstrap** | `5.3.3 / 2.10.9` | Hệ thống Grid và các component giao diện cơ bản |
| **Material UI (MUI)** | `7.3.11` | Các UI Components cao cấp và hệ thống Icon hiện đại |
| **Chart.js / react-chartjs-2** | `4.5.1 / 5.3.1` | Vẽ biểu đồ thống kê doanh thu và báo cáo |
| **SweetAlert2** | `11.17.2` | Hộp thoại thông báo (Modal / Alert / Confirm) sinh động |
| **Swiper / React Slick** | `11.2.6 / 0.30.3` | Slider trình diễn banner và danh sách món ăn |
| **jsPDF / html2pdf.js** | `3.0.3 / 0.12.1` | Xuất hóa đơn bán lẻ dạng tệp PDF tải về |
| **qrcode.react** | `4.2.0` | Tạo mã QR đơn hàng và QR thanh toán |
| **@paypal/react-paypal-js** | `8.8.3` | Tích hợp nút thanh toán chuẩn PayPal Sandbox & Production |

---

## 📁 Cấu trúc thư mục

```text
pizzaDeli/
├── public/                 # Tệp tĩnh, favicon, index.html
├── src/
│   ├── component/          # Các Component giao diện
│   │   ├── Admin/          # Phân hệ Quản trị (Admin)
│   │   │   └── AdminPages/
│   │   │       ├── Chart/            # Biểu đồ doanh thu
│   │   │       ├── Layout/           # Sidebar, Header quản trị
│   │   │       └── Pages/            # Dashboard, Product, Category, Order, User, Review
│   │   └── Client/         # Phân hệ Khách hàng (Client)
│   │       ├── Home.js               # Trang chủ
│   │       ├── Menu.js               # Trang thực đơn
│   │       ├── ProductDetail.js      # Chi tiết sản phẩm & biến thể
│   │       ├── Cart.js               # Giỏ hàng
│   │       ├── CheckoutPage.js       # Trang thanh toán (COD, QR, VNPay, PayPal)
│   │       ├── ProfilePage.js        # Trang cá nhân & Lịch sử đơn hàng
│   │       ├── RAGMenuAssistant.js   # Trợ lý AI gợi ý món ăn
│   │       ├── ProductReviews.js     # Khối bình luận & đánh giá sao
│   │       ├── LoginPage.js          # Trang đăng nhập
│   │       ├── RegisterPage.js       # Trang đăng ký
│   │       └── VNPayReturn.js        # Nhận kết quả callback từ VNPay
│   ├── context/            # React Context (Quản lý trạng thái giỏ hàng, người dùng)
│   ├── css/                # Định kiểu giao diện CSS cho từng trang
│   ├── services/           # Tầng kết nối REST API
│   │   ├── Domain.js       # Cấu hình địa chỉ máy chủ API Backend
│   │   └── ApiService.js   # Tập hợp hàm gọi API (Axios)
│   ├── App.js              # Định tuyến Router chính của ứng dụng
│   ├── index.js            # Entry point của React
│   └── ScrollToTop.js      # Tự động cuộn lên đầu trang khi chuyển trang
├── package.json            # Danh sách dependencies & scripts
└── package-lock.json       # Khóa phiên bản dependencies
```

---

## ⚙️ Cấu hình kết nối Backend

Ứng dụng kết nối tới Backend thông qua tệp [Domain.js](file:///e:/Pizza/pizzaDeli/src/services/Domain.js):

Mở `src/services/Domain.js` và chỉ định địa chỉ Backend của bạn:

```javascript
// Phát triển cục bộ (Localhost)
export let Domain = "http://localhost:8080";

// Triển khai thực tế (Production Cloud)
// export let Domain = "https://deli-api.onrender.com";
```

---

## 🏃 Hướng dẫn cài đặt & Khởi chạy

### 1. Cài đặt các gói phụ thuộc (Dependencies)
Mở cửa sổ dòng lệnh tại thư mục `pizzaDeli`:

```bash
cd pizzaDeli
npm install
```
*(Nếu gặp cảnh báo xung đột peer-dependencies từ một số gói cũ, hãy sử dụng lệnh: `npm install --legacy-peer-deps`)*

### 2. Khởi chạy máy chủ phát triển (Development Server)
```bash
npm start
```

Ứng dụng sẽ tự động mở tại trình duyệt theo địa chỉ:
👉 `http://localhost:3000`

---

## 📦 Đóng gói sản phẩm (Production Build)

Khi muốn biên dịch mã nguồn để triển khai lên máy chủ Hosting (Vercel, Netlify, Render, Nginx,...):

```bash
npm run build
```
Thư mục `build/` sẽ được tạo ra, chứa toàn bộ mã nguồn HTML/CSS/JS đã được nén tối ưu hóa sẵn sàng cho việc phân phối.

---

## 👨‍💻 Tác giả & Đóng góp
Dự án được xây dựng và phát triển cho nền tảng thương mại ẩm thực **Pizza Deli**. Mọi ý kiến đóng góp hoặc phản hồi vui lòng tạo Issue trên kho lưu trữ.
