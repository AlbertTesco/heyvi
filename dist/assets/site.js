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

function typeHeroCommand(output) {
  const duration = Number(getComputedStyle(output).getPropertyValue("--motion-terminal-duration-ms"));
  if (duration <= 0 || !Number.isFinite(duration)) return;

  const characters = Array.from(output.querySelector(".command-copy").textContent);
  const typed = document.createElement("span");
  typed.className = "command-typed";
  typed.setAttribute("aria-hidden", "true");
  output.append(typed);
  output.classList.add("is-typing");

  const start = performance.now();
  function frame(now) {
    const count = Math.floor(((now - start) / duration) * characters.length);
    if (count >= characters.length) {
      output.classList.remove("is-typing");
      typed.remove();
      return;
    }
    if (count !== typed.textContent.length) {
      typed.textContent = characters.slice(0, Math.max(0, count)).join("");
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const motionAllowed = matchMedia("(prefers-reduced-motion: no-preference)");
if (motionAllowed.matches) {
  const command = document.querySelector(".command-output");
  if (command) typeHeroCommand(command);

  if ("IntersectionObserver" in window) {
    const visibleFraction = 0.55;
    const observer = new IntersectionObserver((entries) => {
      for (const { target, intersectionRatio } of entries) {
        if (intersectionRatio < visibleFraction) continue;
        target.dataset.state = "running";
        observer.unobserve(target);
      }
    }, { threshold: visibleFraction });

    for (const trace of document.querySelectorAll("[data-terminal-run]")) {
      trace.dataset.state = "waiting";
      observer.observe(trace);
    }
  }
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
