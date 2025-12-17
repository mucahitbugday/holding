'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'organization' | 'article' | 'breadcrumb' | 'website';
  data?: any;
  content?: any;
  slug?: string;
  id?: string;
}

export default function StructuredData({ type, data, content, slug, id }: StructuredDataProps) {
  useEffect(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
    const scriptId = `structured-data-${type}${id ? `-${id}` : ''}`;
    
    let jsonLd: any = {};

    if (type === 'organization' && data) {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: data.companyName || data.siteName || 'Holding Şirketi',
        url: siteUrl,
        logo: data.siteLogo ? `${siteUrl}${data.siteLogo}` : `${siteUrl}/images/logo.png`,
        description: data.siteDescription || data.metaDescription || '',
        address: {
          '@type': 'PostalAddress',
          streetAddress: data.companyAddress || '',
          addressCountry: 'TR',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: data.companyPhone || '',
          contactType: 'customer service',
          email: data.companyEmail || '',
        },
      };

      if (data.socialMedia) {
        const sameAs: string[] = [];
        if (data.socialMedia.facebook) sameAs.push(data.socialMedia.facebook);
        if (data.socialMedia.twitter) sameAs.push(data.socialMedia.twitter);
        if (data.socialMedia.instagram) sameAs.push(data.socialMedia.instagram);
        if (data.socialMedia.linkedin) sameAs.push(data.socialMedia.linkedin);
        if (data.socialMedia.youtube) sameAs.push(data.socialMedia.youtube);
        if (sameAs.length > 0) {
          jsonLd.sameAs = sameAs;
        }
      }

      if (data.companyFoundedYear) {
        jsonLd.foundingDate = data.companyFoundedYear.toString();
      }
    } else if (type === 'article' && content) {
      const imageUrl = content.featuredImage || content.metadata?.image;
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: content.title,
        description: content.description || '',
        image: imageUrl ? `${siteUrl}${imageUrl}` : undefined,
        datePublished: content.createdAt,
        dateModified: content.updatedAt || content.createdAt,
        author: {
          '@type': 'Organization',
          name: data?.companyName || 'Holding Şirketi',
        },
        publisher: {
          '@type': 'Organization',
          name: data?.companyName || 'Holding Şirketi',
          logo: {
            '@type': 'ImageObject',
            url: data?.siteLogo ? `${siteUrl}${data.siteLogo}` : `${siteUrl}/images/logo.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${siteUrl}/${slug || content.slug}`,
        },
      };
    } else if (type === 'website') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data?.siteName || 'Holding Şirketi',
        url: siteUrl,
        description: data?.siteDescription || data?.metaDescription || '',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      };
    }

    // Mevcut structured data script'ini kaldır
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Yeni structured data script'ini ekle
    if (Object.keys(jsonLd).length > 0) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const script = document.getElementById(scriptId);
      if (script) {
        script.remove();
      }
    };
  }, [type, data, content, slug, id]);

  return null;
}
