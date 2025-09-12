import { mockSectors } from '../data/sectors';
import { mockMerchants, Merchant } from '../data/merchants';

// Simuler un délai réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Service pour les secteurs
export const sectorService = {
  getSectors: async () => {
    await delay(500);
    return [...mockSectors];
  },
  
  getSector: async (id: string) => {
    await delay(300);
    return mockSectors.find(sector => sector.id === id) || null;
  },
  
  createSector: async (sector: Omit<typeof mockSectors[0], 'id' | 'is_active'>) => {
    await delay(500);
    const newSector = {
      ...sector,
      id: Math.random().toString(36).substr(2, 9),
      is_active: true
    };
    mockSectors.push(newSector);
    return newSector;
  },
  
  updateSector: async (id: string, updates: Partial<typeof mockSectors[0]>) => {
    await delay(500);
    const index = mockSectors.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Sector not found');
    
    mockSectors[index] = { ...mockSectors[index], ...updates };
    return mockSectors[index];
  },
  
  deleteSector: async (id: string) => {
    await delay(500);
    const index = mockSectors.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Sector not found');
    
    mockSectors.splice(index, 1);
    return { success: true };
  }
};

// Service pour les marchands
export const merchantService = {
  getMerchants: async () => {
    await delay(500);
    return [...mockMerchants];
  },
  
  getMerchant: async (id: string) => {
    await delay(300);
    return mockMerchants.find(merchant => merchant.id === id) || null;
  },
  
  getMerchantsBySector: async (sectorId: string) => {
    await delay(400);
    return mockMerchants.filter(merchant => merchant.sector_id === sectorId);
  },
  
  createMerchant: async (merchant: Omit<Merchant, 'id' | 'sector' | 'rating' | 'is_active' | 'featured'>) => {
    await delay(600);
    const sector = mockSectors.find(s => s.id === merchant.sector_id);
    
    if (!sector) {
      throw new Error('Sector not found');
    }
    
    const newMerchant: Merchant = {
      ...merchant,
      id: Math.random().toString(36).substr(2, 9),
      sector: { name: sector.name },
      rating: 0,
      is_active: true,
      featured: false,
      logo_url: merchant.logo_url || '/placeholder.svg'
    };
    
    mockMerchants.push(newMerchant);
    return newMerchant;
  },
  
  updateMerchant: async (id: string, updates: Partial<Merchant>) => {
    await delay(500);
    const index = mockMerchants.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Merchant not found');
    
    // Mettre à jour les informations du secteur si nécessaire
    if (updates.sector_id) {
      const sector = mockSectors.find(s => s.id === updates.sector_id);
      if (sector) {
        updates.sector = { name: sector.name };
      }
    }
    
    mockMerchants[index] = { ...mockMerchants[index], ...updates };
    return mockMerchants[index];
  },
  
  deleteMerchant: async (id: string) => {
    await delay(500);
    const index = mockMerchants.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Merchant not found');
    
    mockMerchants.splice(index, 1);
    return { success: true };
  },
  
  getFeaturedMerchants: async () => {
    await delay(400);
    return mockMerchants.filter(merchant => merchant.featured);
  }
};

// Service pour l'authentification simulée
export const authService = {
  login: async (email: string, password: string) => {
    await delay(800);
    // Simuler une connexion réussie
    return {
      user: {
        id: 'user-123',
        email,
        name: 'Admin User',
        role: 'admin'
      },
      token: 'mock-jwt-token'
    };
  },
  
  getCurrentUser: async () => {
    await delay(300);
    return {
      id: 'user-123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin'
    };
  }
};
