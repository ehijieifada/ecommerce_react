import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

const ListProducts = () => {
  const [products, setProducts] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios
      .get(`${API_URL}/api/products/list`)
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => console.error("Error fetching products", error));
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
              <button
                onClick={() => handleDelete(product._id)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ListProducts;
