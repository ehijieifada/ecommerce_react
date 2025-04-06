import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const HeroFooterBanner = () => {
  return (
    <section
      className="relative w-full px-6 py-10 md:py-16 flex flex-col-reverse md:flex-row items-center justify-between"
      style={{
        background:
          'linear-gradient(90deg, rgba(244, 67, 54, 1) 0%, rgba(255, 193, 7, 1) 15%, rgba(209, 190, 26, 1) 31%, rgba(222, 93, 106, 1) 65%, rgba(255, 193, 7, 1) 100%)',
      }}
    >
      {/*  Left Side: Image */}
      <div className="w-full md:w-1/2 flex justify-center">
        <img
          src={assets.herofooter_img}
          alt="Hero Footer"
          className="w-5/6 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-contain"
        />
      </div>

      {/*  Right Side: Text Content */}
      <div className="text-center md:text-left max-w-lg space-y-3 md:space-y-5">
        <p className="text-3xl md:text-4xl font-bold text-white">30% Off</p>
        <p className="text-2xl md:text-3xl font-bold text-white">Great Deal</p>
        <p className="text-lg md:text-xl font-semibold text-gray-200">25 Nov to 5 Dec</p>

        <Link
          to="/products/67f2a24ac9994ce402eb7a65"
          className="inline-block mt-4 bg-blue-600 px-5 py-2 text-white rounded-lg text-lg font-semibold hover:bg-orange-800 transition"
        >
          Shop Now
        </Link>

        <div className="mt-3 md:mt-5">
          <p className="text-white">SmartFit Pro X Smartwatch</p>
          <h1 className="text-lg md:text-xl font-bold text-white">Holiday Sale</h1>
          <p className="text-gray-100">Fantastic Smartwatch on the Market</p>
        </div>
      </div>
    </section>
  );
};

export default HeroFooterBanner;
