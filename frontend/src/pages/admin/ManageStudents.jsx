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

export default function ManageStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get("/admin/users?role=student");
            const raw = data.users || [];
            const mapped = raw.map((s) => ({
                id: s._id,
                name: s.name,
                email: s.email,
                university: s.university || "Not provided",
                branch: s.branch || "General",
                cgpa: s.cgpa ? String(s.cgpa) : "N/A",
                skills: Array.isArray(s.skills) ? s.skills : [],
            }));
            setStudents(mapped);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load students");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this student and their applications?")) return;
        try {
            await api.delete(`/admin/user/${id}`);
            setStudents((prev) => prev.filter((s) => s.id !== id));
            toast.success("Student removed successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete student");
        }
    };

    const filtered = students.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.email.toLowerCase().includes(search.toLowerCase()) ||
            s.university.toLowerCase().includes(search.toLowerCase())
    );

    return (<DashboardLayout navItems={navItems} title="Admin Panel (TPO)">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Students</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading..." : `${filtered.length} students registered`}
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input placeholder="Search students by name, university..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)}/>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3"/>
          <p className="text-sm text-muted-foreground">Loading student records from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center text-muted-foreground">
          No students found matching your search.
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">University</th>
                  <th className="text-left py-3 px-4 font-medium">Branch</th>
                  <th className="text-left py-3 px-4 font-medium">CGPA</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (<tr key={s.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{s.university}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.branch}</td>
                    <td className="py-3 px-4 font-medium">{s.cgpa}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        title="Delete Student"
                        onClick={() => handleDelete(s.id)}
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
