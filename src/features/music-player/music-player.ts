const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

const players = document.querySelectorAll<HTMLElement>("[data-music-player]");

players.forEach((player) => {
  const audio = player.querySelector<HTMLAudioElement>("[data-audio-player]");
  const playButton = player.querySelector<HTMLButtonElement>("[data-audio-play]");
  const playIcon = playButton?.querySelector<HTMLElement>("[data-audio-icon]");
  const progress = player.querySelector<HTMLInputElement>("[data-audio-progress]");
  const currentTimeLabel = player.querySelector<HTMLElement>("[data-current-time]");
  const totalTimeLabel = player.querySelector<HTMLElement>("[data-total-time]");

  if (!audio || !playButton || !progress || !currentTimeLabel || !totalTimeLabel) {
    return;
  }

  let pendingPlayStartTime: number | null = null;

  const syncProgress = () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

    progress.value = String(percent);
    currentTimeLabel.textContent = formatTime(currentTime);
    totalTimeLabel.textContent = formatTime(duration);
  };

  const setControlState = (state: "paused" | "loading" | "playing") => {
    playButton.dataset.state = state;
    playButton.setAttribute("aria-busy", String(state === "loading"));
    progress.disabled = state === "loading";

    if (state === "playing") {
      playButton.setAttribute("aria-label", "Pause song");
    } else if (state === "loading") {
      playButton.setAttribute("aria-label", "Loading song");
    } else {
      playButton.setAttribute("aria-label", "Play song");
    }

    if (playIcon) {
      playIcon.textContent = state === "playing" ? "❚❚" : "▶";
    }
  };

  playButton.addEventListener("click", async () => {
    if (playButton.dataset.state === "loading") {
      return;
    }

    if (audio.paused) {
      pendingPlayStartTime = audio.currentTime;
      setControlState("loading");

      try {
        await waitForPaint();
        await audio.play();
      } catch {
        setControlState("paused");
      }
      return;
    }

    audio.pause();
  });

  progress.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }

    const percent = Number(progress.value) / 100;
    audio.currentTime = percent * audio.duration;
    syncProgress();
  });

  audio.addEventListener("loadedmetadata", syncProgress);
  audio.addEventListener("timeupdate", () => {
    syncProgress();

    if (
      pendingPlayStartTime !== null &&
      audio.currentTime > pendingPlayStartTime + 0.05
    ) {
      pendingPlayStartTime = null;
      setControlState("playing");
    }
  });
  audio.addEventListener("pause", () => {
    pendingPlayStartTime = null;
    setControlState("paused");
  });
  audio.addEventListener("error", () => {
    pendingPlayStartTime = null;
    setControlState("paused");
  });
  audio.addEventListener("ended", () => {
    pendingPlayStartTime = null;
    audio.currentTime = 0;
    syncProgress();
    setControlState("paused");
  });

  setControlState("paused");
  syncProgress();
});
