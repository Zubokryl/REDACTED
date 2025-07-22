'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItemApi } from '@/types';
import { DigitalOrder } from '@/types';
import {
  clearCartApi,
  fetchCartItems,
  removeFromCart as removeFromCartApi,
  updateCartItemLicense as updateCartItemLicenseApi,
  checkoutCart as checkoutCartApi,
  addToCart as addToCartApi,
} from '../lib/api';
import { licenseCoefficient } from '@/utils/licenseCoefficient';

export interface CartItem {
  model_id: number;
  title: string;
  license_type: 'personal' | 'commercial' | 'enterprise';
  base_price: number;
  price: number; // base_price * licenseCoefficient
  preview_image_url: string | File;
  id?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  updateCartItemLicense: (cartItemId: number, license_type: CartItem['license_type']) => Promise<void>;
 checkoutCart: () => Promise<{ message: string; orders: DigitalOrder[] } | null>;
  getTotalPrice: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
  const loadCart = async () => {
    try {
      setLoading(true);
      const data: CartItemApi[] = await fetchCartItems();
      const items = data.map((ci) => {
        const basePrice = ci.model.price;
        const coefficient = licenseCoefficient(ci.license_type);
        const finalPrice = basePrice * coefficient;

        return {
          id: ci.id,
          model_id: ci.model_id,
          license_type: ci.license_type,
          title: ci.model.title,
          base_price: basePrice,
          price: finalPrice,
          preview_image_url: ci.model.preview_image_url,
        };
      });
      setCartItems(items);
    } catch (error) {
      console.error('Failed to load cart items', error);
    } finally {
      setLoading(false);
    }
  };

  loadCart();
}, []);


  const addToCart = async (item: Omit<CartItem, 'id'>) => {
  try {
    const addedItem = await addToCartApi(item.model_id, item.license_type);
    const basePrice = addedItem.model.price;
    const coefficient = licenseCoefficient(addedItem.license_type);
    const finalPrice = basePrice * coefficient;

    setCartItems((prev) => {
      if (prev.find((i) => i.model_id === item.model_id && i.license_type === item.license_type)) return prev;
      return [
        ...prev,
        {
          id: addedItem.id,
          model_id: addedItem.model_id,
          license_type: addedItem.license_type,
          title: addedItem.model.title,
          base_price: basePrice,
          price: finalPrice,
          preview_image_url : addedItem.model.preview_image_url,
        },
      ];
    });
  } catch (error) {
    console.error('Failed to add item to cart', error);
  }
};

  const removeFromCart = async (cartItemId: number) => {
    try {
      await removeFromCartApi(cartItemId);
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } catch (error) {
      console.error('Failed to remove item from cart', error);
    }
  };

  const clearCart = async () => {
    try {
      await clearCartApi();
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
  };

const updateCartItemLicense = async (cartItemId: number, license_type: CartItem['license_type']) => {
  try {
    const updatedItem = await updateCartItemLicenseApi(cartItemId, license_type);
    const basePrice = updatedItem.model.price;
    const coefficient = licenseCoefficient(license_type);
    const finalPrice = basePrice * coefficient;

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? {
              ...item,
              license_type,
              base_price: basePrice,
              price: finalPrice,
            }
          : item
      )
    );
  } catch (error) {
    console.error('Failed to update cart item license', error);
  }
};

  const checkoutCart = async () => {
    try {
      const result = await checkoutCartApi();
    
      setCartItems([]);
      return result;
    } catch (error) {
      console.error('Failed to checkout cart', error);
      return null;
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartItemLicense,
        checkoutCart,
        getTotalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};