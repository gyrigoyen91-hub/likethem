"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import InviteCodeForm from './InviteCodeForm';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AccessModal({ isOpen, onClose, onSuccess }: AccessModalProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);

  if (!isOpen) return null;

  const handleSuccess = () => {
    setIsRedeeming(true);
  };

  const handleRedeem = () => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Exclusive Access Required</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Enter a curator access code to unlock purchasing and add items to your cart.
          </p>

          <InviteCodeForm
            onSuccess={handleSuccess}
            onRedeem={handleRedeem}
            showRedeemButton={true}
          />

          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500 text-center">
              Don't have an access code?{' '}
              <a 
                href="/access" 
                className="text-black hover:underline font-medium"
                onClick={onClose}
              >
                Request access
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
