import { notFound } from 'next/navigation';
import { careers } from '@/data/components/careerList'; // Sesuaikan path ini dengan lokasimu
import CareerDetail from '@/components/main/CareerDetail'; // Sesuaikan path ini

function stripHtml(input = '') {
  let output = '';
  let insideTag = false;
  let lastWasSpace = false;

  for (const char of String(input)) {
    if (char === '<') {
      insideTag = true;
      if (!lastWasSpace) {
        output += ' ';
        lastWasSpace = true;
      }
      continue;
    }

    if (char === '>') {
      insideTag = false;
      continue;
    }

    if (insideTag) continue;

    const isWhitespace = char.trim() === '';
    if (isWhitespace) {
      if (!lastWasSpace) {
        output += ' ';
        lastWasSpace = true;
      }
      continue;
    }

    output += char;
    lastWasSpace = false;
  }

  return output.trim();
}

// 1. GENERATE STATIC PARAMS (Wajib pakai 'id' karena foldernya '[id]')
export async function generateStaticParams() {
  return careers.map((career) => ({
    id: career.id, 
  }));
}

// 2. GENERATE METADATA (Wajib tangkap 'id')
export async function generateMetadata({ params }) {
  const resolvedParams = await params; // Wajib di-await di Next.js 14/15
  const { id } = resolvedParams; 
  
  const career = careers.find((item) => item.id === id);

  if (!career) return { title: 'Career Not Found | Link Net' };

  const plainDescription = `${stripHtml(career.description).substring(0, 160)}...`;

  return {
    title: `We're Hiring ${career.title}`,
    description: plainDescription,
  };
}

// 3. KOMPONEN UTAMA (Wajib tangkap 'id')
export default async function CareerDetailPage({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const career = careers.find((item) => item.id === id);

  if (!career) {
    notFound();
  }

  // ==========================================
  // LOGIKA FILLER RELATED CAREERS
  // ==========================================
  
  // 1. Ambil semua karir KECUALI yang sedang dibuka saat ini
  const allOtherCareers = careers.filter((item) => item.id !== career.id);

  // 2. Filter karir dengan departemen yang sama
  const sameDept = allOtherCareers.filter(
    (item) => item.department === career.department
  );

  // 3. Filter karir dengan departemen yang BERBEDA
  const diffDept = allOtherCareers.filter(
    (item) => item.department !== career.department
  );

  // 4. Gabungkan: dahulukan yang satu departemen, sisanya ambil dari departemen lain
  // Kita gabungkan keduanya, lalu kita potong (slice) menjadi 4
  const RelatedCareers = [...sameDept, ...diffDept].slice(0, 4);

  return (
    <main className="bg-white">
      <CareerDetail 
        career={career} 
        relatedCareers={RelatedCareers} 
      />
    </main>
  );
}
