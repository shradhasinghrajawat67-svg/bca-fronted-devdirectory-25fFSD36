import { achievementArt, certificateArt, codeArt, dashboardArt, metricArt } from '../lib/art';

// All community content is written in English and lives in the app, so the feed looks the same
// every time (no placeholder text from the public API). Images are generated SVG artwork.
export const AUTHORS = {
  1: 'Leanne Graham', 2: 'Ervin Howell', 3: 'Clementine Bauch', 4: 'Patricia Lebsack', 5: 'Chelsey Dietrich',
  6: 'Dennis Schulist', 7: 'Kurtis Weissnat', 8: 'Nicholas Runolfsdottir', 9: 'Glenna Reichert', 10: 'Clementina DuBuque',
};

const DAY = 86400000;
const BASE = Date.UTC(2026, 9, 25, 9, 30);

const cert = (u, title, issuer, date, id, tone, tags, body) => ({
  userId: u, kind: 'certification', title: `I earned the ${title}`, tags,
  description: `Certified by ${issuer} · credential ${id}`,
  body, cert: { issuer, id, date, name: title },
  cover: certificateArt({ title, issuer, name: AUTHORS[u], date, credentialId: id, tone }),
  coverAlt: `Certificate: ${title}, issued by ${issuer} to ${AUTHORS[u]}`,
});
const win = (u, title, subtitle, stat, tone, tags, body) => ({
  userId: u, kind: 'achievement', title, tags, description: subtitle, body,
  cover: achievementArt({ title, subtitle, stat, tone }), coverAlt: `Achievement card: ${title}`,
});
const metric = (u, title, value, label, tone, tags, body, description) => ({
  userId: u, kind: 'achievement', title, tags, description, body,
  cover: metricArt({ title, value, label, tone }), coverAlt: `Growth chart: ${title}, ${value} ${label}`,
});
const proj = (u, title, url, tone, tags, description, body) => ({
  userId: u, kind: 'project', title, tags, description, body,
  cover: dashboardArt({ title, tone, url }), coverAlt: `Screenshot of ${title}`,
});
const art = (u, title, tone, lines, tags, description, body) => ({
  userId: u, kind: 'article', title, tags, description, body,
  cover: codeArt({ title, lines, tone }), coverAlt: `Code snippet from the article: ${title}`,
});
const upd = (u, text, tags) => ({ userId: u, kind: 'update', title: text.slice(0, 57), body: text, description: '', tags });

