// Target roles for the Skill Gap Analyzer.
// `core` skills carry more weight than `bonus` skills.
export const ROLES = {
  'Frontend Developer': {
    blurb: 'Build fast, accessible interfaces people enjoy using.',
    core: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Responsive Design'],
    bonus: ['TypeScript', 'Testing', 'Accessibility', 'Next.js', 'Design Systems'],
  },
  'Backend Developer': {
    blurb: 'Design APIs, data models and services that scale.',
    core: ['Node.js', 'SQL', 'REST APIs', 'Git', 'Authentication', 'Databases'],
    bonus: ['TypeScript', 'Docker', 'Testing', 'GraphQL', 'Redis'],
  },
  'Full-Stack Developer': {
    blurb: 'Ship complete features from the database to the browser.',
    core: ['JavaScript', 'React', 'Node.js', 'SQL', 'REST APIs', 'Git'],
    bonus: ['TypeScript', 'Docker', 'Testing', 'CSS', 'GraphQL'],
  },
  'DevOps Engineer': {
    blurb: 'Automate delivery and keep production healthy.',
    core: ['Linux', 'Docker', 'CI/CD', 'Git', 'Cloud (AWS)', 'Networking'],
    bonus: ['Kubernetes', 'Terraform', 'Monitoring', 'Python', 'Security'],
  },
  'Data Scientist': {
    blurb: 'Turn raw data into models and decisions.',
    core: ['Python', 'SQL', 'Statistics', 'Pandas', 'Machine Learning', 'Data Visualization'],
    bonus: ['Deep Learning', 'Git', 'Cloud (AWS)', 'Spark', 'AI/ML'],
  },
  'Mobile Developer': {
    blurb: 'Create polished apps for phones and tablets.',
    core: ['JavaScript', 'React Native', 'Git', 'REST APIs', 'UI Design', 'State Management'],
    bonus: ['TypeScript', 'Testing', 'Swift', 'Kotlin', 'Firebase'],
  },
};

