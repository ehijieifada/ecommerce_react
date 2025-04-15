import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import HeroBanner from "../components/HeroBanner";
import HeroFooterBanner from "../components/HeroFooterBanner";
import { products as staticProducts } from "../assets/assets";
import ChatBubble from "../components/ChatBubble";

const Home = () => {
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([...staticProducts]);
  const [loading, setLoading] = useState(true); //  Loading state

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch dynamic products from MongoDB
  useEffect(() => {
    axios
      .get(`${API_URL}/api/products/list`)
      .then((response) => {
        setDynamicProducts(response.data);
      })
      .catch((error) => console.error("❌ Error fetching products:", error))
      .finally(() => setLoading(false)); // ✅ Set loading to false
  }, []);

  useEffect(() => {
    setAllProducts([...staticProducts, ...dynamicProducts]);
  }, [dynamicProducts]);

  const bestSellers = allProducts.filter((product) => product.bestseller);

  const latestProducts = [...allProducts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">
      <HeroBanner />

      {/* Latest Products Section */}
      <section className="mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center md:text-left">
          Latest Products
        </h2>

        {loading ? (
          <p className="text-center col-span-full">Loading latest products...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {latestProducts.map((product) => (
              <ProductCard key={product._id || product.name} product={product} />
            ))}
          </div>
        )}

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

      <ChatBubble />
      <HeroFooterBanner />
    </div>
  );
};

export default Home;
