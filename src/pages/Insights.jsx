import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import useCommunity from '../hooks/useCommunity';
import { activityGrid, DEMAND, growthSeries, matchScore, radarAxes } from '../lib/insights';
import { profileStrength } from '../lib/strength';
import { totalPoints } from '../lib/challenge';
import AiStream from '../components/AiStream';
import Avatar from '../components/Avatar';
import ConnectButton from '../components/ConnectButton';
import { AreaChart, BarList, Heatmap, RadarChart, Ring } from '../components/charts';

const SAMPLE = ['JavaScript', 'HTML', 'CSS', 'React', 'Git'];
const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];

export default function Insights() {
  const { user, isAuthenticated } = useAuth();
  const { projects, posts, results } = useSocial();
  const { users } = useCommunity();
  const skills = user?.skills?.length ? user.skills : isAuthenticated ? [] : SAMPLE;
  const key = user?.email || 'guest';

  const data = useMemo(() => {
    const axes = radarAxes(skills);
    const sorted = [...axes].sort((a, b) => b.value - a.value);
    const growth = growthSeries(key, skills, projects.length, posts.length);
    return { axes, strong: sorted[0], weak: sorted[sorted.length - 1], growth, grid: activityGrid(key, posts.length + projects.length) };
  }, [skills, key, projects.length, posts.length]);

  const strength = profileStrength(user || { skills }, projects.length);
  const points = totalPoints(results);
  const delta = data.growth[data.growth.length - 1] - data.growth[0];
  const demand = Object.entries(DEMAND).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([label, value]) => ({ label, value, mine: skills.includes(label) }));
  const matches = useMemo(() => users.filter((u) => u.id !== 'me').map((u) => ({ u, ...matchScore(skills, u.skills) })).sort((a, b) => b.pct - a.pct).slice(0, 4), [users, skills]);

  const insightText = `**Strongest area:** ${data.strong.label}${data.strong.hits ? ` (${data.strong.hits} matching skill${data.strong.hits > 1 ? 's' : ''})` : ''}.\n\n**Biggest opportunity:** ${data.weak.label}. Adding one skill there would widen your profile the most.\n\nYour DevScore moved **${delta >= 0 ? '+' : ''}${delta} points** over eight weeks${points ? ` and you have earned ${points} challenge points` : ''}. ${strength.score < 100 ? `Finishing your profile would add up to ${100 - strength.score} points.` : 'Your profile is complete.'}`;

  return (
    <div className="container page">
      <header className="page-head">
        <h1><span className="ai-badge">AI</span> Developer Insights</h1>
        <p className="lead">A visual read on your skills, momentum and network. Calculated on your device from your profile and activity.</p>
      </header>
      {!isAuthenticated && <p className="notice-soft">Showing a sample profile. <Link to="/signup">Create your profile</Link> to see your own insights.</p>}

      <div className="card insight-ai">
        <h2>AI summary</h2>
        <AiStream key={insightText} steps={['Collecting your skills and activity', 'Scoring six skill areas', 'Comparing eight weeks of momentum', 'Writing your summary']} text={insightText} />
      </div>

      <div className="insights-grid">
        <div className="card"><h2>Skill radar</h2><RadarChart axes={data.axes} /></div>
        <div className="card center-col">
          <h2>Profile strength</h2>
          <Ring value={strength.score} label={strength.level} sub={strength.message.split('—')[0]} size={150} />
          <Link to="/profile/edit" className="btn btn-outline btn-sm">Improve profile</Link>
        </div>
        <div className="card wide"><h2>DevScore momentum <small className="muted">last 8 weeks</small></h2><AreaChart data={data.growth} labels={WEEKS} /></div>
        <div className="card"><h2>Activity <small className="muted">13 weeks</small></h2><Heatmap grid={data.grid} />
          <p className="muted legend-hm">Less <i className="hm-box hm-0" /><i className="hm-box hm-1" /><i className="hm-box hm-2" /><i className="hm-box hm-3" /><i className="hm-box hm-4" /> More</p></div>
        <div className="card"><h2>Skill demand</h2><BarList items={demand} /><p className="muted">Illustrative demand index. Highlighted bars are skills you have.</p></div>
        <div className="card wide">
          <h2>AI recommended connections</h2>
          <ul className="match-list">
            {matches.map(({ u, pct, reason }) => (
              <li key={u.id}>
                <Avatar user={u} size={44} />
                <div><Link to={`/users/${u.id}`}><strong>{u.name}</strong></Link><small className="muted">{u.headline}</small><small>{reason}</small></div>
                <div className="match-pct"><b>{pct}%</b><small className="muted">match</small></div>
                <ConnectButton userId={u.id} name={u.name} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
