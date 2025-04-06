import React, { useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import { AuthContext } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <img src={assets.cart_icon} alt="Empty Cart" className="w-20 h-20 mb-4" />
          <p className="text-xl font-semibold">Your shopping bag is empty</p>
          <Link
            to="/"
            className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div>
          <ul>
            {cartItems.map((item) => (
              <li
                key={`${item._id}-${item.selectedSize}`}
                className="flex justify-between items-center border-b py-4"
              >
                <div className="flex items-center">
                <img
                      src={
                        item.images
                          ? item.images[0].startsWith("http")
                            ? item.images[0]
                            : `${API_URL}${item.images[0]}`
                          : item.image[0]
                      }
                      alt={item.name}
                      className="bg-gray-100 w-20 h-20 object-cover rounded mr-4"
                      onError={(e) => {
                        e.target.src = "/fallback-image.jpg";
                      }}
                />

                  <div>
                    <h2 className="text-xl">{item.name}</h2>
                    {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                    <p>Price: ${item.price}</p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity - 1)}
                        className="border px-2 py-1"
                      >
                        –
                      </button>
                      <span className="px-4">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity + 1)}
                        className="border px-2 py-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item._id, item.selectedSize)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <p className="text-xl font-semibold">Total: ${total.toFixed(2)}</p>
            <button
              onClick={clearCart}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition mt-2"
            >
              Clear Cart
            </button>
          </div>
          {/* PROCEED TO CHECKOUT Button with Authentication Check */}
          <div className="mt-6">
            {user ? (
              <Link to="/placeOrder">
                <button className="w-50 bg-green-600 text-white py-3 rounded hover:bg-green-700 transition">
                  PROCEED TO CHECKOUT
                </button>
              </Link>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="w-50 bg-gray-500 text-white py-3 rounded cursor-pointer"
              >
                LOGIN TO CHECKOUT
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
