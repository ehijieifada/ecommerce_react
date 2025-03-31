import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import axios from "axios";
import { products as staticProducts } from "../assets/assets"; // Static products

const ProductCarousel = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0); // Track exact position
  const [productList, setProductList] = useState([]);

  // Fetch recommended products from backend OR fallback to static products
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products/list");
        const dynamicProducts = response.data.length > 0 ? response.data : staticProducts;
        setProductList(dynamicProducts);
      } catch (error) {
        console.error("❌ Error fetching recommended products:", error);
        setProductList(staticProducts); //  Fallback to static products
      }
    };

    fetchRecommendedProducts();
  }, []);

  useEffect(() => {
    let interval;
    if (!isPaused && productList.length > 0) {
      interval = setInterval(() => {
        setScrollPosition((prev) => (prev - 1) % (productList.length * 200)); //  Smooth looping
      }, 30); //  Speed of scrolling
    }
    return () => clearInterval(interval);
  }, [isPaused, productList.length]);

  if (productList.length === 0) {
    return <p className="text-center text-gray-500">No recommended products available.</p>;
  }

  return (
    <div
      className="overflow-hidden relative w-full"
      onMouseEnter={() => setIsPaused(true)} //  Stop scrolling on hover
      onMouseLeave={() => setIsPaused(false)} //  Resume scrolling
    >
      <div
        className="flex space-x-4 transition-transform duration-300 ease-linear"
        style={{ transform: `translateX(${scrollPosition}px)` }} //  Controlled movement
      >
        {productList.map((product, index) => (
          <div key={`${product._id || product.name}-${index}`} className="min-w-[200px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
