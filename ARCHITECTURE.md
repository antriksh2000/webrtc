# Architecture

## Overview
This repository contains a MERN-oriented authentication UI with a shadcn-inspired visual system. The current implementation is frontend-only, but it is structured to map cleanly onto a React auth page that would later call Express/Node endpoints and persist users in MongoDB.

## Files
- `index.html` — responsive auth page structure plus lightweight client-side mode switching
- `styles.css` — shadcn-inspired tokens, cards, inputs, tabs, and responsive layout

## Implementation Notes
- The interface is designed as a React-friendly composition, with discrete auth sections and reusable field patterns.
- The signup form reveals extra fields dynamically without a page refresh.
- The visual style follows shadcn cues: neutral surfaces, subtle borders, rounded cards, and restrained typography.
- Backend integration is intentionally not wired up yet; the submit handler only demonstrates where REST auth calls would be connected.

## Next MERN steps
- Replace the local submit handler with fetch calls to Express routes.
- Store users in MongoDB with hashed passwords.
- Add JWT or session-based auth handling in the backend.
- Move the markup into React components and reuse the same styling approach in shadcn components.
