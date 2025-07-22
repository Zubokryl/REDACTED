export interface User {
  id: string;
  role: 'admin' | 'creator' | 'user'; 
  name: string;
  [key: string]: unknown; 
}

export interface SocialLinks {
  Artstation?: string;
  Facebook?: string;
  GitHub?: string;
  Instagram?: string;
  LinkedIn?: string;
  Twitter?: string;
  YouTube?: string;
  [key: string]: string | undefined; 
}


export interface Profile {
  name: string;
  about: string;
  experience: string;
  contact: string;
  skills: string;
  software: string[] | string | null;
  profile_photo_url: string;
  socialLinks: SocialLinks;
}

export interface UserProfile {
  name: string;
  about: string;
  contact: string;
  profile_photo_url: string;
  socialLinks: SocialLinks;
}


export interface AuthData {
  user: User | null;
  profile: Profile | null;
  userProfile: UserProfile | null; 
  models?: ModelForm[];
}


export interface AuthContextType extends AuthData {
  setAuth: (data: AuthData | ((prev: AuthData) => AuthData)) => void;
  logout: () => void;
}


export interface ModelFeatures {
  lowPoly: boolean;
  pbr: boolean;
  textures: boolean;
  materials: boolean;
  uvMapping: boolean;
  uvUnwrapped: boolean;
  rigged: boolean;
  animated: boolean;
  uvMapped: boolean;

}


export interface ModelForm {
  id?: number;
  title: string;
  description?: string;
  category?: string;
  price?: number | string;
  available_licenses?: LicenseType[];
  formats?: string[];     
  features?: ModelFeatures;
  vertices: number;
  printable: boolean;
  tools?: string[];        
  customizable: boolean;
  release_date?: string;      
  creator_id?: number; 
  created_at?: string;
  updated_at?: string; 
  tags?: string[];
  materials?: string[];
  model_file: string | File;
  preview_file?: File;
  preview_image_url: string;
  images?: string[]; 
  preview_video?: string;          
}

export const SOFTWARE_OPTIONS = [
  'Substance 3D Painter',
  'Substance 3D Designer',
  'ZBrush',
  'Unity',
  'Blender',
  'Maya',
  'Photoshop',
  '3ds Max',
  'Marmoset Toolbag',
] as const;

export type SoftwareOption = typeof SOFTWARE_OPTIONS[number];


// Order status
export type OrderStatus = 'pending' | 'completed' | 'failed';

// Order type
export interface DigitalOrder {
  id: number;
  user_id: number;
  model_id: number;
  price: number;
  license_type: LicenseType;
  status: OrderStatus;
  download_count: number;
  downloaded_at: string | null;
  created_at: string;
  updated_at: string;

  // Optional — if the API returns expanded data - ???
  model?: ModelForm; // included if model details are returned
  user?: User;       // included if buyer details are returned
}

export interface OrderItem {
  id: number;
  license_type: LicenseType;
  price: number;
  model: {
    id: number;
    title: string;
  };
}

export interface BulkOrder {
  id: number;
  items: OrderItem[];
  price: number;
}

export type LicenseType = 'personal' | 'commercial' | 'enterprise';

export interface CartItemApi {
  id: number;
  model_id: number;
  license_type: LicenseType;
  preview_image_url: File;
  model: {
    id: number;
    title: string;
    price: number;
    preview_image_url: File;
  };
}
