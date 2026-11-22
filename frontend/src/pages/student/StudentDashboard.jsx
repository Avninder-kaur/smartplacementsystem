import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, User, Briefcase, FileCheck, Activity, Bell, CalendarCheck, Star, MapPin, IndianRupee, Clock, } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useJobApplications } from "@/context/JobApplicationContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const navItems = [
    { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Profile", to: "/student/profile", icon: User },
    { label: "Available Jobs", to: "/student/jobs", icon: Briefcase },
    { label: "Applied Jobs", to: "/student/applied", icon: FileCheck },
    { label: "Application Status", to: "/student/status", icon: Activity },
    { label: "Notifications", to: "/student/notifications", icon: Bell },
];

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.4 },
    }),
};

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { applications } = useJobApplications();
    const { user } = useAuth();
    const [recentJobs, setRecentJobs] = useState([]);
    const [totalJobs, setTotalJobs] = useState(0);

    useEffect(() => {
        if (user?.role === "recruiter" || user?.role === "company") {
            navigate("/company/dashboard", { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        let isMounted = true;
        api.get("/jobs?limit=6")
            .then((data) => {
                if (!isMounted) return;
                const raw = data.jobs || [];
                setTotalJobs(data.total || raw.length);
                const mapped = raw.slice(0, 6).map((j) => ({
                    id: j._id,
                    title: j.title,
                    company: j.company,
                    location: j.location,
                    salary: j.salary || "Best in Industry",
                    posted: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "Recently",
                }));
                setRecentJobs(mapped);
            })
            .catch((err) => console.error("Failed to load dashboard jobs:", err));
        return () => { isMounted = false; };
    }, []);

    const jobsApplied = applications.length;
    const shortlisted = applications.filter((a) => a.status === "Shortlisted").length;
    const interviews = applications.filter((a) => a.status === "Interview Scheduled").length;

    // Dynamically calculate profile completion based on user fields
    const profileCompletion = useMemo(() => {
        if (!user) return 20;
        let score = 0;
        if (user.name) score += 20;
        if (user.university) score += 20;
        if (user.branch) score += 20;
        if (user.cgpa) score += 20;
        if (user.resumeURL) score += 20;
        return Math.max(score, 20);
    }, [user]);

    const widgets = [
        { label: "Jobs Available", value: String(totalJobs), icon: Briefcase, color: "text-primary bg-primary/10" },
        { label: "Jobs Applied", value: String(jobsApplied), icon: FileCheck, color: "text-amber-400 bg-amber-400/10" },
        { label: "Shortlisted", value: String(shortlisted), icon: Star, color: "text-emerald-400 bg-emerald-400/10" },
        { label: "Upcoming Interviews", value: String(interviews), icon: CalendarCheck, color: "text-cyan-400 bg-cyan-400/10" },
    ];

    return (<DashboardLayout navItems={navItems} title="Student Portal">
      <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || "Student"}! 👋</h1>
      <p className="text-muted-foreground font-body mb-8">Here's your live placement overview</p>

      {/* Stat cards */}
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

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Profile completion */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Profile Completion</h3>
          <Progress value={profileCompletion} className="h-2.5 mb-3"/>
          <p className="text-sm text-muted-foreground">
            {profileCompletion}% — {profileCompletion === 100 ? "Your profile is fully completed!" : "Add your skills, CGPA, branch, and resume to reach 100%."}
          </p>
        </div>

        {/* Recent applications (activity timeline) */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Application Activity</h3>
            {applications.length > 0 && (<Link to="/student/applied" className="text-xs text-primary hover:underline">View all</Link>)}
          </div>
          <div className="space-y-3">
            {applications.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-4">
                No applications yet. Start by applying to jobs!
              </p>) : (applications.slice(0, 4).map((app, i) => {
                const job = app.jobId || app.job || {};
                const appliedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : (app.appliedDate || "");
                return (<div key={app._id || i} className="flex items-center gap-3 text-sm border-b last:border-0 pb-3 last:pb-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileCheck className="h-4 w-4 text-primary"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{job.title || "Job Listing"}</p>
                    <p className="text-xs text-muted-foreground">{job.company || "Company"} &middot; {appliedDate}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${app.status === "Pending" ? "text-amber-400 border-amber-400/20" :
                app.status === "Shortlisted" ? "text-emerald-400 border-emerald-400/20" :
                    app.status === "Interview Scheduled" ? "text-cyan-400 border-cyan-400/20" :
                    app.status === "Offered" ? "text-primary border-primary/20" :
                        "text-destructive border-destructive/20"}`}>
                    {app.status}
                  </Badge>
                </div>);
              }))}
          </div>
        </div>
      </div>

      {/* Latest job openings */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Latest Job Openings</h3>
          <Link to="/student/jobs" className="text-xs text-primary hover:underline">Browse all jobs</Link>
        </div>
        {recentJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No active job postings right now.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentJobs.map((job) => (<Link key={job.id} to="/student/jobs" className="border rounded-lg p-4 hover:bg-accent/50 transition-colors group">
                <h4 className="font-medium group-hover:text-primary transition-colors">{job.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-3">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {job.location}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3"/> {job.salary}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Clock className="h-3 w-3"/> {job.posted}
                </div>
              </Link>))}
          </div>
        )}
      </div>
    </DashboardLayout>);
}
