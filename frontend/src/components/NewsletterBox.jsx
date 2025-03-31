import React, { useState } from 'react';

const NewsletterBox = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage('Please enter a valid email address.');
      return;
    }

    setMessage('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <div className="bg-red-100 py-10 px-6 md:px-16 rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-bold text-gray-900">Subscribe to Our Newsletter</h2>
      <p className="text-gray-600 mt-2">Get the latest updates, special offers, and exclusive deals.</p>

      <form onSubmit={handleSubscribe} className="mt-4 flex flex-col md:flex-row justify-center items-center gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full md:w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Subscribe
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default NewsletterBox;
