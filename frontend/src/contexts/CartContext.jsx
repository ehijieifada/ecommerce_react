import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Check if the product with the same selectedSize already exists
      const existingItem = prevItems.find(
        item => item._id === product._id && item.selectedSize === product.selectedSize
      );
      if (existingItem) {
        return prevItems.map(item =>
          item._id === product._id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  // Update the quantity for a given cart item
  const updateQuantity = (productId, selectedSize, newQuantity) => {
    setCartItems(prevItems =>
      prevItems
        .map(item => {
          if (item._id === productId && item.selectedSize === selectedSize) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        // Remove items that have zero (or negative) quantity
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId, selectedSize) => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item._id === productId && item.selectedSize === selectedSize))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
