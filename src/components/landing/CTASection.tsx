// ✅ CTA Section - Fixed Mobile Width
// components/landing/CTASection.tsx

'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from 'next-themes';

export function CTASection() {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const shadowBreathing = isDark
    ? [
        '0 4px 20px rgba(120, 53, 15, 0.4)',
        '0 6px 30px rgba(120, 53, 15, 0.6)',
        '0 4px 20px rgba(120, 53, 15, 0.4)',
      ]
    : [
        '0 4px 20px rgba(179, 157, 125, 0.4)',
        '0 6px 30px rgba(179, 157, 125, 0.6)',
        '0 4px 20px rgba(179, 157, 125, 0.4)',
      ];
  const shadowHover = isDark
    ? '0 8px 30px rgba(120, 53, 15, 0.5)'
    : '0 8px 30px rgba(179, 157, 125, 0.5)';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsClicked(true);
    
    // ✅ Ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
      router.push('/quiz');
    }, 300);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.4,
            type: 'spring' 
          }}
          className="opacity-100 flex justify-center"
        >
          <motion.button
            onClick={handleClick}
            disabled={isClicked}
            className="landing-cta-quiz group relative w-[90%] max-w-[300px] overflow-hidden rounded-full bg-gradient-to-r from-gold to-gold-dark dark:from-amber-600 dark:to-amber-800 px-12 py-[18px] text-lg font-semibold text-white shadow-lg dark:shadow-amber-900/30 transition-all duration-300 disabled:opacity-70 md:w-auto"
            
            // ✅ Breathing animation (theme-aware shadows)
            animate={{
              boxShadow: shadowBreathing,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            
            // ✅ Hover state
            whileHover={{ 
              scale: 1.05,
              y: -3,
              boxShadow: shadowHover,
              transition: { duration: 0.2 }
            }}
            
            // ✅ Tap state
            whileTap={{ scale: 0.95 }}
          >
            {/* Shimmer effect */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            
            {/* Button text - white for max contrast on gold/amber gradient */}
            <span className="relative z-10 text-3xl md:text-4xl text-white font-bold">
              {isClicked ? 'جاري التحميل...' : 'ابدأ الرحلة'}
            </span>
          </motion.button>
        </motion.div>
      </div>
      
      {/* ✅ CSS animation for ripple */}
      <style jsx>{`
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
