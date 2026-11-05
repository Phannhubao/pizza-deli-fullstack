import { Icon } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { PutPassword, PostLogout } from "../../../../services/ApiService";
import "../css/style.css";
import "../css/AdminHeader.css"; // Tạo file CSS mới cho header

export default function AdminHeader() {
  const navigate = useNavigate();
  const userToken = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    try {
      // Call the PostLogout API
      const response = await PostLogout();
      if (response.status === 200 || response.data === "success") {
        // Clear local storage
        localStorage.removeItem("token");
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

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      const { value: passwords } = await Swal.fire({
        title: "Reset Password",
        html: `
          <input id="swal-input1" class="swal2-input" type="password" placeholder="Enter New Password">
          <input id="swal-input2" class="swal2-input" type="password" placeholder="Re-enter New Password">
        `,
        focusConfirm: false,
        preConfirm: () => [
          document.getElementById("swal-input1").value,
          document.getElementById("swal-input2").value,
        ],
      });

      const [newPassword, confirmPassword] = passwords || [];

      if (!newPassword || !confirmPassword) return;
      if (newPassword !== confirmPassword) {
        return Swal.fire({
          icon: "error",
          title: "Mismatch",
          text: "Passwords do not match!",
        });
      }
      if (newPassword.length < 6) {
        return Swal.fire({
          icon: "error",
          title: "Too short",
          text: "Password must be at least 6 characters.",
        });
      }

      const confirm = await Swal.fire({
        title: "Confirm Change",
        text: "Are you sure you want to update your password?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
      });

      if (confirm.isConfirmed) {
        const result = await PutPassword(userToken.userId, newPassword);
        if (result.status === 200 || result === "success") {
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Password changed successfully.",
          });
        } else {
          throw new Error("Update failed");
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while changing the password.",
      });
    }
  };

  // Lấy tên người dùng từ userToken (giả sử dùng email làm tên tạm thời)
  const userName = userToken ? userToken.email || "User" : "User";

  return (
    <nav className="admin-header navbar navbar-expand-lg navbar-dark fixed-top">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebar"
          aria-controls="offcanvasExample"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <a className="navbar-brand me-auto ms-lg-0 ms-3 fw-bold p-0" href="/admin">
          <i className="bi bi-egg-fried me-2"></i>Pizza Deli Admin
        </a>

        <div className="collapse navbar-collapse" id="topNavBar">
          {/* Thêm các danh mục menu */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link" href="/admin">
                <i className="bi bi-speedometer2 me-1"></i>Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/admin/orders">
                <i className="bi bi-cart-check me-1"></i>Orders
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/admin/categories">
                <i className="bi bi-tags me-1"></i>Category
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/admin/products">
                <i className="bi bi-egg-fried me-1"></i>Products
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/admin/users">
                <i className="bi bi-people me-1"></i>Users
              </a>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle user-menu"
                href="/"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="user-avatar">
                  <i className="bi bi-person-circle"></i>
                </div>
                <span className="user-name">{userName}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <h6 className="dropdown-header">User Actions</h6>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={handleChangePassword}>
                    <Icon className="me-2">lock_reset</Icon>Reset Password
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <Icon className="me-2">logout</Icon>Sign out
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}