
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
  avatar: string;
  socialLinks: SocialLinks;
}


export interface AuthData {
  user: User | null;
  profile: Profile | null;
  
}


export interface AuthContextType extends AuthData {
  setAuth: (data: AuthData) => void;
  logout: () => void;
}


export interface ModelFeatures {
  lowPoly: boolean;
  pbr: boolean;
  textures: boolean;
  materials: boolean;
  uvMapping: boolean;
  uvUnwrapped: boolean;
}


export interface ModelForm {
  id: number;
  creatorId: string; 
  title: string;
  description: string;
  category: string;
  price: number;
  license: string;
  printable: boolean;
  vertices: number;
  formats: string[];
  features: {
    rigged: boolean;
    animated: boolean;
    uvMapped: boolean;
    pbr: boolean;
    [key: string]: boolean;
  };
  releaseDate: string;
  tools: string[];
  model: string;
  modelURL: string;
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