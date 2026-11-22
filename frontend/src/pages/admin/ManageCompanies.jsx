import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Users, Building2, Briefcase, FileText, Search, Globe, Loader2, Trash2 } from "lucide-react";
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

export default function ManageCompanies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get("/admin/users?role=recruiter");
            const raw = data.users || [];
            const mapped = raw.map((c) => ({
                id: c._id,
                name: c.companyName || c.name || "Company",
                recruiterName: c.name,
                email: c.email,
                industry: c.industry || "General Industry",
                website: c.website || "",
            }));
            setCompanies(mapped);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load companies");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this recruiter, their jobs, and all associated applications?")) return;
        try {
            await api.delete(`/admin/user/${id}`);
            setCompanies((prev) => prev.filter((c) => c.id !== id));
            toast.success("Company/Recruiter removed successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete company");
        }
    };

    const filtered = companies.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.industry.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (<DashboardLayout navItems={navItems} title="Admin Panel (TPO)">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading..." : `${filtered.length} recruiting companies registered`}
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input placeholder="Search companies or recruiters..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3"/>
          <p className="text-sm text-muted-foreground">Loading companies from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center text-muted-foreground">
          No companies found matching your search.
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Company</th>
                  <th className="text-left py-3 px-4 font-medium">Recruiter</th>
                  <th className="text-left py-3 px-4 font-medium">Industry</th>
                  <th className="text-left py-3 px-4 font-medium">Website</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (<tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{c.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <div>
                        <p>{c.recruiterName}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{c.industry}</td>
                    <td className="py-3 px-4">
                      {c.website ? (
                        <a
                          href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Globe className="h-3.5 w-3.5"/> {c.website}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not provided</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete Company"
                        onClick={() => handleDelete(c.id)}
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
