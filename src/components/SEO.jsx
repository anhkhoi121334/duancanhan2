import { useEffect } from 'react';

const SEO = ({ 
  title = 'ANKH - Cửa hàng giày chính hãng',
  description = 'Cửa hàng giày thể thao chính hãng ANKH. Giày nam, giày nữ, giày thể thao, giày sneaker với nhiều mẫu mã đẹp, giá tốt, freeship toàn quốc.',
  keywords = 'giày thể thao, giày sneaker, giày nam, giày nữ, ANKH, giày chính hãng, mua giày online',
  image = `${window.location.origin}/logo-ankh.svg`,
  url = window.location.href,
  type = 'website'
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Primary Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph / Facebook
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', 'ANKH - Shoe Store', true);
    updateMetaTag('og:locale', 'vi_VN', true);

    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:url', url, true);
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url.split('?')[0]);

  }, [title, description, keywords, image, url, type]);

  return null;
};

export default SEO;

