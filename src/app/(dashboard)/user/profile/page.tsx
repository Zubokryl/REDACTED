'use client';

import styles from './UserProfile.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface LocalUserProfile {
  name: string;
  about: string;
  contact: string;
  profile_photo_url: string;
  socialLinks: {
    Artstation?: string;
    Facebook?: string;
    GitHub?: string;
    Instagram?: string;
    LinkedIn?: string;
    Twitter?: string;
    YouTube?: string;
    [key: string]: string | undefined;
  };
}

const defaultProfile: LocalUserProfile = {
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

function ProfileTabs({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  return (
    <div className={styles.profileButtons}>
      <button
        className={`${styles.profileButton} ${activeTab === 'profile' ? styles.activeButton : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        Profile
      </button>
      <button
        className={`${styles.profileButton} ${activeTab === 'purchases' ? styles.activeButton : ''}`}
        onClick={() => setActiveTab('purchases')}
      >
        <span className={styles.tabIcon}>🛒</span>
        My Purchases
      </button>
    </div>
  );
}

export default function UserProfilePage() {
  const { user, userProfile, setAuth } = useAuth();
  const isOwner = user?.role === 'user';
  const [profileData, setProfileData] = useState<LocalUserProfile>(userProfile ?? defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();

  useEffect(() => {
    if (userProfile) {
      setProfileData(userProfile);
    }
    
    // Очистка при размонтировании
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [userProfile, previewUrl]);

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

  const handleChange = <T extends keyof LocalUserProfile>(field: T, value: LocalUserProfile[T]) => {
    setProfileData((prev: LocalUserProfile) => ({ ...prev, [field]: value }));
  };

  const prepareProfilePayload = (profileData: LocalUserProfile) => ({
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
        size: file.size,
      });

      // Validate file type
      const validFormats = ['image/jpeg', 'image/png', 'image/gif'];
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
          size: selectedFile.size,
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

  const getProfilePhotoUrl = (profile: LocalUserProfile) => {
    if (profile.profile_photo_url && !profile.profile_photo_url.includes('ui-avatars.com')) {
      return profile.profile_photo_url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random`;
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'profile' && (
          <>
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
                          className={styles.fileInput}
                        />
                        <p className={styles.fileHint}>JPG, PNG or GIF (max. 5MB)</p>
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
          </>
        )}

        {activeTab === 'purchases' && <MyPurchases />}
      </div>
    </div>
  );
}

// Component for displaying user purchases
function MyPurchases() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getUserOrders()
      .then(response => {
        console.log('Orders API response:', response);
        // Check if response is paginated
        if (response && response.data) {
          setOrders(response.data);
        } else if (Array.isArray(response)) {
          setOrders(response);
        } else {
          console.error('Unexpected orders response format:', response);
          setError('Unexpected response format');
          setOrders([]);
        }
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading purchases...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!orders || orders.length === 0) return <div>No purchases yet.</div>;

  // Process orders to remove duplicates (same model with same license)
  const uniquePurchases = new Map();
  
  // First, collect all items from all orders
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        // Create a unique key for each model+license combination
        const key = `${item.model_id}-${item.license_type}`;
        
        // Only keep the most recent purchase of each model+license
        if (!uniquePurchases.has(key) || 
            new Date(order.created_at) > new Date(uniquePurchases.get(key).order.created_at)) {
          uniquePurchases.set(key, { item, order });
        }
      });
    } else if (order.model_id) {
      // Handle old format orders
      const key = `${order.model_id}-${order.license_type}`;
      if (!uniquePurchases.has(key) || 
          new Date(order.created_at) > new Date(uniquePurchases.get(key).order.created_at)) {
        uniquePurchases.set(key, { item: order, order });
      }
    }
  });

  return (
    <div className={styles.purchasesSection}>
      <h2 className={styles.sectionTitle}>My Purchases</h2>
      <div className={styles.ordersList}>
        {Array.from(uniquePurchases.values()).map(({ item, order }) => (
          <div key={`${order.id}-${item.id || item.model_id}`} className={styles.orderItem}>
            <img
              src={item.model?.preview_image_url || '/placeholder.png'}
              alt={item.model?.title || 'Model'}
              className={styles.modelPreview}
              width={80}
              height={80}
            />
            <div className={styles.orderInfo}>
              <div className={styles.modelTitle}><b>{item.model?.title || 'Model'}</b></div>
              <div>License: {item.license_type}</div>
              <div>Price: €{Number(item.price).toFixed(2)}</div>
              <div>Date: {new Date(order.created_at).toLocaleDateString()}</div>
              <div>Status: {order.status === 'completed' ? 'Completed' : order.status}</div>
              <button
                className={styles.downloadBtn}
                disabled={item.download_count >= 5 && item.license_type === 'personal'}
                onClick={async () => {
                  try {
                    const blob = await api.downloadOrder(order.id, item.model_id);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    // Get file extension from model file name or use a default
                    const fileExtension = item.model?.model_file ? 
                      item.model.model_file.split('.').pop() || 'glb' : 
                      'glb';
                    a.download = `${item.model?.title || 'model'}.${fileExtension}`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    toast.success('Download started!');
                  } catch (error) {
                    console.error('Download error:', error);
                    toast.error('Failed to download model');
                  }
                }}
              >
                Download
              </button>
              {item.download_count >= 5 && item.license_type === 'personal' && (
                <span className={styles.downloadLimit}>Download limit reached</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}