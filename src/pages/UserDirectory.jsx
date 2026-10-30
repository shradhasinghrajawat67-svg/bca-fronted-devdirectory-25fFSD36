import { useMemo, useState } from 'react';
import useCommunity from '../hooks/useCommunity';
import useDebounce from '../hooks/useDebounce';
import UserCard from '../components/UserCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';

export default function UserDirectory() {
  const { loading, error, retry, users } = useCommunity();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 200);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return q ? users.filter((u) => u.name.toLowerCase().includes(q) || u.company.name.toLowerCase().includes(q)) : users;
  }, [users, debounced]);

  return (
    <section className="container page">
      <h1>Developers</h1>
      <label className="field search">
        <span>Search by name or company</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “Leanne” or “Romaguera”" />
      </label>
      {error && <AlertBanner message={error} onRetry={retry} />}
      {loading && <SkeletonLoader />}
      {!loading && !error && (filtered.length
        ? <div className="grid">{filtered.map((u) => <UserCard key={u.id} user={u} />)}</div>
        : <p className="empty">No developers match “{debounced}”. Clear the search to see everyone.</p>)}
    </section>
  );
}
