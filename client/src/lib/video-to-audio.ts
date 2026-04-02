type AudioRecorderProfile = {
  mimeType: string;
  extension: string;
};

type VideoCaptureElement = HTMLVideoElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

const AUDIO_PROFILES: AudioRecorderProfile[] = [
  { mimeType: "audio/webm;codecs=opus", extension: "webm" },
  { mimeType: "audio/webm", extension: "webm" },
  { mimeType: "audio/ogg;codecs=opus", extension: "ogg" },
  { mimeType: "audio/ogg", extension: "ogg" },
];

function waitForEvent<T extends Event>(target: EventTarget, eventName: string) {
  return new Promise<T>((resolve, reject) => {
    const onEvent = (event: Event) => {
      cleanup();
      resolve(event as T);
    };

    const onError = () => {
      cleanup();
      reject(new Error("Failed to load or play the selected video."));
    };

    const cleanup = () => {
      target.removeEventListener(eventName, onEvent);
      target.removeEventListener("error", onError);
    };

    target.addEventListener(eventName, onEvent, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

function pickAudioProfile() {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("This browser does not support audio recording.");
  }

  const profile = AUDIO_PROFILES.find((candidate) =>
    MediaRecorder.isTypeSupported(candidate.mimeType)
  );

  if (!profile) {
    throw new Error(
      "This browser cannot create a compatible audio file. Try Chrome, Edge, or Firefox."
    );
  }

  return profile;
}

function getCaptureStream(video: VideoCaptureElement) {
  const captureStream = video.captureStream || video.mozCaptureStream;

  if (!captureStream) {
    throw new Error(
      "This browser cannot capture audio from video files."
    );
  }

  return captureStream.call(video);
}

export async function extractAudioFromVideo(file: File) {
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

  let recorder: MediaRecorder | null = null;
  let recordingComplete: Promise<Blob> | null = null;

  try {
    await waitForEvent(video, "loadedmetadata");

    const captureStream = getCaptureStream(video);
    const audioTracks = captureStream.getAudioTracks();

    if (audioTracks.length === 0) {
      throw new Error("No audio track was found in this video.");
    }

    const audioProfile = pickAudioProfile();
    const audioStream = new MediaStream(audioTracks);
    const chunks: BlobPart[] = [];

    recorder = new MediaRecorder(audioStream, {
      mimeType: audioProfile.mimeType,
    });

    recordingComplete = new Promise<Blob>((resolve, reject) => {
      recorder!.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder!.onstop = () => {
        resolve(
          new Blob(chunks, {
            type: recorder?.mimeType || audioProfile.mimeType,
          })
        );
      };

      recorder!.onerror = () => {
        reject(new Error("Audio extraction failed while recording."));
      };
    });

    recorder.start(1000);

    const playback = video.play();
    if (playback) {
      await playback;
    }

    await waitForEvent(video, "ended");
    recorder.stop();

    const blob = await recordingComplete;
    return {
      blob,
      extension: audioProfile.extension,
    };
  } catch (error) {
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        // Ignore stop errors during cleanup.
      }
    }

    if (recordingComplete) {
      void recordingComplete.catch(() => {});
    }

    throw error;
  } finally {
    URL.revokeObjectURL(objectUrl);
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.remove();
  }
}
