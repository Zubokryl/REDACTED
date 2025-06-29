import { axiosClient } from "./axios";
import type { User, ModelForm, Profile, DigitalOrder } from "@/types";
import { AxiosError, isAxiosError } from "axios";
import { toast } from "react-hot-toast";

interface AuthResponse {
  user: User;
  token?: string;
}

const makeRequest = async <T>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: unknown,
  config: object = {}
): Promise<T> => {
  try {
    console.log(`[makeRequest] ${method.toUpperCase()} ${url}`);
    
    if (data instanceof FormData) {
      console.log('FormData contents in makeRequest:');
      for (const [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(`${key}: { name: ${value.name}, type: ${value.type}, size: ${value.size} }`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    } else {
      console.log(`[makeRequest] data:`, data);
    }

    const headers = data instanceof FormData
      ? { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
      : { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };

    const response = await axiosClient({
      method,
      url,
      data,
      headers,
      ...config,
    });

    console.log(`[makeRequest] response status: ${response.status}`);
    console.log(`[makeRequest] response data:`, response.data);
    return response.data;

  } catch (error) {
    console.error('[makeRequest] Request failed:', error);

    if (error instanceof Error) {
      console.error('[makeRequest] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }

    const axiosError = error as AxiosError;

    console.error('[makeRequest] Request config:', {
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      headers: axiosError.config?.headers,
      data: axiosError.config?.data,
    });

    if (axiosError.response) {
      console.error('[makeRequest] Response error details:', {
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        headers: axiosError.response.headers,
        data: axiosError.response.data,
      });
    }

    throw axiosError;
  }
};


export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}): Promise<AuthResponse> => {
  return makeRequest<AuthResponse>("post", "/register", data);
};

export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await makeRequest<AuthResponse>("post", "/login", data);
  if (response.token) {
    localStorage.setItem("accessToken", response.token);
  }
  return response;
};

export const logoutUser = async (): Promise<void> => {
  await makeRequest<void>("post", "/logout");
  localStorage.removeItem("accessToken");
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await makeRequest<{ user: User }>('get', '/user');
    return response.user ?? null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const getProfile = async (): Promise<Profile | null> => {
  try {
    return await makeRequest<Profile>('get', '/profile');
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export const updateProfile = async (
  data: FormData | object,
  config = {}
): Promise<Profile> => {
  if (data instanceof FormData) {
    // Log FormData contents
    console.log('FormData contents before sending:');
    for (const [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }

    // For PUT requests with FormData use POST with _method=PUT
    data.append('_method', 'PUT');
    return makeRequest<Profile>('post', '/profile', data, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      ...config,
    });
  } else {
    return makeRequest<Profile>('put', '/profile', data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      ...config,
    });
  }
};

export const getModelById = async (id: number): Promise<ModelForm> => {
  return makeRequest<ModelForm>("get", `/models/${id}`);
};

export const createModel = async (formData: FormData) => {
    try {
        // Log FormData contents
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

        const response = await axiosClient.post('/models', formData, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 7200000, // 2 hours timeout for large files
            validateStatus: function (status) {
                return status >= 200 && status < 500;
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                console.log(`Upload progress: ${percentCompleted}%`);
                // Update toast with progress
                if (percentCompleted < 100) {
                    toast.loading(`Uploading model: ${percentCompleted}%`, { id: 'upload' });
                } else {
                    toast.loading('Processing model...', { id: 'upload' });
                }
            }
        });

        // Log the complete response
        console.log('Complete response:', {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data,
            request: {
                headers: response.config.headers,
                data: response.config.data instanceof FormData ? 'FormData object' : response.config.data
            }
        });

        if (response.status >= 400) {
            throw new Error(`Request failed with status ${response.status}: ${JSON.stringify(response.data)}`);
        }

        return response.data;
    } catch (error: unknown) {
        console.error('Error in createModel:', error);
        if (isAxiosError(error)) {
            console.error('Response data:', error.response?.data);
            console.error('Response status:', error.response?.status);
            console.error('Response headers:', error.response?.headers);
            console.error('Request config:', {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                data: error.config?.data instanceof FormData ? 'FormData object' : error.config?.data
            });
        }
        throw error;
    }
};

export const updateModel = async (id: number, data: Partial<ModelForm>): Promise<ModelForm> => {
  return makeRequest<ModelForm>("put", `/models/${id}`, data);
};

export const deleteModel = async (id: number): Promise<void> => {
  return makeRequest<void>("delete", `/models/${id}`);
};

export const getModels = async (params?: { creator_id?: number }): Promise<ModelForm[]> => {
  try {
    const response = await makeRequest<ModelForm[]>("get", "/models", undefined, { params });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};


// Получить список заказов текущего пользователя
export const getUserOrders = async (): Promise<DigitalOrder[]> => {
  return makeRequest<DigitalOrder[]>("get", "/orders");
};

// Получить один заказ по ID
export const getOrderById = async (orderId: number): Promise<DigitalOrder> => {
  return makeRequest<DigitalOrder>("get", `/orders/${orderId}`);
};

// Оформить заказ (покупка модели)
export const createOrder = async (data: {
  model_id: number;
  license_type: "personal" | "commercial" | "enterprise";
}): Promise<{
  message: string;
  order: DigitalOrder;
}> => {
  return makeRequest("post", "/orders", data);
};

// Скачать файл модели по заказу
export const downloadOrder = async (orderId: number): Promise<Blob> => {
  const response = await axiosClient.get(`/orders/${orderId}/download`, {
    responseType: "blob",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  return response.data;
};




export const forgotPassword = async (data: { email: string }): Promise<{ status: string }> => {
  return makeRequest<{ status: string }>("post", "/forgot-password", data);
};

export const resetPassword = async (data: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> => {
  return makeRequest<{ message: string }>("post", "/reset-password", data);
};

export const verifyEmail = async (id: string, hash: string): Promise<{ message: string }> => {
  return makeRequest<{ message: string }>("post", `/email/verify/${id}/${hash}`);
};

export const api = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  getModels,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  getUserOrders,
  getOrderById,
  createOrder,
  downloadOrder
};

export { makeRequest };