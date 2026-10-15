# Wanderlog — Travel Journal

Wanderlog is a responsive, browser-based travel journal for saving trip details, cover photos, destinations and memories. This repository contains the Week 4 polish pass on the Week 3 application: visual refinements, keyboard accessibility, responsive styling, user feedback and deployment documentation.

> **Storage note:** this is a static, front-end-only project. Trips, photos and profile settings are stored in the current browser's `localStorage`; they are not uploaded to a server or synced between devices. The profile URL is therefore a read-only view in the same browser profile, not a globally shareable hosted user account. A backend/database is needed for genuine cross-device public profiles.

## Features

- **Trip CRUD:** create, view, edit and delete journal entries.
- **Photo uploads:** choose an image, preview it, and store it with a trip as a Data URL.
- **Validation and friendly errors:** required fields, image type/size checks, storage-error feedback and empty states.
- **Trip detail dialog:** inspect a trip in a modal; close with Escape or the close button, with keyboard focus managed inside the dialog.
- **Profile settings:** save a traveler name and short bio, then view the journal through `profile.html?user=your-name` in the same browser.
- **Responsive layout:** styles for mobile, tablet and desktop widths.
- **Accessibility basics:** semantic landmarks, form labels, image alt text/fallbacks, visible keyboard focus, skip links, live status messages and reduced-motion support.
- **Micro-interactions:** transitions for buttons and cards, hover/focus states, photo-reading feedback and save/update feedback.
- **No build step:** plain HTML, CSS and JavaScript; no package installation is required.

## Tech stack

- HTML5
- CSS3 (responsive media queries, transitions and reduced-motion support)
- Vanilla JavaScript
- Browser `localStorage`, `FileReader` and `URLSearchParams`
- Google Fonts: Fraunces, Work Sans and Space Mono (internet connection required for the hosted fonts)

## Project structure

```text
wanderlog/
├── index.html       # Main journal, trip form, profile settings and detail dialog
├── profile.html     # Read-only profile view
├── script.js        # Trip CRUD, validation, image handling and profile settings
├── profile.js       # Profile URL parsing and read-only rendering
├── style.css        # Shared design system and responsive styles
├── README.md
└── .gitignore
```

## Run locally

1. Extract the project ZIP.
2. Open the `wanderlog` folder in VS Code.
3. Open `index.html` directly, or use the **Live Server** extension for a local HTTP URL.
4. Add a trip, select a cover photo, and save it. Try viewing, editing and deleting the trip.
5. Set a traveler name and bio in the Profile section. Open the generated profile link in the same browser to test the read-only page.

No Node.js server or database is used by this version.

## Manual QA checklist

Use browser dev tools responsive mode to check at approximately **360 px**, **768 px** and **1440 px** widths.

- [ ] Main page and profile page load without console errors.
- [ ] Navigation opens/closes on mobile and can be operated by keyboard.
- [ ] Empty submission shows field-level messages and does not create a trip.
- [ ] Valid trip saves; card count and empty state update correctly.
- [ ] Oversized or non-image files are rejected with a clear message.
- [ ] Uploaded image previews and appears in the trip card/detail view.
- [ ] A broken image shows a fallback instead of a broken-image icon.
- [ ] Edit preserves the existing photo if no replacement is selected.
- [ ] Delete confirmation works and deleting the final trip restores the empty state.
- [ ] Modal can be opened/closed by keyboard; Escape closes it and focus returns to the opener.
- [ ] Profile form validates the name and the profile page displays saved content.
- [ ] Focus indicators are visible when tabbing; reduced-motion preference is respected.
- [ ] Test on mobile, tablet and desktop before sharing the deployment URL.

## Deploy later (static hosting)

The project is ready to be deployed as a static site to Netlify, Vercel or GitHub Pages. No build command is needed.

### Netlify

1. Extract the ZIP and ensure `index.html`, `profile.html`, `script.js`, `profile.js` and `style.css` are in the published site folder.
2. In Netlify, choose **Add new site → Deploy manually** and drag the `wanderlog` folder (or its contents) into the drop area.
3. Open the generated HTTPS URL and run the manual QA checklist against the live site.
4. Add the real live URL here after deployment.

### Vercel / GitHub Pages

1. Push the contents of the `wanderlog` folder to a Git repository.
2. Import the repository into Vercel, or enable GitHub Pages for the repository.
3. Use the repository root as the static output; no build command is required.
4. Verify both `index.html` and `profile.html` work at the deployed path.

**Live URL:** _Add after deployment._  
**Repository URL:** _Add after pushing to your Git provider._

## Screenshots

Add current screenshots after running the app locally, for example:

- `screenshots/home-desktop.png`
- `screenshots/trip-form-mobile.png`
- `screenshots/profile-page.png`

Keep screenshots in a `screenshots/` folder and update this section with Markdown image links before final submission.

## Browser storage and privacy

Data is saved only in the browser profile where the app is used. Clearing site data or switching browsers/devices can make saved trips unavailable. Photos count toward browser storage limits; if saving fails, try a smaller image. Do not use this prototype to store sensitive information.

## Week 4 submission checklist

- [x] Added visible keyboard focus, skip links and reduced-motion handling.
- [x] Added responsive finishing styles and interaction transitions.
- [x] Added keyboard focus management to the trip detail dialog.
- [x] Added photo-preparation and save/update feedback.
- [x] Documented features, stack, local setup, QA and deployment steps.
- [ ] Complete manual browser QA on mobile, tablet and desktop.
- [ ] Add real screenshots.
- [ ] Deploy and test the public URL.
- [ ] Add the real live URL and repository URL above.
