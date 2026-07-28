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
