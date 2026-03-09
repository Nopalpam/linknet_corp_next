// src/app/[locale]/newsroom/layout.jsx


export default function NewsroomLayout({ children }) {
  return (
    <>
      {/* NavbarNewsroom akan otomatis muncul tepat di bawah Navbar Utama */}
      
      {/* {children} di sini adalah halaman NewsFeed (berita-beritanya) */}
      {children}
    </>
  );
}