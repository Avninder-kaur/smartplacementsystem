import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Users, Building2, Briefcase, FileText, TrendingUp, Award, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, } from "recharts";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const navItems = [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Manage Students", to: "/admin/students", icon: Users },
    { label: "Manage Companies", to: "/admin/companies", icon: Building2 },
    { label: "Job Listings", to: "/admin/jobs", icon: Briefcase },
    { label: "Reports", to: "/admin/reports", icon: FileText },
];

const COLORS = ["hsl(217, 91%, 60%)", "hsl(215, 25%, 35%)"];

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.4 },
    }),
};

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        api.get("/admin/stats")
            .then((data) => {
                if (!isMounted) return;
                setStats(data.stats);
            })
            .catch((err) => console.error("Failed to load admin stats:", err))
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    const widgets = [
        { label: "Total Students", value: stats ? String(stats.totalStudents) : "0", icon: Users, color: "text-primary bg-primary/10" },
        { label: "Total Companies", value: stats ? String(stats.totalRecruiters) : "0", icon: Building2, color: "text-emerald-400 bg-emerald-400/10" },
        { label: "Total Job Listings", value: stats ? String(stats.totalJobs) : "0", icon: Briefcase, color: "text-amber-400 bg-amber-400/10" },
        { label: "Placement Rate", value: stats ? stats.placementRate : "0%", icon: Award, color: "text-cyan-400 bg-cyan-400/10" },
    ];

    const pieData = stats
        ? [
            { name: "Placed", value: stats.placedStudents || 0 },
            { name: "Unplaced", value: Math.max(0, stats.totalStudents - stats.placedStudents) },
          ]
        : [
            { name: "Placed", value: 0 },
            { name: "Unplaced", value: 0 },
          ];

    const barData = [
        { name: "Students", count: stats?.totalStudents || 0 },
        { name: "Recruiters", count: stats?.totalRecruiters || 0 },
        { name: "Jobs", count: stats?.totalJobs || 0 },
        { name: "Applications", count: stats?.totalApplications || 0 },
        { name: "Placed", count: stats?.placedStudents || 0 },
    ];

    return (<DashboardLayout navItems={navItems} title="Admin Panel (TPO)">
      <h1 className="text-2xl font-bold mb-2">Placement Statistics</h1>
      <p className="text-muted-foreground font-body mb-8">Overview of live campus placement activity</p>

      {loading ? (
        <div className="bg-card border rounded-xl p-12 text-center flex flex-col items-center justify-center mb-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3"/>
          <p className="text-sm text-muted-foreground">Loading real-time placement stats...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {widgets.map((w, i) => (<motion.div key={w.label} custom={i} initial="hidden" animate="visible" variants={fadeUp} className="bg-card border rounded-xl p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${w.color}`}>
                <w.icon className="h-5 w-5"/>
              </div>
              <div>
                <p className="text-2xl font-bold">{w.value}</p>
                <p className="text-sm text-muted-foreground">{w.label}</p>
              </div>
            </motion.div>))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Platform Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(215, 25%, 22%)"/>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(215, 20%, 60%)" }}/>
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 20%, 60%)" }}/>
              <Tooltip contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(215, 25%, 22%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }}/>
              <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Placement Distribution</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} dataKey="value" stroke="none">
                {pieData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(215, 25%, 22%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {pieData.map((entry, i) => (<div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i] }}/>
                <span className="text-muted-foreground">{entry.name}: {entry.value.toLocaleString()}</span>
              </div>))}
          </div>
        </div>
      </div>
    </DashboardLayout>);
}
