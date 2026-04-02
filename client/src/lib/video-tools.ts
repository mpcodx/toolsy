type VideoRecorderProfile = {
  mimeType: string;
  extension: string;
};

type VideoCaptureElement = HTMLVideoElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

export type VideoFrameCapture = {
  blob: Blob;
  filename: string;
  time: number;
};

export type VideoMetadata = {
  duration: number;
  width: number;
  height: number;
};

export type VideoFrameOptions = {
  startTime?: number;
  endTime?: number;
  intervalSeconds?: number;
  maxFrames?: number;
  mimeType?: "image/png" | "image/jpeg" | "image/webp";
  quality?: number;
};

export type VideoClipOptions = {
  startTime: number;
  endTime: number;
};

export const SUPPORTED_VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
]);

const VIDEO_RECORDING_PROFILES: VideoRecorderProfile[] = [
  { mimeType: "video/webm;codecs=vp9,opus", extension: "webm" },
  { mimeType: "video/webm;codecs=vp8,opus", extension: "webm" },
  { mimeType: "video/webm", extension: "webm" },
];

function waitForEvent<T extends Event>(target: EventTarget, eventName: string) {
  return new Promise<T>((resolve, reject) => {
    const onEvent = (event: Event) => {
      cleanup();
      resolve(event as T);
    };

    const onError = () => {
      cleanup();
      reject(new Error("Failed to load or process the selected video."));
    };

    const cleanup = () => {
      target.removeEventListener(eventName, onEvent);
      target.removeEventListener("error", onError);
    };

    target.addEventListener(eventName, onEvent, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getCaptureStream(video: VideoCaptureElement) {
  const captureStream = video.captureStream || video.mozCaptureStream;

  if (!captureStream) {
    throw new Error("This browser cannot capture frames from video files.");
  }

  return captureStream.call(video);
}

function pickRecorderProfile() {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("This browser does not support video recording.");
  }

  const profile = VIDEO_RECORDING_PROFILES.find((candidate) =>
    MediaRecorder.isTypeSupported(candidate.mimeType)
  );

  if (!profile) {
    throw new Error(
      "This browser cannot create a compatible video file. Try Chrome, Edge, or Firefox."
    );
  }

  return profile;
}

function createHiddenVideoElement(file: File) {
  const video = document.createElement("video") as VideoCaptureElement;
  const objectUrl = URL.createObjectURL(file);

  video.src = objectUrl;
  video.preload = "auto";
  video.playsInline = true;
  video.muted = true;
  video.volume = 0;
  video.style.position = "fixed";
  video.style.left = "-9999px";
  video.style.top = "-9999px";
  video.style.width = "1px";
  video.style.height = "1px";
  video.style.opacity = "0";
  video.style.pointerEvents = "none";

  document.body.appendChild(video);

  const cleanup = () => {
    URL.revokeObjectURL(objectUrl);
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.remove();
  };

  return { video, cleanup };
}

async function waitForSeek(video: HTMLVideoElement, time: number) {
  return new Promise<void>((resolve, reject) => {
    const targetTime = Math.max(0, time);

    const onSeeked = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error("Failed to seek within the selected video."));
    };

    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };

    if (Math.abs(video.currentTime - targetTime) < 0.001) {
      resolve();
      return;
    }

    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.currentTime = targetTime;
  });
}

async function captureFrameBlob(
  video: HTMLVideoElement,
  mimeType: "image/png" | "image/jpeg" | "image/webp" = "image/png",
  quality = 0.92
) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  if (canvas.width <= 0 || canvas.height <= 0) {
    throw new Error("The selected video does not have a readable frame size.");
  }

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create a canvas for video frame extraction.");
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }

        reject(new Error("Could not render a frame from the selected video."));
      },
      mimeType,
      mimeType === "image/png" ? undefined : quality
    );
  });

  return blob;
}

export function isSupportedVideoFile(file: File) {
  return (
    SUPPORTED_VIDEO_MIME_TYPES.has(file.type) ||
    /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(file.name)
  );
}

export async function loadVideoMetadata(file: File): Promise<VideoMetadata> {
  const { video, cleanup } = createHiddenVideoElement(file);

  try {
    await waitForEvent(video, "loadedmetadata");

    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("Could not read the selected video duration.");
    }

    return {
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    };
  } finally {
    cleanup();
  }
}

