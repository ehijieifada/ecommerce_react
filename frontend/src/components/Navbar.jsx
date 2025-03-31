import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { assets } from '../assets/assets';

const Navbar = () => {
  const { cartItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      <nav className="bg-white shadow p-4 flex items-center justify-between">
        {/* Left Section: Mobile Menu Icon and Logo */}
        <div className="flex items-center space-x-2">
          <div className="md:hidden">
            <button onClick={() => setShowMobileMenu(true)}>
              <img src={assets.menu_icon} alt="Menu" className="h-6 cursor-pointer" />
            </button>
          </div>
          <Link to="/">
            <img src={assets.logo} alt="Logo" className="h-8" />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex flex-1 justify-center">
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
            <li><Link to="/products" className="hover:text-blue-600">Products</Link></li>
            <li><Link to="/about" className="hover:text-blue-600">About</Link></li>
            <li><Link to="/contact" className="hover:text-blue-600">Contact</Link></li>
          </ul>
        </div>

        {/* Right Section: Search, Cart, Profile */}
        <div className="flex items-center space-x-4 relative">
          <button onClick={() => navigate('/products?search=true')}>
            <img src={assets.search_icon} alt="Search" className="h-6 cursor-pointer" />
          </button>
          
          <Link to="/cart" className="flex items-center hover:text-blue-600">
            <img src={assets.cart_icon} alt="Cart" className="h-6 mr-1" />
            <span>{cartItems.length}</span>
          </Link>
          
          {user ? (
            <div className="relative">
              {/* Profile Icon - Toggle Dropdown */}
              <button onClick={() => setShowDropdown(!showDropdown)}>
                <img src={assets.profile_icon} alt="Profile" className="h-6 cursor-pointer" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg p-2 z-50">
                  <div className="px-4 py-2 text-gray-700 font-medium">
                    My Profile: {user.username}
                  </div>
                  <button 
                    onClick={() => { 
                      navigate('/orders'); 
                      setShowDropdown(false); 
                    }} 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Orders
                  </button>

                  <button 
                    onClick={() => { logout(); setShowDropdown(false); }} 
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <img src={assets.profile_icon} alt="Profile" className="h-6" />
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Fullscreen Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-white z-50 p-6 flex flex-col items-start">
          <button 
            onClick={() => setShowMobileMenu(false)}
            className="self-end text-3xl font-bold"
          >
            &times;
          </button>

          <ul className="mt-4 space-y-4 text-xl w-full">
            <li><Link to="/" onClick={() => setShowMobileMenu(false)} className="hover:text-blue-600">Home</Link></li>
            <li><Link to="/products" onClick={() => setShowMobileMenu(false)} className="hover:text-blue-600">Products</Link></li>
            <li><Link to="/about" onClick={() => setShowMobileMenu(false)} className="hover:text-blue-600">About</Link></li>
            <li><Link to="/contact" onClick={() => setShowMobileMenu(false)} className="hover:text-blue-600">Contact</Link></li>
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;
