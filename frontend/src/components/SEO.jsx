/**
 * SEO Component - Dynamic meta tags and structured data
 * Optimized for Google Search, social sharing, and rich results
 */

import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'GoAxonAI | AI-Powered Job Search & Career Agent',
  description = 'Find your dream job with AI. GoAxonAI aggregates 50+ job sources, matches jobs to your skills with AI, and builds ATS-optimized resumes. Free to start.',
  keywords = 'AI job search, job aggregator India, AI resume builder, job matching AI, tech jobs India, remote jobs, freshers jobs, AxonMatch, AxonResume, career AI, GoAxonAI',
  ogImage = 'https://www.goaxonai.in/og-image.png',
  url = 'https://www.goaxonai.in',
  type = 'website',
  structuredData = null,
  noIndex = false
}) => {
  const fullTitle = title.includes('GoAxonAI') ? title : `${title} | GoAxonAI`;
  
  // Truncate description to 155 chars for Google
  const metaDescription = description.length > 155 
    ? description.substring(0, 152) + '...' 
    : description;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="GoAxonAI - AI-Powered Job Search Platform" />
      <meta property="og:site_name" content="GoAxonAI" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@GoAxonAI" />
      
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
