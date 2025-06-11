import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { ModelForm } from '@/types';

export function useCreatorModels() {
  const [models, setModels] = useState<ModelForm[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const fetchModels = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.getModels({ creator_id: Number(user.id) });
        if (isMounted) {
          setModels(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        if (isMounted) {
          setModels([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchModels();

    return () => {
      isMounted = false;
    };
  }, [user]); // Include user in dependencies

  return { models, loading, setModels };
}