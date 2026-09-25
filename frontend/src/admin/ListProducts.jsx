import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

const ListProducts = () => {
  const [products, setProducts] = useState([]);
  const [heroBannerProduct, setHeroBannerProduct] = useState(null);
  const [heroFooterBannerProduct, setHeroFooterBannerProduct] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products/list`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const loadBannerSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/banners`);
        setHeroBannerProduct(response.data.heroProduct);
        setHeroFooterBannerProduct(response.data.footerProduct);
      } catch (error) {
        console.error("Error fetching banner settings:", error);
      }
    };

    loadProducts();
    loadBannerSettings();
  }, [API_URL]);

  const saveHeroSelection = async (type, product, setter) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.put(
        `${API_URL}/api/banners/${type}`,
        { productId: product._id },
        {
          withCredentials: true,
          headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
        }
      );
      setter(type === "hero" ? response.data.heroProduct : response.data.footerProduct);
      alert(`${product.name} has been set as ${type === "hero" ? "Hero Banner" : "Hero Footer Banner"}.`);
    } catch (error) {
      console.error("Error saving banner selection:", error);
      alert(error.response?.data?.message || "Failed to save banner selection.");
    }
  };

  // Function to delete product from MongoDB
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${API_URL}/api/products/delete/${productId}`);
      setProducts(products.filter((product) => product._id !== productId)); 
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">List of Products</h1>

        <div className="mb-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <h2 className="text-xl font-semibold mb-3">Current Banner Selections</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-lg bg-white p-4 border">
              <p className="text-sm text-gray-600">Hero Banner Product</p>
              <p className="font-medium">{heroBannerProduct ? heroBannerProduct.name : "Default image"}</p>
            </div>
            <div className="rounded-lg bg-white p-4 border">
              <p className="text-sm text-gray-600">Hero Footer Banner Product</p>
              <p className="font-medium">{heroFooterBannerProduct ? heroFooterBannerProduct.name : "Default image"}</p>
            </div>
          </div>
        </div>

        <ul>
          {products.map((product) => (
            <li
              key={product._id}
              className="border-b p-4 flex justify-between items-center"
            >
              <div className="flex items-center">
                <img
                  src={
                    product.images && product.images.length > 0
                      ? product.images[0] //  Cloudinary URL
                      : "/fallback-image.jpg"
                  }
                  alt={product.name}
                  className="w-20 h-20 object-cover mr-4"
                />
                <div>
                  <span className="font-semibold">{product.name}</span> - 
                  <span className="text-gray-600 ml-1">${product.price}</span>
                  <p className="text-sm text-gray-500">Category: {product.category || "N/A"}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row items-end">
                <button
                  onClick={() => saveHeroSelection("hero", product, setHeroBannerProduct)}
                  className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
                >
                  Set as Hero Banner
                </button>
                <button
                  onClick={() => saveHeroSelection("footer", product, setHeroFooterBannerProduct)}
                  className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-700 transition"
                >
                  Set as Footer Banner
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ListProducts;
