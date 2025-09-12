import { v4 as uuidv4 } from 'uuid';
import { mockSectors } from './sectors';

export interface Merchant {
  id: string;
  name: string;
  sector_id: string;
  sector: { name: string };
  discount_percentage: number;
  location: string;
  contact_phone: string;
  contact_email: string;
  description: string;
  website: string;
  logo_url?: string;
  rating: number;
  is_active: boolean;
  featured: boolean;
}

// Get a random sector ID from mock sectors
const getRandomSector = () => {
  const randomIndex = Math.floor(Math.random() * mockSectors.length);
  return mockSectors[randomIndex];
};

// Generate mock merchants
export const mockMerchants: Merchant[] = [
  {
    id: uuidv4(),
    name: 'Restaurant Le Délicieux',
    sector_id: mockSectors[0].id,
    sector: { name: mockSectors[0].name },
    discount_percentage: 15,
    location: 'Abidjan, Plateau',
    contact_phone: '+225 01 23 45 67 89',
    contact_email: 'contact@ledelicieux.ci',
    description: 'Cuisine ivoirienne traditionnelle',
    website: 'https://ledelicieux.ci',
    logo_url: '/placeholder.svg',
    rating: 4.5,
    is_active: true,
    featured: true
  },
  {
    id: uuidv4(),
    name: 'Clinique du Bonheur',
    sector_id: mockSectors[1].id,
    sector: { name: mockSectors[1].name },
    discount_percentage: 20,
    location: 'Abidjan, Cocody',
    contact_phone: '+225 07 89 45 12 36',
    contact_email: 'contact@cliniquedubonheur.ci',
    description: 'Soins médicaux de qualité',
    website: 'https://cliniquedubonheur.ci',
    logo_url: '/placeholder.svg',
    rating: 4.8,
    is_active: true,
    featured: false
  },
  {
    id: uuidv4(),
    name: 'Fashion Store',
    sector_id: mockSectors[2].id,
    sector: { name: mockSectors[2].name },
    discount_percentage: 10,
    location: 'Abidjan, Marcory',
    contact_phone: '+225 05 67 89 12 34',
    contact_email: 'info@fashionstore.ci',
    description: 'Vêtements tendance pour hommes et femmes',
    website: 'https://fashionstore.ci',
    logo_url: '/placeholder.svg',
    rating: 4.2,
    is_active: true,
    featured: true
  },
  {
    id: uuidv4(),
    name: 'Institut Français',
    sector_id: mockSectors[3].id,
    sector: { name: mockSectors[3].name },
    discount_percentage: 15,
    location: 'Abidjan, Plateau',
    contact_phone: '+225 20 21 22 23',
    contact_email: 'contact@institutfrancais.ci',
    description: 'Cours de français et culture',
    website: 'https://institutfrancais.ci',
    logo_url: '/placeholder.svg',
    rating: 4.7,
    is_active: true,
    featured: false
  },
  {
    id: uuidv4(),
    name: 'Cinéma Abidjan',
    sector_id: mockSectors[4].id,
    sector: { name: mockSectors[4].name },
    discount_percentage: 25,
    location: 'Abidjan, Zone 4',
    contact_phone: '+225 20 25 30 35',
    contact_email: 'contact@cinemaabidjan.ci',
    description: 'Films à l\'affiche et événements',
    website: 'https://cinemaabidjan.ci',
    logo_url: '/placeholder.svg',
    rating: 4.6,
    is_active: true,
    featured: true
  }
];
