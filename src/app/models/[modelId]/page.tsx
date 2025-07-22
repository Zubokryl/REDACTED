'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './ModelStyles.module.css';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { getModelById } from '@/lib/api';
import type { ModelForm } from '@/types';
import type { LicenseType } from '@/types';
import { licenseCoefficient } from '@/utils/licenseCoefficient';

const ModelPreview = dynamic(() => import('@/components/ModelDetailPreview'), { ssr: false });

export default function ModelDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const modelId = Number(params?.modelId);
  const { user } = useAuth();
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('personal');


  const [model, setModel] = useState<ModelForm | null>(null);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const handleBuyModel = () => {
  if (!model?.id) {
    console.error('Model ID is missing');
    return;
  }


  const price = typeof model.price === 'number'
    ? model.price
    : model.price
      ? parseFloat(model.price)
      : 0;

  let previewUrl: string | undefined = undefined;

  if (typeof model.preview_file === 'string' && model.preview_file) {
    previewUrl = (model.preview_file as string).startsWith('http')
      ? model.preview_file
      : `http://localhost:8000/storage/previews/${model.preview_file}`;
  } else if (model.preview_file instanceof File) {
    previewUrl = URL.createObjectURL(model.preview_file);
  }

addToCart({
  model_id: model.id,
  title: model.title,
  license_type: selectedLicense,
  base_price: price,
  price: price * licenseCoefficient(selectedLicense),
  preview_image_url: previewUrl ?? '', 
});

  router.push('/cart');
};

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!modelId) return;

    setLoading(true);
    setError(null);

    getModelById(modelId)
      .then(data => setModel(data))
      .catch(() => setError('Model not found or error loading'))
      .finally(() => setLoading(false));
  }, [modelId, user, router]);

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>{error}</div>;
  if (!model) return <div className={styles.container}>Model not found.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Left column */}
        <div className={styles.leftColumn}>
          <div className={styles.modelPreview}>
            {model.model_file && (
              <ModelPreview 
                url={typeof model.model_file === 'string' 
                  ? model.model_file.startsWith('http') 
                    ? model.model_file 
                    : `http://localhost:8000/storage/${model.model_file}`
                  : URL.createObjectURL(model.model_file)} 
              />
            )}
          </div>

          {/* Category and Price */}
          <div className={styles.row}>
            <div className={styles.field}>
              <span className={styles.label}>Category</span>
              <div>{model.category ?? '-'}</div>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Price (€)</span>
              <div>
                {model.price !== undefined 
                  ? typeof model.price === 'number' 
                    ? model.price.toFixed(2)
                    : parseFloat(model.price).toFixed(2)
                  : '-'}
              </div>
            </div>
          </div>


          {/* Other fields */}
          <div className={styles.gridFields}>
            <div className={styles.field}>
              <span className={styles.label}>Uploaded Formats</span>
              <div className={styles.formats}>
                {(model.formats || []).map(f => <span key={f}>{f}</span>)}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Technical Features</span>
              <div className={styles.formats}>
                {model.features &&
                  Object.entries(model.features)
                    .filter(([, value]) => value)
                    .map(([key]) => (
                      <span key={key}>
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .trim()}
                      </span>
                    ))}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Vertices</span>
              <div>{model.vertices}</div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>3D Printable</span>
              <div>{model.printable ? 'Yes' : 'No'}</div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Tools</span>
              <div className={styles.formats}>
                {(model.tools || []).map(tool => <span key={tool}>{tool}</span>)}
              </div>
            </div>

           <div className={styles.field}>
  <span className={styles.label}>License</span>
  <div>{model.available_licenses?.[0] ?? '-'}</div>
</div>

            <div className={styles.field}>
              <span className={styles.label}>Release Date</span>
              <div>{model.release_date ? new Date(model.release_date).toLocaleDateString() : '-'}</div>
            </div>
          </div>
        </div>

    {/* Right column */}
<div className={styles.titleColumn}>
  <div className={styles.field}>
    <span className={styles.label}>
      Model Title
    </span>
    <div>{model.title}</div>
  </div>
  <div className={styles.field}>
    <span className={styles.label}>
      Description
    </span>
    <p>{model.description ?? '-'}</p>
  </div>

  {model.available_licenses && (
  <div className={styles.field}>
    <span className={styles.label}>Choose License</span>
    <select
      value={selectedLicense}
      onChange={(e) => setSelectedLicense(e.target.value as LicenseType)}
      className={styles.select}
    >
      {model.available_licenses.map((license) => (
        <option key={license} value={license}>
          {license === 'personal' ? 'Standard License' :
           license === 'commercial' ? 'Editorial Use' :
           license === 'enterprise' ? 'Commercial Use' :
           license}
        </option>
      ))}
    </select>
  </div>
)}

  {/* Mock "Buy Model" button */}
  <div className={styles.field}>
      <button
        onClick={handleBuyModel}
        className={styles.buyBtn}>
        Buy Model
      </button>
         </div>
      </div>
    </div>
  </div>

)
};