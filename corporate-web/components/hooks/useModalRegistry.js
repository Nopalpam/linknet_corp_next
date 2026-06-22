'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function useModalRegistry() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Mengambil ID modal dari URL (misal: ?modal=order)
  const activeModalId = searchParams.get('modal');

  // Fungsi untuk membuka modal tertentu
  const openModal = (modalId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('modal', modalId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Fungsi untuk menutup modal (HANYA menghapus query param 'modal')
  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('modal'); // Hapus parameter modal saja
    
    // Cek apakah masih ada parameter lain yang tersisa
    const query = params.toString();
    const newUrl = query ? `${pathname}?${query}` : pathname;
    
    router.push(newUrl, { scroll: false });
  };

  return {
    activeModalId,
    openModal,
    closeModal,
    // Helper untuk mengecek spesifik modal
    isModalOpen: (id) => activeModalId === id
  };
}