import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, PlusCircle, FolderOpen, Users, Building2, FileText, Search, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";

const navItems = [
    { label: "Dashboard", to: "/company/dashboard", icon: LayoutDashboard },
    { label: "Post Job", to: "/company/post-job", icon: PlusCircle },
    { label: "Manage Jobs", to: "/company/manage-jobs", icon: FolderOpen },
    { label: "View Applicants", to: "/company/applicants", icon: Users },
    { label: "Company Profile", to: "/company/profile", icon: Building2 },
];

const statusColors = {
    Pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    Shortlisted: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    "Interview Scheduled": "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
    Rejected: "bg-destructive/10 text-destructive border-destructive/20",
    Offered: "bg-primary/10 text-primary border-primary/20",
};

const allStatuses = ["All", "Pending", "Shortlisted", "Interview Scheduled", "Offered", "Rejected"];

export default function ViewApplicants() {
    const [searchParams, setSearchParams] = useSearchParams();
    const jobIdParam = searchParams.get("jobId");

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [jobFilter, setJobFilter] = useState("All Jobs");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedApp, setSelectedApp] = useState(null);
    const [scheduleApp, setScheduleApp] = useState(null);
    const [interviewDate, setInterviewDate] = useState("");

    const fetchApplicants = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = jobIdParam
                ? `/applications/recruiter/${jobIdParam}`
                : `/applications/recruiter/all`;
            const data = await api.get(endpoint);
            const rawApps = data.applications || [];

            const mapped = rawApps.map((a) => {
                const s = a.studentId || {};
                const j = a.jobId || {};
                return {
                    id: a._id,
                    name: s.name || "Unnamed Student",
                    email: s.email || "",
                    university: s.university || "Not specified",
                    branch: s.branch || "Not specified",
                    cgpa: s.cgpa ? String(s.cgpa) : "N/A",
                    skills: Array.isArray(s.skills) ? s.skills : [],
                    job: j.title || "Job Listing",
                    jobId: j._id || a.jobId,
                    status: a.status || "Pending",
                    appliedDate: a.createdAt ? new Date(a.createdAt).toISOString().split("T")[0] : "",
                    interviewDate: a.interviewDate ? new Date(a.interviewDate).toISOString().split("T")[0] : undefined,
                    resumeURL: a.resumeURL || s.resumeURL,
                    coverNote: a.coverNote,
                };
            });
            setApplicants(mapped);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load applicants");
        } finally {
            setLoading(false);
        }
    }, [jobIdParam]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const availableJobTitles = useMemo(() => {
        const set = new Set();
        applicants.forEach((a) => {
            if (a.job) set.add(a.job);
        });
        return ["All Jobs", ...Array.from(set)];
    }, [applicants]);

    const filtered = applicants.filter((a) => {
        const matchSearch =
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.university.toLowerCase().includes(search.toLowerCase()) ||
            a.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
        const matchJob = jobFilter === "All Jobs" || a.job === jobFilter;
        const matchStatus = statusFilter === "All" || a.status === statusFilter;
        return matchSearch && matchJob && matchStatus;
    });

    const updateStatus = async (id, status, extra = {}) => {
        try {
            const body = { status, ...extra };
            await api.put(`/applications/status/${id}`, body);
            setApplicants((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status, ...extra } : a))
            );
            toast.success(`Status updated to "${status}"`);
            if (selectedApp && selectedApp.id === id) {
                setSelectedApp((prev) => prev ? { ...prev, status, ...extra } : null);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update status");
        }
    };

    const handleScheduleInterview = async (e) => {
        e.preventDefault();
        if (!scheduleApp || !interviewDate) return;
        await updateStatus(scheduleApp.id, "Interview Scheduled", { interviewDate });
        toast.success(`Interview scheduled for ${scheduleApp.name} on ${interviewDate}`);
        setScheduleApp(null);
        setInterviewDate("");
    };

    const counts = allStatuses.slice(1).reduce((acc, s) => {
        acc[s] = applicants.filter((a) => a.status === s).length;
        return acc;
    }, {});

    return (<DashboardLayout navItems={navItems} title="Recruiter Portal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Applicants</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {applicants.length} total &middot; {counts["Pending"] ?? 0} pending review
            {jobIdParam && (
                <button
                    onClick={() => {
                        searchParams.delete("jobId");
                        setSearchParams(searchParams);
                    }}
                    className="ml-2 text-xs text-primary underline"
                >
                    Show all jobs
                </button>
            )}
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input placeholder="Search name, university, skill..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {allStatuses.map((s) => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-card border text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
            {s} {s !== "All" && `(${counts[s] ?? 0})`}
          </button>))}
      </div>

      {/* Dynamic Job filter */}
      {availableJobTitles.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {availableJobTitles.map((j) => (<button key={j} onClick={() => setJobFilter(j)} className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${jobFilter === j
                  ? "bg-accent border-primary/30 text-foreground"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
              {j}
            </button>))}
        </div>
      )}

      {loading ? (
        <div className="bg-card border rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3"/>
          <p className="text-sm text-muted-foreground">Loading applicants from database...</p>
        </div>
      ) : filtered.length === 0 ? (<div className="bg-card border rounded-xl p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4"/>
          <h3 className="font-semibold mb-1">No applicants found</h3>
          <p className="text-sm text-muted-foreground">
            {search || jobFilter !== "All Jobs" || statusFilter !== "All"
                ? "Try clearing your search or filters."
                : "When students apply to your job postings, they will appear here."}
          </p>
        </div>) : (<div className="grid gap-4">
          {filtered.map((app) => (<motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg hover:shadow-primary/5 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-base">{app.name}</h3>
                  <Badge variant="outline" className={statusColors[app.status] || "bg-muted"}>
                    {app.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Applied for <span className="font-medium text-foreground">{app.job}</span> &middot; {app.university} ({app.branch}) &middot; CGPA: {app.cgpa}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {app.skills.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
                {app.interviewDate && (
                  <p className="text-xs text-cyan-400 font-medium flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3"/> Interview: {app.interviewDate}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>
                  View Details
                </Button>
                {app.status === "Pending" && (
                  <Button size="sm" onClick={() => updateStatus(app.id, "Shortlisted")}>
                    Shortlist
                  </Button>
                )}
                {app.status === "Shortlisted" && (
                  <Button size="sm" onClick={() => { setScheduleApp(app); setInterviewDate(""); }}>
                    Schedule Interview
                  </Button>
                )}
                {app.status === "Interview Scheduled" && (
                  <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => updateStatus(app.id, "Offered")}>
                    Make Offer
                  </Button>
                )}
              </div>
            </motion.div>))}
        </div>)}

      {/* Applicant Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Applicant Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4 text-sm mt-2">
              <div>
                <p className="text-base font-semibold">{selectedApp.name}</p>
                <p className="text-muted-foreground text-xs">{selectedApp.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">University</p>
                  <p className="font-medium">{selectedApp.university}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Branch & CGPA</p>
                  <p className="font-medium">{selectedApp.branch} ({selectedApp.cgpa})</p>
                </div>
              </div>
              {selectedApp.coverNote && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cover Note</p>
                  <p className="text-xs bg-muted/30 p-2.5 rounded border">{selectedApp.coverNote}</p>
                </div>
              )}
              {selectedApp.resumeURL && (
                <div className="pt-1">
                  <a
                    href={selectedApp.resumeURL.startsWith("http") ? selectedApp.resumeURL : `http://localhost:5000${selectedApp.resumeURL}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                  >
                    <FileText className="h-4 w-4"/> View Uploaded Resume
                  </a>
                </div>
              )}
              <div className="pt-2 border-t flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(selectedApp.id, "Shortlisted")}>
                  Shortlist
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setScheduleApp(selectedApp); setSelectedApp(null); }}>
                  Schedule Interview
                </Button>
                <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => updateStatus(selectedApp.id, "Offered")}>
                  Offer
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateStatus(selectedApp.id, "Rejected")}>
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={!!scheduleApp} onOpenChange={() => setScheduleApp(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScheduleInterview} className="space-y-4 mt-2">
            <p className="text-xs text-muted-foreground">
              Candidate: <span className="font-medium text-foreground">{scheduleApp?.name}</span> ({scheduleApp?.job})
            </p>
            <div className="space-y-2">
              <Label htmlFor="interviewDate">Interview Date</Label>
              <Input
                id="interviewDate"
                type="date"
                required
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setScheduleApp(null)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Date</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>);
}
