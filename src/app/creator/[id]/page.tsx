'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { makeRequest } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import styles from './CreatorView.module.css';

interface CreatorProfile {
  id: number;
  name: string;
  about: string;
  experience: string;
  contact: string;
  skills: string;
  software: string[];
  profile_photo_url: string;
  socialLinks: {
    [key: string]: string;
  };
}

export default function CreatorViewPage() {
  const params = useParams();
  const creatorId = params?.id;
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      try {
        const response = await makeRequest<CreatorProfile>('get', `/creator/${creatorId}`);
        setProfile(response);
      } catch (err) {
        setError('Failed to load creator profile');
        console.error('Error loading creator profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (creatorId) {
      fetchCreatorProfile();
    }
  }, [creatorId]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!profile) return <div className={styles.error}>Creator not found</div>;

  const getProfilePhotoUrl = (profile: CreatorProfile) => {
    if (profile.profile_photo_url) {
      return profile.profile_photo_url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=811818&color=fff`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <section className={styles.profileTop}>
          <div className={styles.profileRow}>
            <div className={styles.profileAboutContainer}>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>About</h3>
                <p>{profile.about || "No information provided."}</p>
              </section>
            </div>

            <div className={styles.profileDetails}>
              <div className={styles.avatarWrapper}>
                <Image
                  src={getProfilePhotoUrl(profile)}
                  alt={`${profile.name}&apos;s profile picture`}
                  width={200}
                  height={200}
                  className={styles.profilePic}
                />
              </div>

              <div className={styles.profileInfo}>
                <div className={styles.name}>
                  <p>{profile.name}</p>
                </div>

                <div className={styles.email}>
                  <p>{profile.contact || 'No contact information'}</p>
                </div>

                <div className={styles.socialLinks}>
                  <p>Follow on Social:</p>
                  <div className={styles.icons}>
                    {Object.entries(profile.socialLinks)
                      .filter(([_, url]) => url && url.trim() !== '')
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
                </div>

                <Link href={`/shop?creator=${profile.id}`} className={styles.storeLink}>
                  View Creator's Store
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Experience</h3>
          <p>{profile.experience}</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Skills</h3>
          <div className={styles.tagsContainer}>
            {profile.skills
              .split(',')
              .map((skill) => skill.trim())
              .filter(Boolean)
              .map((skill) => (
                <div key={skill} className={styles.skillTag}>
                  {skill}
                </div>
              ))}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Software</h3>
          <div className={styles.tagsContainer}>
            {profile.software
              .filter((s) => s.trim() !== '')
              .map((software) => (
                <div key={software} className={styles.softwareTag}>
                  <Image
                    src={`/icons/software/${software}.png`}
                    alt={software}
                    width={20}
                    height={20}
                  />
                  <span>{software}</span>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
} 