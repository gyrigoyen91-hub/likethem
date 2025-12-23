"use client";

import { useState, useEffect } from "react";
import { KpiCard } from "./KpiCard";
import { ActionCard } from "./ActionCard";
import { RecentActivity } from "./RecentActivity";
import { DollarSign, Eye, Heart, Package, Plus, Edit, BarChart3 } from "lucide-react";

type StatsData = {
  storeVisits: number;
  itemsSold: number;
  earnings: number;
  favorites: number;
  deltas: {
    visits: number;
    items: number;
    earnings: number;
    favorites: number;
  };
  recentActivity: Array<{
    type: "order" | "favorite" | "review";
    title: string;
    meta: string;
    timeago: string;
  }>;
};

export function CuratorDashboard({ user }: { user: { name?: string } }) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/curator/stats")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Curator Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Welcome back{user?.name ? `, ${user.name}` : ""}. Here's what's happening with your store.
      </p>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          label="Store Visits" 
          value={data?.storeVisits ?? "—"} 
          deltaPct={data?.deltas?.visits} 
          icon={<Eye />} 
        />
        <KpiCard 
          label="Items Sold" 
          value={data?.itemsSold ?? "—"} 
          deltaPct={data?.deltas?.items} 
          icon={<Package />} 
        />
        <KpiCard 
          label="Earnings" 
          value={typeof data?.earnings === "number" ? `$${data.earnings}` : "—"} 
          deltaPct={data?.deltas?.earnings} 
          icon={<DollarSign />} 
        />
        <KpiCard 
          label="Favorites" 
          value={data?.favorites ?? "—"} 
          deltaPct={data?.deltas?.favorites} 
          icon={<Heart />} 
        />
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard 
          title="Add New Product" 
          description="Upload a new item to your store" 
          href="/dashboard/curator/products/new" 
          icon={<Plus className="w-5 h-5" />}
        />
        <ActionCard 
          title="Edit Store Profile" 
          description="Update your bio and store settings" 
          href="/dashboard/curator/settings" 
          icon={<Edit className="w-5 h-5" />}
        />
        <ActionCard 
          title="View Analytics" 
          description="Check your performance insights" 
          href="/dashboard/curator/analytics" 
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <ActionCard 
          title="Manage Orders" 
          description="View and fulfill customer orders" 
          href="/dashboard/curator/orders" 
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      {/* Recent activity */}
      <div className="mt-6">
        <RecentActivity items={data?.recentActivity ?? []} />
      </div>
    </div>
  );
}
