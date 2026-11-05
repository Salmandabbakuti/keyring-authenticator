import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

export function useQrScanner(
  active: boolean,
  onScan: (value: string) => boolean
) {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );
  const videoRef = (element: HTMLVideoElement | null) => {
    setVideoElement(element);
  };
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!active || !videoElement) return;

    let cancelled = false;
    const scanner: QrScanner = new QrScanner(
      videoElement,
      (result) => {
        if (cancelled) return;

        if (onScanRef.current(result.data)) {
          cancelled = true;
          scanner.stop();
        }
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        // onDecodeError: (error) => setError(error),
        returnDetailedScanResult: true
      }
    );

    setError("");
    setStarting(true);

    scanner
      .start()
      .then(() => {
        if (!cancelled) setStarting(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Camera unavailable. Allow camera access or enter the setup key manually."
          );
          setStarting(false);
        }
      });

    return () => {
      cancelled = true;
      scanner.destroy();
    };
  }, [active, videoElement]);

  return { videoRef, error, starting };
}
