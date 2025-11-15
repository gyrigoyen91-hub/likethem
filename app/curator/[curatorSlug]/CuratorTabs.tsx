"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';

interface Tab {
  key: string;
  label: string;
  count: number;
}

interface CuratorTabsProps {
  tabs: Tab[];
  curatorSlug: string;
}

export default function CuratorTabs({ tabs, curatorSlug }: CuratorTabsProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('t') || searchParams.get('tab') || 'general';
  const currentCategory = searchParams.get('cat') || searchParams.get('category');

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          // Preserve category when switching tabs
          const url = new URLSearchParams();
          url.set('t', tab.key);
          if (currentCategory) {
            url.set('cat', currentCategory);
          }
          
          return (
            <Link
              key={tab.key}
              href={`/curator/${curatorSlug}?${url.toString()}`}
              className={clsx(
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.key
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={clsx(
                    'ml-2 py-0.5 px-2 rounded-full text-xs font-medium',
                    activeTab === tab.key
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
