import { Genre } from '../types';

interface GenreListProps {
  genres: Genre[];
}

export default function GenreList({ genres }: GenreListProps) {
  const colors = [
    'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300',
    'bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-950 dark:text-blue-light-300',
    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  ];

  return (
    <section>
      <div className="flex flex-wrap gap-3">
        {genres.map((genre, idx) => (
          <span
            key={genre.name}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium ${colors[idx % colors.length]}`}
          >
            {genre.name}
          </span>
        ))}
      </div>
    </section>
  );
}
