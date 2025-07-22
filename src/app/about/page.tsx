'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './AboutStyles.module.css';
import UserGuide from './UserGuide';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>About REDACTED</h1>
        <div className={styles.subtitle}>Premium 3D Assets for Game Development and Creative Projects</div>
      </div>

      {/* Tabs Navigation */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'about' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About Us
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'guide' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          User Guide
        </button>
      </div>

      {/* About Tab Content */}
      {activeTab === 'about' && (
        <>
          <div className={styles.contentSection}>
            <div className={styles.textBlock}>
              <h2 className={styles.sectionTitle}>Our Vision</h2>
              <p>
                REDACTED is a web platform with shop functionality for selling high-quality 3D assets.
                Our mission is to provide game developers, designers, and creative professionals with 
                exceptional 3D resources that bring their visions to life. We focus on delivering 
                optimized models with clean topology, professional texturing, and multiple format options.
              </p>
            </div>
          </div>

          <div className={styles.contentSection}>
            <div className={styles.textBlock}>
              <h2 className={styles.sectionTitle}>Quality Standards</h2>
              <p>
                Every asset on our platform undergoes rigorous quality checks. We ensure proper 
                topology, clean UV mapping, and provide industry-standard formats like FBX, OBJ, 
                and Blender files. Our assets are optimized for game development and other creative 
                applications, with high-quality preview images to showcase their features.
              </p>
            </div>
          </div>

          <div className={styles.teamSection}>
            <h2 className={styles.sectionTitle}>Our Team</h2>
            <div className={styles.teamGrid}>
              <div className={styles.teamMember}>
                <div className={styles.memberPhoto}>
                  <Image 
                    src="/team/benjamin.jpg" 
                    alt="Benjamin Kopetzky" 
                    width={200} 
                    height={200}
                    className={styles.memberImage}
                  />
                </div>
                <h3 className={styles.memberName}>Benjamin Kopetzky</h3>
                <p className={styles.memberRole}>Game Artist (Asset Creation)</p>
                <p className={styles.memberDesc}>Creates high-quality game assets through modeling, sculpting, texturing, and animation. Uses tools like Maya, ZBrush, and Substance 3D Painter.</p>
              </div>
              <div className={styles.teamMember}>
                <div className={styles.memberPhoto}>
                  <Image 
                    src="/team/svetlana.jpg" 
                    alt="Svetlana Radkevich" 
                    width={200} 
                    height={200}
                    className={styles.memberImage}
                  />
                </div>
                <h3 className={styles.memberName}>Svetlana Radkevich</h3>
                <p className={styles.memberRole}>Frontend Developer (Next.js)</p>
                <p className={styles.memberDesc}>Implements the frontend with Next.js, creating responsive UI and optimizing performance. Handles shop interface, checkout process, and API integration.</p>
              </div>
              <div className={styles.teamMember}>
                <div className={styles.memberPhoto}>
                  <Image 
                    src="/team/patrick.jpg" 
                    alt="Patrick Müller" 
                    width={200} 
                    height={200}
                    className={styles.memberImage}
                  />
                </div>
                <h3 className={styles.memberName}>Patrick Müller</h3>
                <p className={styles.memberRole}>Backend Developer (Laravel)</p>
                <p className={styles.memberDesc}>Develops REST API with Laravel, handling user management, asset data, and security. Manages database and server-side validation.</p>
              </div>
              <div className={styles.teamMember}>
                <div className={styles.memberPhoto}>
                  <Image 
                    src="/team/majkl.jpg" 
                    alt="Majkl Buzuleak" 
                    width={200} 
                    height={200}
                    className={styles.memberImage}
                  />
                </div>
                <h3 className={styles.memberName}>Majkl Buzuleak</h3>
                <p className={styles.memberRole}>Webshop Microservice Developer</p>
                <p className={styles.memberDesc}>Manages the webshop microservice, integrates payment providers (Stripe/Klarna), and handles the checkout process. Provides API for product listings and orders.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* User Guide Tab Content */}
      {activeTab === 'guide' && <UserGuide />}
    </div>
  );
}