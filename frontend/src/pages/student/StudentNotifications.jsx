import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, User, Briefcase, FileCheck, Activity, Bell, CheckCircle2, Calendar, XCircle, Check, } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useJobApplications } from "@/context/JobApplicationContext";
import { api } from "@/lib/api";

const navItems = [
    { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Profile", to: "/student/profile", icon: User },
    { label: "Available Jobs", to: "/student/jobs", icon: Briefcase },
    { label: "Applied Jobs", to: "/student/applied", icon: FileCheck },
    { label: "Application Status", to: "/student/status", icon: Activity },
    { label: "Notifications", to: "/student/notifications", icon: Bell },
];

const iconMap = {
    job: Briefcase,
    applied: FileCheck,
    shortlisted: CheckCircle2,
    interview: Calendar,
    rejected: XCircle,
};
const colorMap = {
    job: "text-primary",
    applied: "text-amber-400",
    shortlisted: "text-emerald-400",
    interview: "text-cyan-400",
    rejected: "text-destructive",
};
const labelMap = {
    job: "New Job",
    applied: "Applied",
    shortlisted: "Shortlisted",
    interview: "Interview",
    rejected: "Rejected",
};
const badgeColorMap = {
    job: "bg-primary/10 text-primary border-primary/20",
    applied: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    shortlisted: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    interview: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function StudentNotifications() {
    const { applications } = useJobApplications();
    const [jobs, setJobs] = useState([]);
    const [readIds, setReadIds] = useState(() => new Set());
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        let isMounted = true;
        api.get("/jobs?limit=5")
            .then((data) => {
                if (isMounted) setJobs(data.jobs || []);
            })
            .catch(() => {});
        return () => { isMounted = false; };
    }, []);

    const notifications = useMemo(() => {
        const list = [];

        applications.forEach((app) => {
            const job = app.jobId || {};
            const title = job.title || "Job Listing";
            const company = job.company || "Company";
            const time = app.createdAt ? new Date(app.createdAt).toLocaleString() : "Recently";

            if (app.status === "Shortlisted") {
                list.push({
                    id: `app-shortlisted-${app._id}`,
                    type: "shortlisted",
                    message: `You've been shortlisted for ${title} at ${company}!`,
                    timestamp: time,
                });
            } else if (app.status === "Interview Scheduled") {
                const dateStr = app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : "";
                list.push({
                    id: `app-interview-${app._id}`,
                    type: "interview",
                    message: `Interview scheduled for ${title} at ${company}${dateStr ? ` on ${dateStr}` : ""}`,
                    timestamp: time,
                });
            } else if (app.status === "Offered") {
                list.push({
                    id: `app-offered-${app._id}`,
                    type: "shortlisted",
                    message: `Congratulations! Offer extended for ${title} at ${company}.`,
                    timestamp: time,
                });
            } else if (app.status === "Rejected") {
                list.push({
                    id: `app-rejected-${app._id}`,
                    type: "rejected",
                    message: `Application update: Status set to Rejected for ${title} at ${company}.`,
                    timestamp: time,
                });
            }

            list.push({
                id: `app-applied-${app._id}`,
                type: "applied",
                message: `Your application for ${title} at ${company} was submitted successfully.`,
                timestamp: time,
            });
        });

        jobs.forEach((j) => {
            list.push({
                id: `job-${j._id}`,
                type: "job",
                message: `New job posted: ${j.title} at ${j.company}`,
                timestamp: j.createdAt ? new Date(j.createdAt).toLocaleString() : "Recently",
            });
        });

        return list.map((n) => ({
            ...n,
            read: readIds.has(n.id),
        }));
    }, [applications, jobs, readIds]);

    const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);
    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id) => {
        setReadIds((prev) => new Set([...prev, id]));
    };

    const markAllRead = () => {
        setReadIds(new Set(notifications.map((n) => n.id)));
    };
    const filters = [
        { label: "All", value: "all" },
        { label: "New Jobs", value: "job" },
        { label: "Applied", value: "applied" },
        { label: "Shortlisted", value: "shortlisted" },
        { label: "Interviews", value: "interview" },
        { label: "Rejected", value: "rejected" },
    ];
    return (<DashboardLayout navItems={navItems} title="Student Portal">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (<button onClick={markAllRead} className="text-sm text-primary hover:underline">
            Mark all as read
          </button>)}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (<button key={f.value} onClick={() => setFilter(f.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-card border text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
            {f.label}
          </button>))}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (<div className="bg-card border rounded-xl p-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4"/>
            <h3 className="font-semibold mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              {filter === "all" ? "You're all caught up!" : `No ${filter} notifications.`}
            </p>
          </div>) : (filtered.map((n, i) => {
            const Icon = iconMap[n.type];
            return (<motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`bg-card border rounded-xl p-4 flex items-start gap-4 transition-all duration-200 hover:shadow-md ${!n.read ? "ring-1 ring-primary/20" : ""}`}>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${n.type === "job" ? "bg-primary/10" :
                    n.type === "applied" ? "bg-amber-400/10" :
                        n.type === "shortlisted" ? "bg-emerald-400/10" :
                            n.type === "interview" ? "bg-cyan-400/10" :
                                "bg-destructive/10"}`}>
                  <Icon className={`h-5 w-5 ${colorMap[n.type]}`}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-relaxed ${!n.read ? "font-medium" : "text-muted-foreground"}`}>
                      {n.message}
                    </p>
                    <Badge variant="outline" className={`shrink-0 text-[10px] ${badgeColorMap[n.type]}`}>
                      {labelMap[n.type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-xs text-muted-foreground">{n.timestamp}</p>
                    {!n.read && (<button onClick={() => markAsRead(n.id)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <Check className="h-3 w-3"/> Mark as read
                      </button>)}
                  </div>
                </div>
                {!n.read && (<div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0 mt-1.5"/>)}
              </motion.div>);
        }))}
      </div>
    </DashboardLayout>);
}
