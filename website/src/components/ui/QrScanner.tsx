import { useEffect, useId, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { colors } from "@/lib/theme";

interface QrScannerProps {
  onScan: (data: string) => void;
  onError?: (message: string) => void;
}

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const elementId = useId().replace(/:/g, "");
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  const handledRef = useRef(false);

  onScanRef.current = onScan;
  onErrorRef.current = onError;

  useEffect(() => {
    handledRef.current = false;
    const scanner = new Html5Qrcode(elementId);
    let active = true;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (!active || handledRef.current) return;
          handledRef.current = true;
          onScanRef.current(decodedText);
        },
        () => {}
      )
      .catch((err: unknown) => {
        if (!active) return;
        const message =
          err instanceof Error ? err.message : "Could not access camera. Check permissions and try again.";
        onErrorRef.current?.(message);
      });

    return () => {
      active = false;
      scanner
        .stop()
        .catch(() => {})
        .finally(() => scanner.clear());
    };
  }, [elementId]);

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${colors.brownBorder}`,
        backgroundColor: colors.brownLight,
      }}
    >
      <div id={elementId} style={{ width: "100%", minHeight: 280 }} />
    </div>
  );
}
