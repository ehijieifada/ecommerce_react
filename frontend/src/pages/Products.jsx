import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { products as staticProducts } from "../assets/assets";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const showSearch = queryParams.get("search") === "true";

  const [search, setSearch] = useState("");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [typeFilters, setTypeFilters] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const categories = ["Men", "Women", "Kids", "Gadgets", "Electronics"];
  const types = ["Topwear", "Winterwear", "Bottomwear", "Computing", "Audio & sound", "Mobile & wearables" ];

  useEffect(() => {
    if (!staticProducts || staticProducts.length === 0) {
      axios
        .get("http://localhost:5000/api/products/list")
        .then((response) => setDynamicProducts(response.data))
        .catch((error) => console.error("❌ Error fetching products:", error));
    }
  }, []);

  useEffect(() => {
    if (staticProducts && staticProducts.length > 0) {
      setAllProducts([...staticProducts, ...dynamicProducts]);
    } else {
      setAllProducts(dynamicProducts);
    }
  }, [dynamicProducts]);

  const handleCategoryChange = (category) => {
    setCategoryFilters((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleTypeChange = (type) => {
    setTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilters.length === 0 || categoryFilters.includes(product.category);
    const matchesType = typeFilters.length === 0 || typeFilters.includes(product.subcategory);
    return matchesSearch && matchesCategory && matchesType;
  });

  useEffect(() => {
    if (!showSearch) setSearch("");
  }, [showSearch]);

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar Filters */}
      <div className="w-full md:w-1/4 p-4 bg-gray-100 md:bg-transparent">
        <h2 className="text-xl font-bold mb-4">FILTERS</h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Categories</h3>
          {categories.map((category) => (
            <label key={category} className="block">
              <input 
                type="checkbox" 
                checked={categoryFilters.includes(category)} 
                onChange={() => handleCategoryChange(category)} 
                className="mr-2" 
              />
              {category}
            </label>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">TYPE</h3>
          {types.map((type) => (
            <label key={type} className="block">
              <input 
                type="checkbox" 
                checked={typeFilters.includes(type)} 
                onChange={() => handleTypeChange(type)} 
                className="mr-2" 
              />
              {type}
            </label>
          ))}
        </div>
      </div>
  
      {/* Product List */}
      <div className="w-full md:w-3/4 p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center md:text-left">Products</h1>
  
        {/* Search Bar */}
        {showSearch && (
          <div className="bg-white shadow p-4 mb-4 flex flex-col sm:flex-row items-center">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full sm:w-auto flex-grow border p-2 rounded-md sm:rounded-l-md"
            />
            <button 
              onClick={() => navigate("/products")} 
              className="bg-red-500 text-white px-4 py-2 mt-2 sm:mt-0 sm:rounded-r-md rounded-md hover:bg-red-600 transition"
            >
              ✖
            </button>
          </div>
        )}
  
        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500">No products available.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.name} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
};

export default Products;
