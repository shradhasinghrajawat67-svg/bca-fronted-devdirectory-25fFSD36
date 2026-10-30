import { useSocial } from '../context/SocialContext';
import useGuard from '../hooks/useGuard';
import { useToast } from '../context/ToastContext';

// none -> Connect, pending -> Pending (click to withdraw), connected -> Connected (click to remove)
export default function ConnectButton({ userId, name }) {
  const { connStatus, connect, disconnect } = useSocial();
  const guard = useGuard();
  const toast = useToast();
  const status = connStatus(userId);

  const click = guard(() => {
    if (status === 'none') { connect(userId); toast(`Connection request sent to ${name || 'developer'}.`, 'success'); return; }
    const msg = status === 'pending' ? 'Request withdrawn.' : `Removed ${name || 'developer'} from your connections.`;
    if (status === 'connected' && !window.confirm(`Remove ${name || 'this developer'} from your connections?`)) return;
    disconnect(userId);
    toast(msg, 'info');
  }, 'connect with developers');

  const label = status === 'connected' ? 'Connected' : status === 'pending' ? 'Pending' : 'Connect';
  return (
    <button className={`btn btn-sm ${status === 'none' ? 'btn-outline' : 'btn-ghost'}`} aria-pressed={status === 'connected'} onClick={click}
      title={status === 'pending' ? 'Click to withdraw the request' : status === 'connected' ? 'Click to remove this connection' : 'Send a connection request'}>
      {status === 'connected' ? '✓ ' : ''}{label}
    </button>
  );
}
