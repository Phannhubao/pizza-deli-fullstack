import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/ProductList.css";
import ProductCard from "./ProductCard";

// Import các hàm API
import { GetImageByProductId, GetProductList } from "../../services/ApiService";

const ProductList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("categoryId");

  // Fetch products và images
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await GetProductList();
        const rawProducts = Array.isArray(response.data) ? response.data : [];
        const productsData = rawProducts.filter((product) => product.active);
        console.log("Active products data from API:", productsData);

        // Lọc theo categoryId nếu có
        const filteredProducts = categoryId
          ? productsData.filter((product) => product.categoryId === Number(categoryId))
          : productsData;

        // Fetch images cho từng sản phẩm
        const imagesMap = {};
        for (const product of filteredProducts) {
          const imageResponse = await GetImageByProductId(product.productId);
          imagesMap[product.productId] = imageResponse.data && imageResponse.data.length > 0
            ? imageResponse.data[0].imageUrl
            : "img/default-product.png";
        }

        const processedProducts = filteredProducts.map((product) => {
          const processedProduct = {
            ...product,
            image: imagesMap[product.productId],
          };
          console.log("Processed product for ProductCard:", processedProduct);
          return processedProduct;
        });

        setProducts(processedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Không thể tải danh sách sản phẩm");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  if (isLoading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center my-5">
        <div className="alert alert-danger">
          {error}
          <button className="btn btn-link" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container product-list-container">
      <h1 className="section-title">
        {categoryId ? `Sản phẩm theo danh mục` : `Tất cả sản phẩm`}
      </h1>

      {products.length === 0 && !isLoading ? (
        <div className="text-center my-5">
          <p>Không tìm thấy sản phẩm nào</p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Quay lại trang chủ
          </button>
        </div>
      ) : (
        <div className="row">
          {products
            .filter((product) => product.active)
            .map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                onClick={() => navigate(`/product/${product.productId}`)}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;