import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Users, Building2, Briefcase, FileText, Search, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const navItems = [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Manage Students", to: "/admin/students", icon: Users },
    { label: "Manage Companies", to: "/admin/companies", icon: Building2 },
    { label: "Job Listings", to: "/admin/jobs", icon: Briefcase },
    { label: "Reports", to: "/admin/reports", icon: FileText },
];

export default function AdminJobListings() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get("/admin/jobs");
            const raw = data.jobs || [];
            const mapped = raw.map((j) => ({
                id: j._id,
                title: j.title,
                company: j.company,
                location: j.location,
                applicants: j.applicantCount || 0,
                deadline: j.deadline ? new Date(j.deadline).toLocaleDateString() : "No deadline",
                active: j.isActive,
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

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this job and all its student applications?")) return;
        try {
            await api.delete(`/admin/job/${id}`);
            setJobs((prev) => prev.filter((j) => j.id !== id));
            toast.success("Job and applications deleted successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete job");
        }
    };

    const filtered = jobs.filter(
        (j) =>
            j.title.toLowerCase().includes(search.toLowerCase()) ||
            j.company.toLowerCase().includes(search.toLowerCase()) ||
            j.location.toLowerCase().includes(search.toLowerCase())
    );

    return (<DashboardLayout navItems={navItems} title="Admin Panel (TPO)">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Job Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading..." : `All active and closed job postings across campus (${filtered.length} total)`}
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input placeholder="Search jobs, company, location..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3"/>
          <p className="text-sm text-muted-foreground">Loading job listings from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center text-muted-foreground">
          No jobs found matching your search.
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Job Title</th>
                  <th className="text-left py-3 px-4 font-medium">Company</th>
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                  <th className="text-left py-3 px-4 font-medium">Applicants</th>
                  <th className="text-left py-3 px-4 font-medium">Deadline</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (<tr key={job.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{job.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">{job.company}</td>
                    <td className="py-3 px-4 text-muted-foreground">{job.location}</td>
                    <td className="py-3 px-4 text-muted-foreground font-semibold">{job.applicants}</td>
                    <td className="py-3 px-4 text-muted-foreground">{job.deadline}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className={job.active ? "bg-emerald-400/10 text-emerald-400" : "bg-muted text-muted-foreground"}>
                        {job.active ? "Active" : "Closed"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete Job"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>);
}
