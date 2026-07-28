const menuButton = document.querySelector(".menu-button");
const mobileLinks = document.querySelector(".mobile-links");

if (menuButton && mobileLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = mobileLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  mobileLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      mobileLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll("form[data-static-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = form.querySelector(".form-note");
    if (note) note.classList.add("show");
  });
});

// Hero: hover the wordmark to play the drone video (fades in ~2.5s), keeps
// playing after the mouse leaves, then reveals the logo again once it ends.
// Videos marked data-hover-play: start on hover, pause when the mouse leaves.
document.querySelectorAll("video[data-hover-play]").forEach((video) => {
  video.muted = true;
  video.addEventListener("mouseenter", () => {
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  });
  video.addEventListener("mouseleave", () => video.pause());
});

const heroWord = document.querySelector(".hero-word");
const heroVideo = document.querySelector(".hero-video");

if (heroWord && heroVideo) {
  heroVideo.muted = true;

  let running = false;

  heroWord.addEventListener("mouseenter", () => {
    if (running) return;
    running = true;
    try {
      heroVideo.currentTime = 0;
    } catch (e) {}
    heroVideo.classList.add("show");
    const p = heroVideo.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  });

  heroVideo.addEventListener("ended", () => {
    heroVideo.classList.remove("show");
    running = false;
  });
}
