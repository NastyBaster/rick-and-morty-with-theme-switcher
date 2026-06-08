import { useEffect, useRef, useState } from "react";
import { fetchImageBlob } from "../api/client";
import { IMAGE_PLACEHOLDER, toProxiedImageUrl } from "../api/imageUrl";

interface ApiImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ApiImage({ src, alt, className }: ApiImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displaySrc, setDisplaySrc] = useState(IMAGE_PLACEHOLDER);
  const [isLoading, setIsLoading] = useState(true);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !src) return;

    const controller = new AbortController();
    let visible = false;
    setIsLoading(true);

    const loadImage = async () => {
      try {
        const proxiedUrl = toProxiedImageUrl(src);
        const blob = await fetchImageBlob(proxiedUrl, controller.signal);
        if (controller.signal.aborted) return;

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }

        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        setDisplaySrc(objectUrl);
        setIsLoading(false);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setDisplaySrc(IMAGE_PLACEHOLDER);
        setIsLoading(false);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          visible = true;
          observer.disconnect();
          void loadImage();
        }
      },
      { rootMargin: "80px" },
    );

    observer.observe(container);

    return () => {
      controller.abort();
      observer.disconnect();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-(--card-image-bg)"
    >
      <img
        src={displaySrc}
        alt={alt}
        className={className}
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setDisplaySrc(IMAGE_PLACEHOLDER);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-(--card-image-bg)/80">
          <div className="loader scale-50" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
