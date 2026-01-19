// /js/verify.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  applyActionCode,
  checkActionCode,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

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

const els = {
  box: document.getElementById("statusBox"),
  spinner: document.getElementById("spinner"),
  title: document.getElementById("title"),
  detail: document.getElementById("detail"),
  actions: document.getElementById("actions"),
  btnOpenApp: document.getElementById("btnOpenApp"),
  btnHome: document.getElementById("btnHome"),
  debug: document.getElementById("debug"),
  // Optional: if you later want to localize h1 text too:
  // h1: document.querySelector("h1"),
  // muted: document.querySelector(".muted"),
};

function getParams() {
  const url = new URL(window.location.href);
  return {
    mode: url.searchParams.get("mode"),
    oobCode: url.searchParams.get("oobCode"),
    continueUrl: url.searchParams.get("continueUrl"),
    lang: (url.searchParams.get("lang") || "en").toLowerCase(),
    debug: url.searchParams.get("debug"),
  };
}

function i18n(lang) {
  // Normalize language (ru/ky/en)
  const l = lang.startsWith("ky") ? "ky" : lang.startsWith("ru") ? "ru" : "en";

  const dict = {
    en: {
      verifyingTitle: "Verifying your email…",
      verifyingDetail: "Please wait.",
      invalidTitle: "Invalid verification link",
      invalidDetail: "Please open the latest verification email and try again.",
      okTitle: "Email verified successfully",
      okDetail: "You can return to the app now.",
      failTitle: "Verification failed",
      failDetail:
        "This link may be expired or already used. Please request a new verification email from the app.",
      openApp: "Open the app",
      goHome: "Go to website",
    },
    ru: {
      verifyingTitle: "Подтверждаем email…",
      verifyingDetail: "Пожалуйста, подождите.",
      invalidTitle: "Неверная ссылка подтверждения",
      invalidDetail: "Откройте самое свежее письмо и попробуйте ещё раз.",
      okTitle: "Email подтверждён ✅",
      okDetail: "Теперь можно вернуться в приложение.",
      failTitle: "Не удалось подтвердить",
      failDetail:
        "Ссылка могла устареть или уже была использована. Запросите новое письмо в приложении.",
      openApp: "Открыть приложение",
      goHome: "Перейти на сайт",
    },
    ky: {
      verifyingTitle: "Email тастыкталууда…",
      verifyingDetail: "Сураныч, күтө туруңуз.",
      invalidTitle: "Тастыктоо шилтемеси туура эмес",
      invalidDetail: "Эң акыркы катты ачып, кайра аракет кылыңыз.",
      okTitle: "Email тастыкталды ✅",
      okDetail: "Эми колдонмого кайта берсеңиз болот.",
      failTitle: "Тастыктоо ишке ашкан жок",
      failDetail:
        "Шилтеме эскирип калган же мурда колдонулган болушу мүмкүн. Колдонмодон жаңы кат сураныңыз.",
      openApp: "Колдонмону ачуу",
      goHome: "Сайтка өтүү",
    },
  };

  return dict[l];
}

function setUI({ ok = false, err = false, loading = false, title = "", detail = "" }) {
  els.box.classList.remove("ok", "err");
  if (ok) els.box.classList.add("ok");
  if (err) els.box.classList.add("err");

  els.spinner.style.display = loading ? "block" : "none";
  els.title.textContent = title;
  els.detail.textContent = detail;
}

function safeShowDebug(obj) {
  const { debug } = getParams();
  if (debug !== "1") return;

  els.debug.style.display = "block";
  els.debug.innerHTML =
    "Debug:<br/><code>" +
    Object.entries(obj)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join("<br/>") +
    "</code>";
}

async function run() {
  const { mode, oobCode, continueUrl, lang } = getParams();
  const tr = i18n(lang);

  // Localize buttons
  els.btnOpenApp.textContent = tr.openApp;
  els.btnHome.textContent = tr.goHome;

  // Buttons behavior:
  // If Firebase provided continueUrl, prefer it (common in auth flows)
  const homeUrl = continueUrl || "https://zhalbyrak.app/";
  els.btnHome.onclick = () => (window.location.href = homeUrl);

  // If you have deep links, set your scheme here.
  // Otherwise, just go to site. The user can switch back to the app manually.
  els.btnOpenApp.onclick = () => {
    // window.location.href = "zhalbyrak://verified";
    window.location.href = homeUrl;
  };

  setUI({
    loading: true,
    title: tr.verifyingTitle,
    detail: tr.verifyingDetail,
  });

  safeShowDebug({ mode, oobCode, continueUrl, lang });

  if (!oobCode || mode !== "verifyEmail") {
    setUI({
      err: true,
      loading: false,
      title: tr.invalidTitle,
      detail: tr.invalidDetail,
    });
    els.actions.style.display = "flex";
    return;
  }

  try {
    await checkActionCode(auth, oobCode);
    await applyActionCode(auth, oobCode);

    setUI({
      ok: true,
      loading: false,
      title: tr.okTitle,
      detail: tr.okDetail,
    });

    els.actions.style.display = "flex";
  } catch (e) {
    console.error(e);

    setUI({
      err: true,
      loading: false,
      title: tr.failTitle,
      detail: tr.failDetail,
    });

    // show exact firebase error only when debug=1
    safeShowDebug({
      firebaseErrorCode: e?.code || "",
      firebaseErrorMessage: e?.message || String(e),
    });

    els.actions.style.display = "flex";
  }
}

run();