// Learning steps for each skill. Every skill gets 3 steps: learn, practise, prove.
const STEPS = {
  HTML: ['Learn semantic tags, forms and landmarks', 'Rebuild a landing page from a design', 'Run an accessibility audit on your page'],
  CSS: ['Master the box model, flexbox and grid', 'Build a responsive layout without a framework', 'Add themes with CSS variables'],
  JavaScript: ['Learn scope, closures, promises and array methods', 'Build a small app with fetch and DOM events', 'Solve 10 problems and explain each solution'],
  React: ['Learn components, props, state and effects', 'Build a CRUD app with routing', 'Optimise renders and add custom hooks'],
  TypeScript: ['Learn types, interfaces and generics', 'Convert a small JS project to TypeScript', 'Type your API responses end to end'],
  Git: ['Learn commit, branch, merge and rebase', 'Open a pull request on an open-source repo', 'Resolve a merge conflict on purpose'],
  'Responsive Design': ['Learn mobile-first design and media queries', 'Make one of your projects work from 320px to 1440px', 'Test on a real phone and fix what breaks'],
  Testing: ['Learn the testing pyramid and a test runner', 'Write unit tests for utility functions', 'Add component or API tests to a project'],
  Accessibility: ['Learn WCAG basics and keyboard navigation', 'Audit a page with a screen reader', 'Fix every issue and document the changes'],
  'Next.js': ['Learn file routing, SSR and SSG', 'Build a blog with dynamic routes', 'Deploy it and measure performance'],
  'Design Systems': ['Learn design tokens and component APIs', 'Build a small component library', 'Document it with usage examples'],
  'Node.js': ['Learn modules, the event loop and streams', 'Build a REST API with Express', 'Add validation, logging and error handling'],
  SQL: ['Learn SELECT, JOIN and GROUP BY', 'Design a normalised schema for a small app', 'Optimise a slow query with indexes'],
  'REST APIs': ['Learn resources, verbs and status codes', 'Build and document a CRUD API', 'Add pagination, filtering and versioning'],
  Authentication: ['Learn sessions, JWTs and password hashing', 'Add sign-up and login to an API', 'Add role-based access control'],
  Databases: ['Compare relational and document databases', 'Model a project in both', 'Add migrations and backups'],
  Docker: ['Learn images, containers and volumes', 'Containerise one of your apps', 'Use docker-compose with a database'],
  GraphQL: ['Learn schemas, queries and mutations', 'Build a small GraphQL server', 'Consume it from a React client'],
  Redis: ['Learn caching and key expiry', 'Cache a slow endpoint', 'Measure the improvement'],
  Linux: ['Learn the shell, permissions and processes', 'Set up a server and harden SSH', 'Write a bash script that automates a task'],
  'CI/CD': ['Learn pipelines, stages and artifacts', 'Add lint, test and build to GitHub Actions', 'Deploy automatically on merge'],
  'Cloud (AWS)': ['Learn compute, storage and IAM basics', 'Host a static site and an API', 'Add monitoring and a billing alert'],
  Networking: ['Learn DNS, HTTP, TLS and load balancing', 'Trace a request from browser to server', 'Configure a reverse proxy'],
  Kubernetes: ['Learn pods, services and deployments', 'Run an app on a local cluster', 'Add autoscaling and health checks'],
  Terraform: ['Learn providers, state and modules', 'Provision a small environment', 'Destroy and recreate it from code'],
  Monitoring: ['Learn metrics, logs and traces', 'Add a dashboard and alerts', 'Run a game-day incident drill'],
  Security: ['Learn the OWASP Top 10', 'Scan one of your apps for issues', 'Fix and retest every finding'],
  Python: ['Learn syntax, data structures and modules', 'Automate a task with a script', 'Package a small CLI tool'],
  Statistics: ['Learn distributions, sampling and hypothesis tests', 'Analyse a public dataset', 'Explain the findings in plain language'],
  Pandas: ['Learn DataFrames, grouping and merging', 'Clean a messy CSV', 'Produce a reusable analysis notebook'],
  'Machine Learning': ['Learn supervised learning and evaluation metrics', 'Train and compare three models', 'Deploy one behind a simple API'],
  'Data Visualization': ['Learn chart choice and colour use', 'Build a dashboard from real data', 'Present three insights from it'],
  'Deep Learning': ['Learn neural networks and backpropagation', 'Train an image classifier', 'Fine-tune a pre-trained model'],
  Spark: ['Learn RDDs, DataFrames and partitions', 'Process a large dataset', 'Tune a slow job'],
  'AI/ML': ['Learn core AI concepts and tooling', 'Build a small model-powered feature', 'Evaluate and document its limits'],
  'React Native': ['Learn core components and navigation', 'Build a two-screen app', 'Run it on a real device'],
  'UI Design': ['Learn layout, spacing and typography', 'Redesign one screen in Figma', 'Implement it and compare'],
  'State Management': ['Learn local, shared and server state', 'Refactor an app to use context or a store', 'Add persistence and optimistic updates'],
  Swift: ['Learn Swift syntax and optionals', 'Build a SwiftUI list-detail app', 'Publish it to TestFlight'],
  Kotlin: ['Learn Kotlin syntax and coroutines', 'Build a Jetpack Compose app', 'Add local storage'],
  Firebase: ['Learn auth, Firestore and hosting', 'Add real-time data to an app', 'Secure it with rules'],
};

export const stepsFor = (skill) =>
  STEPS[skill] || [`Learn the fundamentals of ${skill}`, `Build a small project using ${skill}`, `Share what you built and what you learned`];

// Every skill that can be picked anywhere in the app.
export const ALL_SKILLS = [...new Set(Object.values(ROLES).flatMap((r) => [...r.core, ...r.bonus]))].sort();

// Aliases so "reactjs", "node" or "js" still match.
const ALIASES = {
  js: 'javascript', reactjs: 'react', 'react.js': 'react', node: 'node.js', nodejs: 'node.js', ts: 'typescript',
  postgres: 'sql', postgresql: 'sql', mysql: 'sql', css3: 'css', html5: 'html', aws: 'cloud (aws)', ml: 'machine learning',
  ai: 'ai/ml', 'rest': 'rest apis', 'api': 'rest apis', 'apis': 'rest apis', k8s: 'kubernetes', nextjs: 'next.js', 'next': 'next.js',
  testing: 'testing', jest: 'testing', cicd: 'ci/cd', 'a11y': 'accessibility', 'responsive': 'responsive design', 'mongodb': 'databases',
};
export const normSkill = (s) => {
  const k = String(s).trim().toLowerCase();
  return ALIASES[k] || k;
};
