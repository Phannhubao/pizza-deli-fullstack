import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Header from "./component/Client/Header";
import Footer from "./component/Client/Footer";

// Client pages
import Home from "./component/Client/Home";
import Contact from "./component/Client/Contact";
import ProductDetail from "./component/Client/ProductDetail";
import About from "./component/Client/About";
import Signup from "./component/Client/RegisterPage";
import Cart from "./component/Client/Cart";
import ProductList from "./component/Client/ProductList";
import LoginPage from "./component/Client/LoginPage";

import { AuthProvider } from './component/Admin/AdminPages/Context/AuthContext';
import ProtectedRoute from './component/Admin/AdminPages/Context/ProtectedRoute';
import { CartProvider } from "./context/CartContext";

// Admin pages
import AdminLayout from "./component/Admin/AdminPages/Layout/AdminLayout";
import Dashboard from "./component/Admin/AdminPages/Pages/Dashboard";

import CategoryManager from "./component/Admin/AdminPages/Pages/Category/CategoryManager";
import CreateCategory from "./component/Admin/AdminPages/Pages/Category/CreateCategory";
import ProductManager from "./component/Admin/AdminPages/Pages/Product/ProductManager";
import CreateProduct from "./component/Admin/AdminPages/Pages/Product/CreateProduct";
import UpdateProduct from "./component/Admin/AdminPages/Pages/Product/UpdateProduct";
import UserManager from "./component/Admin/AdminPages/Pages/User/UserManager";
import OrderManager from "./component/Admin/AdminPages/Pages/Order/OrderManager";
import CheckoutPage from "./component/Client/CheckoutPage";
import ProfilePage from "./component/Client/ProfilePage";
import VNPayReturn from './component/Client/VNPayReturn';
import RAGMenuAssistant from "./component/Client/RAGMenuAssistant";

import ScrollToTop from "./ScrollToTop";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <AuthProvider>
          <Routes>
            {/* -------- CLIENT LAYOUT -------- */}
            <Route
              path="/*"
              element={
                <>
                  <Header />
                  <main className="client-main-wrapper">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/products/ProductDetail/:id" element={<ProductDetail />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/Checkout" element={<CheckoutPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/vnpay-return" element={<VNPayReturn />} />

                    </Routes>
                  </main>
                  <Footer />
                  {/* 🍕 Nút Chatbot AI Đề xuất thực đơn cá nhân hóa (Mở ra / Mở vô) */}
                  <RAGMenuAssistant />
                </>
              }
            />

            {/* -------- ADMIN LAYOUT -------- */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              {/* <Route path="accounts">
                <Route index element={<AccountManager />} />
                <Route path="create" element={<CreateAccount />} />
              </Route> */}
              <Route path="categories">
                <Route index element={<CategoryManager />} />
                <Route path="create" element={<CreateCategory />} />
              </Route>
              <Route path="products">
                <Route index element={<ProductManager />} />
                <Route path="create" element={<CreateProduct />} />
                <Route path="update/:id" element={<UpdateProduct />} />
              </Route>
              <Route path="users">
                <Route index element={<UserManager />} />
                
              </Route>
              <Route path="orders">
                <Route index element={<OrderManager />} />
                
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </CartProvider>
    </Router>
  );
}

export default App;