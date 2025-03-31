import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="py-10 px-6 md:px-20">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-sm text-gray-700">

    {/* Left Section - Logo & Description */}
    <div className='description_footer'>
      <img src={assets.logo} className="mb-5 w-32" alt="Logo" />
      <p className="md:w-2/3">
        BlissTechIQ is committed to providing a seamless and enjoyable shopping experience. 
        With a carefully curated selection of high-quality products, we bring convenience, 
        affordability, and innovation to your fingertips.
      </p>
    </div>

    {/* Center Section - Company Links */}
    <div>
      <p className="text-xl font-medium mb-5">COMPANY</p>
      <ul className="flex flex-col gap-2">
        <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
        <li><Link to="/about" className="hover:text-blue-600">About Us</Link></li>
        <li><Link to="/delivery" className="hover:text-blue-600">Delivery</Link></li>
        <li><Link to="/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link></li>
      </ul>
    </div>

    {/* Right Section - Contact Info */}
    <div>
      <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
      <ul className="flex flex-col gap-2">
        <li className="hover:text-blue-600">+1-415-555-3455</li>
        <li className="hover:text-blue-600">contact@blisstechiq.com</li>
      </ul>
    </div>

  </div>

  <div className='shadow h-0.5 bg-white-100 mt-5'>
    <p className='py-5 text-center'>Copyright 2025@ blisstechiq.com - All Rights Reserved</p>
  </div>
</footer>

  );
};

export default Footer;
