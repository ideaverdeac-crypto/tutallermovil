'use client';

import { Suspense, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

function PageTransitionInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex-1 flex flex-col w-full"
    >
      {children}
    </motion.div>
  );
}

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex-1 flex flex-col w-full">{children}</div>}>
      <PageTransitionInner>{children}</PageTransitionInner>
    </Suspense>
  );
}
