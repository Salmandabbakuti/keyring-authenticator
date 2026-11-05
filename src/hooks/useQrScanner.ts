import { useEffect, useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  type IScannerControls
} from "@zxing/browser";

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
    let controls: IScannerControls | undefined;
    const reader = new BrowserMultiFormatReader();

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

          if (onScanRef.current(result.getText())) {
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
