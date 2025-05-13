'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ModelForm } from '@/types';
import styles from './ModelStyles.module.css';
import dynamic from 'next/dynamic';

const ModelPreview = dynamic(() => import('@/components/ModelPreview'), { ssr: false })

export default function ModelDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const modelId = Number(params?.modelId);

  const currentUser = { id: 'demo-user', role: 'creator' }; // instead of useAuth
  const [model, setModel] = useState<ModelForm | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`models-${currentUser.id}`);
    if (stored) {
      const parsed: ModelForm[] = JSON.parse(stored);
      const found = parsed.find(m => m.id === modelId);
      if (found) {
        setModel(found);
      }
    }
  }, [modelId]);

  if (!model) return <div className={styles.container}>Model not found.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* left column */}
        <div className={styles.leftColumn}>
          <div className={styles.modelPreview}>
          {model.modelURL && (
  <div className={styles.modelPreview}>
    <ModelPreview url={model.modelURL} />
  </div>
)}
          </div>

          {/* Category  and price */}
          <div className={styles.row}>
            <div className={styles.field}>
              <span className={styles.label}>Category</span>
              <div>{model.category}</div>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Price (€)</span>
              <div>{model.price}</div>
            </div>
          </div>

          {/* Buttons */}
          <div className={styles.row}>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.buttonBackToStore}
                onClick={() => router.push('/creator/store')}
              >
                Back to Store
              </button>
              <button
                type="button"
                className={styles.buttonEditModel}
                onClick={() => {
                  localStorage.setItem('editingModelId', modelId.toString());
                  router.push(`/creator/store/${modelId}`);
                }}
              >
                Edit Model
              </button>
            </div>
          </div>

          {/* Features */}
          <div className={styles.gridFields}>
            <div className={styles.field}>
              <span className={styles.label}>Uploaded Formats</span>
              <div className={styles.formats}>
                {model.formats.map(f => <span key={f}>{f}</span>)}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Technical Features</span>
              <div className={styles.formats}>
                {Object.entries(model.features)
                  .filter(([, value]) => value)
                  .map(([key]) => (
                    <span key={key}>{key.replace(/([A-Z])/g, ' $1')}</span>
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
                {model.tools.map(tool => <span key={tool}>{tool}</span>)}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>License</span>
              <div>{model.license}</div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Release Date</span>
              <div>{model.releaseDate}</div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className={styles.titleColumn}>
          <div className={styles.field}>
            <span className={styles.label}>Model Title</span>
            <div>{model.title}</div>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Description</span>
            <p>{model.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}