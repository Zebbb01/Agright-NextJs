// src/components/ui/back-to-top-button.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Function to scroll to the top of the page
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Smooth scroll animation
    });
  }, []);

  // Function to toggle visibility based on scroll position
  const toggleVisibility = useCallback(() => {
    // Show button after scrolling 300px down (adjust as needed)
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [toggleVisibility]);

  // Define Framer Motion variants for the animation
  const buttonVariants = {
    hidden: { opacity: 0, y: 100, scale: 0.5 }, // Starts invisible, lower, and smaller
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, type: 'spring', damping: 15, stiffness: 300 } }, // Spring animation for appearance
    exit: { opacity: 0, y: 100, scale: 0.5, transition: { duration: 0.2 } }, // Fades out, moves down, and shrinks
  };

  return (
    // AnimatePresence enables exit animations when components are removed from the DOM
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="back-to-top-button" // Required for AnimatePresence to track the component
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={buttonVariants}
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
            aria-label="Scroll to top"
          >
            <ChevronUp size={24} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}