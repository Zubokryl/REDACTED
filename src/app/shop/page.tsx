'use client';

import React, { useState, useEffect } from 'react';
import { makeRequest } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ShopStyles.module.css';

interface Model {
  id: number;
  title: string;
  description: string;
  price: number;
  images: string[];
  creator: {
    id: number;
    name: string;
    profile_photo_url: string;
  };
}

interface PaginatedResponse {
  data: Model[];
  current_page: number;
  last_page: number;
  total: number;
}

const ShopPage = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchModels();
  }, [currentPage]);

  const fetchModels = async () => {
    try {
      const response = await makeRequest<PaginatedResponse>('get', '/shop/models', undefined, {
        params: { page: currentPage }
      });
      setModels(response.data);
      setTotalPages(response.last_page);
      setLoading(false);
    } catch {
      setError('Failed to load models');
      setLoading(false);
    }
  };

  const handleModelSelect = (modelId: number) => {
    setSelectedModels(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      
      <div className={styles.modelsGrid}>
        {models.map((model) => (
          <div key={model.id} className={styles.modelCard}>
            <input
              type="checkbox"
              checked={selectedModels.includes(model.id)}
              onChange={() => handleModelSelect(model.id)}
              className={styles.checkbox}
            />
            
            <Link href={`/shop/${model.id}`} className={styles.modelLink}>
              <div className={styles.modelPreview}>
                <Image 
                  src={model.images?.[0] || '/placeholder.png'} 
                  alt={model.title}
                  width={300}
                  height={200}
                  className={styles.previewImage}
                />
              </div>
            </Link>
            
            <div className={styles.modelInfo}>
              <Link href={`/shop/${model.id}`} className={styles.modelTitle}>
                <h2>{model.title}</h2>
              </Link>
              
              <p className={styles.modelDescription}>
                {model.description}
              </p>
              
              <Link href={`/creator/${model.creator.id}`} className={styles.creatorInfo}>
                <Image 
                  src={model.creator.profile_photo_url || '/default-avatar.png'} 
                  alt={model.creator.name}
                  width={32}
                  height={32}
                  className={styles.creatorAvatar}
                />
                <span className={styles.creatorName}>
                  {model.creator.name}
                </span>
              </Link>
              
              <span className={styles.price}>
                ${model.price}
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}

      {selectedModels.length > 0 && (
        <div className={styles.purchaseBar}>
          <span className={styles.selectedCount}>
            {selectedModels.length} model(s) selected
          </span>
          <button
            onClick={() => {/* TODO: Implement purchase logic */}}
            className={styles.purchaseButton}
          >
            Purchase Selected
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopPage;