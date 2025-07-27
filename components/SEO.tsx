import Head from 'next/head'

export interface SEOProps {
  title: string
  description: string
  canonical?: string
  image?: string
  type?: 'website' | 'product' | 'profile' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  twitterHandle?: string
  siteName?: string
  noindex?: boolean
  nofollow?: boolean
}

export default function SEO({
  title,
  description,
  canonical,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags,
  twitterHandle = '@LikeThem',
  siteName = 'LikeThem',
  noindex = false,
  nofollow = false
}: SEOProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://likethem.com'
  const fullTitle = title.includes('LikeThem') ? title : `${title} | LikeThem`
  const fullUrl = canonical ? `${siteUrl}${canonical}` : undefined
  const fullImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : undefined

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={fullUrl} />}
      
      {/* Robots */}
      {(noindex || nofollow) && (
        <meta 
          name="robots" 
          content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`} 
        />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      {fullUrl && <meta property="og:url" content={fullUrl} />}
      {fullImage && <meta property="og:image" content={fullImage} />}
      {fullImage && <meta property="og:image:width" content="1200" />}
      {fullImage && <meta property="og:image:height" content="630" />}
      {fullImage && <meta property="og:image:alt" content={title} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      {section && <meta property="article:section" content={section} />}
      {tags && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {fullImage && <meta name="twitter:image" content={fullImage} />}
      {fullImage && <meta name="twitter:image:alt" content={title} />}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Structured Data */}
      {type === 'product' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: title,
              description: description,
              image: fullImage,
              url: fullUrl
            })
          }}
        />
      )}

      {type === 'profile' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: title,
              description: description,
              image: fullImage,
              url: fullUrl
            })
          }}
        />
      )}
    </Head>
  )
}

// Convenience components for specific use cases
export function ProductSEO({
  title,
  description,
  price,
  image,
  slug,
  curator,
  category,
  tags = []
}: {
  title: string
  description: string
  price: number
  image: string
  slug: string
  curator: string
  category: string
  tags?: string[]
}) {
  return (
    <SEO
      title={title}
      description={description}
      canonical={`/product/${slug}`}
      image={image}
      type="product"
      section={category}
      tags={[category, curator, ...tags]}
    />
  )
}

export function CuratorSEO({
  name,
  description,
  image,
  slug
}: {
  name: string
  description: string
  image?: string
  slug: string
}) {
  return (
    <SEO
      title={`${name} - Curator`}
      description={description}
      canonical={`/curator/${slug}`}
      image={image}
      type="profile"
      tags={['curator', 'fashion', 'style']}
    />
  )
}

export function PageSEO({
  title,
  description,
  path,
  image
}: {
  title: string
  description: string
  path: string
  image?: string
}) {
  return (
    <SEO
      title={title}
      description={description}
      canonical={path}
      image={image}
      type="website"
    />
  )
} 