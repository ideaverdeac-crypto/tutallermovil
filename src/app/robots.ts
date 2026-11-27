import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/aliados/',
          '/admin/',
          '/runner/',
          '/repuestos/',
          '/carnet/',
          '/cliente/',
          '/flotas/',
          '/api/',
          '/recuperar-password',
        ],
      },
    ],
    sitemap: 'https://tutallermovil.vercel.app/sitemap.xml',
  };
}
