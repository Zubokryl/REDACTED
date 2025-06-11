'use client';

import { useRouter } from 'next/navigation';
import styles from './CreatorStore.module.css';
import { api } from '@/lib/api';
import { useCreatorModels } from '@/hooks/useCreatorModels';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function CreatorStorePage() {
  const router = useRouter();
  const { loading, models, setModels } = useCreatorModels();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleCardClick = (modelId?: number) => {
    if (modelId !== undefined) {
      router.push(`/creator/store/${modelId}`);
    }
  };

  const handleUploadClick = () => {
    router.push('/creator/store/upload');
  };

  const handleDelete = async (modelId?: number) => {
    if (!modelId) return;

    try {
      await api.deleteModel(modelId);
      setModels(prevModels => prevModels.filter(model => model.id !== modelId));
    } catch (error) {
      console.error('Failed to delete model:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My 3D Models</h1>
        <div className={styles.uploadWrapper}>
          <button className={styles.uploadButton} onClick={handleUploadClick}>
            Upload New Model
          </button>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          {loading ? (
            <p>Loading...</p>
          ) : models && models.length > 0 ? (
            <div className={styles.grid}>
              {models.map((model) => (
                <div key={model.id} className={styles.card}>
                  <h3>{model.title || 'Untitled Model'}</h3>
                  <p>{model.category || 'No category'}</p>
                  <div className={styles.buttonRow}>
                    <button
                      className={styles.detailsButton}
                      onClick={() => handleCardClick(model.id)}
                    >
                      Model Details
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(model.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You have not uploaded any models yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}