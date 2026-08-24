import { useState } from 'react';
import {
  useGetMySubvendorsQuery,
  useInviteSubvendorMutation,
  useRemoveSubvendorMutation,
} from '../service';

export function useSubvendors() {
  const { data: links = [], isLoading, isError, refetch } = useGetMySubvendorsQuery();
  const [inviteMutation, inviteState] = useInviteSubvendorMutation();
  const [removeMutation] = useRemoveSubvendorMutation();
  const [phone, setPhone] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);

  const active = links.filter((l) => l.status === 'active');
  const pending = links.filter((l) => l.status === 'pending');

  const invite = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setInviteError('Enter a valid 10-digit mobile number');
      return;
    }
    setInviteError(null);
    try {
      await inviteMutation({ phone: digits }).unwrap();
      setPhone('');
    } catch {
      setInviteError('Could not send the invite. Please try again.');
    }
  };

  const remove = (linkId: string) => void removeMutation(linkId);

  return {
    active,
    pending,
    isLoading,
    isError,
    refetch,
    phone,
    setPhone,
    invite,
    isInviting: inviteState.isLoading,
    inviteError,
    remove,
  };
}
