import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, PlusCircle, FolderOpen, Users, Building2, Pencil, Trash2, Eye, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const navItems = [
    { label: "Dashboard", to: "/company/dashboard", icon: LayoutDashboard },
    { label: "Post Job", to: "/company/post-job", icon: PlusCircle },
    { label: "Manage Jobs", to: "/company/manage-jobs", icon: FolderOpen },
    { label: "View Applicants", to: "/company/applicants", icon: Users },
    { label: "Company Profile", to: "/company/profile", icon: Building2 },
];

export default function ManageJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editJob, setEditJob] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get("/jobs/my/listings");
            const rawJobs = data.jobs || [];
            const mapped = rawJobs.map((j) => ({
                ...j,
                id: j._id,
                active: j.isActive,
                applicants: j.applicantCount || 0,
                deadlineFormatted: j.deadline ? new Date(j.deadline).toISOString().split("T")[0] : "No deadline",
                rawDeadline: j.deadline ? new Date(j.deadline).toISOString().split("T")[0] : "",
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
        try {
            await api.delete(`/jobs/${id}`);
            setJobs((prev) => prev.filter((j) => j.id !== id));
            setDeleteId(null);
            toast.success("Job listing deleted.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete job");
        }
    };

    const handleToggleActive = async (id, currentActive) => {
        try {
            const nextActive = !currentActive;
            await api.put(`/jobs/${id}`, { isActive: nextActive });
            setJobs((prev) =>
                prev.map((j) => (j.id === id ? { ...j, active: nextActive, isActive: nextActive } : j))
            );
            toast.success(nextActive ? "Job listing activated." : "Job listing closed.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update job status");
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editJob) return;
        const form = e.currentTarget;
        const data = new FormData(form);

        const updateData = {
            title: data.get("title")?.toString().trim(),
            description: data.get("description")?.toString().trim(),
            location: data.get("location")?.toString().trim(),
            salary: data.get("salary")?.toString().trim(),
            deadline: data.get("deadline")?.toString() || undefined,
        };

        try {
            const res = await api.put(`/jobs/${editJob.id}`, updateData);
            if (!res?.success) throw new Error(res?.message || "Update failed");
            toast.success("Job updated successfully!");
            setEditJob(null);
            await fetchJobs();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update job");
        }
    };

    return (<DashboardLayout navItems={navItems} title="Recruiter Portal">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {jobs.filter((j) => j.active).length} active &middot; {jobs.filter((j) => !j.active).length} closed
          </p>
        </div>
        <Button onClick={() => navigate("/company/post-job")}>
          <PlusCircle className="h-4 w-4 mr-2"/> Post New Job
        </Button>
      </div>

      {loading ? (
        <div className="bg-card border rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3"/>
          <p className="text-sm text-muted-foreground">Loading your job listings...</p>
        </div>
      ) : jobs.length === 0 ? (<div className="bg-card border rounded-xl p-12 text-center">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4"/>
          <h3 className="font-semibold mb-1">No job listings yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first job posting to start receiving applications.</p>
          <Button onClick={() => navigate("/company/post-job")}>Post a Job</Button>
        </div>) : (<div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Job Title</th>
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                  <th className="text-left py-3 px-4 font-medium">Applicants</th>
                  <th className="text-left py-3 px-4 font-medium">Deadline</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (<tr key={job.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.salary || "Not specified"}</p>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{job.location}</td>
                    <td className="py-3 px-4">
                      <button className="text-primary hover:underline font-medium" onClick={() => navigate(`/company/applicants?jobId=${job.id}`)}>
                        {job.applicants}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{job.deadlineFormatted}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className={job.active ? "bg-emerald-400/10 text-emerald-400" : "bg-muted text-muted-foreground"}>
                        {job.active ? "Active" : "Closed"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View applicants" onClick={() => navigate(`/company/applicants?jobId=${job.id}`)}>
                          <Eye className="h-4 w-4"/>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit job" onClick={() => setEditJob(job)}>
                          <Pencil className="h-4 w-4"/>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title={job.active ? "Close listing" : "Reopen listing"} onClick={() => handleToggleActive(job.id, job.active)}>
                          {job.active
                    ? <ToggleRight className="h-4 w-4 text-emerald-400"/>
                    : <ToggleLeft className="h-4 w-4 text-muted-foreground"/>}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete job" onClick={() => setDeleteId(job.id)}>
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>)}

      {/* Edit Dialog */}
      <Dialog open={!!editJob} onOpenChange={() => setEditJob(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Job Listing</DialogTitle>
          </DialogHeader>
          {editJob && (<form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input name="title" defaultValue={editJob.title} required/>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" defaultValue={editJob.description} rows={3} required/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input name="location" defaultValue={editJob.location} required/>
                </div>
                <div className="space-y-2">
                  <Label>Salary Range</Label>
                  <Input name="salary" defaultValue={editJob.salary}/>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input name="deadline" type="date" defaultValue={editJob.rawDeadline}/>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setEditJob(null)}>Cancel</Button>
              </div>
            </form>)}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Job Listing?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            This will permanently remove the listing and all its applications. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="destructive" onClick={() => deleteId !== null && handleDelete(deleteId)}>
              Yes, Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>);
}
