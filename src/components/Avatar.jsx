import { useState } from 'react';

export default function Avatar({ user, size = 40 }) {
  const [failed, setFailed] = useState(false);
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('');
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (!user.avatar || failed) return <span className="avatar" style={style} aria-hidden="true">{initials}</span>;
  return <img className="avatar" style={style} src={user.avatar} alt="" onError={() => setFailed(true)} />;
}
