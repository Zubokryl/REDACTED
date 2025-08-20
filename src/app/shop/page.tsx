'use client';

import React, { useState, useEffect } from 'react';
import { makeRequest } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import type { LicenseType, ModelForm } from '@/types';
import styles from './ShopStyles.module.css';

interface ShopModel extends ModelForm {
  creator: {
    id: number;
    name: string;
    profile_photo_url: string;
  };
  preview_image_url: string;
  model?: {
    available_licenses: LicenseType[];
  };
}


type ShopModelApiResponseItem = {
  id: number;
  creator: {
    id: number;
    name: string;
    profile_photo_url: string;
  };
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  model_file: string;
  preview_file: string;
  preview_image_url: string;
  model?: {
    available_licenses: LicenseType[];
  };
};

interface PaginatedResponse {
  data: ShopModelApiResponseItem[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
 
 const [models, setModels] = useState<ShopModel[]>([]);

  const [categoryFilter, setCategoryFilter] = useState('');
const [minPrice, setMinPrice] = useState('');
const [maxPrice, setMaxPrice] = useState('');
const [creatorName, setCreatorName] = useState('');

  // 🔍 Filter states
  const [inputCategory, setInputCategory] = useState('');
const [inputMinPrice, setInputMinPrice] = useState('');
const [inputMaxPrice, setInputMaxPrice] = useState('');
const [inputCreatorName, setInputCreatorName] = useState('');

const fetchModels = React.useCallback(async (page = 1) => {
  try {
    setLoading(true);
    const response = await makeRequest<PaginatedResponse>('get', '/shop/models', undefined, {
      params: {
        page: page,
        category: categoryFilter || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        creator: creatorName || undefined,
      },
    });

    const modelsData: ShopModel[] = response.data.map((item: ShopModelApiResponseItem) => {
      const rest = item;
      return {
        ...rest,
        vertices: (item as ShopModelApiResponseItem & { vertices?: number }).vertices ?? 0,
        printable: (item as ShopModelApiResponseItem & { printable?: boolean }).printable ?? false,
        customizable: (item as ShopModelApiResponseItem & { customizable?: boolean }).customizable ?? false,
        model: item.model
          ? { available_licenses: item.model.available_licenses }
          : { available_licenses: [] }
      };
    });

  
    setModels(modelsData);
    setTotalPages(response.last_page);
    setCurrentPage(page);
  } catch {
    setError('Failed to load models');
  } finally {
    setLoading(false);
  }
}, [categoryFilter, minPrice, maxPrice, creatorName]);

useEffect(() => {
  fetchModels(currentPage);
}, [currentPage, fetchModels]);

const handleFilterSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setCategoryFilter(inputCategory);
  setMinPrice(inputMinPrice);
  setMaxPrice(inputMaxPrice);
  setCreatorName(inputCreatorName);
  setCurrentPage(1); 
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
    value={inputCategory}
    onChange={(e) => setInputCategory(e.target.value)}
    className={styles.filterInput}
  />
  <input
    type="number"
    placeholder="Min Price"
    value={inputMinPrice}
    onChange={(e) => setInputMinPrice(e.target.value)}
    className={styles.filterInput}
  />
  <input
    type="number"
    placeholder="Max Price"
    value={inputMaxPrice}
    onChange={(e) => setInputMaxPrice(e.target.value)}
    className={styles.filterInput}
  />
  <input
    type="text"
    placeholder="Creator name"
    value={inputCreatorName}
    onChange={(e) => setInputCreatorName(e.target.value)}
    className={styles.filterInput}
  />
  <button type="submit" className={styles.filterButton}>Apply</button>
</form>

    {/* Model Cards */}
    <div className={styles.modelsGrid}>
      {models.map((model) => (
        <div key={model.id} className={styles.modelCard}>
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
            <Link href={`/models/${model.id}`} className={styles.modelTitleButtonLink}>
              <button className={styles.modelTitleButton}>
                {model.title}
              </button>
            </Link>

            <p className={styles.modelDescription}>{model.description}</p>

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

            <span className={styles.price}>€ {model.price}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Pagination */}
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
  </div>
);
};

export default ShopPage;