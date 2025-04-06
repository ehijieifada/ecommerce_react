import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${API_URL}/api/orders`)
      .then((response) => {
        console.log("📦 Admin Orders fetched:", response.data);
        setOrders(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching admin orders:", error);
        setLoading(false);
      });
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/orders/update/${orderId}`, { status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("❌ Error updating order status:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-6 bg-gray-100">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center md:text-left">Orders</h1>

        {loading ? (
          <p className="text-center">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-600">No orders found.</p>
        ) : (
          <ul className="space-y-6">
            {orders.map((order) => (
              <li key={order._id} className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold text-lg">Order ID: {order._id}</p>
                    <p className="text-gray-600">Date: {new Date(order.date).toLocaleDateString()}</p>
                    <p className="font-bold text-gray-800">Total: ${order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <label className="text-gray-700 font-semibold mb-1">Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="border p-2 rounded w-full sm:w-auto"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-4">
                  <h2 className="font-semibold text-lg mb-2">Items</h2>
                  <ul className="space-y-2">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex items-center border-b pb-2">
                        <img
                            src={
                              item.images?.length
                                ? item.images[0].startsWith("http")
                                  ? item.images[0]
                                  : `${API_URL}${item.images[0]}`
                                : "/fallback-image.jpg"
                            }
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded mr-4"
                            onError={(e) => {
                              e.target.src = "/fallback-image.jpg";
                            }}
                        />
                        
                        <div className="text-sm sm:text-base">
                          <p className="font-semibold">{item.name}</p>
                          <p>Size: {item.size || "N/A"}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p className="text-gray-800 font-semibold">Price: ${item.price}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
