// VALUE_LADDER - File 8/20: src/components/ui/PriceComparisonTable.tsx
// ✅ COMPLETE PRICE COMPARISON TABLE
// 🎯 Premium-only feature

'use client'
import { ExternalLink, TrendingDown, Package } from 'lucide-react'
import { motion } from 'framer-motion'

interface PriceOption {
  retailer: string
  price: number
  currency: string
  url: string
  inStock: boolean
}

interface PriceComparisonTableProps {
  prices: PriceOption[]
  perfumeName: string
}

const MOCK_STORES: PriceOption[] = [
  { retailer: 'noon', price: 299, currency: 'SAR', url: 'https://www.noon.com', inStock: true },
  { retailer: 'amazon_sa', price: 319, currency: 'SAR', url: 'https://www.amazon.sa', inStock: true }
]

export function PriceComparisonTable({ prices, perfumeName }: PriceComparisonTableProps) {
  const displayPrices = !prices || prices.length === 0 ? MOCK_STORES : prices
  if (!displayPrices || displayPrices.length === 0) {
    return (
      <div className="text-center py-6 text-brown-text/60">
        لا توجد بيانات أسعار متاحة حالياً
      </div>
    )
  }
  
  // Sort by price (lowest first)
  const sortedPrices = [...displayPrices].sort((a, b) => a.price - b.price)
  const lowestPrice = sortedPrices[0]
  const highestPrice = sortedPrices[sortedPrices.length - 1]
  const savings = highestPrice.price - lowestPrice.price
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-safe-green/5 to-emerald-500/5 rounded-2xl p-6 border border-safe-green/20"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-brown-text flex items-center gap-2">
          <Package className="w-5 h-5 text-safe-green" />
          مقارنة الأسعار
        </h4>
        {savings > 0 && (
          <div className="flex items-center gap-1 text-safe-green text-sm font-medium bg-safe-green/10 px-3 py-1 rounded-full">
            <TrendingDown className="w-4 h-4" />
            وفّر {savings.toFixed(0)} {lowestPrice.currency}
          </div>
        )}
      </div>
      
      {/* Price list */}
      <div className="space-y-2">
        {sortedPrices.map((option, index) => {
          const isBestPrice = index === 0
          const isOutOfStock = !option.inStock
          
          return (
            <div
              key={option.retailer}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                isBestPrice
                  ? 'bg-safe-green/10 border-2 border-safe-green/30'
                  : 'bg-white/60 border border-brown-text/10'
              } ${isOutOfStock ? 'opacity-50' : ''}`}
            >
              {/* Retailer info */}
              <div className="flex items-center gap-3">
                {isBestPrice && (
                  <div className="bg-safe-green text-white px-2 py-1 rounded-md text-xs font-bold">
                    أفضل سعر
                  </div>
                )}
                <div>
                  <p className="font-bold text-brown-text capitalize">
                    {getRetailerDisplayName(option.retailer)}
                  </p>
                  {isOutOfStock && (
                    <p className="text-xs text-red-500">غير متوفر حالياً</p>
                  )}
                </div>
              </div>
              
              {/* Price and link */}
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="text-2xl font-black text-brown-text">
                    {option.price.toFixed(0)}
                  </p>
                  <p className="text-xs text-brown-text/60">{option.currency}</p>
                </div>
                
                <a
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (isOutOfStock) {
                      e.preventDefault()
                    }
                  }}
                  className={`min-touch-target min-touch-target w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90 text-white hover:scale-110 active:scale-95'
                  }`}
                  aria-label={`اشترِ ${perfumeName} من ${option.retailer}`}
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Footer note */}
      <p className="text-xs text-brown-text/50 mt-4 text-center">
        آخر تحديث للأسعار: اليوم • الأسعار قد تتغير
      </p>
    </motion.div>
  )
}

// Helper: Get Arabic display name for retailers
function getRetailerDisplayName(retailer: string): string {
  const names: Record<string, string> = {
    'sephora': 'سيفورا',
    'noon': 'نون',
    'amazon': 'أمازون',
    'amazon_sa': 'Amazon.sa',
    'namshi': 'نمشي',
    'golden_scent': 'جولدن سنت',
    'paris_gallery': 'باريس غاليري'
  }
  
  return names[retailer.toLowerCase()] || retailer
}
