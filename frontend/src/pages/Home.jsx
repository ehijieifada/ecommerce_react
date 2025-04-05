import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import HeroBanner from "../components/HeroBanner";
import HeroFooterBanner from "../components/HeroFooterBanner";
import { products as staticProducts } from "../assets/assets"; // Import static products

const Home = () => {
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([...staticProducts]); // Initialize with static products

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch dynamic products from MongoDB
  useEffect(() => {
    axios
      .get(`${API_URL}/api/products/list`)
      .then((response) => {
        setDynamicProducts(response.data);
      })
      .catch((error) => console.error("❌ Error fetching products:", error));
  }, []);

  // Merge static and dynamic products
  useEffect(() => {
    setAllProducts([...staticProducts, ...dynamicProducts]);
  }, [dynamicProducts]); // Runs when dynamicProducts update

  // Filter Best Sellers
  const bestSellers = allProducts.filter((product) => product.bestseller);

  // Sort products by date (assuming `date` field exists) and get top 5
  const latestProducts = [...allProducts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24"> {/* Responsive padding */}
      <HeroBanner />

      {/* Latest Products Section */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center md:text-left">
          Latest Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {latestProducts.map((product) => (
            <ProductCard key={product._id || product.name} product={product} />
          ))}
        </div>
        <div className="mt-4 text-center md:text-right">
          <Link to="/products" className="text-blue-600 hover:underline">
            View All Products
          </Link>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center md:text-left">
          Best Sellers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {bestSellers.length > 0 ? (
            bestSellers.map((product) => (
              <ProductCard key={product._id || product.name} product={product} />
            ))
          ) : (
            <p className="text-center col-span-full">No Best Sellers Available</p>
          )}
        </div>
        <div className="mt-4 text-center md:text-right">
          <Link to="/products" className="text-blue-600 hover:underline">
            View All Products
          </Link>
        </div>
      </section>

      <HeroFooterBanner />
    </div>
  );
};

export default Home;
