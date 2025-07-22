'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import styles from './Upload.module.css';
import { useAuth } from '@/context/AuthContext';
import { ModelForm, ModelFeatures } from '@/types';  
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

const ModelPreview = dynamic(() => import('@/components/ModelDetailPreview'), { ssr: false });

const defaultFeatures: ModelFeatures = {
  lowPoly: false,
  pbr: false,
  textures: false,
  materials: false,
  uvMapping: false,
  uvUnwrapped: false,
  rigged: false,
  animated: false,
  uvMapped: false,   
};

const initialForm: ModelForm = {
  id: 0,
  creator_id: 0,         
  title: '',
  description: '',
  category: '',
  formats: [],
  features: defaultFeatures,
  release_date: new Date().toISOString().split('T')[0],  
  vertices: 0,
  tools: [],
  printable: false,
  price: 0,
  available_licenses: [],
  customizable: false,
  model_file: '',  
  preview_file: undefined
};

const toolOptions = [
  'Blender',
  'Maya',
  'ZBrush',
  'Substance 3D Painter',
  'Substance 3D Designer',
  'Photoshop',
  '3ds Max',
  'Marmoset Toolbag',
  'Unity',
  'Unreal Engine',
];

const formatList = ['.fbx', '.obj', '.glb', '.tbscene', '.png', '.jpg', '.jpeg']; 


