// One challenge is published each week; the bank rotates automatically.
// `answer` is the index of the correct option.
export const CHALLENGES = [
  { id: 'js-gotchas', title: 'JavaScript Gotchas', topic: 'JavaScript', blurb: 'Five classic quirks that trip up even experienced developers.',
    questions: [
      { q: 'What does this print?', code: 'console.log(typeof null);', options: ['"null"', '"object"', '"undefined"', '"number"'], answer: 1, why: 'typeof null returns "object". It is a long-standing quirk of the language.' },
      { q: 'What does this print?', code: 'console.log(0.1 + 0.2 === 0.3);', options: ['true', 'false', 'undefined', 'It throws an error'], answer: 1, why: 'Floating-point rounding makes 0.1 + 0.2 equal 0.30000000000000004.' },
      { q: 'What does this print?', code: 'console.log([1, 2, 3].map(parseInt));', options: ['[1, 2, 3]', '[1, NaN, NaN]', '[NaN, NaN, NaN]', '[1, 2, NaN]'], answer: 1, why: 'map passes (value, index), so parseInt gets radix 0, 1, 2. Radix 1 and "3" in base 2 both give NaN.' },
      { q: 'What does this print?', code: 'console.log([] + []);', options: ['[]', '0', '"" (an empty string)', 'undefined'], answer: 2, why: 'Both arrays convert to empty strings, and "" + "" is "".' },
      { q: 'What does this log?', code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}', options: ['0 1 2', '3 3 3', '0 0 0', '1 2 3'], answer: 1, why: 'var is function-scoped, so every callback sees the same i, which is 3 once the loop ends. let would print 0 1 2.' },
    ] },
  { id: 'css-mastery', title: 'CSS Mastery', topic: 'CSS', blurb: 'Layout, specificity and units: the parts of CSS you use every day.',
    questions: [
      { q: 'Which declaration turns an element into a flex container?', options: ['display: flex;', 'position: flex;', 'flex: container;', 'float: flex;'], answer: 0, why: 'display: flex makes the element a flex container and its children flex items.' },
      { q: 'Which selector has the highest specificity?', options: ['ul li a', '.menu .link', 'a:hover', '#nav a'], answer: 3, why: 'An ID counts above any number of classes. #nav a is (1,0,1) while .menu .link is (0,2,0).' },
      { q: 'What does box-sizing: border-box do?', options: ['Adds a border to every box', 'Includes padding and border inside the declared width and height', 'Removes margins', 'Makes the box a flex item'], answer: 1, why: 'With border-box, width and height include padding and border, which makes sizing predictable.' },
      { q: 'Which unit is relative to the root element\u2019s font size?', options: ['em', 'vw', 'rem', 'ch'], answer: 2, why: 'rem is relative to the font size of the root (html) element. em is relative to the parent.' },
      { q: 'How does position: sticky behave?', options: ['It is removed from the document flow', 'It scrolls normally until a threshold, then sticks within its container', 'It is always fixed to the viewport', 'It only works on tables'], answer: 1, why: 'A sticky element acts relative until it reaches its offset (such as top: 0), then stays put within its scroll container.' },
    ] },
  { id: 'react-core', title: 'React Fundamentals', topic: 'React', blurb: 'State updates, effects and keys: the ideas behind every React app.',
    questions: [
      { q: 'After one click, what is n?', code: 'const [n, setN] = useState(0);\nfunction onClick() {\n  setN(n + 1);\n  setN(n + 1);\n  setN(n + 1);\n}', options: ['0', '1', '3', 'undefined'], answer: 1, why: 'Each call uses the same n from this render (0), so all three set the state to 1. Use setN(c => c + 1) to add three.' },
      { q: 'When does useEffect(fn, []) run?', options: ['On every render', 'Only after the first render', 'Before the first render', 'Only when props change'], answer: 1, why: 'An empty dependency array runs the effect once after the component mounts (twice in StrictMode during development).' },
      { q: 'Why do list items need a stable key?', options: ['To style them', 'To help React match items between renders', 'To make them clickable', 'To sort them automatically'], answer: 1, why: 'Keys let React tell which items were added, removed or moved, so it updates the right DOM nodes and state.' },
      { q: 'Which is the correct way to add an item to array state?', options: ['items.push(x); setItems(items);', 'setItems([...items, x]);', 'items[items.length] = x;', 'setItems(items.push(x));'], answer: 1, why: 'State must be treated as immutable. Create a new array so React sees a changed reference.' },
      { q: 'What is useMemo for?', options: ['Storing data in localStorage', 'Caching a computed value until its dependencies change', 'Running code after render', 'Sharing state between components'], answer: 1, why: 'useMemo skips an expensive calculation when its dependencies have not changed.' },
    ] },
  { id: 'git-terminal', title: 'Git & Terminal', topic: 'Tools', blurb: 'Commands you will type hundreds of times a year.',
    questions: [
      { q: 'Which command creates a new branch and switches to it?', options: ['git branch -d feature', 'git merge feature', 'git checkout -b feature', 'git stash feature'], answer: 2, why: 'git checkout -b feature (or git switch -c feature) creates the branch and switches to it in one step.' },
      { q: 'What does git stash do?', options: ['Deletes uncommitted changes forever', 'Temporarily shelves uncommitted changes', 'Pushes commits to the remote', 'Creates a tag'], answer: 1, why: 'Stash saves your working changes on a stack so you can switch tasks, then restore them with git stash pop.' },
      { q: 'How does git rebase differ from git merge?', options: ['Rebase deletes the other branch', 'Rebase replays your commits on top of another base, rewriting history', 'Rebase only works on tags', 'There is no difference'], answer: 1, why: 'Rebase moves your commits onto a new base, producing a linear history. Merge keeps both histories and adds a merge commit.' },
      { q: 'What does git reset --hard HEAD~1 do?', options: ['Undoes the last commit and discards its changes', 'Creates a new commit', 'Only unstages files', 'Shows the previous commit'], answer: 0, why: '--hard moves the branch back one commit and overwrites your working files, so uncommitted work is lost.' },
      { q: 'What do the permissions of chmod 755 file mean?', options: ['Everyone can read, write and execute', 'Owner: read, write, execute. Group and others: read, execute', 'Owner can only read', 'Nobody can execute it'], answer: 1, why: '7 = rwx for the owner, 5 = r-x for the group and for others.' },
    ] },
  { id: 'dsa-basics', title: 'Data Structures & Algorithms', topic: 'Computer Science', blurb: 'Complexity, structures and recursion in five questions.',
    questions: [
      { q: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], answer: 1, why: 'Each step halves the search space, so it takes about log2(n) steps.' },
      { q: 'Which data structure is last-in, first-out (LIFO)?', options: ['Queue', 'Stack', 'Linked list', 'Heap'], answer: 1, why: 'A stack pushes and pops from the same end, like a pile of plates.' },
      { q: 'What is the average lookup time in a hash table?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n\u00b2)'], answer: 0, why: 'A good hash function spreads keys so a lookup takes constant time on average.' },
      { q: 'What does this print?', code: 'function f(n) {\n  return n <= 1 ? 1 : n * f(n - 1);\n}\nconsole.log(f(5));', options: ['15', '24', '120', '720'], answer: 2, why: 'This is factorial: 5 \u00d7 4 \u00d7 3 \u00d7 2 \u00d7 1 = 120.' },
      { q: 'Which sorting algorithm guarantees O(n log n) in the worst case?', options: ['Bubble sort', 'Quick sort (naive pivot)', 'Merge sort', 'Insertion sort'], answer: 2, why: 'Merge sort always splits in half and merges in linear time. Naive quick sort can degrade to O(n\u00b2).' },
    ] },
  { id: 'sql-apis', title: 'SQL & APIs', topic: 'Backend', blurb: 'Queries, joins and HTTP: the backend essentials.',
    questions: [
      { q: 'Which clause filters groups after GROUP BY?', options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], answer: 1, why: 'WHERE filters rows before grouping. HAVING filters the groups afterwards, for example HAVING COUNT(*) > 5.' },
      { q: 'Which HTTP status code means a resource was created?', options: ['200', '201', '204', '301'], answer: 1, why: '201 Created is the right response to a successful POST that creates something.' },
      { q: 'What does a LEFT JOIN return?', options: ['Only rows that match in both tables', 'All rows from the left table, with NULLs where the right has no match', 'All rows from the right table', 'The cross product of both tables'], answer: 1, why: 'LEFT JOIN keeps every left-table row and fills right-table columns with NULL when nothing matches.' },
      { q: 'Which of these HTTP methods is defined as idempotent?', options: ['POST', 'PUT', 'PATCH', 'None of them'], answer: 1, why: 'Sending the same PUT many times leaves the resource in the same state. POST normally creates a new thing each time.' },
      { q: 'How does COUNT(column) differ from COUNT(*)?', options: ['It counts duplicates twice', 'It ignores NULL values in that column', 'It is always faster', 'It only works on numbers'], answer: 1, why: 'COUNT(*) counts rows. COUNT(column) counts only rows where that column is not NULL.' },
    ] },
];
