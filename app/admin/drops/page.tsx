"use client";

import { useState } from 'react';
import { mockDrops } from '@/lib/mock-data';

export default function AdminDropsPage() {
  const [drops] = useState(mockDrops);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-serif mb-8">Drops Management</h1>
      
      <div className="space-y-6">
        {drops.map((drop) => (
          <div key={drop.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{drop.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                drop.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {drop.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{drop.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Starts:</span> {new Date(drop.startsAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Ends:</span> {new Date(drop.endsAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Slug:</span> {drop.slug}
              </div>
              <div>
                <span className="font-medium">Curator ID:</span> {drop.curatorId}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Development Note</h3>
        <p className="text-blue-800 text-sm">
          This is a mock admin page for development. In production, this would include forms to create, edit, and manage drops.
        </p>
      </div>
    </div>
  );
}
