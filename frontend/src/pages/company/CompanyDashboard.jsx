import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, FolderOpen, LayoutDashboard, PlusCircle, TrendingUp, UserCheck, Users, } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const navItems = [
    { label: "Dashboard", to: "/company/dashboard", icon: LayoutDashboard },
    { label: "Post Job", to: "/company/post-job", icon: PlusCircle },
    { label: "Manage Jobs", to: "/company/manage-jobs", icon: FolderOpen },
    { label: "View Applicants", to: "/company/applicants", icon: Users },
    { label: "Company Profile", to: "/company/profile", icon: Building2 },
];

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.4 },
    }),
};

const statusColor = {
    Pending: "bg-amber-400/10 text-amber-400",
    Shortlisted: "bg-emerald-400/10 text-emerald-400",
    "Interview Scheduled": "bg-cyan-400/10 text-cyan-400",
    Rejected: "bg-destructive/10 text-destructive",
    Offered: "bg-primary/10 text-primary",
};

export default function CompanyDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplicants: 0,
        shortlisted: 0,
        interviews: 0,
        offers: 0,
    });
    const [recentApplicants, setRecentApplicants] = useState([]);

    useEffect(() => {
      if (!user?.role) {
        navigate("/login?role=recruiter", { replace: true });
      } else if (user?.role === "student") {
        navigate("/student/dashboard", { replace: true });
      }
    }, [user, navigate]);

    useEffect(() => {
        let isMounted = true;
        Promise.allSettled([
            api.get("/jobs/my/listings"),
            api.get("/applications/recruiter/all"),
        ]).then(([jobsRes, appsRes]) => {
            if (!isMounted) return;

            const jobs = jobsRes.status === "fulfilled" ? (jobsRes.value?.jobs || []) : [];
            const apps = appsRes.status === "fulfilled" ? (appsRes.value?.applications || []) : [];

            const totalJobs = jobs.length;
            const activeJobs = jobs.filter((j) => j.isActive).length;
            const totalApplicants = apps.length;
            const shortlisted = apps.filter((a) => a.status === "Shortlisted").length;
            const interviews = apps.filter((a) => a.status === "Interview Scheduled").length;
            const offers = apps.filter((a) => a.status === "Offered").length;

            setStats({
                totalJobs,
                activeJobs,
                totalApplicants,
                shortlisted,
                interviews,
                offers,
            });

            const mappedRecent = apps.slice(0, 4).map((a) => ({
                id: a._id,
                name: a.studentId?.name || "Student",
                job: a.jobId?.title || "Job Listing",
                status: a.status || "Pending",
                time: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "Recently",
            }));
            setRecentApplicants(mappedRecent);
        });

        return () => { isMounted = false; };
    }, []);

    const widgets = [
        { label: "Total Jobs Posted", value: String(stats.totalJobs), icon: Briefcase, color: "text-primary bg-primary/10", to: "/company/manage-jobs" },
        { label: "Active Listings", value: String(stats.activeJobs), icon: FolderOpen, color: "text-emerald-400 bg-emerald-400/10", to: "/company/manage-jobs" },
        { label: "Total Applicants", value: String(stats.totalApplicants), icon: Users, color: "text-amber-400 bg-amber-400/10", to: "/company/applicants" },
        { label: "Shortlisted", value: String(stats.shortlisted), icon: UserCheck, color: "text-cyan-400 bg-cyan-400/10", to: "/company/applicants" },
    ];

    return (<DashboardLayout navItems={navItems} title="Recruiter Portal">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
          <p className="text-muted-foreground font-body mt-1">Manage your live job listings and applicants</p>
        </div>
        <Button onClick={() => navigate("/company/post-job")}>
          <PlusCircle className="h-4 w-4 mr-2"/> Post New Job
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-6">
        {widgets.map((w, i) => (<motion.button key={w.label} custom={i} initial="hidden" animate="visible" variants={fadeUp} onClick={() => navigate(w.to)} className="bg-card border rounded-xl p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300 text-left w-full">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${w.color}`}>
              <w.icon className="h-5 w-5"/>
            </div>
            <div>
              <p className="text-2xl font-bold">{w.value}</p>
              <p className="text-sm text-muted-foreground">{w.label}</p>
            </div>
          </motion.button>))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hiring Activity */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary"/>
            <h3 className="font-semibold">Hiring Activity</h3>
          </div>
          <div className="space-y-3">
            {[
                { label: "Total applications received", value: String(stats.totalApplicants) },
                { label: "Candidates shortlisted", value: String(stats.shortlisted) },
                { label: "Interviews scheduled", value: String(stats.interviews) },
                { label: "Offers extended", value: String(stats.offers) },
            ].map((item) => (<div key={item.label} className="flex justify-between items-center text-sm py-2 border-b last:border-0">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </div>))}
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Applicants</h3>
            <button onClick={() => navigate("/company/applicants")} className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3"/>
            </button>
          </div>
          <div className="space-y-3">
            {recentApplicants.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No applicants yet.</p>
            ) : (
                recentApplicants.map((a) => (<div key={a.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/company/applicants")}>
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.job} &middot; {a.time}</p>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] ${statusColor[a.status] || "bg-muted"}`}>
                      {a.status}
                    </Badge>
                  </div>))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-card border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate("/company/post-job")}>
            <PlusCircle className="h-4 w-4 mr-2"/> Post a Job
          </Button>
          <Button variant="outline" onClick={() => navigate("/company/applicants")}>
            <Users className="h-4 w-4 mr-2"/> Review Applicants
          </Button>
          <Button variant="outline" onClick={() => navigate("/company/manage-jobs")}>
            <FolderOpen className="h-4 w-4 mr-2"/> Manage Listings
          </Button>
          <Button variant="outline" onClick={() => navigate("/company/profile")}>
            <Building2 className="h-4 w-4 mr-2"/> Update Profile
          </Button>
        </div>
      </div>
    </DashboardLayout>);
}
