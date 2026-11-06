import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";

export function useQrScanner(
  active: boolean,
  onQrData: (data: string) => boolean
) {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const videoRef = (element: HTMLVideoElement | null) => {
    setVideoElement(element);
  };

  const onQrDataRef = useRef(onQrData);
  onQrDataRef.current = onQrData;

  useEffect(() => {
    if (!active || !videoElement) return;
    let cancelled = false;
    let controls: IScannerControls | undefined;
    const reader = new BrowserQRCodeReader();
    setError("");
    setStarting(true);

    reader
      .decodeFromVideoDevice(
        undefined,
        videoElement,
        (result, _error, callbackControls) => {
          if (cancelled) {
            callbackControls.stop();
            return;
          }
          if (!result) return;
          const isScanned = onQrDataRef.current(result.getText());
          if (isScanned) {
            cancelled = true;
            callbackControls.stop();
          }
        }
      )
      .then((result) => {
        controls = result;
        if (cancelled) result.stop();
        else setStarting(false);
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
      controls?.stop();
    };
  }, [active, videoElement]);

  return { videoRef, error, starting };
}
