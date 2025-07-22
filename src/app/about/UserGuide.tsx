import React from 'react';
import styles from './AboutStyles.module.css';

export default function UserGuide() {
  return (
    <div className={styles.guideContainer}>
      <h2 className={styles.sectionTitle}>User Guide</h2>
      
      <section className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Getting Started</h3>
        <p>
          Welcome to REDACTED, a premium marketplace for high-quality 3D assets designed for game development and creative projects. 
          This guide will help you navigate our platform and make the most of its features.
        </p>
      </section>

      <section className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>User Roles</h3>
        <p>Our platform supports two different user roles:</p>
        <ol className={styles.guideList}>
          <li><strong>User</strong> - Can browse, purchase, and download 3D models</li>
          <li><strong>Creator</strong> - Can upload, sell, and manage 3D models, as well as purchase models from other creators</li>
        </ol>
      </section>

      <section className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Browsing Models</h3>
        <ul className={styles.guideList}>
          <li>Visit the <strong>Shop</strong> page to browse all available 3D models</li>
          <li>Use filters to narrow down models by category, price range, or creator</li>
          <li>Click on any model to view its details, preview the 3D model, and see technical specifications</li>
        </ul>
      </section>

      <section className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Interactive 3D Preview</h3>
        <p>All models feature an interactive 3D preview that allows you to:</p>
        <ul className={styles.guideList}>
          <li>Rotate the model by dragging your mouse</li>
          <li>Zoom in/out using the mouse wheel</li>
          <li>Pan the view by holding Shift while dragging</li>
          <li>Models with animations will play automatically</li>
        </ul>
      </section>

      <section className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Supported File Formats</h3>
        <p>We support multiple 3D file formats:</p>
        <ul className={styles.guideList}>
          <li><strong>GLB/GLTF</strong> - Optimized for web viewing</li>
          <li><strong>FBX</strong> - Industry standard for animation and rigging</li>
          <li><strong>OBJ</strong> - Common interchange format</li>
          <li><strong>Marmoset/TBSCENE</strong> - For high-quality PBR rendering</li>
        </ul>
      </section>

      <section className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>License Types</h3>
        <p>When purchasing a model, you can choose from three license types:</p>
        
        <div className={styles.licenseItem}>
          <h4>1. Standard License</h4>
          <p>For personal use only</p>
          <ul className={styles.guideList}>
            <li>Limited to 5 downloads</li>
            <li>Cannot be used in commercial projects</li>
          </ul>
        </div>
        
        <div className={styles.licenseItem}>
          <h4>2. Editorial Use</h4>
          <p>For commercial projects with limitations</p>
          <ul className={styles.guideList}>
            <li>Up to 10 downloads</li>
            <li>Can be used in commercial projects with attribution</li>
          </ul>
        </div>
        
        <div className={styles.licenseItem}>
          <h4>3. Commercial Use</h4>
          <p>Full commercial rights</p>
          <ul className={styles.guideList}>
            <li>Up to 100 downloads</li>
            <li>Can be used in any commercial project without attribution</li>
          </ul>
        </div>
      </section>

      <section className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>For Creators</h3>
        
        <div className={styles.creatorSection}>
          <h4>1. Profile Setup</h4>
          <ul className={styles.guideList}>
            <li>Complete your profile with your name, about section, experience, and skills</li>
            <li>Add your software expertise (Blender, Maya, ZBrush, etc.)</li>
            <li>Connect your social media accounts</li>
          </ul>
        </div>
        
        <div className={styles.creatorSection}>
          <h4>2. Uploading Models</h4>
          <ul className={styles.guideList}>
            <li>Go to your Creator Store and click "Upload New Model"</li>
            <li>Fill in all required details: title, description, category, price</li>
            <li>Upload your 3D model file (FBX, GLB, OBJ)</li>
            <li>Add preview images and textures if applicable</li>
            <li>Set technical specifications like vertex count and features</li>
          </ul>
        </div>
        
        <div className={styles.creatorSection}>
          <h4>3. Managing Your Store</h4>
          <ul className={styles.guideList}>
            <li>Track your uploaded models</li>
            <li>Edit model details</li>
          </ul>
        </div>
      </section>

      <section className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Purchasing and Downloads</h3>
        
        <div className={styles.purchaseSection}>
          <h4>1. Adding to Cart</h4>
          <ul className={styles.guideList}>
            <li>Click "Buy Model" on the model detail page</li>
            <li>Select your preferred license type</li>
            <li>The model will be added to your cart</li>
          </ul>
        </div>
        
        <div className={styles.purchaseSection}>
          <h4>2. Checkout Process</h4>
          <ul className={styles.guideList}>
            <li>Review your cart items</li>
            <li>Proceed to checkout</li>
            <li>Complete payment using the secure payment system</li>
          </ul>
        </div>
        
        <div className={styles.purchaseSection}>
          <h4>3. Accessing Purchases</h4>
          <ul className={styles.guideList}>
            <li>After purchase, models are available in your "My Purchases" tab</li>
            <li>Download your models directly from this section</li>
            <li>Note the download limits based on your license type</li>
          </ul>
        </div>
      </section>

      <section className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Technical Features</h3>
        <ul className={styles.guideList}>
          <li><strong>Model Specifications</strong>: View detailed information about each model including polygon count, textures, and features</li>
          <li><strong>3D Printable</strong>: Some models are optimized for 3D printing, marked with the "Printable" tag</li>
          <li><strong>Animations</strong>: Models with animations will display them in the preview</li>
          <li><strong>PBR Materials</strong>: Many models include PBR textures for realistic rendering</li>
        </ul>
      </section>

      <section className={styles.guideSection}>
        <h3 className={styles.guideSubtitle}>Need Help?</h3>
        <ul className={styles.guideList}>
          <li>Visit our <strong>Contact</strong> page for support</li>
          <li>Check out our <strong>About</strong> page to learn more about our team</li>
          <li>For technical guidance on file formats, visit our <strong>GLB Guide</strong> page</li>
        </ul>
      </section>
    </div>
  );
}