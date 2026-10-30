export default function SkeletonLoader({ variant = 'card', count = 6 }) {
  return (
    <div
      className={variant === 'card' ? 'grid' : 'skeleton-stack'}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {Array.from({ length: count }, (_, i) =>
        variant === 'card' ? (
          <div className="user-card skeleton-card" key={i}>
            <div className="skeleton skeleton-avatar" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line" />
          </div>
        ) : (
          <div className="skeleton skeleton-row" key={i} />
        )
      )}
    </div>
  );
}
