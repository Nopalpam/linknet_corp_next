export default function EventsLoading() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-0">
        <div className="mb-8 h-8 w-32 animate-pulse rounded-full bg-neutral-200"></div>
        <div className="mb-4 h-12 max-w-md animate-pulse rounded-xl bg-neutral-200"></div>
        <div className="mb-12 h-6 max-w-2xl animate-pulse rounded-xl bg-neutral-100"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm">
              <div className="aspect-[16/10] animate-pulse bg-neutral-200"></div>
              <div className="space-y-4 p-6">
                <div className="h-4 w-40 animate-pulse rounded bg-neutral-100"></div>
                <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-200"></div>
                <div className="h-16 animate-pulse rounded bg-neutral-100"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}