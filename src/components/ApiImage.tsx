import { useState } from "react";
import { IMAGE_PLACEHOLDER, toProxiedImageUrl } from "../api/imageUrl";

interface ApiImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ApiImage({ src, alt, className }: ApiImageProps) {
  const [displaySrc, setDisplaySrc] = useState(
    src ? toProxiedImageUrl(src) : IMAGE_PLACEHOLDER,
  );

  return (
    <div className="relative w-full h-full overflow-hidden bg-(--card-image-bg)">
      <img
        src={displaySrc}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        onError={() => setDisplaySrc(IMAGE_PLACEHOLDER)}
      />
    </div>
  );
}
