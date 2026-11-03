---
name: Offline update policy
description: Why AAC service-worker updates should wait for the child to close the app.
---

Let pending offline-app updates activate after the old app closes; do not force a reload while the app is in use.

**Why:** The board is the child's means of communication. An update must not discard or interrupt a sentence.

**How to apply:** Preserve this behavior when changing PWA registration or adding update notifications. Offer an explicit caregiver-controlled update action if immediate activation is ever needed.
