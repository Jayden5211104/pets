// Types mirroring src/types.ts for the admin panel

export type PetCategory = 'dog' | 'cat' | 'bird' | 'hamster';

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: '公' | '母';
  weight: string;
  size: '小型' | '中型' | '大型';
  location: string;
  distance: string;
  imageUrl: string;
  tags: string[];
  description: string[];
  isVaccinated: boolean;
  isNeutered: boolean;
  isHouseTrained: boolean;
  isEnergetic: boolean;
  isGoodWithKids: boolean;
  isOnline: boolean;
  category: PetCategory;
  shelterId: string;
  shelter?: { id: string; name: string };
  created_at?: string;
}

export interface AdoptionApplication {
  id: string;
  petId: string;
  petName: string;
  petBreed: string;
  petImage: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  homeType: 'apartment' | 'house';
  hasYard: boolean;
  reason: string;
  status: 'submitted' | 'reviewing' | 'handover';
  date: string;
  created_at?: string;
}

export interface DashboardStats {
  totalPets: number;
  onlinePets: number;
  offlinePets: number;
  applications: {
    total: number;
    submitted: number;
    reviewing: number;
    handover: number;
  };
}

export type AdminPage = 'dashboard' | 'pets' | 'applications';

export interface PetFormData {
  name: string;
  breed: string;
  age: string;
  gender: '公' | '母';
  weight: string;
  size: '小型' | '中型' | '大型';
  location: string;
  distance: string;
  category: PetCategory;
  tags: string;
  description: string;
  isVaccinated: boolean;
  isNeutered: boolean;
  isHouseTrained: boolean;
  isEnergetic: boolean;
  isGoodWithKids: boolean;
  shelterId: string;
}
