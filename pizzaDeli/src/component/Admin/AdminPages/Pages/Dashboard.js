import "../css/style.css";
import "../css/dataTables.bootstrap5.min.css";
import "../css/Dashboard.css";
import ChartQuantityProduct from "../Chart/ChartQuantityProduct";
import ChartProductOrder from "../Chart/ChartProductOrder";
import { useEffect, useState } from "react";
import {
  GetCategoryList,
  GetOrderDetailList,
  GetProductList,
  GetAllOrders
} from "../../../../services/ApiService";
import { Icon } from "@mui/material";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [brandCount, setBrandCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [detailList, setDetailList] = useState([]);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await GetAllOrders();
        let orders = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const total = orders
          .filter(order => order.status === "COMPLETED")
          .reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
        setTotalRevenue(total);
      } catch (err) {
        console.error("Error loading orders:", err);
        setTotalRevenue(0);
      }
    };

    const fetchOrderDetails = async () => {
      try {
        const detailRes = await GetOrderDetailList();
        let details =
          Array.isArray(detailRes?.data) ? detailRes.data :
          Array.isArray(detailRes?.data?.data) ? detailRes.data.data :
          Array.isArray(detailRes) ? detailRes : [];
        setDetailList(details.slice(0, 10000));
      } catch (error) {
        console.error("Error loading order details:", error);
        setDetailList([]);
      }
    };

    const fetchCategory = async () => {
      try {
        const categories = await GetCategoryList();
        const categoryData = Array.isArray(categories?.data)
          ? categories.data
          : Array.isArray(categories)
          ? categories
          : [];
        setBrandCount(categoryData.length);
      } catch (error) {
        console.log("Error loading categories:", error);
        setBrandCount(0);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await GetProductList();
        const productData = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];
        setProductCount(productData.length);
      } catch (error) {
        console.log("Error loading products:", error);
        setProductCount(0);
      }
    };

    fetchRevenue();
    fetchOrderDetails();
    fetchCategory();
    fetchProducts();
  }, []);

  // tính toán dữ liệu hiển thị theo trang
  const totalPages = Math.ceil(detailList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = detailList.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <main className="dashboard-main py-4">
      <div className="container-fluid">
        {/* Header */}
        <div className="row">
          <div className="col-md-12">
            <div className="dashboard-header">
              <h4>Dashboard Overview</h4>
              <p>Welcome to your Pizza Deli administration panel</p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="row">
          <DashboardCard
            title="TOTAL REVENUE"
            icon="payments"
            value={`${totalRevenue.toLocaleString()} VND`}
            link="/admin/orders"
            bg="revenue-card"
          />
          <DashboardCard
            title="CATEGORIES"
            icon="category"
            value={`${brandCount} Categories`}
            link="/admin/categories"
            bg="categories-card"
          />
          <DashboardCard
            title="PRODUCTS"
            icon="inventory_2"
            value={`${productCount} Products`}
            link="/admin/products"
            bg="products-card"
          />
        </div>

        {/* Charts */}
        <div className="row chart-section">
          <div className="col-lg-5 mb-4">
            <div className="card h-100 chart-card">
              <div className="card-header chart-header">
                <i className="bi bi-bar-chart-fill me-2"></i> Product Quantity Distribution
              </div>
              <div className="card-body chart-body">
                <ChartQuantityProduct />
              </div>
            </div>
          </div>

          <div className="col-lg-7 mb-4">
            <div className="card h-100 chart-card">
              <div className="card-header chart-header">
                <i className="bi bi-graph-up me-2"></i> Product Order Trends
              </div>
              <div className="card-body chart-body">
                <ChartProductOrder />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="row">
          <div className="col-md-12 mb-4">
            <div className="card data-card">
              <div className="card-header data-header d-flex justify-content-between align-items-center">
                <span><i className="bi bi-table me-2"></i> Recent Order Details</span>
                <Link to="/admin/orders" className="view-all-link">
                  View All <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Order ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                          <tr key={item.detailId}>
                            <td><span className="id-badge">{item.detailId}</span></td>
                            <td>ORD-{item.orderId}</td>
                            <td>
                              <div className="product-info">
                                <div className="product-name">{item.produc_name || "N/A"}</div>
                                <div className="product-id">ID: {item.productId}</div>
                              </div>
                            </td>
                            <td>{item.quantity}</td>
                            <td>{Number(item.price).toLocaleString()} VND</td>
                            <td className="fw-bold">
                              {(Number(item.quantity) * Number(item.price)).toLocaleString()} VND
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            <div className="no-data">
                              <i className="bi bi-inbox"></i>
                              <p>No order detail data available</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                {detailList.length > itemsPerPage && (
                  <div className="pagination d-flex justify-content-center mt-3">
                    <button
                      className="btn btn-outline-secondary me-2"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        className={`btn me-1 ${currentPage === i + 1 ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      className="btn btn-outline-secondary ms-2"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({ title, icon, value, link, bg }) {
  return (
    <div className="col-md-4 mb-4">
      <div className={`card stat-card ${bg} h-100`}>
        <div className="card-body">
          <div className="stat-icon">
            <Icon>{icon}</Icon>
          </div>
          <h5 className="stat-title">{title}</h5>
          <h3 className="stat-value">{value}</h3>
        </div>
        <div className="card-footer">
          <Link to={link} className="stat-link">
            View Details <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
