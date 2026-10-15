import { useEffect, useRef, useState } from "react";
import shaka from "shaka-player";

type PlaybackData = {
  playbackId: string;
  playbackToken: string;
  drmToken: string;
  url?: string;
  signedUrl?: string;
  watermarkText?: string;
};

interface ProtectedLessonPlayerProps {
  lessonId: string;
}

export default function ProtectedLessonPlayer({ lessonId }: ProtectedLessonPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Loading authorization...");
  const [watermark, setWatermark] = useState("");

  useEffect(() => {
    let player: shaka.Player | undefined;
    let cancelled = false;

    async function initialize() {
      try {
        const response = await fetch(
          `/api/lessons/${encodeURIComponent(lessonId)}/playback`,
          { credentials: "include" }
        );

        if (!response.ok) {
          // Fallback to /play if /playback isn't matched
          const fallbackRes = await fetch(
            `/api/lessons/${encodeURIComponent(lessonId)}/play`,
            { credentials: "include" }
          );
          if (!fallbackRes.ok) {
            throw new Error("You are not authorized to view this lesson.");
          }
          const fallbackData = await fallbackRes.json();
          if (cancelled || !videoRef.current) return;
          if (fallbackData.watermarkText) setWatermark(fallbackData.watermarkText);

          // If direct MP4 signed URL is returned, load it directly into video element
          const directUrl = fallbackData.url || fallbackData.signedUrl;
          if (directUrl) {
            videoRef.current.src = directUrl;
            setStatus("");
            return;
          }
        }

        const data: PlaybackData = await response.json();
        if (cancelled || !videoRef.current) return;
        if (data.watermarkText) setWatermark(data.watermarkText);

        if (data.url || data.signedUrl) {
          videoRef.current.src = data.url || data.signedUrl || '';
          setStatus("");
          return;
        }

        shaka.polyfill.installAll();

        if (!shaka.Player.isBrowserSupported()) {
          throw new Error("This browser does not support this player.");
        }

        player = new shaka.Player(videoRef.current);

        if (data.drmToken) {
          player.configure({
            drm: {
              servers: {
                "com.widevine.alpha": `https://license.mux.com/license/widevine/${data.playbackId}?token=${encodeURIComponent(data.drmToken)}`,
                "com.microsoft.playready": `https://license.mux.com/license/playready/${data.playbackId}?token=${encodeURIComponent(data.drmToken)}`,
              },
            },
          });
        }

        player.addEventListener("error", (event: unknown) => {
          console.error("Shaka playback error:", event);
          setStatus("Playback failed. Please refresh and try again.");
        });

        const manifestUrl = `https://stream.mux.com/${data.playbackId}.m3u8?token=${encodeURIComponent(data.playbackToken)}`;
        await player.load(manifestUrl);

        if (!cancelled) setStatus("");
      } catch (error) {
        if (!cancelled) {
          setStatus(
            error instanceof Error
              ? error.message
              : "Unable to load the lesson."
          );
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
      if (player) void player.destroy();
    };
  }, [lessonId]);

  return (
    <div className="protected-player" style={{ position: 'relative', width: '100%', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        controls
        playsInline
        autoPlay
        preload="metadata"
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        style={{
          display: "block",
          width: "100%",
          background: "#000",
          aspectRatio: "16 / 9",
        }}
        onContextMenu={e => e.preventDefault()}
      />

      {watermark && (
        <div className="watermark-overlay" style={{ background: 'rgba(0,0,0,0.65)', color: '#fca5a5', fontWeight: 'bold' }}>
          PROTECTED | {watermark}
        </div>
      )}

      {status && (
        <div role="status" style={{ padding: '20px', textAlign: 'center', color: '#fff', background: 'rgba(0,0,0,0.8)', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {status}
        </div>
      )}
    </div>
  );
}
