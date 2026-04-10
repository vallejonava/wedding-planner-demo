// ════════════════════════════════════════════════════════════
// notifications.js — Tanvi & Justin Wedding
// Web Push Notifications (admin + guest side)
// ════════════════════════════════════════════════════════════
// NOTE: For full Web Push you need a VAPID key pair and a
// Cloud Function to send messages. This module handles the
// browser-side permission request and stores FCM tokens in
// Firestore so a backend (or manual trigger) can send them.
// ════════════════════════════════════════════════════════════

// ── ADMIN SIDE ──

/**
 * Call once after login on admin.html
 * Sets up a listener that shows a desktop notification
 * when a new unread message arrives from a guest.
 */
function initNotifications(db) {
  if (!("Notification" in window)) return;
  // Watch for new unread guest messages and fire a desktop notification
  db.collectionGroup("messages")
    .where("sender", "==", "guest")
    .where("readByAdmin", "==", false)
    .onSnapshot(snap => {
      if (snap.size === 0) return;
      if (Notification.permission === "granted") {
        snap.docChanges().forEach(change => {
          if (change.type === "added") {
            const msg   = change.doc.data();
            const guest = msg.guestName || "A guest";
            new Notification("New message · T&J Admin", {
              body: `${guest}: ${msg.message || "(message)"}`,
              icon: "/favicon.ico"
            });
          }
        });
      }
    }, () => {});
}

/**
 * Request notification permission (called from Settings panel).
 * Returns a Promise<boolean> indicating whether permission was granted.
 */
function requestNotifications() {
  if (!("Notification" in window)) return Promise.resolve(false);
  return Notification.requestPermission().then(p => p === "granted");
}

function showNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

// ── GUEST SIDE ──

/**
 * Call once on invitado.html load.
 * Listens for admin-created notifications on the guest's sub-collection
 * and shows a badge / desktop notification.
 */
function initGuestNotifications(db, guestId) {
  if (!guestId) return;

  db.collection("guests").doc(guestId)
    .collection("notifications")
    .where("read", "==", false)
    .onSnapshot(snap => {
      if (snap.empty) return;

      snap.docChanges().forEach(change => {
        if (change.type !== "added") return;
        const n = change.doc.data();

        // Update chat badge
        const badge = document.getElementById("chat-badge");
        if (badge && n.type === "new_message") {
          badge.style.display = "flex";
          badge.textContent = parseInt(badge.textContent || "0") + 1;
        }

        // Desktop notification if permission granted
        if (Notification.permission === "granted") {
          const titles = {
            new_message:              "Message from the wedding team 💬",
            event_transport_assigned: "Your transport has been arranged 🚗",
            event_rsvp_declined:      "Event update 📅"
          };
          new Notification(titles[n.type] || "Wedding Update", {
            body: n.message || "Tap to view",
            icon: "/favicon.ico"
          });
        }

        // Mark as read
        change.doc.ref.update({ read: true }).catch(() => {});
      });
    }, () => {});
}
