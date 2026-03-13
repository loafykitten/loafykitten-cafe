const audio = document.querySelector("[data-audio-player]");
const playButton = document.querySelector("[data-audio-play]");
const progress = document.querySelector("[data-audio-progress]");
const currentTimeLabel = document.querySelector("[data-current-time]");
const totalTimeLabel = document.querySelector("[data-total-time]");

if (audio && playButton && progress && currentTimeLabel && totalTimeLabel) {
  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${minutes}:${String(remainder).padStart(2, "0")}`;
  };

  const syncProgress = () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

    progress.value = String(percent);
    currentTimeLabel.textContent = formatTime(currentTime);
    totalTimeLabel.textContent = formatTime(duration);
  };

  const setPlayingState = (isPlaying) => {
    playButton.textContent = isPlaying ? "❚❚" : "▶";
  };

  playButton.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlayingState(false);
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
  audio.addEventListener("timeupdate", syncProgress);
  audio.addEventListener("play", () => setPlayingState(true));
  audio.addEventListener("pause", () => setPlayingState(false));
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    syncProgress();
    setPlayingState(false);
  });

  syncProgress();
}
