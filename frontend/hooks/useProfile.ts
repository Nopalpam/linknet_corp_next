import useSWR from 'swr';
import api from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
  phone: string | null;
  status: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }>;
  permissions: string[];
  twoFactorEnabled: boolean;
}

interface ProfileResponse {
  success: boolean;
  data: UserProfile;
}

const fetcher = async (url: string): Promise<UserProfile> => {
  const response = await api.get<ProfileResponse>(url);
  return response.data.data;
};

export default function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    '/profile',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    profile: data,
    isLoading,
    error,
    mutate,
  };
}