export default function UploadModelPage() {
  const { user } = useAuth();
  const router = useRouter();

  const userId = Number(user?.id ?? 0);

  const [form, setForm] = useState<ModelForm>({ ...initialForm, creator_id: userId });
  const [modelPreviewURL, setModelPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [previewImageURL, setPreviewImageURL] = useState<string | null>(null);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  
  // Для текстур и .tbscene файлов
  const [textureFiles, setTextureFiles] = useState<File[]>([]);
  const [tbsceneFile, setTbsceneFile] = useState<File | null>(null);

  if (!user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const isCreator = user.role === 'creator';

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;
    const value = 'value' in e.target ? e.target.value : '';
    const checked = 'checked' in e.target ? e.target.checked : false;

    if (type === 'file' && name === 'preview_image') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const validImageExtensions = ['.png', '.jpg', '.jpeg'];
        const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

        if (!validImageExtensions.includes(fileExt)) {
          toast.error('Invalid preview image type. Only PNG/JPEG allowed.');
          return;
        }
        
        // Очистить предыдущий URL, если он существует
        if (previewImageURL) {
          URL.revokeObjectURL(previewImageURL);
        }
        
        setPreviewImageFile(file);
        setPreviewImageURL(URL.createObjectURL(file));
      }
      return;
    }
    
    // Обработка загрузки текстур
    if (type === 'file' && name === 'texture_files' && 'files' in e.target) {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const textureArray: File[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const validExtensions = ['.png', '.jpg', '.jpeg'];
          const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
          
          if (validExtensions.includes(fileExt)) {
            textureArray.push(file);
          } else {
            toast.error(`Invalid texture file type: ${file.name}. Only PNG/JPEG allowed.`);
          }
        }
        setTextureFiles(textureArray);
        if (textureArray.length > 0) {
          toast.success(`${textureArray.length} texture files selected`);
        }
      }
      return;
    }
    
    // Обработка загрузки .tbscene файла
    if (type === 'file' && name === 'tbscene_file' && 'files' in e.target) {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (fileExt === '.tbscene') {
          setTbsceneFile(file);
          toast.success('Marmoset Toolbag scene file selected');
        } else {
          toast.error('Invalid file type. Only .tbscene files are allowed.');
        }
      }
      return;
    }

    // Handle file input for 3D model
    if (type === 'file' && name === 'model_file' && 'files' in e.target) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const validExtensions = ['.fbx', '.obj', '.glb', '.tbscene'];
            const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
            const maxSize = 100 * 1024 * 1024;

            if (!validExtensions.includes(fileExt)) {
                toast.error('Invalid file type. Only .fbx, .obj, .glb, and .tbscene are allowed.');
                return;
            }

            if (file.size > maxSize) {
                toast.error('File size exceeds 100MB.');
                return;
            }
            
            // Очистить предыдущий URL, если он существует
            if (modelPreviewURL) {
                URL.revokeObjectURL(modelPreviewURL);
            }

            setForm((prev) => ({ ...prev, model_file: file }));

            const previewURL = URL.createObjectURL(file);
            console.log('Created model preview URL:', previewURL);
            setModelPreviewURL(previewURL);
        }
        return;
    }

    // Handle checkboxes for formats
    if (formatList.includes(name)) {
        setForm((prev) => ({
            ...prev,
            formats: checked
                ? [...(prev.formats ?? []), name]
                : (prev.formats ?? []).filter((f) => f !== name),
        }));
        return;
    }

    // Handle checkboxes for features
    if (name in (form.features ?? {})) {
        setForm((prev) => ({
            ...prev,
            features: {
                ...(prev.features || defaultFeatures),
                [name]: checked,
            },
        }));
        return;
    }

    // Handle checkboxes for tools
    if (name === 'tools') {
        const toolValue = value;
        setForm((prev) => ({
            ...prev,
            tools: checked
                ? [...(prev.tools ?? []), toolValue]
                : (prev.tools ?? []).filter((tool) => tool !== toolValue),
        }));
        return;
    }

    // Handle all other inputs (text, number, select, textarea)
    setForm((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Очистить предыдущие ошибки и уведомления
    toast.dismiss();

    // Check if we have a token
    const token = localStorage.getItem('accessToken');
    if (!token) {
        toast.error('Authentication required. Please log in again.');
        router.push('/login');
        return;
    }

    // Get file from input
  if (!form.model_file) {
    toast.error('Please select a 3D model file to upload');
    return;
}

const file = form.model_file as File;
console.log('Selected file details?', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    isFile: file instanceof File,
    constructor: file.constructor.name
});

    // Validate file size (5GB max)
    const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > maxSize) {
        toast.error('File size exceeds 5GB limit');
        return;
    }

    // Validate file type
    const validTypes = ['.fbx', '.obj', '.glb', '.tbscene'];
    const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(fileExt)) {
        toast.error('Invalid file type. Only .fbx, .obj, .glb, and .tbscene are allowed');
        return;
    }

    try {
        setLoading(true);
        const formData = new FormData();

        // Append file first with the correct field name
        formData.append('model_file', file);

        // Добавляем файл .tbscene, если он есть
        if (tbsceneFile) {
          formData.append('tbscene_file', tbsceneFile);
        }
        
        // Добавляем текстуры, если они есть
        if (textureFiles.length > 0) {
          textureFiles.forEach((textureFile, index) => {
            formData.append(`texture_files[${index}]`, textureFile);
          });
        }

        if (previewImageFile) {
          formData.append('preview_image', previewImageFile);
        }

        // Show upload progress
        toast.loading('Uploading model...', { id: 'upload' });

        // Log FormData contents before sending
        console.log('FormData contents before sending:');
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}:`, {
                    name: value.name,
                    type: value.type,
                    size: value.size,
                    lastModified: value.lastModified,
                    isFile: value instanceof File,
                    constructor: value.constructor.name
                });
            } else {
                console.log(`${key}:`, value);
            }
        }

        // Convert features object to array format expected by backend
        if (form.features) {
            Object.entries(form.features).forEach(([, value]) => {
                formData.append('features[]', value ? '1' : '0');
            });
        }

        // Handle boolean fields
        formData.append('printable', form.printable ? '1' : '0');
        formData.append('customizable', form.customizable ? '1' : '0');

        // Handle arrays
        if (form.formats) {
            form.formats.forEach(format => {
                formData.append('formats[]', format);
            });
        }
        if (form.tools) {
            form.tools.forEach(tool => {
                formData.append('tools[]', tool);
            });
        }

        // Handle other fields
        formData.append('title', form.title || '');
        formData.append('description', form.description || '');
        formData.append('category', form.category || '');
        formData.append('release_date', form.release_date || new Date().toISOString().split('T')[0]);
        formData.append('vertices', (form.vertices || 0).toString());
        formData.append('price', (form.price || 0).toString());
       for (const license of form.available_licenses ?? ['personal']) {
       formData.append('available_licenses[]', license);
}

        // Make the API call
        console.log('Making API call to create model...');
        const response = await api.createModel(formData);
        console.log('Model created:', response);
        toast.success('Model uploaded successfully');
        router.push('/creator/store');
    } catch (error: unknown) {
        console.error('Error uploading model:', error);
        const axiosError = error as { 
            response?: { 
                data?: { 
                    message?: string; 
                    errors?: Record<string, string[]> 
                } 
            } 
        };
        
        if (axiosError.response?.data?.errors) {
            Object.entries(axiosError.response.data.errors).forEach(([field, messages]) => {
                messages.forEach(message => toast.error(`${field}: ${message}`));
            });
        } else if (axiosError.response?.data?.message) {
            toast.error(axiosError.response.data.message);
        } else {
            toast.error('Failed to upload model. Please try again.');
        }
    } finally {
        setLoading(false);
    }
  };

  function handleCheckboxChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value, checked } = event.target;

    setForm((prev) => {
      // Only handle available_licenses array
      if (name === 'available_licenses') {
        const prevLicenses = prev.available_licenses ?? [];
        return {
          ...prev,
          available_licenses: checked
            ? [...prevLicenses, value as string]
            : prevLicenses.filter((license) => license !== value),
        } as ModelForm;
      }
      return prev;
    });
  }

  // Очистка URL при размонтировании компонента
  useEffect(() => {
    return () => {
      // Очистка URL превью изображения
      if (previewImageURL) {
        URL.revokeObjectURL(previewImageURL);
      }
      // Очистка URL превью модели
      if (modelPreviewURL) {
        URL.revokeObjectURL(modelPreviewURL);
      }
    };
  }, [previewImageURL, modelPreviewURL]);

  return (
    <div className={styles.container}>
      {!loading && isCreator && (
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
              <option value="Animals">Animals</option>
              <option value="Monsters">Monsters</option>
              <option value="Creatures">Creatures</option>
              <option value="Weapons">Weapons</option>
              <option value="Humans">Humans</option>
              <option value="Clothes & Accessories">Clothes & Accessories</option>
              <option value="Materials">Materials</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Architecture">Architecture</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Nature">Nature</option>
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
                    checked={form.formats?.includes(format) ?? false}
                    onChange={handleChange}
                  />
                  {format}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.field}>
  <span className={styles.label}>Tools Used</span>
  <div className={styles.checkboxGroup}>
    {toolOptions.map((tool) => (
      <label key={tool} className={styles.checkboxLabel}>
        <input
          type="checkbox"
          name="tools"
          value={tool}
          checked={(form.tools ?? []).includes(tool)}
          onChange={handleChange}
        />
        {tool}
      </label>
    ))}
  </div>
</div>

     <fieldset className={styles.fieldset}>
  <legend className={styles.label}>Technical Features</legend>
  {form.features &&
    Object.entries(form.features).map(([key, value]) => (
      <label key={key} className={styles.checkboxLabel}>
        <input
          type="checkbox"
          name={key}
          checked={Boolean(value)}  
          onChange={handleChange}
        />
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
  <span className={styles.label}>Available Licenses</span>
  <div className={styles.checkboxGroup}>
    <label>
      <input
        type="checkbox"
        name="available_licenses"
        value="personal"
        checked={form.available_licenses?.includes('personal') ?? false}
        onChange={handleCheckboxChange}
      />
      Standard License
    </label>
    <label>
      <input
        type="checkbox"
        name="available_licenses"
        value="commercial"
        checked={form.available_licenses?.includes('commercial') ?? false}
        onChange={handleCheckboxChange}
      />
      Editorial Use
    </label>
    <label>
      <input
        type="checkbox"
        name="available_licenses"
        value="enterprise"
        checked={form.available_licenses?.includes('enterprise') ?? false}
        onChange={handleCheckboxChange}
      />
      Commercial Use
    </label>
  </div>
</div>
          <div className={styles.field}>
  <span className={styles.label}>Upload Preview Image (PNG/JPEG)</span>
  <input
    type="file"
    className={styles.input}
    accept=".png, .jpg, .jpeg"
    name="preview_image"
    onChange={handleChange}
  />
</div>
{previewImageURL && (
  <div className={styles.previewBlock}>
    <Image
      src={previewImageURL}
      alt="Preview"
      className={styles.previewImage}
      width={400}
      height={300}
      unoptimized
    />
  </div>
)}

          <div className={styles.field}>
            <span className={styles.label}>Upload 3D Model</span>
            <input
              type="file"
              className={styles.input}
              accept=".fbx, .obj, .glb, .tbscene"
              name="model_file"
              onChange={handleChange}
            />
          </div>
          
          <div className={styles.field}>
            <span className={styles.label}>Upload Marmoset Scene (.tbscene)</span>
            <input
              type="file"
              className={styles.input}
              accept=".tbscene"
              name="tbscene_file"
              onChange={handleChange}
            />
            <p className={styles.hint}>Optional: Upload a Marmoset Toolbag scene file for enhanced visualization</p>
          </div>
          
          <div className={styles.field}>
            <span className={styles.label}>Upload Textures</span>
            <input
              type="file"
              className={styles.input}
              accept=".png, .jpg, .jpeg"
              name="texture_files"
              onChange={handleChange}
              multiple
            />
            <p className={styles.hint}>Optional: Upload texture files for your model (diffuse, normal, specular, etc.)</p>
          </div>
          
          {modelPreviewURL && (
  <div className={styles.previewBlock}>
    <h3 className={styles.label}>Preview</h3>
    <ModelPreview url={modelPreviewURL} />
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
        </div>
        </form>
      )}

      {loading && (
        <div className={styles.loading}>Loading...</div>
      )}
    </div>
  );
}