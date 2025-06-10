"use client";
import { useState } from "react";

import Image from "next/image";

import { LucideImageOff } from "lucide-react";

import Loading from "@/components/loading";


interface Row {
  original: {
    imageSrc: string | File | null; // Adjust the type based on your actual data structure
  };
}

export const ImageColumnHelper = ({ row }: { row: Row }) => {
  const imageSrc = row.original.imageSrc;
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);

  const src =
    typeof imageSrc === "string"
      ? imageSrc
      : imageSrc
        ? URL.createObjectURL(imageSrc)
        : "";

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded border">
        {!hasError && src ? (
          <>
            <Image
              src={src}
              alt="Preview"
              width={60}
              height={60}
              className="object-contain"
              onError={() => setHasError(true)}
              onLoadingComplete={() => setLoading(false)}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <Loading />
              </div>
            )}
          </>
        ) : (
          <LucideImageOff className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
    </div>
  );
};
