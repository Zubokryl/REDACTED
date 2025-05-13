'use client';

import styles from './CreatorProfile.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const defaultProfile = {
  nickname: '',
  about: '',
  experience: '',
  contact: '',
  skills: '',
  software: '',
  avatar: '',
  socialLinks: {
    Artstation: '',
    Facebook: '',
    GitHub: '',
    Instagram: '',
    LinkedIn: '',
    Twitter: '',
    YouTube: ''
  },
};

export default function CreatorProfilePage() {
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const { user, profile, setAuth } = useAuth();
  const isOwner = user?.role === 'creator';

  const [profileData, setProfileData] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);



  useEffect(() => {
    if (profile) {
      setProfileData({
        ...defaultProfile,
        ...profile,
        socialLinks: {
          ...defaultProfile.socialLinks,
          ...(profile.socialLinks || {}),
        },
      });
    }
  }, [profile]);

  const handleChange = <T extends keyof typeof defaultProfile>(
    field: T,
    value: typeof defaultProfile[T]
  ) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setAuth({ user, profile: profileData });
    setIsEditing(false);
    alert('Profile saved!');
  };

  const handleReset = () => {
    setAuth({ user, profile: null });
    setProfileData(defaultProfile);
    setIsEditing(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.heading}></h1>
  
        <section className={styles.profileTop}>
          <div className={styles.profileRow}>
            <div className={styles.profileAboutContainer}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>About</h3>
                {isOwner && isEditing ? (
                  <textarea
                    className={styles.textarea}
                    value={profileData.about}
                    onChange={(e) => handleChange('about', e.target.value)}
                  />
                ) : (
                  <p>{profileData.about}</p>
                )}
              </section>
            </div>
  
            <div className={styles.profileDetails}>
              <div className={styles.avatarWrapper}>
                <Image
                  src={profileData.avatar || '/default-avatar.png'}
                  alt="Creator Avatar"
                  width={150}
                  height={150}
                  className={styles.profilePic}
                />
                {isOwner && isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const base64 = await toBase64(file);
                        handleChange('avatar', base64);
                      }
                    }}
                  />
                )}
              </div>
  
              <div className={styles.profileInfo}>
                <p className={styles.nickname}>
                  {profileData.nickname || 'Nickname'}
                </p>
                <p className={styles.email}>
                  {profileData.contact || 'Email'}
                </p>
                <p className={styles.website}>
                  🌐{' '}
                  <a
                    href="https://yourwebsite.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    yourwebsite.com
                  </a>
                </p>
  
                <div className={styles.socialLinks}>
                  <p>Follow on Social:</p>
                  {isOwner && isEditing ? (
                    <div className={styles.editSocialsGrid}>
                      {(Object.keys(defaultProfile.socialLinks) as (
                        keyof typeof defaultProfile.socialLinks
                      )[]).map((platform) => (
                        <div key={platform} className={styles.socialEditItem}>
                          <label>
                            <input
                              type="checkbox"
                              checked={!!profileData.socialLinks[platform]}
                              onChange={(e) =>
                                handleChange('socialLinks', {
                                  ...profileData.socialLinks,
                                  [platform]: e.target.checked
                                    ? `https://www.${platform.toLowerCase()}.com/yourprofile`
                                    : '',
                                })
                              }
                            />
                            {platform}
                          </label>
                          {profileData.socialLinks[platform] && (
                            <input
                              className={styles.input}
                              type="url"
                              value={profileData.socialLinks[platform]}
                              onChange={(e) =>
                                handleChange('socialLinks', {
                                  ...profileData.socialLinks,
                                  [platform]: e.target.value,
                                })
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.icons}>
                      {(Object.entries(profileData.socialLinks) as [
                        keyof typeof defaultProfile.socialLinks,
                        string
                      ][])
                      .filter(([platform, url]) => {
                        if (url && url.trim() !== '') {
                       console.log(platform);  
                          return true;
                        }
                        return false;
                      })
                        .map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              src={`/icons/${platform}.png`}
                              alt={platform}
                              width={24}
                              height={24}
                            />
                          </a>
                        ))}
                    </div>
                  )}
                </div>
  
                <Link href="/creator/store" className={styles.storeLink}>
                 View Store (0 items)
                </Link>
  
                {isOwner && (
                  <div className={styles.profileButtons}>
                    {isEditing ? (
                      <button className={styles.profileButton} onClick={handleSave}>
                        Save Profile
                      </button>
                    ) : (
                      <button
                        className={styles.profileButton}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </button>
                    )}
  
                    <button
                      className={`${styles.profileButton} ${styles.deleteButton}`}
                      onClick={handleReset}
                    >
                      Delete Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
  
        {[
  { label: 'Experience', field: 'experience', multiline: true },
  { label: 'Contact', field: 'contact', type: 'email' },
  { label: 'Skills', field: 'skills' },
  { label: 'Software', field: 'software' },
].map(({ label, field, multiline, type }) => (
  <section className={styles.section} key={field}>
    <h3 className={styles.sectionTitle}>{label}</h3>
    {isOwner && isEditing ? (
      multiline ? (
        <textarea
          className={styles.textarea}
          value={
            typeof profileData[field as keyof typeof defaultProfile] === 'string'
              ? (profileData[field as keyof typeof defaultProfile] as string)
              : ''
          }
          onChange={(e) =>
            handleChange(field as keyof typeof defaultProfile, e.target.value)
          }
        />
      ) : (
        <input
          className={styles.input}
          type={type || 'text'}
          value={
            typeof profileData[field as keyof typeof defaultProfile] === 'string'
              ? (profileData[field as keyof typeof defaultProfile] as string)
              : ''
          }
          onChange={(e) =>
            handleChange(field as keyof typeof defaultProfile, e.target.value)
          }
        />
      )
    ) : (
      typeof profileData[field as keyof typeof defaultProfile] === 'string' &&
      (field === 'skills' || field === 'software' ? (
        <div className={styles.tagsContainer}>
          {(profileData[field as keyof typeof defaultProfile] as string)
            .split(',')
            .map((tag, i) => (
              <span key={i} className={styles.tag}>
                {tag.trim()}
              </span>
            ))}
        </div>
      ) : (
        <p>{profileData[field as keyof typeof defaultProfile] as string}</p>
      ))
    )}
  </section>
))}
      </div>
      </div>
  );
}