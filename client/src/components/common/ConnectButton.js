import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Clock, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ConnectButton({ userId, size = 'sm' }) {
  const { user } = useAuth();
  const [status, setStatus] = useState('none');
  const [connectionId, setConnectionId] = useState(null);
  const [isRequester, setIsRequester] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id === userId) { setLoading(false); return; }
    api.get(`/connections/status/${userId}`)
      .then(({ data }) => {
        setStatus(data.status);
        setConnectionId(data.connection?._id);
        setIsRequester(data.isRequester);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, user]);

  if (user?._id === userId || loading) return null;

  const handleConnect = async () => {
    try {
      await api.post(`/connections/request/${userId}`);
      setStatus('pending');
      setIsRequester(true);
      toast.success('Connection request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleWithdraw = async () => {
    try {
      await api.delete(`/connections/${connectionId}`);
      setStatus('none');
      toast.success('Request withdrawn');
    } catch (err) {
      toast.error('Failed to withdraw request');
    }
  };

  const handleRemove = async () => {
    try {
      await api.delete(`/connections/${connectionId}`);
      setStatus('none');
      toast.success('Connection removed');
    } catch (err) {
      toast.error('Failed to remove connection');
    }
  };

  const btnClass = `btn btn-${size}`;

  if (status === 'none') return (
    <button className={`${btnClass} btn-primary`} onClick={handleConnect}>
      <UserPlus size={13} /> Connect
    </button>
  );

  if (status === 'pending' && isRequester) return (
    <button className={`${btnClass} btn-secondary`} onClick={handleWithdraw}>
      <Clock size={13} /> Pending
    </button>
  );

  if (status === 'pending' && !isRequester) return (
    <span className={`${btnClass} btn-secondary`} style={{ color: 'var(--warning)' }}>
      <Clock size={13} /> Requested You
    </span>
  );

  if (status === 'accepted') return (
    <button className={`${btnClass} btn-secondary`} onClick={handleRemove}
      style={{ color: 'var(--success)' }}>
      <UserCheck size={13} /> Connected
    </button>
  );

  return null;
}