const RAW = [
  cert(3, 'AWS Certified Solutions Architect – Associate', 'Amazon Web Services', 'October 2026', 'AWS-SAA-482913', 'amber', ['DevOps', 'Career'],
    'After eight weeks of evening study I passed the **AWS Solutions Architect Associate** exam.\n\n## What worked for me\n- Building a small multi-AZ project instead of only watching videos\n- Practice exams, then reading every wrong answer twice\n- Writing a one-page cheat sheet for networking and IAM\n\nNext stop: the Professional level. Happy to share my notes with anyone preparing.'),
  art(8, 'Why we stopped fetching data inside useEffect', 'violet', ['function Profile({ id }) {', '  const { data, isLoading } = useQuery({', "    queryKey: ['user', id],", '    queryFn: () => fetchUser(id),', '  });', '  return isLoading ? <Spinner /> : <Card user={data} />;', '}'],
    ['React', 'TypeScript'], 'Server state deserves its own tools. Here is what changed after we moved to a query library.',
    'For years our components fetched data inside **useEffect**, and for years we fixed the same bugs: race conditions, stale data and missing loading states.\n\n## What we changed\n- Moved all server state into a query library with caching\n- Kept useEffect for real side effects only\n- Added optimistic updates for likes and comments\n\n## Result\nFewer lines of code, no more duplicate requests and a much easier testing story. If your components have three useState calls just to load one list, this is worth a weekend.'),
  metric(1, 'Cut API latency by 63%', '-63%', 'p95 response time', 'green', ['Node.js', 'DevOps'],
    'Our checkout API was slow under load. Over three weeks the team brought the p95 latency from 410 ms down to 150 ms.\n\n## The three biggest wins\n- Added a read-through cache for product data\n- Replaced N+1 queries with a single batched query\n- Enabled HTTP keep-alive between services\n\nMeasure first, change one thing at a time, and keep the graph on a big screen. It keeps everyone honest.',
    'p95 latency fell from 410 ms to 150 ms in three weeks.'),
  proj(6, 'Design System v2 is live', 'design.northwind.dev', 'violet', ['CSS', 'React'], 'Tokens, 48 components and full dark mode, adopted by six product teams.',
    'Today we shipped **Design System v2** to every product team.\n\n## Highlights\n- Design tokens for colour, spacing and type, generated from one source\n- 48 accessible components with keyboard support\n- Dark mode and density settings out of the box\n\nThe biggest lesson: documentation is part of the product. Every component ships with live examples and do and don’t guidance.'),
  art(5, 'A practical guide to evaluating LLM outputs', 'blue', ['def evaluate(model, cases):', '    scores = []', '    for case in cases:', '        answer = model(case.prompt)', '        scores.append(judge(answer, case.expected))', '    return sum(scores) / len(scores)'],
    ['AI', 'Testing'], 'You cannot improve what you cannot measure. A simple evaluation loop for language model features.',
    'Shipping an AI feature without evaluation is guessing. Here is the loop we use.\n\n## Build a golden set\nCollect 50 to 100 real prompts with the answers you would be happy to see. Keep it in version control.\n\n## Score automatically\n- Exact checks for facts and formats\n- A rubric-based judge for tone and helpfulness\n- Human review for a small random sample\n\n## Track it over time\nRun the set on every prompt or model change and chart the score. Regressions show up before your users notice them.'),
  cert(2, 'Meta Front-End Developer Professional Certificate', 'Meta', 'September 2026', 'META-FE-770215', 'blue', ['React', 'Career'],
    'I finished the **Meta Front-End Developer** programme and passed the final capstone review.\n\n## Favourite parts\n- The React testing module\n- Building a full restaurant booking app as the capstone\n- Peer code reviews, which taught me more than the videos\n\nIf you are switching careers into frontend, this is a structured way to build a portfolio at the same time.'),
  art(4, 'How I run 1:1s that people actually value', 'amber', ['## 1:1 agenda', '1. Their topics first', '2. Career and growth', '3. Feedback both ways', '4. Blockers I can remove', '5. Agree one action each'],
    ['Career'], 'A simple structure for weekly one-on-ones that builds trust instead of status updates.',
    'A good 1:1 is the one meeting where the other person sets the agenda.\n\n## My structure\n- **Their topics first**, always\n- Ten minutes on growth: skills, stretch work, visibility\n- Feedback in both directions\n- One action each, written down\n\n## Things I stopped doing\n- Using the time for project status\n- Cancelling when things get busy\n\nConsistency matters more than the perfect template.'),
  metric(7, '10,000 downloads in the first month', '10k', 'app downloads', 'blue', ['React', 'Career'],
    'Our offline-first notes app just passed **10,000 downloads** one month after launch.\n\n## What helped\n- A very fast cold start, under 800 ms on mid-range phones\n- Honest app store screenshots\n- Replying to every review in the first two weeks\n\nThank you to everyone who tested the beta and sent feedback.',
    'Passed 10,000 downloads one month after launch.'),
  art(9, 'Designing idempotent APIs in Node.js', 'green', ["app.post('/payments', async (req, res) => {", "  const key = req.get('Idempotency-Key');", '  const hit = await store.get(key);', '  if (hit) return res.json(hit);', '  const result = await charge(req.body);', '  await store.set(key, result);', '  res.status(201).json(result);', '});'],
    ['Node.js', 'Testing'], 'Retries are inevitable. Make them safe with idempotency keys.',
    'Networks fail, clients retry, and without care a retry charges a customer twice.\n\n## The pattern\n- The client sends a unique **Idempotency-Key** header\n- The server stores the result under that key\n- A repeated request returns the stored result instead of repeating the work\n\n## Details that matter\n- Expire keys after 24 hours\n- Lock the key while the first request is still running\n- Reject a reused key with a different body'),
  proj(10, 'Open-sourced our real-time collaboration toolkit', 'github.com/orbit-labs/sync', 'slate', ['Node.js', 'React'], 'CRDT-based editing, presence and comments in a 12 KB library.',
    'We just open-sourced **Orbit Sync**, the toolkit behind our collaborative editor.\n\n## What is inside\n- CRDT-based document model that merges edits without conflicts\n- Presence cursors and typing indicators\n- A tiny React hook, around 12 KB gzipped\n\nIssues and pull requests are welcome. There is a good first issue label for newcomers.'),
  win(3, 'Zero-downtime Kubernetes migration', 'Moved 40 services in one quarter', '0 minutes of downtime', 'green', ['DevOps'],
    'This quarter we moved **40 services** from virtual machines to Kubernetes without a single minute of downtime.\n\n## How we did it\n- Ran old and new stacks side by side behind one load balancer\n- Shifted traffic 5% at a time with automatic rollback\n- Practised the cutover in staging three times\n\nBoring migrations are the best migrations.'),
  cert(8, 'Web Accessibility Specialist (WAS)', 'IAAP', 'August 2026', 'IAAP-WAS-319047', 'green', ['CSS', 'Career'],
    'I am now an **IAAP Certified Web Accessibility Specialist**.\n\n## Three habits I changed immediately\n- Test with a keyboard before every pull request\n- Use native elements before reaching for ARIA\n- Check colour contrast in the design tool, not at the end\n\nAccessibility is not extra work. It is part of building the thing properly.'),
  art(1, 'Rate limiting: token bucket vs sliding window', 'blue', ['class TokenBucket {', '  take() {', '    this.refill();', '    if (this.tokens < 1) return false;', '    this.tokens -= 1;', '    return true;', '  }', '}'],
    ['Node.js', 'DevOps'], 'Two common algorithms, when each one fits, and a 20-line implementation.',
    'Every public API needs rate limiting. The two algorithms you will meet most often:\n\n## Token bucket\nTokens refill at a steady rate and each request spends one. It allows short bursts, which suits most user-facing APIs.\n\n## Sliding window\nCounts requests in the last N seconds. It is stricter and smoother, but needs more memory per client.\n\n## My rule of thumb\nStart with a token bucket in Redis. Switch only if bursts cause real problems.'),
  win(5, 'Winner: AI for Good Hackathon 2026', 'Wildfire risk model built in 36 hours', '1st of 120 teams', 'rose', ['AI'],
    'Our team of four won the **AI for Good Hackathon** with a wildfire risk map built in 36 hours.\n\n## The stack\n- Satellite and weather data, cleaned with Python\n- A gradient boosted model with calibrated risk scores\n- A simple map interface for emergency planners\n\nThe best part was a ten minute chat with a fire service coordinator who told us what they would really use.'),
  art(6, 'CSS container queries changed how I build components', 'violet', ['.card-wrap { container-type: inline-size; }', '', '@container (min-width: 480px) {', '  .card { display: grid; grid-template-columns: 160px 1fr; }', '}'],
    ['CSS'], 'Components that respond to their own width, not the viewport.',
    'Media queries ask how wide the screen is. **Container queries** ask how wide the component is, which is what we really wanted all along.\n\n## Why it matters\n- A card can switch layout in a sidebar and in the main column without extra classes\n- Design system components become truly reusable\n- Fewer overrides and fewer breakpoints\n\nSupport is excellent in current browsers, so you can use them today.'),
  proj(2, 'An invoicing app built in six weeks', 'invoices.brightly.app', 'blue', ['React', 'Node.js'], 'Recurring invoices, PDF export and Stripe payments for freelancers.',
    'I built **Brightly Invoices** with a friend over six evenings a week.\n\n## Features\n- Recurring invoices and automatic reminders\n- One-click PDF export\n- Online payments with card and bank transfer\n\n## What I learned\nScope is everything. We cut half the feature list in week two and shipped something people actually paid for.'),
  cert(9, 'Microsoft Certified: Azure Developer Associate', 'Microsoft', 'July 2026', 'MS-AZ204-558210', 'blue', ['DevOps', 'Node.js'],
    'Passed **AZ-204** on the first attempt.\n\n## How I prepared\n- Two small projects using Functions, Cosmos DB and Service Bus\n- The official learning paths, one module per day\n- Timed practice tests in the final week\n\nThe exam focuses on real scenarios, so hands-on practice made the difference.'),
  win(4, 'Promoted to Engineering Manager', 'Leading a team of eight', 'Team of 8', 'amber', ['Career'],
    'Today I start as **Engineering Manager** for a team of eight engineers.\n\n## Things I want to get right\n- Clear expectations and fast feedback\n- Protect focus time\n- Grow the next generation of leads\n\nThank you to the mentors who took a chance on me when I was a junior developer.'),
  art(10, 'TypeScript tips I wish I knew sooner', 'blue', ["type Status = 'idle' | 'loading' | 'error';", '', 'const config = {', "  retries: 3, mode: 'fast',", '} as const satisfies Config;', '', 'function assertNever(x: never): never { throw x; }'],
    ['TypeScript'], 'Five small features that make large codebases safer.',
    'After five years of TypeScript, these are the habits that paid off most.\n\n## My list\n- Prefer **unions of literals** over enums\n- Use **satisfies** to check a value without widening its type\n- Add an **assertNever** helper so switch statements stay exhaustive\n- Derive types from data instead of repeating them\n- Turn on strict mode early, not later\n\nTypes are documentation that the compiler keeps honest.'),
  cert(7, 'Meta React Native Specialization', 'Meta', 'June 2026', 'META-RN-640182', 'violet', ['React'],
    'I completed the **React Native Specialization** and shipped the capstone app to both stores.\n\n## Takeaways\n- Navigation and state patterns that scale\n- Offline storage and background sync\n- Performance profiling on real devices\n\nNative feels very different from web. Test on a cheap phone early.'),
  proj(5, 'Customer churn prediction pipeline', 'ml.acme-data.io/churn', 'green', ['AI', 'Testing'], 'Weekly retraining, drift alerts and an explainability dashboard.',
    'Our **churn prediction** pipeline now runs every Monday morning without anyone touching it.\n\n## Pipeline\n- Data validation checks before training\n- Automatic retraining with a champion and challenger model\n- Drift alerts sent to the team channel\n- A dashboard that explains each prediction in plain language\n\nCustomer success teams contacted at-risk accounts earlier and saved around 9% of renewals.'),
  art(3, 'Terraform modules: lessons from 200 environments', 'amber', ['module "service" {', '  source  = "./modules/service"', '  name    = var.name', '  env     = var.env', '  replicas = var.env == "prod" ? 3 : 1', '}'],
    ['DevOps'], 'Keep modules small, version them, and never copy and paste an environment.',
    'Managing 200 environments taught us what a good module looks like.\n\n## Rules we follow\n- One module, one responsibility\n- Pin versions and publish releases\n- Expose few variables with sensible defaults\n- Run plan on every pull request\n\n## What to avoid\nHuge modules with dozens of toggles. They become impossible to reason about.'),
  upd(8, 'Just shipped dark mode with automatic contrast checks. Reviewing colour tokens is oddly satisfying.', ['CSS']),
  upd(1, 'Reminder to myself and to you: delete the feature flags once the rollout is finished.', ['Career']),
  upd(2, 'Hot take: the best code review comment is a question, not an instruction. What do you think?', ['Career']),
  win(6, 'Speaker at ReactConf Online 2026', 'Talk: Accessible components at scale', '1,200 live viewers', 'violet', ['React', 'Career'],
    'I gave my first conference talk, **Accessible components at scale**, to more than 1,200 live viewers.\n\n## If you are thinking about speaking\n- Start with a topic you have already taught a colleague\n- Practise out loud, at least five times\n- Record yourself and watch it back\n\nThe community was warm and generous. Submit that proposal.'),
  art(9, 'Testing strategies for event-driven systems', 'green', ["it('publishes OrderPlaced once', async () => {", '  await placeOrder(cart);', "  expect(bus.published('OrderPlaced')).toHaveLength(1);", '});'],
    ['Testing', 'Node.js'], 'Contract tests, replayable events and how to avoid flaky integration suites.',
    'Event-driven systems are hard to test because the interesting behaviour happens between services.\n\n## What works for us\n- **Contract tests** for every event schema\n- Replaying real events from a staging log\n- Assertions on outcomes, not on timing\n\n## What to avoid\nSleeping in tests. Wait for a condition with a clear timeout instead.'),
  cert(10, 'Certified Kubernetes Application Developer (CKAD)', 'Cloud Native Computing Foundation', 'May 2026', 'CNCF-CKAD-904471', 'slate', ['DevOps'],
    'I passed the **CKAD** exam, a two-hour hands-on test in a live cluster.\n\n## Tips\n- Learn kubectl shortcuts and aliases first\n- Practise writing YAML from scratch, quickly\n- Bookmark the official docs pages you will need\n\nTime management matters more than perfection. Skip and return.'),
  upd(4, 'We are hiring two frontend engineers and a data engineer. Remote friendly. Message me if you would like to chat.', ['Career']),
  proj(7, 'Offline-first sync engine for mobile', 'sync.nimbus-mobile.dev', 'amber', ['TypeScript', 'React'], 'Conflict-free local database sync with a 50 ms median merge time.',
    'We built a small **sync engine** that keeps a mobile app fully usable without a connection.\n\n## How it works\n- Every change is stored locally first\n- A background worker syncs when a connection returns\n- Conflicts resolve with per-field timestamps\n\nUsers no longer notice when the network drops, which was the goal from day one.'),
];

