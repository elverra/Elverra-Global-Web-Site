import { v4 as uuidv4 } from 'uuid';

export interface Sector {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export const mockSectors: Sector[] = [
  {
    id: uuidv4(),
    name: 'Restauration',
    description: 'Restaurants et cafés',
    is_active: true
  },
  {
    id: uuidv4(),
    name: 'Santé',
    description: 'Services de santé et bien-être',
    is_active: true
  },
  {
    id: uuidv4(),
    name: 'Mode',
    description: 'Vêtements et accessoires',
    is_active: true
  },
  {
    id: uuidv4(),
    name: 'Éducation',
    description: 'Écoles et formations',
    is_active: true
  },
  {
    id: uuidv4(),
    name: 'Loisirs',
    description: 'Divertissement et activités',
    is_active: true
  }
];
