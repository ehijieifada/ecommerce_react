import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const HeroBanner = () => {
  return (
    <section
      className="relative w-full flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-16 py-10 bg-gradient-to-r from-blue-300 to-gray-300"
    >
      {/*  Left Side: Text Content */}
      <div className="text-center md:text-left md:w-1/2 space-y-3">
        <h1 className="text-lg md:text-xl font-semibold">Beats Solo Wireless</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-black">Summer Sale</h2>
        <Link
          to="/products/67f2a440c9994ce402eb7a6d"
          className="inline-block mt-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition"
        >
          Shop now
        </Link>
      </div>

      {/*  Right Side: Hero Image */}
      <div className="flex justify-center md:w-1/2">
        <img
          src={assets.hero_img}
          alt="Hero"
          className=" w-full max-w-xs sm:max-w-sm md:max-w-md object-contain"
        />
      </div>
    </section>
  );
};

export default HeroBanner;
