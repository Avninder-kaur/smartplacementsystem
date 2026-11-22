import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, User, Briefcase, FileCheck, Activity, Bell, MapPin, IndianRupee, Loader2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useJobApplications } from "@/context/JobApplicationContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

const navItems = [
    { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Profile", to: "/student/profile", icon: User },
    { label: "Available Jobs", to: "/student/jobs", icon: Briefcase },
    { label: "Applied Jobs", to: "/student/applied", icon: FileCheck },
    { label: "Application Status", to: "/student/status", icon: Activity },
    { label: "Notifications", to: "/student/notifications", icon: Bell },
];

const statusColor = {
    Pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    Shortlisted: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    Rejected: "bg-destructive/10 text-destructive border-destructive/20",
    "Interview Scheduled": "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
    Offered: "bg-primary/10 text-primary border-primary/20",
};

const statusFilters = ["Pending", "Shortlisted", "Interview Scheduled", "Offered", "Rejected"];

export default function AppliedJobs() {
    const { applications, loading } = useJobApplications();
    const [filter, setFilter] = useState("All");
    const [selectedApp, setSelectedApp] = useState(null);

    const filtered = filter === "All" ? applications : applications.filter((a) => a.status === filter);

    return (<DashboardLayout navItems={navItems} title="Student Portal">
      <h1 className="text-2xl font-bold mb-1">Applied Jobs</h1>
      <p className="text-sm text-muted-foreground mb-6">Track the status of your applications</p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button size="sm" variant={filter === "All" ? "default" : "outline"} onClick={() => setFilter("All")}>
          All ({applications.length})
        </Button>
        {statusFilters.map((s) => {
            const count = applications.filter((a) => a.status === s).length;
            return (<Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
              {s} ({count})
            </Button>);
        })}
      </div>

      {loading ? (
        <div className="bg-card border rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3"/>
          <p className="text-sm text-muted-foreground">Loading your applications from database...</p>
        </div>
      ) : filtered.length === 0 ? (<div className="bg-card border rounded-xl p-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4"/>
          <h3 className="font-semibold mb-1">No applications found</h3>
          <p className="text-sm text-muted-foreground">
            {filter === "All"
                ? "Start by browsing available jobs and applying!"
                : `No applications with status "${filter}".`}
          </p>
        </div>) : (<div className="grid md:grid-cols-2 gap-4">
          {filtered.map((app, i) => {
            const job = app.jobId || app.job || {};
            const appliedDate = app.createdAt ? new Date(app.createdAt).toISOString().split("T")[0] : (app.appliedDate || "");
            return (<motion.div key={app._id || i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border rounded-xl p-5 flex flex-col cursor-pointer hover:shadow-lg hover:shadow-primary/5 transition-all duration-300" onClick={() => setSelectedApp(app)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{job.title || "Job Listing"}</h3>
                  <p className="text-sm text-muted-foreground">{job.company || "Company"}</p>
                </div>
                <Badge variant="outline" className={statusColor[app.status] || "bg-muted"}>
                  {app.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/> {job.location || "Onsite"}</span>
                <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5"/> {job.salary || "Best in Industry"}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {Array.isArray(job.skills) && job.skills.map((s) => (<Badge key={s} variant="outline" className="text-xs font-normal">{s}</Badge>))}
              </div>

              {app.interviewDate && (
                <p className="text-xs text-cyan-400 font-medium flex items-center gap-1 mb-2">
                  <Calendar className="h-3.5 w-3.5"/> Interview: {new Date(app.interviewDate).toLocaleDateString()}
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-auto">Applied on {appliedDate}</p>
            </motion.div>);
          })}
        </div>)}

      {/* Job Detail Modal */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedApp && (() => {
            const job = selectedApp.jobId || selectedApp.job || {};
            return (<>
              <DialogHeader>
                <DialogTitle>{job.title || "Job Listing"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">{job.company}</p>
                  <Badge variant="outline" className={statusColor[selectedApp.status] || "bg-muted"}>
                    {selectedApp.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">Location</p>
                    <p className="font-medium">{job.location || "N/A"}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs mb-1">Salary</p>
                    <p className="font-medium">{job.salary || "Best in Industry"}</p>
                  </div>
                </div>
                {selectedApp.coverNote && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Your Note:</p>
                    <p className="text-xs bg-muted/30 p-2.5 rounded border">{selectedApp.coverNote}</p>
                  </div>
                )}
                {selectedApp.interviewDate && (
                  <div className="p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg text-cyan-400 text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4"/>
                    <span>Interview Scheduled for: <strong>{new Date(selectedApp.interviewDate).toLocaleDateString()}</strong></span>
                  </div>
                )}
              </div>
            </>);
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>);
}
