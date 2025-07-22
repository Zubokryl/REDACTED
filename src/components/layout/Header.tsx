"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const cartItemCount = cartItems.length;

  const profileLink =
    user?.role === "admin"
      ? "/admin/profile"
      : user?.role === "creator"
      ? "/creator/profile"
      : "/user/profile";

  const handleLogout = () => {
    logout();
    router.push("/login");
    setMenuOpen(false);
  };

  return (
    <header className={`${styles.header} ${!isHomePage ? styles.headerWithBg : ""}`}>
    <div className={styles.topRow}>
      <Link href="/" className={styles.logoLink}>
        <Image
          src="/LOGO V2 small white.png"
          alt="Logo"
          width={260}
          height={120}
          className={styles.logo}
          priority
          unoptimized
        />
      </Link>
    </div>
    
  
    <button
  className={styles.burger}
  onClick={() => setMenuOpen((prev) => !prev)}
  aria-label="Toggle menu"
>
  {menuOpen ? "✖" : "☰"}
</button>

      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
        <Link href="/shop" className={styles.link} onClick={() => setMenuOpen(false)}>Shop</Link>
        <Link href="/about" className={styles.link} onClick={() => setMenuOpen(false)}>About</Link>
        <Link href="/contact" className={styles.link} onClick={() => setMenuOpen(false)}>Contact</Link>
        {user ? (
          <>
            <Link href={profileLink} className={styles.link} onClick={() => setMenuOpen(false)}>
              {user.name || "Profile"}
            </Link>
            <button onClick={handleLogout} className={styles.link}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className={styles.link} onClick={() => setMenuOpen(false)}>Login</Link>
        )}
      </nav>
      
      <div className={styles.cartContainer}>
        <Link href="/cart" className={styles.link} onClick={() => setMenuOpen(false)}>
          <div className={styles.cartWrapper}>
            <Image 
              src="/icons/cart-gold.svg" 
              alt="Cart" 
              width={32} 
              height={32} 
              className={styles.cartIcon} 
            />
          </div>
        </Link>
        {cartItemCount > 0 && <span className={styles.cartText}>{cartItemCount} {cartItemCount === 1 ? 'model' : 'models'}</span>}
      </div>
    </header>
  );
}