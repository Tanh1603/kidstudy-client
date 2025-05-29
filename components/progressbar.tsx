import { motion } from 'framer-motion';
import Image from 'next/image'; // Assuming you are using Next.js

type ProgressBarProps = {
  current: number;
  total: number;
  // New props for image/GIF
  fillImageSrc?: string; // Optional URL for the image/GIF to fill the bar
  fillImageAlt?: string; // Alt text for the image/GIF
};

const ProgressBar = ({
  current,
  total,
  fillImageSrc = "/animation/default.svg", // Default image/GIF path
  fillImageAlt = "Progress fill"
}: ProgressBarProps) => {
  // Calculate the progress percentage
  const progressPercentage = (current / total) * 100;

  return (
    <div className="w-full max-w-2xl bg-gray-200 rounded-full h-4 mb-8 overflow-hidden shadow-inner relative">
      {/* The animated div that represents the filled portion of the progress bar */}
      <motion.div
        className="h-full rounded-full absolute top-0 left-0"
        initial={{ width: 0 }} // Start with 0 width
        animate={{ width: `${progressPercentage}%` }} // Animate to the calculated percentage width
        transition={{ duration: 0.5, ease: "easeInOut" }} // Smooth animation properties
        style={{ overflow: 'hidden' }} // Crucial: clips the image content to the current width
      >
        {/* Render the image/GIF if fillImageSrc is provided */}
        {fillImageSrc && (
          <Image
            src={fillImageSrc}
            alt={fillImageAlt}
            layout="fill" // Makes the image fill the parent motion.div
            objectFit="cover" // Ensures the image covers the area, potentially cropping it
            className="w-full h-full" // Explicitly ensure image takes 100% of its parent's width/height
          />
        )}
      </motion.div>
    </div>
  );
};

export default ProgressBar; // Don't forget to export your component