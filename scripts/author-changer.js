const fursonaSrc = "images/sketch.png";
const irlSrc = "images/meee.gif";
const pauseSymbol = "&#9208;";
const playSymbol = "&#9658;";

const authorImg = document.querySelector(".author img");
const changerBtn = document.querySelector(".author-changer-btn");

const swapToIrl = () => {
  authorImg.setAttribute("src", irlSrc);
  authorImg.setAttribute("alt", "loafykitten in real life");
};

const swapToFursona = () => {
  authorImg.setAttribute("src", fursonaSrc);
  authorImg.setAttribute("alt", "loafykitten fursona sketch");
};

let currentInterval = -1;

const beginAuthorChanger = () => {
  changerBtn.innerHTML = pauseSymbol;
  changerBtn.setAttribute("aria-label", "Pause profile image animation");
  changerBtn.setAttribute("aria-pressed", "false");

  changerBtn.onclick = ceaseAuthorChanger;

  currentInterval = setInterval(() => {
    const src = authorImg.getAttribute("src");
    src === fursonaSrc ? swapToIrl() : swapToFursona();
  }, 5000);
};

const ceaseAuthorChanger = () => {
  if (currentInterval !== -1) {
    clearInterval(currentInterval);
    currentInterval = -1;
    changerBtn.innerHTML = playSymbol;
    changerBtn.setAttribute("aria-label", "Play profile image animation");
    changerBtn.setAttribute("aria-pressed", "true");

    changerBtn.onclick = beginAuthorChanger;
  }
};

beginAuthorChanger();
