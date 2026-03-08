import { MetadataRoute } from 'next'
import { perfumes } from '@/lib/data/perfumes'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://askseba.com'
  const now = new Date()
  
  // الصفحات الثابتة
  const staticPages = [
    '',
    '/about',
    '/faq',
    '/privacy',
    '/pricing',
    '/quiz/step1-favorites',
    '/dashboard',
    '/profile',
    '/settings',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))
  
  // صفحات العطور الديناميكية
  const perfumePages = perfumes.map((perfume) => ({
    url: `${baseUrl}/perfume/${perfume.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  return [...staticPages, ...perfumePages]
}
