'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import styles from './Upload.module.css';
import { useAuth } from '@/context/AuthContext';
import { ModelForm } from '@/types';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ModelPreview = dynamic(() => import('@/components/ModelPreview'), { ssr: false });

const defaultFeatures = {
  rigged: false,
  animated: false,
  uvMapped: false,
  pbr: false,
};

const initialForm: ModelForm = {
  id: 0,
  creatorId: '',
  title: '',
  description: '',
  category: '',
  formats: [],
  features: defaultFeatures,
  releaseDate: new Date().toISOString().split('T')[0],
  vertices: 0,
  tools: [],
  printable: false,
  price: 0,
  license: '',
  model: '',
  modelURL: '',
};

const formatList = ['.fbx', '.obj', '.glb'];

export default function UploadModelPage() {
  const { user } = useAuth();
  const fallbackUser = { id: 'demo-user', role: 'creator' };
  const currentUser = user || fallbackUser;
  const isCreator = currentUser.role === 'creator';
  const router = useRouter();

  const [form, setForm] = useState<ModelForm>({ ...initialForm, creatorId: currentUser.id });
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const temp = localStorage.getItem('modelForm-temp');
    const saved = localStorage.getItem(`modelForm-${currentUser.id}`);

    if (temp && !saved) {
      localStorage.setItem(`modelForm-${currentUser.id}`, temp);
      localStorage.removeItem('modelForm-temp');
    }

    const parsed = JSON.parse(saved || '{}');
    setForm((prev) => ({ ...prev, ...parsed, creatorId: currentUser.id }));
  }, [currentUser.id]);

  useEffect(() => {
    const key = currentUser.id ? `modelForm-${currentUser.id}` : 'modelForm-temp';
    localStorage.setItem(key, JSON.stringify(form));
  }, [form, currentUser.id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const files = (e.target as HTMLInputElement).files;

    if (formatList.includes(name)) {
      setForm((prev) => {
        const updatedFormats = checked
          ? [...prev.formats, name]
          : prev.formats.filter((f) => f !== name);
        return { ...prev, formats: updatedFormats };
      });
      return;
    }

    if (name in form.features) {
      setForm((prev) => ({
        ...prev,
        features: { ...prev.features, [name]: checked },
      }));
      return;
    }

    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file' && files) {
      const file = files[0];
      const allowedTypes = ['model/fbx', 'model/obj', 'model/gltf+json', 'application/octet-stream'];
      const maxSize = 100 * 1024 * 1024;

      const validExtensions = ['.fbx', '.obj', '.glb'];
      const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(fileExt)) {
        alert('Invalid file type. Only .fbx, .obj, and .glb are allowed.');
        return;
      }

      if (file.size > maxSize) {
        alert('File size exceeds 100MB.');
        return;
      }

      setModelFile(file);
      setForm((prev) => ({ ...prev, model: file.name, modelURL: URL.createObjectURL(file) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const creatorId = currentUser.id || fallbackUser.id;

    const modelWithMeta = {
      ...form,
      id: Date.now(),
      creatorId,
    };

    try {
      await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelWithMeta),
      });

      const formData = new FormData();
      if (modelFile) formData.append('model', modelFile);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('creatorId', creatorId);

      await fetch('/upload', {
        method: 'POST',
        body: formData,
      });

      const savedModels = JSON.parse(localStorage.getItem(`models-${creatorId}`) || '[]');
      savedModels.push(modelWithMeta);
      localStorage.setItem(`models-${creatorId}`, JSON.stringify(savedModels));
      setSubmitted(true);
      router.push('/creator/store');

    } catch (err) {
      console.error('Error saving model:', err);
    }
  };

  return (
    <div className={styles.container}>
      {!submitted && isCreator && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <span className={styles.label}>Model Title</span>
            <input
              className={styles.input}
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Futuristic Spaceship"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Description</span>
            <textarea
              className={styles.textarea}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What does your model represent?"
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Category</span>
            <select className={styles.select} name="category" value={form.category} onChange={handleChange}>
              <option value="">Choose a category</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Architecture">Architecture</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Animal">Animal</option>
              <option value="Furniture">Furniture</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Uploaded Formats</span>
            <div className={styles.formats}>
              {formatList.map((format) => (
                <label key={format} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name={format}
                    checked={form.formats.includes(format)}
                    onChange={handleChange}
                  />
                  {format}
                </label>
              ))}
            </div>
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.label}>Technical Features</legend>
            {Object.entries(form.features).map(([key, value]) => (
              <label key={key} className={styles.checkboxLabel}>
                <input type="checkbox" name={key} checked={value} onChange={handleChange} />
                {key.replace(/([A-Z])/g, ' $1')}
              </label>
            ))}
          </fieldset>

          <div className={styles.gridFields}>
            <div className={styles.field}>
              <span className={styles.label}>Vertices</span>
              <input
                className={styles.input}
                type="number"
                name="vertices"
                value={form.vertices}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>3D Printable</span>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="printable"
                  checked={form.printable}
                  onChange={handleChange}
                />
                Suitable for 3D printing
              </label>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Price (€)</span>
              <input
                className={styles.input}
                type="number"
                step="0"
                name="price"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <span className={styles.label}>License</span>
              <select className={styles.select} name="license" value={form.license} onChange={handleChange}>
                <option value="Standard License">Standard License</option>
                <option value="Editorial Use">Editorial Use</option>
                <option value="Commercial Use">Commercial Use</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Upload 3D Model</span>
            <input
              type="file"
              className={styles.input}
              accept=".fbx, .obj, .glb"
              name="model"
              onChange={handleChange}
            />
          </div>
          {form.modelURL && (
  <div className={styles.previewBlock}>
    <h3 className={styles.label}>Preview</h3>
    <ModelPreview url={form.modelURL} />
  </div>
)}

          <div className={styles.buttonRow}>
  <button className={styles.button} type="submit">Save</button>
  <button
    type="button"
    className={styles.button}
    onClick={() => router.push('/creator/store')}
  >
    Back to Store
  </button>
</div>
        </form>
      )}

      {submitted && (
        <div className={styles.successMessage}>
          <p>Model uploaded successfully!</p>
          <button
            className={styles.button}
            onClick={() => {
                router.push('/creator/store'); 
              }}
          >
            View All Models
          </button>
        </div>
      )}
    </div>
  );
}