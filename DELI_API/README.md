# 🍕 Pizza Deli - Backend RESTful API (`DELI_API`)

> **Hệ thống Backend RESTful API cho nền tảng đặt và quản lý giao hàng Pizza Deli**, xây dựng trên nền tảng **Spring Boot 3**, **PostgreSQL**, tích hợp **JWT Security**, **Cloudinary**, thanh toán trực tuyến (**VNPay**, **PayPal**) và **Trợ lý AI tư vấn món ăn (RAG - Retrieval-Augmented Generation)** ứng dụng **Google Gemini**.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue.svg)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/OpenAPI-Swagger%20UI-green.svg)](http://localhost:8080/swagger-ui/index.html)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cấu hình môi trường](#-cấu-hình-môi-trường)
- [Hướng dẫn cài đặt & Khởi chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
- [Tài liệu API & Danh sách Endpoint](#-tài-liệu-api--danh-sách-endpoint)
- [Triển khai với Docker](#-triển-khai-với-docker)

---

## 🌟 Tổng quan

`DELI_API` là lõi xử lý nghiệp vụ cho toàn bộ hệ sinh thái Pizza Deli, cung cấp đầy đủ các API từ xác thực người dùng, quản lý sản phẩm, xử lý giỏ hàng & đơn hàng, áp dụng mã giảm giá, xử lý thanh toán đa kênh đến phân tích và đề xuất món ăn thông minh dựa trên mô hình RAG tích hợp Google Gemini AI.

---

## 🚀 Tính năng chính

### 1. Xác thực & Phân quyền (Authentication & Authorization)
- Đăng ký, đăng nhập tài khoản khách hàng và nhân viên/quản trị viên.
- Cơ chế bảo mật **JWT (JSON Web Token)** với cơ chế xác thực Stateless.
- Quản lý trạng thái người dùng (Ban / Unban tài khoản vi phạm).
- Hỗ trợ gửi email xác thực và đặt lại mật khẩu qua Gmail SMTP / SendGrid.

### 2. Quản lý Thực đơn & Sản phẩm (Menu & Product Management)
- CRUD danh mục sản phẩm (Pizza, Khai vị, Tráng miệng, Nước uống,...).
- CRUD thông tin món ăn, hình ảnh, mô tả, mức giá, kích cỡ (S, M, L) và trạng thái hiển thị.
- Tích hợp **Cloudinary SDK** để upload và tối ưu hóa hình ảnh trực tuyến tự động.

### 3. Đơn hàng & Thanh toán (Orders & Payments)
- Tiếp nhận đơn hàng, tính toán tự động phụ phí và giảm giá.
- Theo dõi vòng đời đơn hàng theo trạng thái thời gian thực: `Chờ xác nhận` -> `Đang chuẩn bị` -> `Đang giao hàng` -> `Đã hoàn thành` / `Đã hủy`.
- Tích hợp cổng thanh toán trực tuyến:
  - **VNPay** (Thanh toán qua thẻ ATM / QR Ngân hàng nội địa).
  - **PayPal** (Thanh toán quốc tế).
  - **COD** (Thanh toán tiền mặt khi nhận hàng).
- Tạo mã **QR Code** tự động bằng thư viện **ZXing** cho từng đơn hàng để xác thực nhanh.

### 4. Mã giảm giá (Coupon Management)
- Quản lý mã khuyến mãi, thiết lập tỷ lệ giảm, giá trị giảm tối đa, giá trị đơn hàng tối thiểu và hạn sử dụng.
- API thẩm định mã (`validate coupon`) bảo đảm tính hợp lệ trước khi hoàn tất đặt hàng.

### 5. Đánh giá & Phản hồi (Reviews & Feedback)
- Đánh giá sao (1 - 5 sao) và để lại bình luận cho sản phẩm.
- Kiểm tra tính xác thực của đánh giá: Chỉ những khách hàng **đã từng mua sản phẩm** mới được quyền đánh giá (`checkCanReview`).

### 6. Trợ lý gợi ý món ăn AI (RAG Recommendation Assistant)
- Ứng dụng mô hình **RAG (Retrieval-Augmented Generation)**: Truy vấn dữ liệu thực đơn thực tế kết hợp với **Google Gemini API**.
- Đề xuất combo món ăn tối ưu dựa trên số lượng người ăn, ngân sách, khẩu vị (độ cay, chay/mặn, tráng miệng) hoặc theo kịch bản (Bữa tối lãng mạn, tiệc gia đình, tụ tập bạn bè,...).

---

## 🛠 Công nghệ sử dụng

| Phân loại | Công nghệ / Thư viện |
| :--- | :--- |
| **Ngôn ngữ** | Java 17 (LTS) |
| **Framework** | Spring Boot 3.5.3 (Spring Data JPA, Spring Web, Spring Security) |
| **Cơ sở dữ liệu** | PostgreSQL 14+ |
| **Bảo mật** | Spring Security + JWT (`io.jsonwebtoken:jjwt:0.11.5`) |
| **Trí tuệ nhân tạo** | Google Gemini API (RAG Recommendation Engine) |
| **Lưu trữ ảnh** | Cloudinary Java SDK 1.29.0 |
| **Mã QR & Tài liệu**| Google ZXing 3.4.1 |
| **Tài liệu API** | Springdoc OpenAPI Starter WebMVC 2.6.0 (Swagger UI) |
| **Email Service** | Spring Boot Starter Mail / SendGrid Java SDK |
| **Build Tool** | Apache Maven 3.9+ |
| **Containerization**| Docker |

---

## 📁 Cấu trúc thư mục

```text
DELI_API/
├── src/
│   ├── main/
│   │   ├── java/com/pizza/deli/
│   │   │   ├── config/              # Cấu hình Security, CORS, Cloudinary, Swagger,...
│   │   │   ├── controller/          # Các REST API Controller
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── CategoryController.java
│   │   │   │   ├── CouponController.java
│   │   │   │   ├── ImageController.java
│   │   │   │   ├── OrderController.java
│   │   │   │   ├── OrderDetailController.java
│   │   │   │   ├── PaymentController.java
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── RecommendationController.java  # RAG AI Gợi ý món
│   │   │   │   ├── ReviewController.java
│   │   │   │   └── UserController.java
│   │   │   ├── dto/                 # Data Transfer Objects (Request/Response)
│   │   │   ├── model/               # Các JPA Entity ánh xạ bảng CSDL
│   │   │   ├── repository/          # Spring Data JPA Repositories
│   │   │   ├── service/             # Xử lý nghiệp vụ (Business logic)
│   │   │   └── DeliApplication.java # Main Application
│   │   └── resources/
│   │       ├── application.properties # Cấu hình database, key, email, jwt
│   │       └── rag_sample_data.sql    # Dữ liệu mẫu khởi tạo cho RAG AI
│   └── test/                        # Unit test & Integration test
├── Dockerfile                       # Multi-stage Docker build
├── mvnw / mvnw.cmd                  # Maven Wrapper
└── pom.xml                          # Quản lý dependencies & build plugin
```

---

## 💻 Yêu cầu hệ thống

- **Java Development Kit (JDK)**: Phiên bản 17 trở lên.
- **PostgreSQL**: Phiên bản 13.0 trở lên đang chạy trên cổng mặc định `5432`.
- **Maven**: 3.8+ (hoặc dùng trực tiếp `./mvnw`).
- Kết nối Internet (để tải thư viện và gọi API Cloudinary, Gemini AI, Email).

---

## ⚙️ Cấu hình môi trường

Mở file `src/main/resources/application.properties` và điều chỉnh các thông số phù hợp:

```properties
server.port=8080

# Cấu hình PostgreSQL Database
spring.datasource.url=jdbc:postgresql://localhost:5432/pizzadeli
spring.datasource.username=postgres
spring.datasource.password=your_db_password
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Cấu hình JWT
jwt.secret=cfrTVYinbpPRorf7EhA7v5MQdKsOhGFJGyzi77an96o
jwt.expiration=86400000

# Cấu hình Cloudinary (Lưu ảnh sản phẩm)
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret

# Cấu hình Google Gemini AI (RAG Recommendation)
gemini.api.key=YOUR_GEMINI_API_KEY

# Cấu hình gửi Mail qua SMTP
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

---

## 🏃 Hướng dẫn cài đặt & Khởi chạy

### 1. Chuẩn bị cơ sở dữ liệu
Khởi tạo cơ sở dữ liệu PostgreSQL:
```sql
CREATE DATABASE pizzadeli;
```
*(Tùy chọn) Chạy script khởi tạo dữ liệu mẫu nếu có trong `src/main/resources/rag_sample_data.sql`.*

### 2. Chạy ứng dụng bằng Maven Wrapper

Trên **Windows (CMD / PowerShell)**:
```powershell
./mvnw.cmd clean spring-boot:run
```

Trên **macOS / Linux**:
```bash
./mvnw clean spring-boot:run
```

Sau khi ứng dụng khởi chạy thành công, API sẽ hoạt động tại:
👉 `http://localhost:8080`

### 3. Truy cập Swagger UI
Tài liệu tương tác trực tiếp API được tích hợp sẵn:
👉 `http://localhost:8080/swagger-ui/index.html`

---

## 📖 Tài liệu API & Danh sách Endpoint

| Phân hệ | Phương thức | Endpoint | Mô tả |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Đăng nhập hệ thống & nhận JWT |
| | `POST` | `/api/auth/logout` | Đăng xuất khỏi hệ thống |
| **User** | `POST` | `/api/users/register` | Đăng ký tài khoản người dùng |
| | `GET` | `/api/users` | Lấy danh sách người dùng (Admin) |
| | `GET` | `/api/users/{id}` | Lấy chi tiết thông tin người dùng |
| | `PUT` | `/api/users/{id}` | Cập nhật thông tin người dùng |
| | `PUT` | `/api/users/{id}/password` | Đổi mật khẩu tài khoản |
| | `POST` | `/api/users/{id}/ban` | Khóa tài khoản người dùng |
| | `POST` | `/api/users/{id}/unban` | Mở khóa tài khoản |
| **Product** | `GET` | `/api/products` | Lấy tất cả sản phẩm |
| | `GET` | `/api/products/active` | Lấy danh sách sản phẩm đang kinh doanh |
| | `GET` | `/api/products/{id}` | Lấy chi tiết một sản phẩm |
| | `GET` | `/api/products/category/{id}` | Lọc sản phẩm theo danh mục |
| | `POST` | `/api/products` | Thêm sản phẩm mới (Admin) |
| | `PUT` | `/api/products/{id}` | Cập nhật thông tin sản phẩm (Admin) |
| | `PUT` | `/api/products/{id}/active` | Bật/tắt trạng thái hiển thị |
| | `DELETE` | `/api/products/{id}` | Xóa sản phẩm (Admin) |
| **Category** | `GET` | `/api/categories` | Lấy danh sách danh mục |
| | `POST` | `/api/categories` | Thêm danh mục mới |
| | `PUT` | `/api/categories/{id}` | Cập nhật danh mục |
| | `DELETE` | `/api/categories/{id}` | Xóa danh mục |
| **Order** | `POST` | `/api/Order/AddOrder` | Tạo đơn hàng mới |
| | `GET` | `/api/Order/GetOrderList` | Lấy toàn bộ danh sách đơn hàng |
| | `GET` | `/api/Order/GetOrder/{id}` | Lấy chi tiết đơn hàng |
| | `GET` | `/api/Order/GetOrderListByUserId/{userId}` | Lấy đơn hàng theo khách hàng |
| | `PUT` | `/api/Order/UpdateStatusOrder/{id}` | Cập nhật trạng thái đơn hàng |
| **Payment** | `POST` | `/api/Payment/AddPayment` | Khởi tạo giao dịch thanh toán |
| | `PUT` | `/api/Payment/UpdateStatusPayment/{orderId}` | Cập nhật trạng thái thanh toán |
| | `GET` | `/api/Payment/GetPaymentByOrderId/{orderId}` | Lấy thông tin thanh toán theo đơn |
| **Coupon** | `GET` | `/api/coupons` | Lấy danh sách mã giảm giá đang hoạt động |
| | `POST` | `/api/coupons/validate` | Kiểm tra tính hợp lệ & giảm trừ của mã |
| | `POST` | `/api/coupons` | Tạo mã giảm giá mới (Admin) |
| | `DELETE` | `/api/coupons/{id}` | Xóa mã giảm giá |
| **Review** | `GET` | `/api/reviews/product/{productId}` | Lấy danh sách đánh giá của sản phẩm |
| | `POST` | `/api/reviews` | Gửi bài đánh giá & số sao |
| | `GET` | `/api/reviews/checkCanReview/{userId}/{productId}` | Kiểm tra điều kiện được phép đánh giá |
| **RAG AI** | `POST` | `/api/recommendations/rag` | Nhận gợi ý combo món theo yêu cầu người dùng |
| | `GET` | `/api/recommendations/presets` | Lấy danh sách kịch bản gợi ý sẵn có |

---

## 🐳 Triển khai với Docker

Dự án đã có sẵn `Dockerfile` hỗ trợ multi-stage build:

```bash
# 1. Build Docker image
docker build -t deli-api:latest .

# 2. Khởi chạy container
docker run -d -p 8080:8080 --name deli_backend \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/pizzadeli \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  deli-api:latest
```

---

## 👨‍💻 Tác giả & Đóng góp
Dự án được xây dựng và phát triển cho nền tảng đặt hàng **Pizza Deli**. Mọi ý kiến đóng góp hoặc phản hồi vui lòng tạo Issue trên kho lưu trữ.
