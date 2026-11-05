import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

import {
  GetCategoryList,
  GetOrderDetailList,
  GetProductByID
} from "../../../../services/ApiService";

const ChartProductOrder = () => {
  const [labels, setLabels] = useState([]);
  const [dataSet, setDataSet] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm tạo màu ngẫu nhiên dạng hex
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Bắt đầu fetch dữ liệu...");

        // 1. Lấy danh sách category và order detail
        const [categoryRes, orderDetailRes] = await Promise.all([
          GetCategoryList(),
          GetOrderDetailList()
        ]);

        console.log("Category Response:", categoryRes);
        console.log("Order Detail Response:", orderDetailRes);

        // 2. Chuẩn hoá dữ liệu category
        let categories = [];
        if (categoryRes?.data?.data) {
          categories = categoryRes.data.data;
        } else if (categoryRes?.data) {
          categories = Array.isArray(categoryRes.data) ? categoryRes.data : [categoryRes.data];
        } else if (Array.isArray(categoryRes)) {
          categories = categoryRes;
        }

        console.log("Categories sau khi chuẩn hóa:", categories);

        if (categories.length === 0) {
          throw new Error("Không tìm thấy danh mục nào");
        }

        // 3. Chuẩn hoá dữ liệu order detail
        let rawOrderDetails = [];
        if (orderDetailRes?.data?.data) {
          rawOrderDetails = orderDetailRes.data.data;
        } else if (orderDetailRes?.data) {
          rawOrderDetails = Array.isArray(orderDetailRes.data) ? orderDetailRes.data : [orderDetailRes.data];
        } else if (Array.isArray(orderDetailRes)) {
          rawOrderDetails = orderDetailRes;
        }

        console.log("Order details sau khi chuẩn hóa:", rawOrderDetails);

        if (rawOrderDetails.length === 0) {
          throw new Error("Không tìm thấy chi tiết đơn hàng nào");
        }

        // 4. Tạo map categoryId sang index
        const categoryIndexMap = {};
        categories.forEach((category, index) => {
          if (category.categoryId) {
            categoryIndexMap[category.categoryId] = index;
          }
        });

        console.log("Category Index Map:", categoryIndexMap);

        const categoryNames = categories.map(category => category.categoryName || "Unknown Category");
        const categoryColors = categories.map(() => getRandomColor());
        const categoryCounts = new Array(categories.length).fill(0);

        // 5. Lấy danh sách productId duy nhất từ order details
        const productIds = [...new Set(rawOrderDetails.map(detail => detail.productId).filter(Boolean))];
        console.log("Product IDs cần fetch:", productIds);

        if (productIds.length === 0) {
          throw new Error("Không tìm thấy productId trong order details");
        }

        // 6. Fetch thông tin sản phẩm
        const productPromises = productIds.map(productId => GetProductByID(productId));
        const productResponses = await Promise.all(productPromises);
        
        const productMap = {};
        productIds.forEach((productId, index) => {
          const productResponse = productResponses[index];
          let productData = null;
          
          if (productResponse?.data?.data) {
            productData = productResponse.data.data;
          } else if (productResponse?.data) {
            productData = productResponse.data;
          } else if (productResponse) {
            productData = productResponse;
          }
          
          if (productData && productData.productId) {
            productMap[productId] = productData;
          }
        });

        console.log("Product Map:", productMap);

        // 7. Tính tổng quantity cho từng category
        rawOrderDetails.forEach(detail => {
          if (!detail.productId) return;
          
          const product = productMap[detail.productId];
          if (!product || !product.categoryId) return;
          
          const categoryIndex = categoryIndexMap[product.categoryId];
          if (categoryIndex !== undefined) {
            categoryCounts[categoryIndex] += parseInt(detail.quantity) || 0;
          }
        });

        console.log("Category Counts:", categoryCounts);

        // 8. Set state cho chart
        setLabels(categoryNames);
        setDataSet(categoryCounts);
        setColors(categoryColors);

        console.log("Chart data đã được set:", {
          labels: categoryNames,
          data: categoryCounts,
          colors: categoryColors
        });

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu biểu đồ:", error);
        setError(error.message);
        setLabels([]);
        setDataSet([]);
        setColors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  // Dữ liệu mẫu để test
  const sampleData = {
    labels: labels.length > 0 ? labels : ['Pizza', 'Pasta', 'Salad', 'Drinks', 'Dessert'],
    datasets: [
      {
        label: "Số lượng đã đặt",
        data: dataSet.length > 0 ? dataSet : [12, 19, 3, 5, 2],
        backgroundColor: colors.length > 0 ? colors : [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: colors.length > 0 ? colors.map(color => color.replace('0.6', '1')) : [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tổng số lượng đặt hàng theo danh mục',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Số lượng: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Số lượng'
        },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        title: {
          display: true,
          text: 'Danh mục'
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Đang tải dữ liệu biểu đồ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#dc3545'
      }}>
        <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
        <h5>Lỗi khi tải biểu đồ</h5>
        <p>{error}</p>
        <button 
          className="btn btn-primary mt-2"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '400px', width: '100%' }}>
      <Bar data={sampleData} options={options} />
      
      {/* Debug info - chỉ hiển thị trong môi trường development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          background: 'rgba(0,0,0,0.7)', 
          color: 'white', 
          padding: '5px 10px', 
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <div>Labels: {labels.length}</div>
          <div>Data: {dataSet.length}</div>
          <div>Total: {dataSet.reduce((a, b) => a + b, 0)}</div>
        </div>
      )}
    </div>
  );
};

export default ChartProductOrder;