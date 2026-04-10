// ════════════════════════════════════════════════════════════
// firebase.js — Tanvi & Justin Wedding
// Shared config, DB instance, and common helpers
// ════════════════════════════════════════════════════════════

// ── FIREBASE INIT ──
const firebaseConfig = {
  apiKey: "AIzaSyCoXMPGLlPn56oKYnWX6iHuJOlJYPlyUV8",
  authDomain: "tanvi-and-justin.firebaseapp.com",
  projectId: "tanvi-and-justin",
  storageBucket: "tanvi-and-justin.firebasestorage.app",
  messagingSenderId: "418808308001",
  appId: "1:418808308001:web:730d002e16f82327f5de60"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// ── WEDDING CONSTANTS ──
const WEDDING = {
  couple:        "Tanvi & Justin",
  dateISO:       "2026-12-27T17:30:00",
  dateDisplay:   "December 27–30, 2026",
  venue:         "Manthan Beach Resort",
  location:      "Mangalore, India",
  guestPage:     "invitado.html",   // filename for guest invitations
  defaultAdminPin: "8888",
  defaultRemotePin: "8888"
};

// ── COLLECTIONS REFERENCE MAP ──
// Centralised so a rename only needs to happen here.
const COL = {
  guests:   () => db.collection("guests"),
  drivers:  () => db.collection("drivers"),
  events:   () => db.collection("events"),
  poi:      () => db.collection("poi"),
  trivia:   () => db.collection("trivia"),
  liveOps:  () => db.collection("liveOps"),
  config:   () => db.collection("config"),
  // Chats — UNIFIED path used by admin, guest, and driver
  chat:     (guestId) => db.collection("chats").doc(guestId).collection("messages"),
};

// ── SHARED HELPERS ──

/** Escape HTML to prevent XSS */
function esc(t = "") {
  const d = document.createElement("div");
  d.textContent = String(t);
  return d.innerHTML;
}

/** Show a brief toast notification */
function showToast(toastId, msg, dur = 2400) {
  const el = document.getElementById(toastId);
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), dur);
}

/** Read admin PIN from Firestore settings, fall back to local */
async function getAdminPin() {
  try {
    const doc = await COL.config().doc("settings").get();
    if (doc.exists && doc.data().adminPin) return doc.data().adminPin;
  } catch (_) {}
  return localStorage.getItem("adminPIN") || WEDDING.defaultAdminPin;
}

/** Read remote PIN from Firestore settings */
async function getRemotePin() {
  try {
    const doc = await COL.config().doc("settings").get();
    if (doc.exists && doc.data().remotePin) return doc.data().remotePin;
  } catch (_) {}
  return WEDDING.defaultRemotePin;
}

/** Countdown to wedding target date */
function countdownTo(targetISO, ids) {
  // ids: { days, hours, mins, secs } — element IDs
  function tick() {
    const diff = new Date(targetISO).getTime() - Date.now();
    if (diff < 0) return;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (ids.days)  { const el = document.getElementById(ids.days);  if (el) el.textContent = String(d).padStart(2,"0"); }
    if (ids.hours) { const el = document.getElementById(ids.hours); if (el) el.textContent = String(h).padStart(2,"0"); }
    if (ids.mins)  { const el = document.getElementById(ids.mins);  if (el) el.textContent = String(m).padStart(2,"0"); }
    if (ids.secs)  { const el = document.getElementById(ids.secs);  if (el) el.textContent = String(s).padStart(2,"0"); }
  }
  tick();
  return setInterval(tick, 1000);
}
