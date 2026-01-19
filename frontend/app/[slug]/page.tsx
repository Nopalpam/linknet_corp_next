import { notFound } from 'next/navigation';
import { Metadata } from 'next';

async function getPage(slug: string) {
  try {
     const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
     const res = await fetch(`${apiUrl}/pages/${slug}`, { 
        next: { revalidate: 60 } 
     });
     
     if (!res.ok) {
         if (res.status === 404) return null;
         throw new Error(`Failed to fetch page: ${res.status}`);
     }
     
     const json = await res.json();
     return json.data;
  } catch (e) {
      console.error(e);
      return null;
  }
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const page = await getPage(params.slug);
  if (!page) return { title: 'Page Not Found' };
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
  };
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  
  if (!page) notFound();

  return (
    <main>
      {/* Dynamic Component Rendering */}
      {(page.components || []).map((comp: any) => {
          if (comp.isVisible === false) return null;

          switch (comp.type) {
              case 'hero_section':
                  return (
                    <section key={comp.id} className="position-relative text-white text-center py-5" style={{ 
                        backgroundImage: `url(${comp.data.bgImage || 'https://via.placeholder.com/1920x600'})`, 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center',
                        minHeight: '60vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{ opacity: 0.5 }}></div>
                        <div className="position-relative z-1 container">
                            <h1 className="display-4 fw-bold mb-3">{comp.data.title}</h1>
                            <p className="lead mb-4 mx-auto" style={{ maxWidth: '800px' }}>{comp.data.subtitle}</p>
                            {comp.data.buttonText && (
                                <a href={comp.data.buttonLink || '#'} className="btn btn-primary btn-lg px-5 border-0 rounded-pill shadow-sm">{comp.data.buttonText}</a>
                            )}
                        </div>
                    </section>
                  );
              
              case 'text_block':
                  return (
                      <section key={comp.id} className="py-5 container">
                          <div dangerouslySetInnerHTML={{ __html: comp.data.content || '' }} />
                      </section>
                  );
              
              case 'cta_section':
                  return (
                      <section key={comp.id} className="py-5 text-center" style={{ backgroundColor: comp.data.bgColor || '#f8f9fa' }}>
                          <div className="container">
                              <h2 className="fw-bold mb-3">{comp.data.title}</h2>
                              {comp.data.buttonText && (
                                  <a href={comp.data.buttonLink || '#'} className="btn btn-primary btn-lg mt-2 rounded-pill px-4">{comp.data.buttonText}</a>
                              )}
                          </div>
                      </section>
                  );
                
              case 'features_grid':
                    return (
                        <section key={comp.id} className="py-5 bg-light">
                            <div className="container">
                                <h2 className="text-center mb-5">{comp.data.title}</h2>
                                <div className={`row row-cols-1 row-cols-md-${comp.data.columns || 3} g-4`}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="col">
                                            <div className="card h-100 border-0 shadow-sm">
                                                <div className="card-body text-center p-4">
                                                    <div className="fs-1 text-primary mb-3">★</div>
                                                    <h5 className="card-title">Feature {i}</h5>
                                                    <p className="card-text text-muted">This is a feature description placeholder.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    );

              default:
                  return (
                      <div key={comp.id} className="container py-5 text-center text-muted border my-3 rounded bg-light">
                      </div>
                  );
          }
      })}
    </main>
  );
}
