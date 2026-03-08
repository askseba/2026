// ✅ HeroSection - Enhanced Golden Dust Particles
// components/landing/HeroSection.tsx

'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

type ParticlePos = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  size: number;
  blurAmount: number;
  delay: number;
  color: string;
};

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<ParticlePos[]>([]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const w = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const h = typeof window !== 'undefined' ? window.innerHeight : 1080;

    // صغيرة (8): لمعات ذهبية واضحة
    const small = [...Array(8)].map((_, i) => ({
      startX: Math.random() * w,
      startY: Math.random() * h,
      endX: Math.random() * w,
      endY: Math.random() * h,
      duration: 14 + Math.random() * 10,
      size: 6,
      blurAmount: 0.5,
      delay: Math.random() * 5,
      color: 'rgba(179, 157, 125, 0.5)',
    }));

    // متوسطة (4): دوائر ناعمة تعطي عمق
    const medium = [...Array(4)].map((_, i) => ({
      startX: Math.random() * w,
      startY: Math.random() * h,
      endX: Math.random() * w,
      endY: Math.random() * h,
      duration: 20 + Math.random() * 12,
      size: 12,
      blurAmount: 1,
      delay: Math.random() * 8,
      color: 'rgba(179, 157, 125, 0.35)',
    }));

    // كبيرة (3): ضبابية — تأثير bokeh فاخر
    const large = [...Array(3)].map((_, i) => ({
      startX: Math.random() * w,
      startY: Math.random() * h,
      endX: Math.random() * w,
      endY: Math.random() * h,
      duration: 25 + Math.random() * 15,
      size: 20,
      blurAmount: 4,
      delay: Math.random() * 10,
      color: 'rgba(179, 157, 125, 0.2)',
    }));

    setParticles([...small, ...medium, ...large]);
  }, [mounted]);

  return (
    <section className="relative overflow-hidden pb-12 bg-gradient-to-br from-cream via-cream to-cream/95 dark:from-surface dark:via-surface-elevated dark:to-background">
      
      {/* ✅ Ambient light */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-radial from-gold/15 via-gold/5 to-transparent dark:from-amber-500/10 dark:via-amber-500/5 dark:to-transparent blur-3xl" />
      </div>

      {/* ✅ Golden dust — انتشار حر في كل الفضاء */}
      <div
        className={`pointer-events-none absolute inset-0 z-[1] transition-opacity duration-700 ${mounted && particles.length ? 'opacity-100' : 'opacity-0'}`}
      >
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              filter: `blur(${p.blurAmount}px)`,
              backgroundColor: p.color,
            }}
            initial={{ x: p.startX, y: p.startY, opacity: 0 }}
            animate={{
              x: [p.startX, p.endX, p.startX],
              y: [p.startY, p.endY, p.startY],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay,
              opacity: {
                duration: p.duration,
                times: [0, 0.1, 0.4, 0.9, 1],
                repeat: Infinity,
                ease: 'easeInOut',
                delay: p.delay,
              },
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-6">
        
        <h1 className="sr-only">Ask Seba</h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="pt-6 text-center bg-transparent"
        >
          <div className="isolate overflow-hidden rounded-2xl bg-cream p-2 md:p-4 inline-block mx-auto mb-8 md:mb-10 shadow-soft drop-shadow-lg dark:bg-surface/80">
            <Image
              src="/ask_logo.png"
              alt="Ask Seba"
              width={280}
              height={72}
              priority
              className="mx-auto h-20 md:h-24 lg:h-28 w-auto object-contain bg-transparent"
              style={{ background: "transparent" }}
            />
          </div>
        </motion.div>

        {/* ✅ Perfume - Interactive 3D effect */}
        <motion.div
          className="relative mx-auto mt-6 flex w-full max-w-[280px] min-h-[400px] aspect-[280/400] justify-center"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left - rect.width / 2);
            mouseY.set(e.clientY - rect.top - rect.height / 2);
          }}
          onMouseLeave={() => {
            mouseX.set(0);
            mouseY.set(0);
          }}
        >
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            whileHover={{ scale: 1.05 }}
            className="relative cursor-pointer"
          >
            <Image
              src="/perfume_transparent.webp"
              alt="Perfume Bottle"
              width={280}
              height={400}
              priority={true}
              fetchPriority="high"
              sizes="(max-width: 768px) 280px, 400px"
              className="drop-shadow-[0_20px_40px_rgba(91,66,51,0.3)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
            />
            
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full bg-gradient-radial from-gold/20 dark:from-amber-500/15 to-transparent opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
