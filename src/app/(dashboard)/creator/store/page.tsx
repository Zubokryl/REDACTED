'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CreatorStore.module.css';
import { ModelForm } from '@/types';

export default function CreatorStorePage() {
  const router = useRouter();
  const [models, setModels] = useState<ModelForm[]>([]);
  const currentUser = { id: 'demo-user', role: 'creator' }; // заменяем useAuth

  useEffect(() => {
    const loadModels = () => {
      const localModels = JSON.parse(localStorage.getItem(`models-${currentUser.id}`) || '[]');
      setModels(localModels);
    };

    loadModels();

    const handleStorage = () => loadModels();
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleCardClick = (modelId: number) => {
    router.push(`/creator/store/${modelId}`);
  };

  const handleUploadClick = () => {
    router.push('/creator/store/upload');
  };

  const handleDelete = (modelId: number) => {
    const updatedModels = models.filter((model) => model.id !== modelId);
    setModels(updatedModels);
    localStorage.setItem(`models-${currentUser.id}`, JSON.stringify(updatedModels));
  };

  return (
    <div className={styles.container}>
<div className={styles.header}>
  <h1 className={styles.title}>My 3D Models</h1>
  <div className={styles.uploadWrapper}>
    <button className={styles.uploadButton} onClick={handleUploadClick}>
      Download new model
    </button>
  </div>
</div>

      <div className={styles.contentWrapper}>
        <div className={styles.leftColumn}>
          <div className={styles.grid}>
            {models.length > 0 ? (
              models.map((model) => (
                <div key={model.id} className={styles.card}>
                <h3>{model.title || 'Untitled Model'}</h3>
                <p>{model.category}</p>
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
              ))
            ) : (
              <p>You have not yet modells.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}