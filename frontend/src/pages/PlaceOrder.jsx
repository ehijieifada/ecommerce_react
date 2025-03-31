import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../contexts/CartContext";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const total = subtotal;

  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!deliveryInfo.fullName || !deliveryInfo.email || !deliveryInfo.phone || !deliveryInfo.address) {
      alert("Please fill in all required fields.");
      return;
    }
    if (cartItems.length === 0) {
      alert("No items in cart.");
      return;
    }

    const newOrder = {
      items: cartItems.map((item) => ({
        _id: item._id || "unknown_id",
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize || "N/A",
        images: item.images?.length ? item.images : ["/fallback-image.jpg"],
      })),
      total,
      date: new Date(),
      status: "Pending",
      paymentMethod,
      deliveryInfo,
      user: user.username,
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        alert("Order placed successfully!");
        clearCart();
        navigate("/orders");
      } else {
        const data = await response.json();
        alert(`Error placing order: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      alert("Error placing order. Please check the console for details.");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Place Your Order</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
          <form className="space-y-4">
            {Object.keys(deliveryInfo).map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold mb-1" htmlFor={field}>
                  {field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </label>
                <input
                  id={field}
                  type={field === "email" ? "email" : "text"}
                  value={deliveryInfo[field]}
                  onChange={(e) => setDeliveryInfo({ ...deliveryInfo, [field]: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ))}
          </form>
        </div>

        <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Cart Totals</h2>
          <div className="mb-4">
            <p className="flex justify-between">
              <span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span>
            </p>
            <p className="flex justify-between font-bold text-lg">
              <span>Total:</span> <span>${total.toFixed(2)}</span>
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
            <div className="space-y-2">
              {['stripe', 'cod'].map((method) => (
                <div key={method} className="flex items-center">
                  <input
                    type="radio"
                    id={method}
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor={method} className="text-sm font-semibold">
                    {method === 'stripe' ? 'Stripe' : 'Cash On Delivery'}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
