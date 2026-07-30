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

// Hero: hovering the cover starts the drone video (fades in ~2.5s). The logo
// stays on top throughout; the video fades out again once it ends.
const heroSection = document.querySelector(".hero-liquid");
const heroVideo = document.querySelector(".hero-video");

if (heroSection && heroVideo) {
  heroVideo.muted = true;

  let running = false;

  heroSection.addEventListener("mouseenter", () => {
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

/* --- Project reflections: comments + photos, stored in this browser only --- */
const modal = document.getElementById("project-modal");

if (modal) {
  const titleEl = document.getElementById("modal-title");
  const listEl = document.getElementById("reflections");
  const form = document.getElementById("reflection-form");
  const nameInput = document.getElementById("rf-name");
  const textInput = document.getElementById("rf-text");
  const fileInput = document.getElementById("rf-image");
  const preview = document.getElementById("rf-preview");
  const note = document.getElementById("rf-note");

  let currentId = null;
  let pendingImage = null;
  let lastFocused = null;

  const storeKey = (id) => `refyber-reflections-${id}`;

  const load = (id) => {
    try {
      return JSON.parse(localStorage.getItem(storeKey(id))) || [];
    } catch (e) {
      return [];
    }
  };

  const save = (id, items) => {
    try {
      localStorage.setItem(storeKey(id), JSON.stringify(items));
      return true;
    } catch (e) {
      return false;
    }
  };

  const render = () => {
    const items = load(currentId);
    listEl.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "reflections-empty";
      empty.textContent = "No reflections yet — be the first to share one.";
      listEl.append(empty);
      return;
    }

    items.forEach((item, index) => {
      const wrap = document.createElement("article");
      wrap.className = "reflection";

      const head = document.createElement("div");
      head.className = "reflection-head";

      const who = document.createElement("span");
      who.className = "reflection-name";
      who.textContent = item.name;

      const when = document.createElement("span");
      when.className = "reflection-date";
      when.textContent = item.date;

      const del = document.createElement("button");
      del.className = "reflection-delete";
      del.type = "button";
      del.textContent = "Delete";
      del.addEventListener("click", () => {
        const next = load(currentId);
        next.splice(index, 1);
        save(currentId, next);
        render();
      });

      head.append(who, when, del);

      const body = document.createElement("p");
      body.textContent = item.text;

      wrap.append(head, body);

      if (item.image) {
        const img = document.createElement("img");
        img.src = item.image;
        img.alt = `Photo shared by ${item.name}`;
        wrap.append(img);
      }

      listEl.append(wrap);
    });
  };

  const openModal = (card) => {
    currentId = card.dataset.project;
    titleEl.textContent = card.dataset.title;
    lastFocused = card;
    pendingImage = null;
    preview.hidden = true;
    preview.removeAttribute("src");
    note.classList.remove("show");
    form.reset();
    render();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    nameInput.focus();
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  const wireCard = (card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest(".project-remove")) return;
      openModal(card);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(card);
      }
    });
  };

  document.querySelectorAll(".project-card").forEach(wireCard);
  window.refyberWireProjectCard = wireCard;

  modal.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  // Downscale uploads so several photos still fit in localStorage
  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    pendingImage = null;
    preview.hidden = true;

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        pendingImage = canvas.toDataURL("image/jpeg", 0.72);
        preview.src = pendingImage;
        preview.hidden = false;
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const items = load(currentId);
    items.unshift({
      name: nameInput.value.trim() || "Anonymous",
      text: textInput.value.trim(),
      image: pendingImage,
      date: new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    });

    const ok = save(currentId, items);

    note.textContent = ok
      ? "Thanks — your reflection is saved in this browser."
      : "Storage is full. Try a smaller photo or delete an older reflection.";
    note.classList.add("show");

    if (ok) {
      form.reset();
      pendingImage = null;
      preview.hidden = true;
      render();
    }
  });
}

/* --- "Add New Project": creates extra scatter cards, stored in this browser --- */
const addProjectBtn = document.getElementById("add-project-btn");
const newProjectModal = document.getElementById("new-project-modal");

if (addProjectBtn && newProjectModal) {
  const scatter = document.querySelector(".scatter");
  const form = document.getElementById("new-project-form");
  const nameInput = document.getElementById("np-name");
  const descInput = document.getElementById("np-desc");
  const fileInput = document.getElementById("np-image");
  const preview = document.getElementById("np-preview");
  const note = document.getElementById("np-note");

  const KEY = "refyber-custom-projects";
  let pendingImage = null;

  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  };

  const save = (items) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
      return true;
    } catch (e) {
      return false;
    }
  };

  const openModal = () => {
    form.reset();
    pendingImage = null;
    preview.hidden = true;
    preview.removeAttribute("src");
    note.classList.remove("show");
    newProjectModal.hidden = false;
    document.body.style.overflow = "hidden";
    nameInput.focus();
  };

  const closeModal = () => {
    newProjectModal.hidden = true;
    document.body.style.overflow = "";
    addProjectBtn.focus();
  };

  addProjectBtn.addEventListener("click", openModal);

  newProjectModal.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !newProjectModal.hidden) closeModal();
  });

  // Downscale the upload so localStorage can hold a few projects
  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    pendingImage = null;
    preview.hidden = true;

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        pendingImage = canvas.toDataURL("image/jpeg", 0.72);
        preview.src = pendingImage;
        preview.hidden = false;
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  const stockCount = document.querySelectorAll(".scatter .card:not(.custom-project)").length;

  const buildCard = (item, index) => {
    const card = document.createElement("article");
    card.className = "card project-card custom-project";
    card.dataset.project = item.id;
    card.dataset.title = item.title;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${item.title} — add a reflection`);

    if (item.image) {
      const img = document.createElement("img");
      img.className = "scatter-photo";
      img.src = item.image;
      img.alt = item.title;
      card.append(img);
    }

    const num = document.createElement("span");
    num.className = "scatter-num";
    num.textContent = "/" + String(stockCount + index + 1).padStart(2, "0");

    const title = document.createElement("h3");
    title.textContent = item.title;

    const desc = document.createElement("p");
    desc.className = "muted small";
    desc.textContent = item.description;

    const cta = document.createElement("span");
    cta.className = "card-cta";
    cta.textContent = "Add a reflection →";

    const remove = document.createElement("button");
    remove.className = "project-remove";
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      save(load().filter((p) => p.id !== item.id));
      renderCustom();
    });

    card.append(num, title, desc, cta, remove);
    if (window.refyberWireProjectCard) window.refyberWireProjectCard(card);
    return card;
  };

  const renderCustom = () => {
    scatter.querySelectorAll(".custom-project").forEach((el) => el.remove());
    load().forEach((item, index) => scatter.append(buildCard(item, index)));
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const items = load();
    items.push({
      id: "custom-" + Date.now(),
      title: nameInput.value.trim(),
      description: descInput.value.trim(),
      image: pendingImage,
    });

    if (save(items)) {
      renderCustom();
      closeModal();
    } else {
      note.textContent = "Storage is full. Try a smaller image or remove a project.";
      note.classList.add("show");
    }
  });

  renderCustom();
}
