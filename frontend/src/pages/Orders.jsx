import React, { useState, useEffect } from "react";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/orders")
      .then((response) => {
        console.log("📦 Orders fetched:", response.data);
        setOrders(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching orders:", error);
        setLoading(false);
      });
  }, []);

  // fetch and display the current status from MongoDB
  const trackOrder = async (orderId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
      const order = response.data;
      alert(`Current status for Order ${orderId}: ${order.status}`);
    } catch (error) {
      console.error("❌ Error tracking order:", error);
      alert("Error fetching order status. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Orders</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="p-4 rounded">
          <ul>
            {orders.map((order) => (
              <li key={order._id} className="mb-6 border p-4 rounded-lg shadow-md">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div>
                    <p className="font-semibold">Order ID: {order._id}</p>
                    <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                    <p className="font-bold text-gray-700">Total: ${order.total.toFixed(2)}</p>
                  </div>
                  <div className="text-center text-green-600 font-semibold">
                    Status: {order.status}
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => trackOrder(order._id)}
                      className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
                {/* Order Items */}
                <div className="mt-4">
                  <ul className="space-y-2">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex items-center border-b pb-2">
                        <img
                          src={
                            item.images?.length
                              ? item.images[0]
                              : "http://localhost:5000/fallback-image.jpg"
                          }
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded mr-4"
                          onError={(e) => {
                            e.target.src = "http://localhost:5000/fallback-image.jpg";
                          }}
                        />
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p>Size: {item.size || "N/A"}</p>  {/* Display selected size */}
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ${item.price}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Orders;
