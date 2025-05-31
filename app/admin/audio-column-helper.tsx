import { useState } from "react";
import { XIcon } from "lucide-react";
import Loading from "@/components/loading";

export const AudioColumnHelper = ({ row }: { row: any }) => {
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioSrc = row.original?.audioSrc;

  if (!audioSrc || hasError) {
    return (
      <div className="flex items-center justify-center text-muted-foreground">
        <XIcon className="mr-1 h-5 w-5" />
        <span>No Audio</span>
      </div>
    );
  }

  const src =
    typeof audioSrc === "string" ? audioSrc : URL.createObjectURL(audioSrc);

  return (
    <div className="flex items-center justify-center">
      {loading && <Loading />}
      <audio
        controls
        src={src}
        className={`max-w-full ${loading ? "hidden" : ""}`}
        onLoadedData={() => setLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  );
};
