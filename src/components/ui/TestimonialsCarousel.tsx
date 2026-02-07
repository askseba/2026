'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Quote } from 'lucide-react'

interface Testimonial {
  quote: string
  author: string
  city: string
}

interface TestimonialsCarouselProps {
  testimonials?: Testimonial[]
  className?: string
}

export function TestimonialsCarousel({ 
  testimonials = [],
  className = '' 
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (testimonials.length === 0) return null

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className={`relative ${className}`} dir="rtl">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg rounded-3xl p-8 md:p-10 border border-brown-text/20 dark:border-slate-600/40"
          >
            {/* Quote Icon */}
            <Quote className="w-8 h-8 text-primary mb-6" />

            {/* Quote Text */}
            <p className="text-lg md:text-xl text-brown-text mb-6 leading-relaxed text-start">
              {testimonials[currentIndex].quote}
            </p>

            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-brown-text">
                  {testimonials[currentIndex].author}
                </div>
                <div className="text-sm text-brown-text/70">
                  {testimonials[currentIndex].city}
                </div>
              </div>

              {/* Stars Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl text-primary">⭐</span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Previous Button */}
        <button
          onClick={prevTestimonial}
          className="w-12 h-12 rounded-full bg-white/90 border border-brown-text/20 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all touch-manipulation"
          aria-label="الشهادة السابقة"
        >
          <ChevronRight className="w-5 h-5 text-brown-text rtl:rotate-180" />
        </button>

        {/* Dots Indicator */}
        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'bg-brown-text/30 hover:bg-brown-text/50'
              }`}
              aria-label={`انتقل إلى الشهادة ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextTestimonial}
          className="w-12 h-12 rounded-full bg-white/90 border border-brown-text/20 flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all touch-manipulation"
          aria-label="الشهادة التالية"
        >
          <ChevronLeft className="w-5 h-5 text-brown-text rtl:rotate-180" />
        </button>
      </div>
    </div>
  )
}

export default TestimonialsCarousel
