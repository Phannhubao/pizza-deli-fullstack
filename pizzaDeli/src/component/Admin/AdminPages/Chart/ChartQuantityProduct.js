import { useEffect, useState, useCallback } from "react";
import { Pie } from "react-chartjs-2";
import { GetCategoryList, GetProductList } from "../../../../services/ApiService";
import "chart.js/auto";
import Swal from "sweetalert2";
import "../css/ChartQuantityProduct.css";

const predefinedColors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)',
    'rgba(40, 159, 64, 0.7)',
    'rgba(210, 99, 132, 0.7)'
  ];
export default function ChartQuantityProduct() {
  const [labels, setLabels] = useState([]);
  const [dataSet, setDataSet] = useState([]);
  const [colors, setColors] = useState([]);
  const [refresh] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Màu sắc định trước (xoay vòng nếu danh mục > số màu)
  

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Lấy danh mục
      const categoryRes = await GetCategoryList();
      const categories = Array.isArray(categoryRes)
        ? categoryRes
        : (Array.isArray(categoryRes?.data) ? categoryRes.data : []);

      // Lấy sản phẩm
      const productRes = await GetProductList();
      const products = Array.isArray(productRes)
        ? productRes
        : (Array.isArray(productRes?.data) ? productRes.data : []);

      if (!Array.isArray(categories) || !Array.isArray(products)) {
        throw new Error("Dữ liệu không hợp lệ");
      }

      // Đếm số lượng sản phẩm theo categoryId
      const productCounts = {};
      categories.forEach(cat => {
        productCounts[cat.categoryId || cat.id] = 0;
      });
      products.forEach(prod => {
        const catId = prod?.categoryId;
        if (catId && productCounts.hasOwnProperty(catId)) {
          productCounts[catId]++;
        }
      });

      // Chuẩn bị dữ liệu cho chart
      const categoryNames = categories.map(cat => 
        cat.categoryName || cat.category_name || cat.name || "Không xác định"
      );
      const categoryColors = categories.map((_, i) => 
        predefinedColors[i % predefinedColors.length]
      );
      const countsArray = categories.map(cat => 
        productCounts[cat.categoryId || cat.id] || 0
      );

      setLabels(categoryNames);
      setColors(categoryColors);
      setDataSet(countsArray);

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu biểu đồ:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải dữ liệu biểu đồ",
        timer: 2000
      });
      setLabels([]);
      setColors([]);
      setDataSet([]);
    } finally {
      setIsLoading(false);
    }
  }, [],);

  useEffect(() => {
    fetchData();
  }, [fetchData, refresh]);

  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="chart-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải dữ liệu biểu đồ...</p>
        </div>
      </div>
    );
  }

  if (dataSet.length === 0 || dataSet.every(v => v === 0)) {
    return (
      <div className="chart-container">
        <div className="chart-no-data">
          <i className="bi bi-pie-chart"></i>
          <p>Không có dữ liệu sản phẩm để hiển thị</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <Pie
        data={{
          labels,
          datasets: [{
            label: "Số lượng sản phẩm",
            data: dataSet,
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace("0.7", "1")),
            borderWidth: 1,
            hoverOffset: 15
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle',
                font: { size: 12 }
              }
            },
            title: {
              display: true,
              text: "Thống kê sản phẩm theo danh mục",
              font: { size: 16, weight: 'bold' },
              color: '#2c3e50',
              padding: { top: 10, bottom: 20 }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              callbacks: {
                label: (ctx) => {
                  const label = ctx.label || '';
                  const value = ctx.raw || 0;
                  const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                  return `${label}: ${value} (${percent}%)`;
                }
              }
            }
          },
          animation: {
            animateScale: true,
            animateRotate: true,
            duration: 1500,
            easing: 'easeOutQuart'
          },
          cutout: '40%'
        }}
      />
    </div>
  );
}
