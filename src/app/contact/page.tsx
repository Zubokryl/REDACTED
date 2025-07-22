'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './ContactStyles.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    setFormStatus({
      submitted: true,
      error: false,
      message: 'Thank you for your message! We will get back to you soon.'
    });
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Contact Us</h1>
        <div className={styles.subtitle}>We'd love to hear from you</div>
      </div>

      <div className={styles.contactGrid}>
        <div className={styles.contactInfo}>
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle}>Get in Touch</h2>
            
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <Image 
                  src="/icons/email-gold.svg" 
                  alt="Email" 
                  width={24} 
                  height={24} 
                />
              </div>
              <div className={styles.contactDetails}>
                <h3 className={styles.contactLabel}>Email Us</h3>
                <p className={styles.contactValue}>support@redacted.com</p>
                <p className={styles.contactValue}>business@redacted.com</p>
              </div>
            </div>
            
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <Image 
                  src="/icons/phone-gold.svg" 
                  alt="Phone" 
                  width={24} 
                  height={24} 
                />
              </div>
              <div className={styles.contactDetails}>
                <h3 className={styles.contactLabel}>Call Us</h3>
                <p className={styles.contactValue}>+49 (123) 456-7890</p>
                <p className={styles.contactValue}>Mon-Fri, 9am-6pm CET</p>
              </div>
            </div>
            
            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <Image 
                  src="/icons/location-gold.svg" 
                  alt="Location" 
                  width={24} 
                  height={24} 
                />
              </div>
              <div className={styles.contactDetails}>
                <h3 className={styles.contactLabel}>Project Supervisor</h3>
                <p className={styles.contactValue}>Ahmad Hachicho</p>
              </div>
            </div>
            
            <div className={styles.socialLinks}>
              <h3 className={styles.socialTitle}>Follow Us</h3>
              <div className={styles.socialIcons}>
                <a href="https://twitter.com/redacted" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <Image 
                    src="/icons/twitter-gold.svg" 
                    alt="Twitter" 
                    width={24} 
                    height={24} 
                  />
                </a>
                <a href="https://instagram.com/redacted" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <Image 
                    src="/icons/instagram-gold.svg" 
                    alt="Instagram" 
                    width={24} 
                    height={24} 
                  />
                </a>
                <a href="https://artstation.com/redacted" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <Image 
                    src="/icons/artstation-gold.svg" 
                    alt="ArtStation" 
                    width={24} 
                    height={24} 
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.contactForm}>
          <div className={styles.formCard}>
            <h2 className={styles.sectionTitle}>Send a Message</h2>
            
            {formStatus.submitted ? (
              <div className={styles.formSuccess}>
                <div className={styles.successIcon}>✓</div>
                <p className={styles.successMessage}>{formStatus.message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="subject" className={styles.formLabel}>Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={styles.formSelect}
                    aria-label="Select a subject"
                  >
                    <option value="" disabled>Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="creator">Become a Creator</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className={styles.formTextarea}
                    placeholder="Type your message here..."
                    rows={6}
                  />
                </div>
                
                <button type="submit" className={styles.submitButton}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
        
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>What file formats do you support?</h3>
            <p className={styles.faqAnswer}>
              We support industry-standard formats including FBX, OBJ, and Blender files. 
              Each asset listing specifies the available formats.
            </p>
          </div>
          
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>How do licensing options work?</h3>
            <p className={styles.faqAnswer}>
              We offer various licenses depending on your needs, from personal use to 
              commercial applications. Check each asset's licensing details for specific terms.
            </p>
          </div>
          
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>Can I request custom modifications?</h3>
            <p className={styles.faqAnswer}>
              Yes! Many of our creators offer customization services. Look for the 
              "Customizable" tag on asset listings or contact the creator directly.
            </p>
          </div>
          
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>How do I become a creator on your platform?</h3>
            <p className={styles.faqAnswer}>
              We're always looking for talented 3D artists. Select "Become a Creator" 
              from the subject dropdown in our contact form to start the process.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.teamContactSection}>
        <h2 className={styles.sectionTitle}>Team Contacts</h2>
        
        <div className={styles.teamContactGrid}>
          <div className={styles.teamContactItem}>
            <h3 className={styles.teamContactName}>Benjamin Kopetzky</h3>
            <p className={styles.teamContactRole}>Game Artist (Asset Creation)</p>
            <p className={styles.teamContactEmail}>benjamin@redacted.com</p>
          </div>
          
          <div className={styles.teamContactItem}>
            <h3 className={styles.teamContactName}>Svetlana Radkevich</h3>
            <p className={styles.teamContactRole}>Frontend Developer</p>
            <p className={styles.teamContactEmail}>svetlana@redacted.com</p>
          </div>
          
          <div className={styles.teamContactItem}>
            <h3 className={styles.teamContactName}>Patrick Müller</h3>
            <p className={styles.teamContactRole}>Backend Developer</p>
            <p className={styles.teamContactEmail}>patrick@redacted.com</p>
          </div>
          
          <div className={styles.teamContactItem}>
            <h3 className={styles.teamContactName}>Majkl Buzuleak</h3>
            <p className={styles.teamContactRole}>Webshop Developer</p>
            <p className={styles.teamContactEmail}>majkl@redacted.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}