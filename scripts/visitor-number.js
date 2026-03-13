const visitorNumber = document.querySelector(".visitor-number");
let visitorCount = 0;

visitorNumber.addEventListener("click", () => {
  visitorNumber.innerHTML = visitorCount;
  visitorNumber.setAttribute("aria-label", `Visitor count: ${visitorCount}`);
  visitorNumber.disabled = true;
});
