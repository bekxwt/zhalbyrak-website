// /js/verify.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getAuth,
  applyActionCode,
  checkActionCode,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// 1) PASTE YOUR FIREBASE WEB CONFIG HERE
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkZoWLttwhP4ynlG5vU0YUYFdXYALBG2A",
  authDomain: "secom-f3642.firebaseapp.com",
  projectId: "secom-f3642",
  storageBucket: "secom-f3642.firebasestorage.app",
  messagingSenderId: "174257410842",
  appId: "1:174257410842:web:3168c37789abe889d252a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const els = {
  box: document.getElementById("statusBox"),
  spinner: document.getElementById("spinner"),
  title: document.getElementById("title"),
  detail: document.getElementById("detail"),
  actions: document.getElementById("actions"),
  btnOpenApp: document.getElementById("btnOpenApp"),
  btnHome: document.getElementById("btnHome"),
  debug: document.getElementById("debug"),
};

function setUI({ ok = false, err = false, loading = false, title = "", detail = "" }) {
  els.box.classList.remove("ok", "err");
  if (ok) els.box.classList.add("ok");
  if (err) els.box.classList.add("err");

  els.spinner.style.display = loading ? "block" : "none";
  els.title.textContent = title;
  els.detail.textContent = detail;
}

function getParams() {
  const url = new URL(window.location.href);
  return {
    mode: url.searchParams.get("mode"),
    oobCode: url.searchParams.get("oobCode"),
    continueUrl: url.searchParams.get("continueUrl"),
    lang: url.searchParams.get("lang"),
  };
}

function safeShowDebug(obj) {
  // Keep debug hidden by default; enable by appending ?debug=1
  const url = new URL(window.location.href);
  const debugOn = url.searchParams.get("debug") === "1";
  if (!debugOn) return;

  els.debug.style.display = "block";
  els.debug.innerHTML =
    "Debug:<br/><code>" +
    Object.entries(obj)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join("<br/>") +
    "</code>";
}

async function run() {
  setUI({
    loading: true,
    title: "Verifying your email…",
    detail: "Please wait.",
  });

  const { mode, oobCode, continueUrl, lang } = getParams();
  safeShowDebug({ mode, oobCode, continueUrl, lang });

  if (!oobCode || mode !== "verifyEmail") {
    setUI({
      err: true,
      loading: false,
      title: "Invalid verification link",
      detail: "Please open the latest verification email and try again.",
    });
    els.actions.style.display = "flex";
    return;
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  try {
    // Optional: validate the code before applying (gives nicer errors)
    await checkActionCode(auth, oobCode);

    // Apply the email verification
    await applyActionCode(auth, oobCode);

    setUI({
      ok: true,
      loading: false,
      title: "Email verified successfully",
      detail: "You can return to the app and sign in.",
    });

    els.actions.style.display = "flex";
  } catch (e) {
    console.error(e);

    // Common cases: expired code, already used, invalid
    setUI({
      err: true,
      loading: false,
      title: "Verification failed",
      detail:
        "This link may be expired or already used. Please request a new verification email from the app.",
    });

    els.actions.style.display = "flex";
  }

  // Buttons
  els.btnHome.onclick = () => (window.location.href = "/");
  els.btnOpenApp.onclick = () => {
    // If you have a custom scheme, put it here:
    // window.location.href = "zhalbyrak://verified";
    // Otherwise send them to homepage (or store page).
    window.location.href = "/";
  };
}

run();
