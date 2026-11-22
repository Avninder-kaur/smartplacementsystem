import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, PlusCircle, FolderOpen, Users, Building2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const navItems = [
    { label: "Dashboard", to: "/company/dashboard", icon: LayoutDashboard },
    { label: "Post Job", to: "/company/post-job", icon: PlusCircle },
    { label: "Manage Jobs", to: "/company/manage-jobs", icon: FolderOpen },
    { label: "View Applicants", to: "/company/applicants", icon: Users },
    { label: "Company Profile", to: "/company/profile", icon: Building2 },
];

export default function CompanyProfile() {
    const { user, refreshUser } = useAuth();

    const [companyName, setCompanyName] = useState("");
    const [industry, setIndustry] = useState("");
    const [website, setWebsite] = useState("");
    const [recruiterName, setRecruiterName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setCompanyName(user.companyName || user.name || "");
            setIndustry(user.industry || "");
            setWebsite(user.website || "");
            setRecruiterName(user.name || "");
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updateBody = {
                companyName: companyName.trim(),
                industry: industry.trim(),
                website: website.trim(),
                name: recruiterName.trim(),
            };
            const res = await api.put("/auth/profile", updateBody);
            if (!res?.success) throw new Error(res?.message || "Failed to update profile");
            await refreshUser();
            toast.success("Company profile updated successfully!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update company profile");
        } finally {
            setSaving(false);
        }
    };

    return (<DashboardLayout navItems={navItems} title="Recruiter Portal">
      <h1 className="text-2xl font-bold mb-2">Company Profile</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your company information visible to students and applicants</p>

      <form className="max-w-2xl space-y-6" onSubmit={handleSubmit}>
        <div className="bg-card border rounded-xl p-6 space-y-5">
          <h3 className="font-semibold text-base">Company Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. TechCorp"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry <span className="text-destructive">*</span></Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Software & Cloud"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recruiterName">Lead Recruiter Name</Label>
              <Input
                id="recruiterName"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="Recruiter contact name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Account Email</Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </DashboardLayout>);
}
