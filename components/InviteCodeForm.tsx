"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/hooks/useT';

interface InviteCodeFormProps {
  onSuccess?: (data: { curator: { storeName: string }; code: { code: string } }) => void;
  onRedeem?: () => void;
  showRedeemButton?: boolean;
  className?: string;
}

export default function InviteCodeForm({ 
  onSuccess, 
  onRedeem, 
  showRedeemButton = true,
  className = "" 
}: InviteCodeFormProps) {
  const t = useT();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ curator: { storeName: string }; code: { code: string } } | null>(null);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess(null);

    try {
      const response = await fetch('/api/access/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.trim(), 
          email: email.trim() || undefined 
        })
      });

      const result = await response.json();

      if (result.ok) {
        setSuccess(result);
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        const errorMessages: Record<string, string> = {
          invalid: 'Invalid access code',
          expired: 'This access code has expired',
          domain: 'This code is not valid for your email domain',
          maxed: 'This access code has reached its usage limit',
          inactive: 'This access code is no longer active'
        };
        setError(errorMessages[result.reason] || 'Invalid access code');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!success) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/access/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: success.code.code })
      });

      const result = await response.json();

      if (result.ok) {
        if (onRedeem) {
          onRedeem();
        } else if (result.redirect) {
          router.push(result.redirect);
        }
      } else {
        setError('Failed to redeem code. Please try again.');
      }
    } catch (err) {
      setError('Failed to redeem code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleVerify} className="space-y-3">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            {t('access.modal.codePlaceholder')}
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t('access.modal.codePlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/10"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email (optional)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/10"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isLoading ? t('common.loading') : t('access.modal.verifyCode')}
        </button>
      </form>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="space-y-3">
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
            ✓ {t('access.modal.success')} <strong>{success.curator.storeName}</strong>
          </div>
          
          {showRedeemButton && (
            <button
              onClick={handleRedeem}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('common.loading') : t('access.modal.requestCode')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
