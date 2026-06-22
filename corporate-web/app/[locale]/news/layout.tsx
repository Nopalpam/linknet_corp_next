// src/app/[locale]/news/layout.jsx


export default function NewsLayout({ children }) {
  return (
    <>
      {/* NavbarNewsroom akan otomatis muncul tepat di bawah Navbar Utama */}
      
      {/* {children} di sini adalah halaman NewsFeed (berita-beritanya) */}
      {children}
    </>
  );
}
