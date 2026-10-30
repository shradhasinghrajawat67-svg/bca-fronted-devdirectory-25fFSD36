import { THEMES, useTheme } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme, compact, toggleCompact } = useTheme();
  return (
    <div className="theme-switcher" role="group" aria-label="Appearance">
      {THEMES.map((t) => (
        <button
          key={t.id}
          className="theme-dot"
          style={{ background: t.dot }}
          aria-label={`${t.label} theme`}
          aria-pressed={theme === t.id}
          title={t.label}
          onClick={() => setTheme(t.id)}
        />
      ))}
      <button className="btn btn-ghost btn-sm" aria-pressed={compact} onClick={toggleCompact} title="Toggle compact layout">
        Compact
      </button>
    </div>
  );
}
