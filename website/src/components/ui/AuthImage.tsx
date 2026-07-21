import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AuthImageProps {
  path: string;
  secret: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function AuthImage({ path, secret, alt = "", style, className }: AuthImageProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    api
      .fetchProtectedMedia(path, secret)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path, secret]);

  if (!src) {
    return (
      <div
        className={className}
        style={{
          backgroundColor: "rgba(26,18,9,0.08)",
          ...style,
        }}
      />
    );
  }

  return <img src={src} alt={alt} style={style} className={className} />;
}

interface AuthVideoProps {
  path: string;
  secret: string;
  style?: React.CSSProperties;
}

export function AuthVideo({ path, secret, style }: AuthVideoProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    api
      .fetchProtectedMedia(path, secret)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path, secret]);

  if (!src) return null;
  return <video src={src} controls style={style} />;
}
