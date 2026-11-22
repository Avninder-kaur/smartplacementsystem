import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, User, Briefcase, FileCheck, Activity, Bell, MapPin, IndianRupee, Search, Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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

export default function AvailableJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [coverNote, setCoverNote] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [applying, setApplying] = useState(false);

    const { appliedIds, applyToJob } = useJobApplications();

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get("/jobs");
            const rawJobs = data.jobs || [];
            const mapped = rawJobs.map((j) => ({
                ...j,
                id: j._id,
                posted: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "Recently",
            }));
            setJobs(mapped);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load jobs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const filtered = jobs.filter((j) => {
        const q = search.toLowerCase();
        return (
            j.title?.toLowerCase().includes(q) ||
            j.company?.toLowerCase().includes(q) ||
            j.location?.toLowerCase().includes(q) ||
            (Array.isArray(j.skills) && j.skills.some((s) => s.toLowerCase().includes(q)))
        );
    });

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setResumeFile(null);
            return;
        }
        const maxBytes = 5 * 1024 * 1024;
        const allowedExts = [".pdf", ".doc", ".docx"];
        const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (!allowedExts.includes(ext)) {
            toast.error("Only PDF, DOC, and DOCX files are allowed.");
            e.target.value = "";
            setResumeFile(null);
            return;
        }
        if (file.size > maxBytes) {
            toast.error("Resume file size must be less than 5MB.");
            e.target.value = "";
            setResumeFile(null);
            return;
        }
        setResumeFile(file);
    };

    const handleApply = async (job) => {
        setApplying(true);
        try {
            const success = await applyToJob(job._id || job.id, coverNote, resumeFile);
            if (success) {
                setExpandedId(null);
                setCoverNote("");
                setResumeFile(null);
                toast.success(`Application submitted successfully to ${job.company}!`);
            } else {
                toast.error("You have already applied to this job.");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Application failed");
        } finally {
            setApplying(false);
        }
    };

    return (<DashboardLayout navItems={navItems} title="Student Portal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Available Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Searching for jobs..." : `${filtered.length} jobs found`}
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input placeholder="Search jobs, skills, location..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3"/>
          <p className="text-sm text-muted-foreground">Loading active job listings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4"/>
          <h3 className="font-semibold mb-1">No jobs currently available</h3>
          <p className="text-sm text-muted-foreground">Check back soon for new postings from recruiters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((job) => {
              const isApplied = appliedIds.has(String(job.id));
              const isExpanded = expandedId === job.id;
              return (<motion.div key={job.id} layout className="bg-card border rounded-xl p-5 flex flex-col hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isApplied && <Badge variant="secondary" className="bg-emerald-400/10 text-emerald-400">Applied</Badge>}
                    <span className="text-xs text-muted-foreground">{job.posted}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/> {job.location}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5"/> {job.salary || "Best in Industry"}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {Array.isArray(job.skills) && job.skills.map((s) => (<Badge key={s} variant="outline" className="text-xs font-normal">{s}</Badge>))}
                </div>

                <AnimatePresence>
                  {isExpanded && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t pt-4 mb-4 space-y-3">
                        <p className="text-xs text-muted-foreground">
                          {job.description}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-foreground">Attach Custom Resume (optional):</label>
                            <span className="text-[10px] text-muted-foreground">PDF/DOC/DOCX, max 5MB</span>
                          </div>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="text-xs cursor-pointer"
                            onChange={handleFileChange}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-foreground">Cover Note (optional):</label>
                          <Input
                            placeholder="Brief note to the recruiter..."
                            value={coverNote}
                            onChange={(e) => setCoverNote(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        <div className="flex gap-3 pt-1">
                          <Button size="sm" disabled={applying} onClick={() => handleApply(job)}>
                            {applying ? "Submitting..." : "Confirm Application"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setExpandedId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </motion.div>)}
                </AnimatePresence>

                {!isApplied && !isExpanded && (<Button size="sm" className="mt-auto self-start" onClick={() => setExpandedId(job.id)}>Apply Now</Button>)}
                {isApplied && !isExpanded && (<Button size="sm" className="mt-auto self-start" variant="secondary" disabled>✓ Applied</Button>)}
              </motion.div>);
          })}
        </div>
      )}
    </DashboardLayout>);
}
