import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { products as staticProducts, assets } from "../assets/assets";
import { CartContext } from "../contexts/CartContext";
import ProductCarousel from "../components/ProductCarousel";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState(false);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products/list");
        const foundProduct =
          response.data.find((p) => p._id === id) || staticProducts.find((p) => p._id === id);

        if (foundProduct) {
          setProduct(foundProduct);
          setMainImage(formatImageURL(foundProduct.images?.[0] || foundProduct.image?.[0]));
        }
      } catch (error) {
        console.error("❌ Error fetching product:", error);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const formatImageURL = (img) => {
    if (!img) return "/fallback-image.jpg";
    if (img.startsWith("/uploads/")) {
      return `http://localhost:5000${img}`;
    } else if (img.startsWith("/assets/") && !img.startsWith("http")) {
      return `http://localhost:5173${img}`;
    }
    return img;
  };

  if (!product) {
    return <div className="text-center text-lg font-semibold p-6">Product not found</div>;
  }

  const handleAddToCart = () => {
    addToCart({ ...product, selectedSize }, quantity);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-row items-center gap-4 w-full">
          <div className="flex flex-col gap-2">
            {(product.images || product.image || []).map((img, index) => (
              <img
                key={index}
                src={formatImageURL(img)}
                alt={`Thumbnail ${index + 1}`}
                className="w-16 h-16 cursor-pointer border-2 border-transparent hover:border-gray-500"
                onMouseEnter={() => setMainImage(formatImageURL(img))}
                onClick={() => setMainImage(formatImageURL(img))}
              />
            ))}
          </div>
          <div className="flex justify-center w-full hover:bg-red-600">
            <img src={mainImage} alt={product.name} className="w-full max-w-md object-contain" />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{product.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            {[...Array(4)].map((_, i) => (
              <img key={i} src={assets.star_icon} alt="star" className="w-3.5" />
            ))}
            <img src={assets.star_dull_icon} alt="star" className="w-3.5" />
            <p className="pl-2">(202)</p>
          </div>
          <p className="text-xl font-semibold mb-4">${product.price}</p>
          <p className="text-gray-500 md:w-4/5 mb-4" id="custom_text">{product.description}</p>

          {product.sizes && product.sizes.length > 0 && (
            <div className="my-4">
              <p className="font-semibold">Select Size:</p>
              <div className="flex gap-2">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(size)}
                    className={`p-2 border rounded ${
                      selectedSize === size ? "bg-orange-500 text-white" : "bg-white text-black"
                    } hover:bg-blue-300`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 my-4">
            <button onClick={() => setQuantity(Math.max(quantity - 1, 1))} className="px-3 py-1 border">
              -
            </button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 border">
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add to Cart
          </button>

          {success && (
            <div className="mt-4 p-2 bg-green-200 text-green-800 rounded">
              Product added successfully!
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">You may also like</h2>
        <ProductCarousel />
      </div>
    </div>
  );
};

export default ProductDetail;
