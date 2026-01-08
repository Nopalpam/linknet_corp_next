export interface Award {
  id: string;
  title: string;
  year: number;
  issuer: string;
  description?: string;
  image?: string;
  order: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface AwardFormData {
  title: string;
  year: number;
  issuer: string;
  description?: string;
  image?: string;
  order?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface AwardOrderUpdate {
  id: string;
  order: number;
}

export interface AwardsByYear {
  [year: number]: Award[];
}
