"use strict";

const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector("#top-nav");
menuButton.hidden = false;
menu.classList.add("menu-enhanced");

function setMenu(open) {
  menu.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") === "false");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuButton.focus();
  }
});

const motionControl = document.querySelector(".motion-control");
if (motionControl) {
  const hero = motionControl.closest(".hero");
  const label = motionControl.querySelector("span");
  const preferenceKey = "heyvi-background-motion";
  let paused = false;

  try {
    paused = localStorage.getItem(preferenceKey) === "paused";
  } catch {
    // The control still works when browser storage is unavailable.
  }

  function updateMotion() {
    hero.dataset.motion = paused ? "paused" : "playing";
    label.textContent = paused ? "Включить анимацию" : "Пауза анимации";
  }

  updateMotion();
  motionControl.hidden = false;
  motionControl.addEventListener("click", () => {
    paused = !paused;
    updateMotion();
    try {
      localStorage.setItem(preferenceKey, hero.dataset.motion);
    } catch {
      // Keep the choice for this visit.
    }
  });
}

function openLinkedScenario() {
  const target = document.getElementById(location.hash.slice(1));
  if (target?.matches("details[data-scenario]")) {
    target.open = true;
  }
}

if (document.querySelector("[data-scenario]")) {
  openLinkedScenario();
  window.addEventListener("hashchange", openLinkedScenario);
}

const filterGroup = document.querySelector(".filters");
if (filterGroup) {
  const filters = [...filterGroup.querySelectorAll("button")];
  const cards = [...document.querySelectorAll("[data-category]")];
  const status = document.querySelector("[data-filter-status]");
  filterGroup.hidden = false;

  filterGroup.addEventListener("click", (event) => {
    const filter = event.target.closest("button[data-filter]");
    if (!filter) return;

    for (const button of filters) {
      button.setAttribute("aria-pressed", String(button === filter));
    }

    const category = filter.dataset.filter;
    let visible = 0;
    for (const card of cards) {
      card.hidden = category !== "all" && card.dataset.category !== category;
      if (!card.hidden) visible += 1;
    }
    status.textContent = `Показано услуг: ${visible} из ${cards.length}.`;
  });
}

const brief = document.querySelector("#brief-form");
if (brief) {
  const { service, company, task } = brief.elements;
  const status = document.querySelector("#brief-status");
  const selectedService = new URLSearchParams(location.search).get("service");
  if ([...service.options].some((option) => option.value === selectedService)) {
    service.value = selectedService;
  }
  brief.hidden = false;

  task.addEventListener("input", () => task.setCustomValidity(""));
  brief.addEventListener("submit", (event) => {
    event.preventDefault();

    const description = task.value.trim();
    if (!description) {
      task.setCustomValidity("Опишите задачу.");
      task.reportValidity();
      return;
    }

    const lines = [
      "Бриф для ООО «ХЭЙВИ»",
      "",
      `Направление: ${service.selectedOptions[0].textContent}`,
      `Компания: ${company.value.trim() || "не указана"}`,
      "",
      "Описание задачи",
      description,
      "",
    ];
    const file = new Blob([lines.join("\r\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const download = document.createElement("a");
    download.href = url;
    download.download = "heyvi-brief.txt";
    download.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = "Бриф подготовлен. Проверьте загрузки браузера.";
  });
}
