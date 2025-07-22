'use client';

import styles from './CreatorProfile.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Profile } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const defaultProfile: Profile = {
  name: '',
  about: '',
  experience: '',
  contact: '',
  skills: '',
  software: [],
  profile_photo_url: '',
  socialLinks: {
    Artstation: '',
    Facebook: '',
    GitHub: '',
    Instagram: '',
    LinkedIn: '',
    Twitter: '',
    YouTube: '',
  },
};

const SOFTWARE_OPTIONS = [
  'Substance 3D Painter',
  'Substance 3D Designer',
  'ZBrush',
  'Unity',
  'Blender',
  'Maya',
  'Photoshop',
  '3ds Max',
  'Marmoset Toolbag',
];

export default function CreatorProfilePage() {
  const { user, profile, setAuth } = useAuth();
  const isOwner = user?.role === 'creator';
  const [modelCount, setModelCount] = useState(0);
  const [profileData, setProfileData] = useState(profile ?? defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      setProfileData(profile);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        console.log('[fetchProfile] returned data:', data);
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid profile data');
        }

        setProfileData({
          ...defaultProfile,
          ...data,
          software: Array.isArray(data.software)
            ? data.software
            : typeof data.software === 'string'
            ? data.software.split(',').map((s) => s.trim())
            : [],
          socialLinks: {
            ...defaultProfile.socialLinks,
            ...(typeof data.socialLinks === 'object' && data.socialLinks !== null ? data.socialLinks : {}),
          },
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfileData(defaultProfile);
      } finally {
        setLoading(false);
      }
    };

    const fetchModelCount = async () => {
      try {
        const models = await api.getModels({ creator_id: Number(user.id) });
        setModelCount(Array.isArray(models) ? models.length : 0);
      } catch (error: unknown) {
        const axiosError = error as { response?: { status: number; data: unknown } };
        if (axiosError?.response) {
          console.error('Error fetching model count:', axiosError.response.status, axiosError.response.data);
        } else {
          console.error('Error fetching model count:', error);
        }
        setModelCount(0);
      }
    };

    fetchProfile();
    fetchModelCount();
  }, [user]);

  const handleChange = <T extends keyof Profile>(field: T, value: Profile[T]) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSoftware = (option: string) => {
    setProfileData((prev) => {
      const current = prev.software as string[];
      const updated = current.includes(option)
        ? current.filter((s) => s !== option)
        : [...current, option];
      return { ...prev, software: updated };
    });
  };

  const prepareProfilePayload = (profileData: Profile) => ({
    name: profileData.name,
    about: profileData.about,
    experience: profileData.experience,
    contact: profileData.contact,
    skills: profileData.skills,
    software: Array.isArray(profileData.software)
      ? profileData.software
      : typeof profileData.software === 'string'
      ? profileData.software.split(',').map((s) => s.trim())
      : [],
    profile_photo_url: profileData.profile_photo_url,
    socialLinks:
      profileData.socialLinks && typeof profileData.socialLinks === 'object' && !Array.isArray(profileData.socialLinks)
        ? profileData.socialLinks
        : {},
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Validate file type
      const validFormats = ["image/jpeg", "image/png", "image/gif"];
      if (!validFormats.includes(file.type)) {
        toast.error('Invalid image format. Please use JPEG, PNG or GIF');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    }
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      
      // Add all profile fields
      formData.append('name', profileData.name || '');
      formData.append('about', profileData.about || '');
      formData.append('experience', profileData.experience || '');
      formData.append('contact', profileData.contact || '');
      formData.append('skills', profileData.skills || '');
      
      // Handle arrays
      if (Array.isArray(profileData.software)) {
        profileData.software.forEach((item) => {
          formData.append('software[]', item);
        });
      }
      
      if (profileData.socialLinks && typeof profileData.socialLinks === 'object') {
        Object.entries(profileData.socialLinks).forEach(([key, value]) => {
          if (value) {
            formData.append(`socialLinks[${key}]`, value);
          }
        });
      }

      // Handle profile photo
      if (selectedFile) {
        console.log('Appending profile photo to FormData:', {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size
        });
        formData.append('profile_photo', selectedFile);
      }

      const updatedProfile = await api.updateProfile(formData);
      
      // Update context and state
      setAuth((prev) => ({
        ...(prev ?? { user: null, models: [] }),
        profile: prepareProfilePayload(updatedProfile),
      }));

      setProfileData(prepareProfilePayload(updatedProfile));
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsEditing(false);
      toast.success('Profile updated successfully');
      router.refresh();
    } catch (error: unknown) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setIsEditing(false);
    setSelectedFile(null);
    setPreviewUrl(null);

    if (user) {
      api.getProfile().then((data) => {
        if (data === null) {
          setProfileData(defaultProfile);
          return;
        }

        let softwareArray: string[] = [];
        if (Array.isArray(data.software)) {
          softwareArray = data.software;
        } else if (typeof data.software === 'string') {
          softwareArray = data.software.split(',').map((s) => s.trim());
        }

        const socialLinks =
          data.socialLinks && typeof data.socialLinks === 'object'
            ? { ...defaultProfile.socialLinks, ...data.socialLinks }
            : defaultProfile.socialLinks;

        setProfileData({
          ...defaultProfile,
          ...data,
          software: softwareArray,
          socialLinks,
        });
      });
    }
  };

  const getProfilePhotoUrl = (profile: Profile) => {
    if (profile.profile_photo_url && !profile.profile_photo_url.includes('ui-avatars.com')) {
      return profile.profile_photo_url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random`;
  };

  if (loading) return <p>Loading profile...</p>;

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
                  src={previewUrl || getProfilePhotoUrl(profileData)}
                  alt="Creator Avatar"
                  width={150}
                  height={150}
                  className={styles.profilePic}
                  unoptimized={!!previewUrl}
                />
                {isOwner && isEditing && (
                  <div className={styles.photoUpload}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      className={styles.fileInput}
                    />
                    <p className={styles.fileHint}>
                      JPG, PNG or GIF (max. 5MB)
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.profileInfo}>
                <div className={styles.name}>
                  {isOwner && isEditing ? (
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Name"
                      value={profileData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                    />
                  ) : (
                    <p>{profileData.name || 'Name'}</p>
                  )}
                </div>

                <div className={styles.email}>
                  {isOwner && isEditing ? (
                    <input
                      className={styles.input}
                      type="email"
                      placeholder="Email"
                      value={profileData.contact}
                      onChange={(e) => handleChange('contact', e.target.value)}
                    />
                  ) : (
                    <p>{profileData.contact || 'Email'}</p>
                  )}
                </div>

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
                                    ? `https://www.${String(platform).toLowerCase()}.com/yourprofile`
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
                           alt={String(platform)}
                           width={24}
                            height={24}
                            />
                          </a>
                        ))}
                    </div>
                  )}
                </div>

                <Link href="/creator/store" className={styles.storeLink}>
                 View Store ({modelCount} {modelCount === 1 ? 'item' : 'items'})
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
                      Cancel Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

       {[
 { label: 'Experience', field: 'experience', multiline: true, type: 'text' },
  { label: 'Skills', field: 'skills', type: 'text' },
].map(({ label, field, multiline, type }) => {
  const value = (profileData[field as keyof typeof defaultProfile] || '') as string;

  return (
    <section className={styles.section} key={field}>
      <h3 className={styles.sectionTitle}>{label}</h3>
      {isOwner && isEditing ? (
        multiline ? (
          <textarea
            className={styles.textarea}
            value={value}
            onChange={(e) => handleChange(field as keyof typeof defaultProfile, e.target.value)}
          />
        ) : (
          <input
            className={styles.input}
            type={type || 'text'}
            value={value}
            onChange={(e) => handleChange(field as keyof typeof defaultProfile, e.target.value)}
          />
        )
      ) : field === 'skills' ? (
        <div className={styles.tagsContainer}>
          {value
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean)
            .map((skill) => (
              <div key={skill} className={styles.skillTag}>
                {skill}
              </div>
            ))}
        </div>
      ) : (
        <p>{value}</p>
      )}
    </section>
  );
})}

<section className={styles.section}>
  <h3 className={styles.sectionTitle}>Software</h3>
  {isOwner && isEditing ? (
    <div className={styles.softwareCheckboxes}>
      {SOFTWARE_OPTIONS.map((software) => (
        <label key={software} className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={(profileData.software as string[]).includes(software)}
            onChange={() => toggleSoftware(software)}
          />
          {software}
        </label>
      ))}
    </div>
  ) : (
    <div className={styles.tagsContainer}>
      {(profileData.software as string[])
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
  )}
</section>
      </div>
    </div>
  );
}