import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {

  const API_URL = import.meta.env.VITE_API_URL;
  //  Determine correct image source
  let imageUrl = "/fallback-image.jpg"; 

  if (product.images && product.images.length > 0) {
    imageUrl = product.images[0].startsWith("/uploads/")
      ? `${API_URL}${product.images[0]}` // Use uploaded image from backend
      : product.images[0]; 
  } else if (product.image) {
    imageUrl = product.image; 
  }

  return (
    <div className="hover:bg-red-600 p-4 bg-white rounded-lg shadow-md hover:scale-105 transition-transform duration-300 ease-in-out">
      <Link to={`/products/${product._id || encodeURIComponent(product.name)}`} className="block">
        {/* load image */}
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-40 sm:h-48 object-contain rounded-lg mx-auto"
          onError={(e) => { e.target.src = "/fallback-image.jpg"; }} //  Fallback image
        />
        <div className="mt-2 text-center">
          <h2 className="text-sm sm:text-base font-semibold text-gray-800">{product.name}</h2>
          <p className="text-gray-600">${product.price.toFixed(2)}</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
