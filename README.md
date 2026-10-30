# DevSphere

A developer network built with React 18, React Router v6, Axios and plain CSS (Vite).

## Run in VS Code
```bash
npm install
npm run dev        # open the URL it prints (usually http://localhost:5173)
npm run build && npm run preview
```
Requires Node 18 or newer and an internet connection (sample developers and articles come from JSONPlaceholder, photos from pravatar.cc).

## Features

**Social**
- Sign up, log in, and edit your profile any time (photo, headline, bio, skills, experience, education, links)
- Follow and Connect buttons (a connection request becomes "Connected" after a few seconds, as if accepted)
- Share short updates or write full Markdown articles; edit and delete your own
- Like, comment, share and save on every post; comments on the feed and on article pages
- Home feed: Latest / Following / Trending / Saved, trending topics, "Who to follow" ranked by shared skills
- Four themes plus compact layout

**Growth tools**
- **Weekly Coding Challenge** (`/challenges`): a new 5-question challenge every Monday, 6-minute timer, points with a speed bonus, five badges, weekly and 8-week leaderboards
- **Skill Gap Analyzer** (`/skill-gap`): choose a target role, see matched and missing skills, a match percentage and a step-by-step roadmap you can tick off
- **Project Idea Generator** (`/ideas`): 28 curated ideas ranked by your skills, interests and level; save ideas or start one as a project
- **Profile Strength Meter**: live percentage with a checklist, on your profile, the edit page and the home page
- **Project Showcase** (`/projects`, and the Projects tab on every profile): screenshots, stack, GitHub and demo links, your role, filters and a detail modal
- **Shareable Identity Card** (`/card`, public route `/card/:handle`): QR code, copy link, share, download as PNG

## Notes
- There is no backend. Accounts, posts, comments, projects and challenge results are stored per account in `localStorage`, so two accounts in one browser never mix.
- Identity-card links carry a small snapshot of the card (`#d=…`), so they open on any device once the app is deployed. On localhost they only open on your computer.
- Leaderboard rivals are the sample developers with deterministic scores.
- Images are resized in the browser before saving to keep storage small.
- Edit challenge questions in `src/data/challenges.js`, roles in `src/data/roles.js`, project ideas in `src/data/ideas.js`.

## What's new in this version
- All posts and comments are now English and bundled with the app (src/data/feed.js). Developers still load from JSONPlaceholder.
- Posts carry images: generated certificates, achievement cards, project screenshots and code cards (src/lib/art.js).
- AI Career Copilot (/copilot) and Developer Insights (/insights): streaming answers, skill radar, DevScore chart, activity heatmap, skill demand and AI recommended connections.
- Write page: Writing assistant and certificate/achievement image generator.
- Home: AI daily brief. New fonts: Space Grotesk and Plus Jakarta Sans.
- The "AI" runs locally in the browser (rule-based), so no API key is needed.
