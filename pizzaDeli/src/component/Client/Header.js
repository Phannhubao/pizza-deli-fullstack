import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Badge, Dropdown } from 'react-bootstrap';
import { FaPizzaSlice, FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; 
import '../../css/header.css';
import Swal from "sweetalert2";
import { PostLogout } from "../../services/ApiService"; // Import PostLogout
import { useCart } from "../../context/CartContext";

const Header = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [isBumping, setIsBumping] = useState(false);

  // Hiệu ứng nhảy số khi có sản phẩm mới được thêm vào giỏ
  useEffect(() => {
    if (totalItems === 0) return;
    setIsBumping(true);
    const timer = setTimeout(() => {
      setIsBumping(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [totalItems]);

  // Lấy thông tin user từ localStorage (giả sử bạn lưu {email, token})
  const userToken = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    try {
      // Call the PostLogout API
      const response = await PostLogout();
      if (response.status === 200 || response.data === "success") {
        // Clear local storage
        localStorage.removeItem("userToken");
        localStorage.removeItem("user");

        // Show success message
        await Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been successfully logged out.",
          timer: 1500,
          showConfirmButton: false,
        });

        // Navigate to homepage
        navigate("/");
      } else {
        throw new Error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: "An error occurred while logging out. Please try again.",
      });
    }
  };

  return (
    <Navbar sticky="top" expand="lg" className="bg-navy shadow-sm py-3 headertop">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-light d-flex align-items-center">
          <FaPizzaSlice size={24} className="me-2" />
          Pizza Deli
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="ml-auto align-items-center">
            <Nav.Link as={Link} to="/" className="text-light fw-bold">
              HOME
            </Nav.Link>
            <Nav.Link as={Link} to="/about" className="text-light">
              ABOUT
            </Nav.Link>
            <Nav.Link as={Link} to="/contact" className="text-light">
              CONTACT
            </Nav.Link>

            {/* Nếu chưa đăng nhập thì hiện SIGNUP / LOGIN */}
            {!userToken && (
              <>
                <Nav.Link as={Link} to="/signup" className="text-light">
                  SIGNUP
                </Nav.Link>
                <Nav.Link as={Link} to="/login" className="text-light">
                  LOGIN
                </Nav.Link>
              </>
            )}

            {/* Nếu đã đăng nhập thì hiện email + dropdown logout */}
            {userToken && (
              <Dropdown align="end" className="ms-3">
                <Dropdown.Toggle variant="link" className="text-light fw-bold p-0">
                  {userToken.email}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    👤 Profile / Tài khoản
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    🚪 Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            <Nav.Link as={Link} to="/cart" className="text-light position-relative ms-3 cart-nav-icon" title="Giỏ hàng">
              <FaShoppingCart size={22} />
              {totalItems > 0 && (
                <Badge
                  pill
                  bg="danger"
                  className={`position-absolute top-0 start-100 translate-middle cart-counter-badge ${
                    isBumping ? 'cart-badge-bounce' : ''
                  }`}
                >
                  {totalItems}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;