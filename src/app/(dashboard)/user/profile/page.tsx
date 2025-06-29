'use client';

import styles from './UserProfile.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const defaultProfile: UserProfile = {
  name: '',
  about: '',
  contact: '',
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



export default function UserProfilePage() {
  const { user, userProfile, setAuth } = useAuth();
  const isOwner = user?.role === 'user';
  const [profileData, setProfileData] = useState(userProfile ?? defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

 useEffect(() => {
  if (userProfile) {
    setProfileData(userProfile);
  }
}, [userProfile]);

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


    fetchProfile();
   
  }, [user]);

  const handleChange = <T extends keyof UserProfile>(field: T, value: UserProfile[T]) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };


const prepareProfilePayload = (profileData: UserProfile) => ({

  name: profileData.name,
  about: profileData.about,
  contact: profileData.contact,
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

    formData.append('name', profileData.name || '');
    formData.append('about', profileData.about || '');
    formData.append('contact', profileData.contact || '');
  
  
    if (profileData.socialLinks && typeof profileData.socialLinks === 'object') {
      Object.entries(profileData.socialLinks).forEach(([key, value]) => {
        if (value) formData.append(`socialLinks[${key}]`, value);
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
  ...prev!,
  userProfile: prepareProfilePayload(updatedProfile),
  profile: prev?.profile ?? null,
}));

     setProfileData(prepareProfilePayload(updatedProfile));
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
    toast.success('Profile updated successfully');
    router.refresh();

  } catch (error) {
    console.error('Error saving profile!', error);
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


        const socialLinks =
          data.socialLinks && typeof data.socialLinks === 'object'
            ? { ...defaultProfile.socialLinks, ...data.socialLinks }
            : defaultProfile.socialLinks;

        setProfileData({
          ...defaultProfile,
          ...data,
          
          socialLinks,
        });
      });
    }
  };

  const getProfilePhotoUrl = (profile: UserProfile) => {
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
                  alt="User Avatar"
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
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100"
                    />
                    <p className="mt-1 text-sm text-gray-500">
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

      </div>
    </div>
  );
}