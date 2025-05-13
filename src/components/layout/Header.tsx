"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
const isHomePage = pathname === "/";

  const profileLink =
    user?.role === "admin"
      ? "/admin/profile"
      : user?.role === "creator"
      ? "/creator/profile"
      : "/user/profile";

  const handleLogout = () => {
    logout();
    router.push("/login"); 
  };

  return (
    <header className={`${styles.header} ${!isHomePage ? styles.headerWithBg : ""}`}>
      <Link href="/" className={styles.logoLink}>
        <Image
          src="/LOGO.png"
          alt="Logo"
          width={260}
          height={120}
          className={styles.logo}
          priority
        />
      </Link>
      <nav className={styles.nav}>
        <Link href="/shop" className={styles.link}>Shop</Link>
        <Link href="/cart" className={styles.link}>Cart</Link>
        {user ? (
  <>
    <Link href={profileLink} className={styles.link}>
      {user.name || "Profile"}
    </Link>
    <button onClick={handleLogout} className={styles.link}>
      Logout
    </button>
  </>
) : (
  <Link href="/login" className={styles.link}>Login</Link>
)}
      </nav>
    </header>
  );
}