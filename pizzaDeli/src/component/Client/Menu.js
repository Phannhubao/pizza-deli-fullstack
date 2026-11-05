import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/menu.css";
import { Domain } from "../../services/Domain";
import RAGMenuAssistant from "./RAGMenuAssistant";

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${Domain}/api/categories`)
      .then((response) => {
        console.log("API Data:", response.data);
        const data = response.data.data || response.data;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  const handleCategoryClick = (categoryId) => {
    // Chuyển đến trang sản phẩm với categoryId
    navigate(`/products?categoryId=${categoryId}`);
  };

  return (
    <div className="container py-4">
      <div className="text-center menu1 mt-4">
        <h4 className="mb-3 text-white fw-bold">Danh Mục Thực Đơn</h4>
        <div className="row">
          {categories.map((category) => (
            <div 
              className="col" 
              key={category.categoryId}
              onClick={() => handleCategoryClick(category.categoryId)}
              style={{ cursor: "pointer" }}
            >
              <div className="menu-title">{category.categoryName}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;