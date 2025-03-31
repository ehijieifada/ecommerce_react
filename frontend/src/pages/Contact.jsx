import React from 'react';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox'

const Contact = () => {
  return (
<div>
      <h1 className="text-center text-2xl pt-10 font-bold">Contact Us</h1>
        <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
          <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="Contact" />
          <div className='flex flex-col justify-center items-start gap-6'>
              <p className='font-semibold text-xl text-gray-600'>Our Store</p>
              <p className='text-gray-500'>54709 Willms Station <br /> Suite 350, Washigton, USA</p>
              <p className='text-gray-500 '>Tel: (415) 555-3455 <br /> Email: admin@blisstechiq.com</p>
              <p className='font-semibold text-xl text-gray-600'>Careers at BlissTechIq</p>
              <p className='text-gray-500'>Learn more about our teams and jobs openings.</p>
              <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</button>
          </div>
        </div>
        <NewsletterBox />
  </div>
  );
};

export default Contact;
