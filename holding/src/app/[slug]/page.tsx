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

  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh', padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <article style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              marginBottom: '1rem', 
              color: '#313131',
              fontWeight: '700'
            }}>
              {content.title}
            </h1>
            {content.description && (
              <p style={{ 
                fontSize: '1.2rem', 
                color: '#666', 
                marginBottom: '2rem',
                lineHeight: '1.6'
              }}>
                {content.description}
              </p>
            )}
            <div 
              style={{ 
                fontSize: '1rem', 
                lineHeight: '1.8', 
                color: '#333',
                marginTop: '2rem'
              }}
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
