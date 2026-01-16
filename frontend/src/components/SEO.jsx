/**
 * SEO Component - Dynamic meta tags and structured data
 * Uses react-helmet-async for better SEO
 */

import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'JobFinder+ | Find Every Job Before You Miss It',
  description = 'Find tech jobs from top companies like Accenture, TCS, Infosys, and startups. AI-powered resume builder, job matching, and application tracking. Get hired faster with JobFinder+.',
  keywords = 'jobs, careers, job search, IT jobs, software jobs, fresher jobs, internships, remote jobs, AI resume builder, job matching, tech jobs, Accenture jobs, TCS jobs, Infosys jobs',
  ogImage = 'https://jobfinderplus.vercel.app/og-image.png',
  url = 'https://jobfinderplus.vercel.app',
  type = 'website',
  structuredData = null
}) => {
  const fullTitle = title.includes('JobFinder+') ? title : `${title} | JobFinder+`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="JobFinder+" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
