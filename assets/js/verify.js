// /assets/js/verify.js
// Firebase email verification landing page for zhalbyrak.app/verify.html
// Supports RU/KY UI based on ?lang=ru|ky or Firebase-provided lang.
// Robust against missing DOM ids.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  applyActionCode,
  checkActionCode,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

/* ---------------- Firebase config ---------------- */
const firebaseConfig = {
  apiKey: "AIzaSyAkZoWLttwhP4ynlG5vU0YUYFdXYALBG2A",
  authDomain: "secom-f3642.firebaseapp.com",
  projectId: "secom-f3642",
  storageBucket: "secom-f3642.firebasestorage.app",
  messagingSenderId: "174257410842",
  appId: "1:174257410842:web:3168c37789abe889d252a3",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* ---------------- i18n ---------------- */
const I18N = {
  ru: {
    pageTitle: "Подтверждение email",
    pageSubtitle: "Эта страница подтверждает ваш email для ZHALBYRAK.",
    verifyingTitle: "Подтверждаем email…",
    verifyingDetail: "Пожалуйста, подождите.",
    invalidTitle: "Некорректная ссылка",
    invalidDetail: "Откройте самое новое письмо и попробуйте снова.",
    okTitle: "Email подтверждён",
    okDetail: "Вернитесь в приложение и выполните вход.",
    failTitle: "Не удалось подтвердить",
    failDetail:
      "Ссылка могла истечь или уже использована. Запросите новое письмо в приложении.",
    btnOpen: "Открыть приложение",
    btnHome: "На сайт",
    hint: "Если страница не обновляется — закройте и откройте письмо заново.",
  },
  ky: {
    pageTitle: "Email тастыктоо",
    pageSubtitle: "Бул баракча ZHALBYRAK үчүн email’иңизди тастыктайт.",
    verifyingTitle: "Email тастыкталууда…",
    verifyingDetail: "Күтүп туруңуз.",
    invalidTitle: "Туура эмес шилтеме",
    invalidDetail: "Эң акыркы катты ачып, кайра аракет кылыңыз.",
    okTitle: "Email тастыкталды",
    okDetail: "Колдонмого кайтып, кирип алыңыз.",
    failTitle: "Тастыктоо ишке ашкан жок",
    failDetail:
      "Шилтеме мөөнөтү өтүп кеткен же колдонулган болушу мүмкүн. Колдонмодон жаңы кат жөнөтүңүз.",
    btnOpen: "Колдонмону ачуу",
    btnHome: "Сайтка өтүү",
    hint: "Эгер жаңырбаса — катты жаап, кайра ачыңыз.",
  },
};

function lang2ruKy(raw) {
  const s = String(raw || "").toLowerCase();
  if (s.startsWith("ky") || s.startsWith("kg") || s.includes("ky")) return "ky";
  return "ru";
}

/* ---------------- DOM helpers (null-safe) ---------------- */
const els = {
  box: document.getElementById("statusBox"),
  spinner: document.getElementById("spinner"),
  title: document.getElementById("title"),
  detail: document.getElementById("detail"),
  actions: document.getElementById("actions"),
  btnOpenApp: document.getElementById("btnOpenApp"),
  btnHome: document.getElementById("btnHome"),
  debug: document.getElementById("debug"),

  // Optional static labels (if present in html)
  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle"),
  hint: document.getElementById("hint"),
};

function setText(el, value) {
  if (!el) return;
  el.textContent = value;
}

function setUI({ ok = false, err = false, loading = false, title = "", detail = "" }) {
  if (els.box) {
    els.box.classList.remove("ok", "err");
    if (ok) els.box.classList.add("ok");
    if (err) els.box.classList.add("err");
  }

  if (els.spinner) els.spinner.style.display = loading ? "block" : "none";
  setText(els.title, title);
  setText(els.detail, detail);
}

function getParams() {
  const url = new URL(window.location.href);
  return {
    mode: url.searchParams.get("mode"),
    oobCode: url.searchParams.get("oobCode"),
    continueUrl: url.searchParams.get("continueUrl"),
    lang: url.searchParams.get("lang"),
    debug: url.searchParams.get("debug"),
  };
}

function safeShowDebug(obj) {
  const { debug } = getParams();
  if (debug !== "1") return;
  if (!els.debug) return;

  els.debug.style.display = "block";
  els.debug.innerHTML =
    "Debug:<br/><code>" +
    Object.entries(obj)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join("<br/>") +
    "</code>";
}

/* ---------------- main ---------------- */
async function run() {
  const { mode, oobCode, continueUrl, lang } = getParams();
  const L = I18N[lang2ruKy(lang)];

  // Localize any static labels if you added ids in HTML (optional)
  setText(els.pageTitle, L.pageTitle);
  setText(els.pageSubtitle, L.pageSubtitle);
  setText(els.hint, L.hint);

  if (els.btnOpenApp) els.btnOpenApp.textContent = L.btnOpen;
  if (els.btnHome) els.btnHome.textContent = L.btnHome;

  safeShowDebug({ mode, oobCode, continueUrl, lang });

  setUI({ loading: true, title: L.verifyingTitle, detail: L.verifyingDetail });

  if (!oobCode || mode !== "verifyEmail") {
    setUI({ err: true, loading: false, title: L.invalidTitle, detail: L.invalidDetail });
    if (els.actions) els.actions.style.display = "flex";
    wireButtons();
    return;
  }

  try {
    // Validate first for cleaner errors
    await checkActionCode(auth, oobCode);

    // Apply verification
    await applyActionCode(auth, oobCode);

    setUI({ ok: true, loading: false, title: L.okTitle, detail: L.okDetail });
    if (els.actions) els.actions.style.display = "flex";
  } catch (e) {
    console.error("verify.js error:", e);
    safeShowDebug({ error: e?.code || e?.message || String(e) });

    setUI({ err: true, loading: false, title: L.failTitle, detail: L.failDetail });
    if (els.actions) els.actions.style.display = "flex";
  }

  wireButtons();
}

function wireButtons() {
  if (els.btnHome) {
    els.btnHome.onclick = () => {
      window.location.href = "/";
    };
  }

  if (els.btnOpenApp) {
    els.btnOpenApp.onclick = () => {
      // If you implement Android App Links / iOS Universal Links, put that URL here.
      // For now, keep it safe: return to homepage (or Play Store/App Store page).
      window.location.href = "/";
    };
  }
}

run();
