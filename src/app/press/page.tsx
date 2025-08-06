"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./PressStyles.module.css";

export default function PressPage() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const toggleDisclaimer = () => setShowDisclaimer((prev) => !prev);

  return (
    <div className={styles.container}>
      {/* Hero / Key Visual */}
      <section className={styles.heroSection}>
        <h1 className={styles.title}>Press Kit</h1>
        <p className={styles.subtitle}>Everything press related to REDACTED.</p>

        <div className={styles.ctaButtons}>
          <a
            href="/press/press-kit.zip"
            download
            className={styles.primaryButton}
          >
            Download All Press Material
          </a>
          <a href="/contact" className={styles.secondaryButton}>
            Contact Press
          </a>
        </div>
      </section>

      {/*Fact Sheet */}
      <section className={styles.factsSection}>
        <h2 className={styles.sectionTitle}>Fact Sheet</h2>

        <ul className={styles.factsList}>
          <li>
            <strong>Introduction</strong>
            Brand-new 3D asset store for artists &amp; game studios
          </li>
          <li>
            <strong>Key Facts</strong>
            - High-quality assets <br />
            - Engine compatibility <br />- Consistency
          </li>
          <li>
            <strong>Benefits</strong>
            - User-friendly shopping <br />
            - 24/7 access <br />
            - 3D previews <br />- Secure transactions
          </li>
          <li>
            <strong>Goal</strong>
            Deliver premium game assets for better projects
          </li>
        </ul>
      </section>

      {/* Brand Assets */}
      <section className={styles.brandSection}>
        <h2 className={styles.sectionTitle}>Brand Assets</h2>
        <p className={styles.sectionIntro}>
          Download logo packs, colour swatches and typography specs. Please
          follow our usage guidelines below.
        </p>

        <div className={styles.assetGrid}>
          {/* Logos */}
          <div className={styles.assetItem}>
            <Image
              src="/LOGO V1.svg"
              alt="REDACTED Red Logo"
              width={200}
              height={200}
            />
            <Image
              src="/LOGO V2.svg"
              alt="REDACTED White Logo"
              width={200}
              height={200}
            />
            <a
              href="/press/logo-pack.zip"
              download
              className={styles.assetLink}
            >
              Logo Pack (.SVG)
            </a>
          </div>

          {/* Swatches */}
          <div className={styles.assetItem}>
            <div className={styles.swatchGrid}>
              <div className={`${styles.swatchItem} ${styles.swatchRed}`}>
                #73171F
              </div>
              <div className={`${styles.swatchItem} ${styles.swatchGold}`}>
                #A68A56
              </div>
              <div className={`${styles.swatchItem} ${styles.swatchDark}`}>
                #111111
              </div>
              <div className={`${styles.swatchItem} ${styles.swatchWhite}`}>
                #FFFFFF
              </div>
            </div>
            <a href="/press/swatch.png" download className={styles.assetLink}>
              Colour Swatch
            </a>
          </div>

          {/* Typography */}
          <div className={styles.assetItem}>
            <span className={styles.typoSample}>Aa</span>
            <p className={styles.typoDescription}>
              Montserrat Bold &amp; Regular
            </p>
            <a href="/press/Typeface.pdf" download className={styles.assetLink}>
              Typography PDF
            </a>
          </div>
        </div>

        {/* Logo Rules */}
        <div className={styles.usageRules}>
          <h3 className={styles.rulesTitle}>Logo Usage</h3>
          <ul className={styles.rulesList}>
            <li>Minimum width 150 px</li>
            <li>Keep 16 px clear space around the mark</li>
            <li>Use red logo on light backgrounds, white logo on dark</li>
            <li>No rotation, drop shadows or colour alterations</li>
          </ul>
        </div>
      </section>

      {/* Key Visuals */}
      <section className={styles.visualsSection}>
        <h2 className={styles.sectionTitle}>Key Visuals</h2>
        <div className={styles.visualGrid}>
          <div className={styles.assetItem}>
            <Image
              src="/press/hero_1920.png"
              alt="Hero Banner"
              width={384}
              height={160}
            />
            <a
              href="/press/hero_banner.zip"
              download
              className={styles.assetLink}
            >
              Hero Banner
            </a>
          </div>
          <div className={styles.assetItem}>
            <Image
              src="/press/social_share.png"
              alt="Social Share Image"
              width={384}
              height={160}
            />
            <a
              href="/press/social_share.zip"
              download
              className={styles.assetLink}
            >
              Social Share
            </a>
          </div>
          <div className={styles.assetItem}>
            <Image
              src="/press/bts_thumb.png"
              alt="Behind-the-Scenes Still"
              width={384}
              height={160}
            />
            <a
              href="/press/bts_stills.zip"
              download
              className={styles.assetLink}
            >
              BTS Stills
            </a>
          </div>
        </div>
      </section>

      {/* Tech Specs */}
      <section className={styles.techSection}>
        <h2 className={styles.sectionTitle}>Tech Specs</h2>
        <ul className={styles.techList}>
          <li>
            <strong>Stack:</strong> Next.js 14 <strong>|</strong> Laravel API{" "}
            <strong>|</strong> MySQL
          </li>
          <li>
            <strong>3D Viewer:</strong> three.js WebGL
          </li>
          <li>
            <strong>Payments:</strong> Stripe
          </li>
        </ul>
      </section>

      {/* Quotes */}
      <section className={styles.quoteSection}>
        <h2 className={styles.sectionTitle}>Quotes</h2>
        <div className={styles.quoteGrid}>
          <figure className={styles.quoteItem}>
            <blockquote>
              “Das richtige Asset zu finden sollte wenige Minuten dauern, nicht
              Tage.”
            </blockquote>
            <br />
            <blockquote>
              “Finding the right asset should take minutes, not days.”
            </blockquote>
            <figcaption>Svetlana Radkevich, Co-Founder</figcaption>
          </figure>

          <figure className={styles.quoteItem}>
            <blockquote>
              “Unsere Assets sind das Lego-Set für dein Level-Design.”
            </blockquote>
            <br />
            <blockquote>
              “Our assets are the Lego set for your level design.”
            </blockquote>
            <figcaption>Benjamin Kopetzky, Lead Game Artist</figcaption>
          </figure>
        </div>
      </section>

      {/* Downloads / Docs */}
      <section className={styles.downloadSection}>
        <h2 className={styles.sectionTitle}>Downloads</h2>
        <div className={styles.downloadGrid}>
          <a
            href="/press/fact sheet.pdf"
            download
            className={styles.downloadCard}
          >
            Fact Sheet (.pdf)
          </a>
          <a
            href="/press/press release.pdf"
            download
            className={styles.downloadCard}
          >
            Press Release in German/English (.pdf)
          </a>
          <a href="/press/Logos.zip" download className={styles.downloadCard}>
            Logos (.zip)
          </a>
        </div>
      </section>

      {/* Disclaimer */}
      <section className={styles.disclaimerSection}>
        <button onClick={toggleDisclaimer} className={styles.disclaimerToggle}>
          {showDisclaimer ? "Hide" : "Show"} Disclaimer
        </button>

        {showDisclaimer && (
          <p className={styles.disclaimerText}>
            Unless explicitly marked CC-BY 4.0, all assets remain the
            intellectual property of REDACTED and are permitted for editorial
            use only.
          </p>
        )}
      </section>
    </div>
  );
}
