'use client';

import React, { useState, useEffect } from 'react';
import { makeRequest, createOrder } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import type { ModelForm } from '@/types';
import { getModelById } from '@/lib/api';
import styles from './ShopStyles.module.css';

interface Model {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  model_file: string;
  preview_file?: string;
  preview_image_url: string;
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

  const backendUrl = 'http://localhost:8000';

function getPreviewUrl(previewFile?: string): string {
  if (!previewFile) {
    return '/placeholder.png';
  }
  if (previewFile.startsWith('http://') || previewFile.startsWith('https://')) {
    return previewFile;
  }
  return `${backendUrl}/storage/previews/${previewFile}`;
}

const ShopPage = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [licenseType, setLicenseType] = useState<'personal' | 'commercial' | 'enterprise'>('personal');
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  

  // 🔍 Filter states
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [creatorName, setCreatorName] = useState('');

  useEffect(() => {
    fetchModels();
  }, [currentPage]);


  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await makeRequest<PaginatedResponse>('get', '/shop/models', undefined, {
        params: {
          page: currentPage,
          category: categoryFilter || undefined,
          min_price: minPrice || undefined,
          max_price: maxPrice || undefined,
          creator: creatorName || undefined
        }
      });
      setModels(response.data);
      console.log('Fetched models:', response.data);
      setTotalPages(response.last_page);
      setLoading(false);
    } catch {
      setError('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchModels();
  };

  const handleModelSelect = (modelId: number) => {
    setSelectedModels(prev => 
      prev.includes(modelId) ? prev.filter(id => id !== modelId) : [...prev, modelId]
    );
  };

  const handlePurchaseSelected = async () => {
  setIsPurchasing(true);
  setPurchaseMessage(null);

  try {
    const results = await Promise.all(
      selectedModels.map((modelId) =>
        createOrder({ model_id: modelId, license_type: licenseType })
          .then((res) => ({ success: true, modelId, message: res.message }))
          .catch((err) => ({ success: false, modelId, message: err?.response?.data?.message || 'Error occurred' }))
      )
    );

    const successCount = results.filter(r => r.success).length;
    const failMessages = results.filter(r => !r.success).map(r => `Model ${r.modelId}: ${r.message}`);

    if (successCount > 0) {
      setPurchaseMessage(`${successCount} model(s) successfully purchased.`);
    }

    if (failMessages.length > 0) {
      setPurchaseMessage((prev) => (prev ? prev + '\n' : '') + failMessages.join('\n'));
    }

    // Сброс выделения
    setSelectedModels([]);
  } catch (err) {
    setPurchaseMessage('An unexpected error occurred during purchase.');
  } finally {
    setIsPurchasing(false);
  }
};

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      
      {/* Filters */}
      <form onSubmit={handleFilterSubmit} className={styles.filters}>
        <input
          type="text"
          placeholder="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={styles.filterInput}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className={styles.filterInput}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className={styles.filterInput}
        />
        <input
          type="text"
          placeholder="Creator name"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          className={styles.filterInput}
        />
        <button type="submit" className={styles.filterButton}>Apply</button>
      </form>
      
      <div className={styles.modelsGrid}>
        {models.map((model) => (
          <div key={model.id} className={styles.modelCard}>
            <input
              type="checkbox"
              checked={selectedModels.includes(model.id)}
              onChange={() => handleModelSelect(model.id)}
              className={styles.checkbox}
            />
            
  <Link href={`/models/${model.id}`} className={styles.modelLink}>
      <div className={styles.modelPreview}>
        <Image 
          src={getPreviewUrl(model.preview_image_url)} 
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

            <div className={styles.field}>
                <span className={styles.label}>Category: </span>
                <span className={styles.categoryValue}>{model.category ?? '-'}</span>
  </div>
             
              <Link href={`/creator/${model.creator.id}`} className={styles.creatorInfo}>
                <Image 
                  src={model.creator.profile_photo_url || '/default-avatar.png'} 
                  alt={model.creator.name}
                  width={32}
                  height={32}
                  className={styles.creatorAvatar}
                />
                <span className={styles.creatorName}>{model.creator.name}</span>
              </Link>
              
              <span className={styles.price}>${model.price}</span>
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

      <div className={styles.licenseSelect}>
  <label>
    <select value={licenseType} onChange={(e) => setLicenseType(e.target.value as any)}>
      <option value="personal">Personal License</option>
      <option value="commercial">Commercial License</option>
      <option value="enterprise">Enterprise License</option>
    </select>
  </label>
</div>

      {selectedModels.length > 0 && (
        <div className={styles.purchaseBar}>
          <span className={styles.selectedCount}>
            {selectedModels.length} model(s) selected
          </span>
          <button
            onClick={handlePurchaseSelected}
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