export const FEED = RAW.map((p, i) => ({
  status: 'published', featured: i % 9 === 0, ...p,
  id: String(i + 1), userId: String(p.userId),
  date: new Date(BASE - i * 0.8 * DAY).toISOString(),
}));

// Short English comments, picked deterministically per post.
const PEOPLE = [
  ['Priya Nair', 'priya.nair@devmail.io'], ['Marcus Lee', 'marcus.lee@devmail.io'], ['Sofia Alvarez', 'sofia.alvarez@devmail.io'],
  ['Tom Becker', 'tom.becker@devmail.io'], ['Aisha Khan', 'aisha.khan@devmail.io'], ['Jonas Weber', 'jonas.weber@devmail.io'],
  ['Mei Tanaka', 'mei.tanaka@devmail.io'], ['Daniel Okoro', 'daniel.okoro@devmail.io'],
];
const LINES = [
  'This is really useful, thanks for sharing the details.',
  'Congratulations! Well deserved.',
  'Great write-up. Bookmarking this for my team.',
  'Would love to see a follow-up on how you measured the results.',
  'We ran into the same problem last month. This approach would have saved us days.',
  'Clear, practical and honest. More posts like this please.',
  'Inspiring. What was the hardest part?',
  'Sharing this with my colleagues right now.',
  'Any recommended resources for getting started?',
  'Love the structure of this post. Easy to follow.',
  'Thanks! The tips at the end are gold.',
  'Curious how this scales with a larger team.',
];
export const commentsFor = (postId) => {
  const n = Number(postId) || 1;
  return Array.from({ length: 5 }, (_, i) => {
    const [name, email] = PEOPLE[(n * 3 + i * 5) % PEOPLE.length];
    return { id: `${n}-${i}`, name, email, body: LINES[(n * 7 + i * 4) % LINES.length] };
  });
};
