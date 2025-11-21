import Head from 'next/head';

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  structuredData?: object;
};

const defaultTitle = 'El Consejo de Hombres';
const defaultDescription = 'Plataforma para la deliberación y toma de decisiones colectivas. Un espacio donde los hombres pueden presentar peticiones, votar y participar en el proceso democrático del Consejo.';
const defaultKeywords = 'consejo de hombres, peticiones, votación, deliberación, democracia, decisiones colectivas';
const defaultImage = '/img/bannerConsejo.png';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elconsejodehombres.net';

export default function SEO({
  title,
  description = defaultDescription,
  keywords = defaultKeywords,
  image = defaultImage,
  url,
  type = 'website',
  noindex = false,
  structuredData
}: SEOProps) {
  const fullTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <link rel="canonical" href={fullUrl} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={defaultTitle} />
      <meta property="og:locale" content="es_ES" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional Meta Tags */}
      <meta name="author" content="El Consejo de Hombres" />
      <meta name="language" content="Spanish" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* Default Structured Data for Organization */}
      {!structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: defaultTitle,
              url: siteUrl,
              description: defaultDescription,
              logo: `${siteUrl}/img/bannerConsejo.png`,
              sameAs: []
            })
          }}
        />
      )}
    </Head>
  );
}

