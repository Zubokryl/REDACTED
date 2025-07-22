'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { getPreviewUrl } from '@/utils/getPreviewUrl';
import { licenseCoefficient } from '@/utils/licenseCoefficient';
import styles from './CartPage.module.css'; 

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart, getTotalPrice } = useCart();

  

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.heading}>Your Cart</h1>

      {cartItems.length === 0 ? (
        <p className={styles.empty}>Your cart is empty.</p>
      ) : (
        <>
          <ul className={styles.itemList}>
            {cartItems.map((item) => (
              <li key={item.id || item.model_id} className={styles.cartItem}>
                <Link href={`/models/${item.model_id}`} className={styles.modelLink}>
              <div className={styles.modelPreview}>
                 <Image 
  src={getPreviewUrl(item.preview_image_url)} 
  alt={item.title}
  width={150}
  height={100}
  className={styles.previewImage}
/>
        </div>
      </Link>
                <div className={styles.details}>
                  <Link href={`/models/${item.model_id}`} className={styles.title}>
                    {item.title}
                  </Link>
                  <p className={styles.license}>
  License: {item.license_type} (x{licenseCoefficient(item.license_type)})
</p>
                  <p className={styles.price}>${item.price.toFixed(2)}</p>
                </div>
               <button
  className={styles.removeButton}
  onClick={() => item.id && removeFromCart(item.id)}
  disabled={!item.id} 
>
  Remove
</button>
              </li>
            ))}
          </ul>

          <div className={styles.summary}>
            <p>Total: <strong>${getTotalPrice().toFixed(2)}</strong></p>
           <button className={styles.clearButton} onClick={clearCart}>Clear Cart</button>

            <Link href="/payment" className={styles.checkoutButton}>
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;