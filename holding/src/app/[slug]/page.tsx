import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getContentBySlug(slug: string) {
  try {
    await connectDB();
    const content = await Content.findOne({
      slug: slug,
      isActive: true
    });
    return content;
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);

  if (!content) {
    return {
      title: 'Sayfa Bulunamadı',
    };
  }

  return {
    title: content.title || 'Sayfa',
    description: content.description || '',
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);

  if (!content) {
    notFound();
  }

  const featuredImage = (content as any).featuredImage || content.metadata?.image;
  
  // Kart içeriklerini yükle
  const cardContents: { [key: string]: any } = {};
  if ((content as any).sections && Array.isArray((content as any).sections)) {
    const cardSectionIds: string[] = [];
    (content as any).sections.forEach((s: any) => {
      if (s.type === 'card') {
        if (s.contentIds && Array.isArray(s.contentIds)) {
          cardSectionIds.push(...s.contentIds);
        } else if (s.contentId) {
          cardSectionIds.push(s.contentId);
        }
      }
    });
    
    if (cardSectionIds.length > 0) {
      try {
        await connectDB();
        const cards = await Content.find({ 
          _id: { $in: cardSectionIds },
          isActive: true 
        });
        cards.forEach((card: any) => {
          cardContents[card._id.toString()] = card;
        });
      } catch (error) {
        console.error('Error loading card contents:', error);
      }
    }
  }

  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh', padding: '0' }}>
        {featuredImage ? (
          <div style={{
            width: '100%',
            height: '500px',
            overflow: 'hidden',
            position: 'relative',
            background: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={featuredImage}
              alt={content.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
                filter: 'brightness(0.4)'
              }}
            />
            <div style={{
              position: 'relative',
              zIndex: 1,
              textAlign: 'center',
              padding: '0 2rem',
              maxWidth: '1200px',
              width: '100%'
            }}>
              <h1 style={{
                fontSize: '3.5rem',
                color: '#ffffff',
                fontWeight: '700',
                margin: 0,
                lineHeight: '1.2',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
                marginBottom: content.description ? '1rem' : '0'
              }}>
                {content.title}
              </h1>
              {content.description && (
                <p style={{
                  fontSize: '1.5rem',
                  color: '#f3f4f6',
                  margin: 0,
                  lineHeight: '1.5',
                  fontWeight: '400',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                  maxWidth: '800px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  {content.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div style={{ 
            background: '#1f2937', 
            padding: '4rem 0',
            marginBottom: '2rem'
          }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
              <h1 style={{
                fontSize: '3.5rem',
                color: '#ffffff',
                fontWeight: '700',
                margin: 0,
                lineHeight: '1.2',
                letterSpacing: '-0.02em',
                textAlign: 'center',
                marginBottom: content.description ? '1rem' : '0'
              }}>
                {content.title}
              </h1>
              {content.description && (
                <p style={{
                  fontSize: '1.5rem',
                  color: '#f3f4f6',
                  margin: 0,
                  lineHeight: '1.5',
                  fontWeight: '400',
                  textAlign: 'center',
                  maxWidth: '800px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  {content.description}
                </p>
              )}
            </div>
          </div>
        )}
        <div style={{ minHeight: '60vh', padding: '2rem 0' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
            <article style={{ background: 'white', padding: '2rem', borderRadius: '8px', }}>
              {(content as any).sections && (content as any).sections.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {(content as any).sections
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((section: any, index: number) => {
                      if (section.type === 'text') {
                        return (
                          <div
                            key={index}
                            className="content-body"
                            style={{
                              fontSize: '1rem',
                              lineHeight: '1.8',
                              color: '#333'
                            }}
                            dangerouslySetInnerHTML={{ __html: section.content || '' }}
                          />
                        );
                      } else if (section.type === 'card') {
                        const cardIds = section.contentIds || (section.contentId ? [section.contentId] : []);
                        if (cardIds.length === 0) {
                          return null;
                        }
                        
                        return (
                          <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {cardIds.map((cardId: string, cardIndex: number) => {
                              const cardContent = cardContents[cardId];
                              if (!cardContent) {
                                return null;
                              }
                              const cardImage = cardContent.featuredImage || cardContent.metadata?.image;
                              const cardSlug = cardContent.slug;
                              
                              return (
                                <a
                                  key={cardIndex}
                                  href={`/${cardSlug}`}
                                  className="content-card"
                                  style={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    display: 'block'
                                  }}
                                >
                                  {cardImage && (
                                    <div style={{
                                      width: '100%',
                                      height: '250px',
                                      overflow: 'hidden',
                                      background: '#f3f4f6'
                                    }}>
                                      <img
                                        src={cardImage}
                                        alt={cardContent.title}
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                          display: 'block'
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div style={{ padding: '1.5rem' }}>
                                    <h3 style={{
                                      margin: 0,
                                      fontSize: '1.5rem',
                                      fontWeight: '600',
                                      color: '#1f2937',
                                      lineHeight: '1.3',
                                      marginBottom: cardContent.description ? '0.75rem' : '0'
                                    }}>
                                      {cardContent.title}
                                    </h3>
                                    {cardContent.description && (
                                      <p style={{
                                        margin: 0,
                                        fontSize: '1rem',
                                        color: '#6b7280',
                                        lineHeight: '1.6'
                                      }}>
                                        {cardContent.description}
                                      </p>
                                    )}
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    })}
                </div>
              ) : (
                <div
                  className="content-body"
                  style={{
                    fontSize: '1rem',
                    lineHeight: '1.8',
                    color: '#333',
                    marginTop: '2rem'
                  }}
                  dangerouslySetInnerHTML={{ __html: content.content || '' }}
                />
              )}
              <style dangerouslySetInnerHTML={{
                __html: `
                .content-body h1, .content-body h2, .content-body h3, 
                .content-body h4, .content-body h5, .content-body h6 {
                  margin: 24px 0 12px 0;
                  color: #1f2937;
                  font-weight: 600;
                }
                .content-body h1 { font-size: 2rem; }
                .content-body h2 { font-size: 1.75rem; }
                .content-body h3 { font-size: 1.5rem; }
                .content-body h4 { font-size: 1.25rem; }
                .content-body p {
                  margin: 16px 0;
                }
                .content-body ul, .content-body ol {
                  margin: 16px 0;
                  padding-left: 32px;
                }
                .content-body li {
                  margin: 8px 0;
                }
                .content-body table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 24px 0;
                }
                .content-body table th,
                .content-body table td {
                  border: 1px solid #e5e7eb;
                  padding: 12px 16px;
                  text-align: left;
                }
                .content-body table th {
                  background: #f3f4f6;
                  font-weight: 600;
                }
                .content-body img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 8px;
                  margin: 24px 0;
                }
                .content-body blockquote {
                  border-left: 4px solid #1f2937;
                  padding-left: 20px;
                  margin: 24px 0;
                  color: #6b7280;
                  font-style: italic;
                }
                .content-body code {
                  background: #f3f4f6;
                  padding: 3px 8px;
                  border-radius: 4px;
                  font-family: 'Courier New', monospace;
                  font-size: 0.9em;
                }
                .content-body pre {
                  background: #f3f4f6;
                  padding: 20px;
                  border-radius: 8px;
                  overflow-x: auto;
                  margin: 24px 0;
                }
                .content-body pre code {
                  background: none;
                  padding: 0;
                }
                .content-card {
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  overflow: hidden;
                  background: #ffffff;
                  transition: all 0.2s ease;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                  text-decoration: none;
                  color: inherit;
                  display: block;
                }
                .content-card:hover {
                  transform: translateY(-4px);
                  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                }
                .content-card img {
                  width: 100%;
                  height: 250px;
                  object-fit: cover;
                  display: block;
                }
                .content-card h3 {
                  margin: 0;
                  font-size: 1.5rem;
                  font-weight: 600;
                  color: #1f2937;
                  line-height: 1.3;
                }
                .content-card p {
                  margin: 0.75rem 0 0 0;
                  font-size: 1rem;
                  color: #6b7280;
                  line-height: 1.6;
                }
              ` }} />
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
