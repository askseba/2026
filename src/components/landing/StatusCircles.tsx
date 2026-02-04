'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export function StatusCircles() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="flex items-center justify-center gap-2.5 ms-4"
    >
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" title="الخدمة متاحة" />
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500 dark:bg-yellow-400" title="تحديثات قادمة" />
      <Link href="/favorites" className="flex h-6 w-6 items-center justify-center p-0" aria-label="المفضلة / Favorites">
        <div className="flex h-6 w-6 items-center justify-center p-0 m-0 leading-none">
          <Heart className="h-[26px] w-[24px] -translate-y-[1px] fill-red-500 text-red-500 hover:fill-red-400" />
        </div>
      </Link>
    </motion.div>
  );
}
