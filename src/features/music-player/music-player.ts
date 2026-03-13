const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const players = document.querySelectorAll<HTMLElement>("[data-music-player]");

players.forEach((player) => {
  const audio = player.querySelector<HTMLAudioElement>("[data-audio-player]");
  const playButton = player.querySelector<HTMLButtonElement>("[data-audio-play]");
  const progress = player.querySelector<HTMLInputElement>("[data-audio-progress]");
  const currentTimeLabel = player.querySelector<HTMLElement>("[data-current-time]");
  const totalTimeLabel = player.querySelector<HTMLElement>("[data-total-time]");

  if (!audio || !playButton || !progress || !currentTimeLabel || !totalTimeLabel) {
    return;
  }

  const syncProgress = () => {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

    progress.value = String(percent);
    currentTimeLabel.textContent = formatTime(currentTime);
    totalTimeLabel.textContent = formatTime(duration);
  };

  const setPlayingState = (isPlaying: boolean) => {
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
});

