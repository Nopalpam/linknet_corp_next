import NavbarNewsroom from '@/components/main/NavbarNewsroom';
import NewsFeed from '@/components/main/NewsFeed';


// Tambahkan 'async' di sini
export default async function CategoryPage({ params }) {
  // Tunggu (await) params sebelum mengambil nilainya
  const resolvedParams = await params;
  const slug = resolvedParams.slug; 

  return (
    <main>
      <NavbarNewsroom />
      <NewsFeed categorySlug={slug} />
    </main>
  );
}