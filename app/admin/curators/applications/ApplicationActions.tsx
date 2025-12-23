'use client';

import { useState } from 'react';

interface ApplicationActionsProps {
  applicationId: string;
  status: string;
}

export default function ApplicationActions({ applicationId, status }: ApplicationActionsProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading('approve');
    setError(null);

    try {
      const response = await fetch(`/api/admin/seller-applications/${applicationId}/approve`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve application');
      }

      // Reload page to show updated status
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading('reject');
    setError(null);

    const decisionNote = prompt('Optional: Enter a reason for rejection (or leave blank):');

    try {
      const response = await fetch(`/api/admin/seller-applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          decisionNote: decisionNote || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject application');
      }

      // Reload page to show updated status
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(null);
    }
  };

  if (status !== 'PENDING') {
    return null;
  }

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex space-x-2">
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          className="text-green-600 hover:text-green-900 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'approve' ? 'Approving...' : 'Approve'}
        </button>
        <button
          onClick={handleReject}
          disabled={loading !== null}
          className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'reject' ? 'Rejecting...' : 'Reject'}
        </button>
      </div>
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}
