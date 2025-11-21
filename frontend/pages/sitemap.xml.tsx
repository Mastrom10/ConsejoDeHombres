import { GetServerSideProps } from 'next';

function generateSiteMap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://elconsejodehombres.net';
  
  // Páginas estáticas
  const staticPages = [
    '',
    '/codigo-hombres',
    '/login',
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
           xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
           xmlns:xhtml="http://www.w3.org/1999/xhtml"
           xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
           xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
           xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
     ${staticPages
       .map((url) => {
         return `
       <url>
           <loc>${baseUrl}${url}</loc>
           <changefreq>daily</changefreq>
           <priority>${url === '' ? '1.0' : '0.8'}</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap();

  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;

