/**
 * SEO Component - Dynamic meta tags and structured data
 * Uses react-helmet-async for better SEO
 */

import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'GoAxonAI | Your AI Agent for Career Success',
  description = 'Not just a job board — an AI agent that thinks for your career. AxonSearch™ scans 50+ sources, AxonMatch™ finds eligible jobs, AxonResume™ builds ATS-friendly resumes.',
  keywords = 'AI job agent, GoAxonAI, AxonMatch, AxonSearch, career AI, resume AI, tech jobs, AI resume builder, job match score, smart job search',
  ogImage = 'https://www.goaxonai.in/og-image.png',
  url = 'https://www.goaxonai.in',
  type = 'website',
  structuredData = null
}) => {
  const fullTitle = title.includes('GoAxonAI') ? title : `${title} | GoAxonAI`;

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
      <meta property="og:site_name" content="GoAxonAI" />
      
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
