import { notFound } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';
import Settings from '@/models/Settings';
import { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';

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

async function getSettings() {
  try {
    await connectDB();
    const settings = await Settings.findOne();
    return settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  const settings = await getSettings();

  if (!content) {
    return {
      title: 'Sayfa Bulunamadı',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const siteName = settings?.siteName || 'Holding Şirketi';
  const pageUrl = `${siteUrl}/${slug}`;
  const featuredImage = content.featuredImage || content.metadata?.image;
  const imageUrl = featuredImage ? `${siteUrl}${featuredImage}` : `${siteUrl}/images/og-default.jpg`;

  return {
    title: `${content.title} | ${siteName}`,
    description: content.description || settings?.siteDescription || '',
    keywords: content.metadata?.keywords || settings?.metaKeywords || [],
    authors: [{ name: settings?.companyName || siteName }],
    openGraph: {
      type: 'article',
      locale: 'tr_TR',
      url: pageUrl,
      siteName: siteName,
      title: content.title,
      description: content.description || '',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: content.title,
        },
      ],
      publishedTime: content.createdAt?.toString(),
      modifiedTime: content.updatedAt?.toString() || content.createdAt?.toString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description || '',
      images: [imageUrl],
    },
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getContentBySlug(slug);
  const settings = await getSettings();

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
      <StructuredData type="article" data={settings} content={content} slug={slug} id="article" />
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
            <Image
              src={featuredImage}
              alt={content.title}
              fill
              priority
              quality={85}
              sizes="100vw"
              style={{
                objectFit: 'cover',
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
                          <div key={index} style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                            gap: '2rem',
                            marginTop: '1rem',
                            marginBottom: '1rem',
                            alignItems: 'stretch'
                          }}>
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
                                  className={`content-card ${cardImage ? 'has-image' : 'no-image'}`}
                                  style={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: '#ffffff',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    overflow: 'hidden',
                                    height: '100%'
                                  }}
                                >
                                  <div style={{
                                    width: '100%',
                                    height: '220px',
                                    overflow: 'hidden',
                                    background: cardImage ? '#f9fafb' : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                    position: 'relative',
                                    flexShrink: 0
                                  }}>
                                    {cardImage ? (
                                      <img
                                        src={cardImage}
                                        alt={cardContent.title}
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                          display: 'block',
                                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                        className="card-image"
                                      />
                                    ) : (
                                      <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        <div style={{
                                          width: '64px',
                                          height: '64px',
                                          borderRadius: '50%',
                                          background: '#ffffff',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                        }}>
                                          <svg 
                                            width="32" 
                                            height="32" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="#9ca3af" 
                                            strokeWidth="1.5"
                                            style={{ opacity: 0.6 }}
                                          >
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                          </svg>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ 
                                    padding: '2rem',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                  }}>
                                    <div>
                                      <h3 style={{
                                        margin: 0,
                                        fontSize: '1.375rem',
                                        fontWeight: '600',
                                        color: '#111827',
                                        lineHeight: '1.4',
                                        marginBottom: cardContent.description ? '0.875rem' : '0',
                                        letterSpacing: '-0.01em'
                                      }}>
                                        {cardContent.title}
                                      </h3>
                                      {cardContent.description && (
                                        <p style={{
                                          margin: 0,
                                          fontSize: '0.9375rem',
                                          color: '#6b7280',
                                          lineHeight: '1.7',
                                          fontWeight: '400'
                                        }}>
                                          {cardContent.description}
                                        </p>
                                      )}
                                    </div>
                                    <div style={{
                                      marginTop: '1.5rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      color: '#1f2937',
                                      fontSize: '0.875rem',
                                      fontWeight: '500',
                                      opacity: 0.7,
                                      transition: 'opacity 0.2s ease'
                                    }} className="card-link">
                                      Daha Fazla
                                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>→</span>
                                    </div>
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
                  border: none;
                  border-radius: 0;
                  overflow: hidden;
                  background: #ffffff;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  box-shadow: none;
                  text-decoration: none;
                  color: inherit;
                  display: flex;
                  flex-direction: column;
                  position: relative;
                }
                .content-card::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  border: 1px solid #e5e7eb;
                  transition: border-color 0.3s ease;
                  pointer-events: none;
                }
                .content-card:hover {
                  transform: translateY(-2px);
                }
                .content-card:hover::before {
                  border-color: #d1d5db;
                }
                .content-card.has-image:hover .card-image {
                  transform: scale(1.03);
                }
                .content-card:hover .card-link {
                  opacity: 1;
                }
                .content-card {
                  height: 100%;
                }
                .content-card.no-image::before {
                  border-color: #f3f4f6;
                }
                .content-card.no-image:hover::before {
                  border-color: #e5e7eb;
                }
                .content-card .card-image {
                  width: 100%;
                  height: 220px;
                  object-fit: cover;
                  display: block;
                  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .content-card h3 {
                  margin: 0;
                  font-size: 1.375rem;
                  font-weight: 600;
                  color: #111827;
                  line-height: 1.4;
                  letter-spacing: -0.01em;
                }
                .content-card p {
                  margin: 0.875rem 0 0 0;
                  font-size: 0.9375rem;
                  color: #6b7280;
                  line-height: 1.7;
                  font-weight: 400;
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
