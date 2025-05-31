// components/footer-game.tsx
'use client';

import React from 'react';

export const Footer = () => {
  return (
    // Outer footer takes full width and uses the background image
    <footer
      className="
        w-full
        mt-12t
        py-8 // Increased vertical padding for better visual space
        relative
        overflow-hidden // Ensures image doesn't spill out if it's larger than the footer
        flex items-center justify-center // Center content vertically and horizontally
        bg-yellow
      "
      style={{
        backgroundImage: "url('/animation/footer-game.jpg')", // Path to your background image
        backgroundSize: "1920px auto", // IMPORTANT CHANGE: Fixed width for the background image. Adjust '1920px' if your image has a different intrinsic width.
        backgroundPosition: "center", // Centers the visible part of the image within the footer
        backgroundRepeat: "no-repeat", // Prevents the image from tiling
        minHeight: "75px", // Minimum height for the footer
      }}
    >
    </footer>
  );
};