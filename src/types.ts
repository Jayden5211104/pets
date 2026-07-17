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
  category: PetCategory;
  shelterId: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  joinedDays: number;
  favorites: string[]; // List of Pet IDs
}

export type ApplicationStatus = 'submitted' | 'reviewing' | 'handover';

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
  status: ApplicationStatus;
  date: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  messageText: string;
  time: string;
  isUser: boolean;
}

export interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  messageText: string;
  time: string;
  unread: boolean;
  isShelter: boolean;
  chatHistory?: ChatMessage[];
}

export interface Shelter {
  id: string;
  name: string;
  location: string;
  distance: string;
  logoUrl: string;
}

export type ActiveTab = 'home' | 'search' | 'messages' | 'profile';

export type ViewState = 
  | { type: 'login' }
  | { type: 'tab'; tab: ActiveTab }
  | { type: 'pet-details'; petId: string; fromView: ViewState }
  | { type: 'adopt-form'; petId: string };
