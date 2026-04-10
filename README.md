# 💍 Tanvi & Justin — Wedding System

**December 27–30, 2026 · Manthan Beach Resort · Mangalore, India**

Firebase project: `tanvi-and-justin`

---

## Files

| File | Audience | URL pattern |
|------|----------|-------------|
| `invitado.html` | Each guest (personalized) | `invitado.html?guestId=XXXX` |
| `admin.html` | Wedding admin (couple / planner) | `admin.html` |
| `tv.html` | Smart TV in venue | `tv.html` |
| `remote.html` | Admin's phone (TV control) | `remote.html` |
| `chofer.html` | Each driver | `chofer.html?driverId=XXXX` |
| `firebase.js` | Shared — included by all | — |
| `notifications.js` | Shared — included by all | — |

---

## Firebase collections

```
guests/{id}
  ├── flightItinerary/{legId}
  └── notifications/{notifId}

drivers/{id}

events/{id}
  ├── eventRsvp/{guestId}
  └── eventTransport/{guestId}

chats/{guestId}/messages   ← UNIFIED: used by admin, guest, AND driver
  sender: 'guest' | 'admin' | 'driver'
  message: string
  timestamp: Timestamp
  readByAdmin: bool
  readByDriver: bool

poi/{id}
trivia/{id}

liveOps/tvDisplay   ← TV scene, autoPlay, announcements
liveOps/phase       ← Global wedding phase

config/settings     ← adminPin, remotePin
```

---

## Global phases

Set from Admin → Events tab. Controls what guests see on `invitado.html`.

| Phase | Guest sees |
|-------|-----------|
| `pre_travel` | Normal invitation (RSVP, events, FAQ…) |
| `in_transit` | Flight tracker fullscreen |
| `arrived` | Welcome to India + driver info |
| `event_active` | Driver tracking or event schedule |
| `post_event` | Event schedule + places to explore |

---

## PINs

All PINs are stored in Firestore at `config/settings`:

```js
{
  adminPin:  "XXXX",   // admin.html login
  remotePin: "XXXX"    // remote.html login (TV remote)
}
// Driver PINs are stored per-driver in drivers/{id}.pin
```

To set initial PINs, create the document manually in Firebase Console
or use the Settings tab in `admin.html`.

---

## Known fixes applied (vs original files)

1. **Chat path unified** — `chofer.html` now writes to `chats/{guestId}/messages`
   (same as `admin.html` and `invitado.html`). Previously it used
   `guests/{guestId}/messages` — a separate collection nobody else read.

2. **Remote PIN from Firestore** — `remote.html` reads the PIN from
   `config/settings.remotePin` instead of having it hardcoded in JS.

3. **`notifications.js` created** — previously referenced but missing.

4. **`firebase.js` shared config** — single source of truth for the
   Firebase init, collection references, and `esc()` helper.
   *(Files still include their own inline config for standalone compatibility.)*

---

## Deployment (Vercel / GitHub Pages)

All files are static — just push to a GitHub repo and connect to Vercel.
No build step needed.

Make sure Firestore Security Rules allow:
- Guests to read/write their own document by `guestId`
- Drivers to read/write their own document by `driverId`
- Admin to read/write all collections (PIN-gated client-side)