export async function captureVideoThumbnail(
  file: File,
  timestampSeconds: number,
  options: Pick<VideoFrameOptions, "mimeType" | "quality"> = {}
) {
  const { video, cleanup } = createHiddenVideoElement(file);

  try {
    await waitForEvent(video, "loadedmetadata");

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const targetTime = clamp(timestampSeconds, 0, Math.max(0, duration - 0.05));

    await waitForSeek(video, targetTime);

    const blob = await captureFrameBlob(
      video,
      options.mimeType ?? "image/png",
      options.quality ?? 0.92
    );

    return {
      blob,
      time: targetTime,
    };
  } finally {
    cleanup();
  }
}

export async function captureVideoFrames(
  file: File,
  options: VideoFrameOptions = {}
) {
  const { video, cleanup } = createHiddenVideoElement(file);

  try {
    await waitForEvent(video, "loadedmetadata");

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const startTime = clamp(options.startTime ?? 0, 0, Math.max(0, duration));
    const endTime = clamp(
      options.endTime ?? duration,
      startTime,
      Math.max(startTime, duration)
    );
    const intervalSeconds = Math.max(0.1, options.intervalSeconds ?? 1);
    const maxFrames = Math.max(1, Math.floor(options.maxFrames ?? 120));

    const frameTimes: number[] = [];
    for (let time = startTime; time <= endTime + 0.0001; time += intervalSeconds) {
      frameTimes.push(Number(Math.min(time, endTime).toFixed(3)));
      if (frameTimes.length >= maxFrames) {
        break;
      }
    }

    if (frameTimes.length === 0) {
      throw new Error("No frames were selected for export.");
    }

    if (frameTimes.length >= maxFrames && endTime - startTime > intervalSeconds * maxFrames) {
      throw new Error(`Too many frames selected. Increase the interval or shorten the range.`);
    }

    const frames: VideoFrameCapture[] = [];

    for (let index = 0; index < frameTimes.length; index += 1) {
      const time = frameTimes[index];
      await waitForSeek(video, clamp(time, 0, Math.max(0, duration - 0.05)));
      const blob = await captureFrameBlob(
        video,
        options.mimeType ?? "image/png",
        options.quality ?? 0.92
      );

      const extension = (options.mimeType ?? "image/png").split("/")[1] || "png";
      frames.push({
        blob,
        time,
        filename: `frame-${String(index + 1).padStart(4, "0")}.${extension === "jpeg" ? "jpg" : extension}`,
      });
    }

    return {
      frames,
      duration,
      startTime,
      endTime,
      intervalSeconds,
    };
  } finally {
    cleanup();
  }
}

export async function recordVideoClip(file: File, options: VideoClipOptions) {
  const { video, cleanup } = createHiddenVideoElement(file);

  try {
    await waitForEvent(video, "loadedmetadata");

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const startTime = clamp(options.startTime, 0, Math.max(0, duration - 0.05));
    const endTime = clamp(options.endTime, startTime + 0.1, duration);

    await waitForSeek(video, startTime);

    const captureStream = getCaptureStream(video);
    const profile = pickRecorderProfile();
    const recorder = new MediaRecorder(captureStream, {
      mimeType: profile.mimeType,
    });

    const chunks: BlobPart[] = [];
    const recordingComplete = new Promise<Blob>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        resolve(
          new Blob(chunks, {
            type: recorder.mimeType || profile.mimeType,
          })
        );
      };

      recorder.onerror = () => {
        reject(new Error("Video clipping failed while recording."));
      };
    });

    const stopOnBoundary = () => {
      if (video.currentTime >= endTime) {
        video.pause();
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      }
    };

    video.addEventListener("timeupdate", stopOnBoundary);

    try {
      recorder.start(1000);

      const playback = video.play();
      if (playback) {
        await playback;
      }

      const result = await recordingComplete;
      return {
        blob: result,
        extension: profile.extension,
        startTime,
        endTime,
      };
    } finally {
      video.removeEventListener("timeupdate", stopOnBoundary);
      if (recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          // Ignore stop errors during cleanup.
        }
      }
    }
  } finally {
    cleanup();
  }
}
