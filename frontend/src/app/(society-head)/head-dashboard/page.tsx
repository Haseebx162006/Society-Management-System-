"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Users,
  ListChecks,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  BarChart3,
  Layers,
  AlertTriangle,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { useGetAllSocietiesQuery, useGetSocietyRequestsQuery, useGetAllPlatformMembersQuery } from "@/lib/features/societies/societyApiSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  accent,
  delay = 0,
  href,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  accent: string;
  delay?: number;
  href?: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-stone-400";

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="relative bg-white rounded-2xl border border-stone-100 shadow-sm p-6 overflow-hidden group hover:shadow-md transition-all duration-300"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br ${accent} pointer-events-none`} />
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 -translate-y-8 translate-x-8 bg-orange-400 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors`}>
            <Icon className="w-5 h-5 text-orange-600" />
          </div>
          {trend && trendLabel && (
            <div className={`flex items-center gap-1 text-xs font-bold ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              {trendLabel}
            </div>
          )}
        </div>
        <p className="text-3xl font-black text-stone-900 tracking-tight">{value}</p>
        <p className="text-sm font-semibold text-stone-500 mt-1">{label}</p>
      </div>
    </motion.div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-black text-stone-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-stone-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function SocietyHeadOverviewPage() {
  const { data: societies = [], isLoading: societiesLoading } = useGetAllSocietiesQuery(undefined);
  const { data: allRequests = [], isLoading: requestsLoading } = useGetSocietyRequestsQuery(undefined);
  const { data: members = [], isLoading: membersLoading } = useGetAllPlatformMembersQuery(undefined);

  const isLoading = societiesLoading || requestsLoading || membersLoading;

  const pendingRequests = useMemo(
    () => (allRequests as any[]).filter((r) => r.status === "PENDING"),
    [allRequests]
  );
  const approvedRequests = useMemo(
    () => (allRequests as any[]).filter((r) => r.status === "APPROVED"),
    [allRequests]
  );
  const rejectedRequests = useMemo(
    () => (allRequests as any[]).filter((r) => r.status === "REJECTED"),
    [allRequests]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (societies as any[]).forEach((s) => {
      const cat = s.category || "Other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [societies]);

  const societyGrowthData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const labels = MONTHS.slice(0, currentMonth + 1);
    const dataPoints = labels.map((_, i) => {
      const count = (societies as any[]).filter((s) => {
        const created = new Date(s.created_at || s.createdAt || Date.now());
        return created.getMonth() <= i;
      }).length;
      return count;
    });
    return {
      labels,
      datasets: [
        {
          label: "Societies",
          data: dataPoints,
          fill: true,
          borderColor: "#ea580c",
          backgroundColor: "rgba(234,88,12,0.10)",
          pointBackgroundColor: "#ea580c",
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          borderWidth: 2.5,
        },
      ],
    };
  }, [societies]);

  const requestStatusData = useMemo(() => ({
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        data: [approvedRequests.length, pendingRequests.length, rejectedRequests.length],
        backgroundColor: ["#ea580c", "#fb923c", "#fed7aa"],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }), [approvedRequests, pendingRequests, rejectedRequests]);

  const membersByMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const labels = MONTHS.slice(0, currentMonth + 1);
    const dataPoints = labels.map((_, i) => {
      return (members as any[]).filter((m) => {
        const d = new Date(m.created_at || m.createdAt || Date.now());
        return d.getMonth() === i;
      }).length;
    });
    return {
      labels,
      datasets: [
        {
          label: "New Members",
          data: dataPoints,
          backgroundColor: "rgba(234,88,12,0.85)",
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: "#c2410c",
        },
      ],
    };
  }, [members]);

  const recentRequests = useMemo(
    () =>
      [...(allRequests as any[])]
        .sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime())
        .slice(0, 6),
    [allRequests]
  );

  const recentSocieties = useMemo(
    () =>
      [...(societies as any[])]
        .sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime())
        .slice(0, 4),
    [societies]
  );

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1c1917", titleColor: "#fff", bodyColor: "#d6d3d1", padding: 10, cornerRadius: 8 } },
    scales: {
      y: { ticks: { color: "#a8a29e", font: { size: 11 } }, grid: { color: "#f5f5f4" }, beginAtZero: true },
      x: { ticks: { color: "#a8a29e", font: { size: 11 } }, grid: { display: false } },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1c1917", titleColor: "#fff", bodyColor: "#d6d3d1", padding: 10, cornerRadius: 8 } },
    scales: {
      y: { ticks: { color: "#a8a29e", font: { size: 11 } }, grid: { color: "#f5f5f4" }, beginAtZero: true },
      x: { ticks: { color: "#a8a29e", font: { size: 11 } }, grid: { display: false } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "72%",
    plugins: {
      legend: { position: "bottom" as const, labels: { color: "#78716c", font: { size: 12, weight: "bold" as const }, padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
      tooltip: { backgroundColor: "#1c1917", titleColor: "#fff", bodyColor: "#d6d3d1", padding: 10, cornerRadius: 8 },
    },
  };

  const statusBadge = (status: string) => {
    if (status === "PENDING") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-600"><Clock className="w-3 h-3" />Pending</span>;
    if (status === "APPROVED") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-3 h-3" />Approved</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-500"><XCircle className="w-3 h-3" />Rejected</span>;
  };

  const formatDate = (d: string | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-semibold text-stone-400">Loading dashboard data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-(--font-family-poppins)">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Platform Overview</h1>
          <p className="text-sm text-stone-400 mt-1">Real-time insights across all societies and members.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border border-orange-100">
          <Activity className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold text-orange-600">Live</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Societies" value={societies.length} icon={Building2} trend="up" trendLabel={`${societies.length} total`} accent="from-orange-50/80 to-transparent" delay={0} href="/head-dashboard/societies" />
        <StatCard label="Platform Members" value={members.length} icon={Users} trend="up" trendLabel={`+${membersByMonth.datasets[0].data.slice(-1)[0] || 0} this month`} accent="from-orange-50/80 to-transparent" delay={0.07} href="/head-dashboard/members" />
        <StatCard label="Pending Requests" value={pendingRequests.length} icon={ListChecks} trend={pendingRequests.length > 0 ? "neutral" : "up"} trendLabel={pendingRequests.length > 0 ? "Needs review" : "All cleared"} accent="from-orange-50/80 to-transparent" delay={0.14} href="/head-dashboard/requests" />
        <StatCard label="Total Requests" value={(allRequests as any[]).length} icon={Layers} trend="up" trendLabel={`${approvedRequests.length} approved`} accent="from-orange-50/80 to-transparent" delay={0.21} href="/head-dashboard/requests" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm p-6"
        >
          <SectionHeader title="Society Growth" subtitle="Cumulative societies registered by month" />
          <div className="h-56">
            <Line options={lineOptions} data={societyGrowthData} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex flex-col"
        >
          <SectionHeader title="Request Status" subtitle="Distribution of all society requests" />
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-44 h-44">
              <Doughnut options={doughnutOptions} data={requestStatusData} />
            </div>
            <div className="w-full grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Approved", value: approvedRequests.length, color: "text-orange-600" },
                { label: "Pending", value: pendingRequests.length, color: "text-orange-400" },
                { label: "Rejected", value: rejectedRequests.length, color: "text-stone-400" },
              ].map((item) => (
                <div key={item.label} className="bg-stone-50 rounded-xl p-2">
                  <p className={`text-lg font-black ${item.color}`}>{item.value}</p>
                  <p className="text-xs font-semibold text-stone-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6"
      >
        <SectionHeader title="Member Registrations" subtitle="New platform members registered per month" />
        <div className="h-52">
          <Bar options={barOptions} data={membersByMonth} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 bg-white rounded-2xl border border-stone-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">Recent Requests</h2>
              <p className="text-sm text-stone-400 mt-0.5">Latest society approval requests</p>
            </div>
            <Link href="/head-dashboard/requests" className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-stone-200" />
              <p className="font-semibold">No requests yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentRequests.map((req: any) => (
                <div key={req._id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-stone-50 hover:bg-orange-50/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-800 truncate">{req.society_name || req.name || "Society Request"}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{formatDate(req.created_at || req.createdAt)}</p>
                  </div>
                  <div className="ml-3 shrink-0">{statusBadge(req.status)}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">Newest Societies</h2>
              <p className="text-sm text-stone-400 mt-0.5">Recently approved</p>
            </div>
            <Link href="/head-dashboard/societies" className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl transition-colors">
              All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentSocieties.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-2">
              <Building2 className="w-10 h-10 text-stone-200" />
              <p className="font-semibold text-sm">No societies yet</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {recentSocieties.map((s: any, i) => (
                <div key={s._id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white font-black text-xs">{(s.name || "S").charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-800 truncate">{s.name}</p>
                    <p className="text-xs text-stone-400">{s.category || "General"}</p>
                  </div>
                  <span className="text-xs font-bold text-stone-400 shrink-0">#{i + 1}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-400 font-semibold">Categories</p>
                <p className="text-lg font-black text-stone-900">{Object.keys(categoryCounts).length}</p>
              </div>
              <div className="flex flex-wrap gap-1 justify-end">
                {Object.entries(categoryCounts).slice(0, 3).map(([cat]) => (
                  <span key={cat} className="text-xs font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{cat}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            icon: BarChart3,
            label: "Approval Rate",
            value: (allRequests as any[]).length > 0
              ? `${Math.round((approvedRequests.length / (allRequests as any[]).length) * 100)}%`
              : "—",
            sub: `${approvedRequests.length} of ${(allRequests as any[]).length} approved`,
            bg: "bg-orange-50",
            iconColor: "text-orange-500",
          },
          {
            icon: AlertTriangle,
            label: "Pending Action",
            value: pendingRequests.length,
            sub: pendingRequests.length === 0 ? "All requests resolved" : "Requests awaiting review",
            bg: pendingRequests.length > 0 ? "bg-amber-50" : "bg-emerald-50",
            iconColor: pendingRequests.length > 0 ? "text-amber-500" : "text-emerald-500",
          },
          {
            icon: TrendingUp,
            label: "Avg. Members/Society",
            value: societies.length > 0
              ? Math.round(members.length / societies.length)
              : 0,
            sub: `Across ${societies.length} societies`,
            bg: "bg-orange-50",
            iconColor: "text-orange-500",
          },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-2xl px-6 py-5 flex items-center gap-4`}>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <item.icon className={`w-5 h-5 ${item.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-stone-900">{item.value}</p>
              <p className="text-xs font-bold text-stone-500 mt-0.5">{item.label}</p>
              <p className="text-xs text-stone-400">{item.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
