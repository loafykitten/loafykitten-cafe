const visitorNumber =
  document.querySelector<HTMLButtonElement>(".visitor-number");
let visitorCount = 8008;

if (visitorNumber) {
  visitorNumber.addEventListener("click", () => {
    visitorNumber.textContent = String(visitorCount);
    visitorNumber.setAttribute("aria-label", `Visitor count: ${visitorCount}`);
    visitorNumber.disabled = true;
  });
}
