import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi"; 

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false); 

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-700 text-white p-2 rounded-full shadow-lg"
        onClick={toggleSidebar}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar Container */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-700 text-white p-6 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        <ul>
          <li className="mb-4">
            <Link to="/admin" className="hover:text-gray-300" onClick={toggleSidebar}>
              🏠 Dashboard
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/admin/add" className="hover:text-gray-300" onClick={toggleSidebar}>
              ➕ Add Product
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/admin/list" className="hover:text-gray-300" onClick={toggleSidebar}>
              📋 List Products
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/admin/orders" className="hover:text-gray-300" onClick={toggleSidebar}>
              📦 Orders
            </Link>
          </li>
        </ul>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default AdminSidebar;
