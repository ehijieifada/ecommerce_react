import React from 'react';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const About = () => {
  return (
    <div>
      {/* About Us Section */}
      <div className="text-2xl text-center font-bold pt-8">
        <h1>About Us</h1>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img 
          className="w-full md:max-w-[450px]" 
          src={assets.about_img} 
          alt="About Us" 
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4">
          <p className="text-lg leading-relaxed" id='custom_text'>
            BlissTechIq was created with a vision to redefine online shopping, blending style and technology seamlessly.  
            Our journey started with a simple goal: to offer a platform where customers can easily find, explore,  
            and shop for high-quality products without hassle.
          </p>
          <p className="text-lg leading-relaxed" id='custom_text'>
            Since our launch, we have been committed to curating a diverse collection of premium products that  
            cater to various lifestyles. From fashion and accessories to cutting-edge electronics, we bring you  
            an extensive selection from trusted brands and manufacturers.
          </p>
          <h2 className="text-blue-800 font-bold text-xl">Our Mission</h2>
          <p className="text-lg leading-relaxed" id='custom_text'>
            At BlissTechIq, our mission is to offer customers the perfect fusion of innovation and style.  
            We strive to deliver an exceptional shopping experience with a focus on quality, convenience,  
            and customer satisfaction, from discovery to doorstep.
          </p>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="text-xl font-bold py-4 text-center md:text-left">
        <h1>WHY SHOP WITH US?</h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 text-sm mb-20">
        <div className="shadow-lg p-6 md:p-10 flex flex-col gap-3 bg-white rounded-md">
          <h2 className="font-bold text-lg">Premium Quality Guaranteed</h2>
          <p className="text-gray-600">
            Every product is carefully inspected to ensure it meets the highest standards of quality and durability.
          </p>
        </div>
        <div className="shadow-lg p-6 md:p-10 flex flex-col gap-3 bg-white rounded-md">
          <h2 className="font-bold text-lg">Effortless Shopping Experience</h2>
          <p className="text-gray-600">
            Our seamless interface and quick checkout process make your shopping journey smooth and enjoyable.
          </p>
        </div>
        <div className="shadow-lg p-6 md:p-10 flex flex-col gap-3 bg-white rounded-md">
          <h2 className="font-bold text-lg">Unmatched Customer Support</h2>
          <p className="text-gray-600">
            Our friendly support team is always ready to assist you, making your satisfaction our top priority.
          </p>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <NewsletterBox />
    </div>
  );
};

export default About;
