// ✅ Questions Section - Fixed Mobile Width
// components/landing/QuestionsSection.tsx

'use client';

import { motion, Variants } from 'framer-motion';
import { useTranslations } from 'next-intl';

// ✅ Animation variants - reusable
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

export function QuestionsSection() {
  const t = useTranslations('home.questions');
  const items = t.raw('items') as string[];

  return (
    <section className="py-6">
      <div className="container mx-auto px-6">
        
        {/* ✅ Staggered animations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="flex flex-col items-center gap-6"
        >
          {items.map((question, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                transition: { type: 'spring', stiffness: 300 }
              }}
              className="group relative w-full max-w-[min(90%,600px)] mx-auto cursor-pointer overflow-hidden rounded-2xl border border-gold/20 bg-white/70 dark:bg-slate-800/80 px-8 py-5 text-center shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-xl"
            >
              {/* ✅ Shimmer effect */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              
              {/* Question text */}
              <p className="relative z-10 text-[15px] font-medium text-dark-brown md:text-[21px]">
                {question}
              </p>

              {/* ✅ Border glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 ring-2 ring-gold/50 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
