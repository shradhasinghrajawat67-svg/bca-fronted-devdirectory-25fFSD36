import { useSocial } from '../context/SocialContext';
import useGuard from '../hooks/useGuard';
import { useToast } from '../context/ToastContext';

export default function FollowButton({ userId, name }) {
  const { has, toggle } = useSocial();
  const guard = useGuard();
  const toast = useToast();
  const on = has('follows', userId);
  const click = guard(() => {
    toggle('follows', userId);
    toast(on ? `Unfollowed ${name || 'developer'}.` : `You are now following ${name || 'this developer'}.`, 'success');
  }, 'follow developers');
  return (
    <button className={`btn btn-sm ${on ? 'btn-outline' : 'btn-primary'}`} aria-pressed={on} onClick={click}>
      {on ? 'Following' : 'Follow'}
    </button>
  );
}
