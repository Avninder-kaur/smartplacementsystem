import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, User, Briefcase, FileCheck, Activity, Bell, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { BranchSelect } from "@/components/ui/BranchSelect";
import { SkillsTagInput } from "@/components/ui/SkillsTagInput";
import { useAuth } from "@/context/AuthContext";
import API_BASE_URL, { api } from "@/lib/api";

const navItems = [
    { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Profile", to: "/student/profile", icon: User },
    { label: "Available Jobs", to: "/student/jobs", icon: Briefcase },
    { label: "Applied Jobs", to: "/student/applied", icon: FileCheck },
    { label: "Application Status", to: "/student/status", icon: Activity },
    { label: "Notifications", to: "/student/notifications", icon: Bell },
];

export default function StudentProfile() {
    const { user, refreshUser } = useAuth();

    const [name, setName] = useState("");
    const [university, setUniversity] = useState("");
    const [branch, setBranch] = useState("");
    const [cgpa, setCgpa] = useState("");
    const [skills, setSkills] = useState([]);
    const [resumeFile, setResumeFile] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setUniversity(user.university || "");
            setBranch(user.branch || "");
            setCgpa(user.cgpa ? String(user.cgpa) : "");
            setSkills(Array.isArray(user.skills) ? user.skills : []);
        }
    }, [user]);

    const profileCompletion = useMemo(() => {
        let score = 0;
        if (name) score += 20;
        if (university) score += 20;
        if (branch) score += 20;
        if (cgpa) score += 20;
        if (user?.resumeURL || resumeFile) score += 20;
        return Math.max(score, 20);
    }, [name, university, branch, cgpa, user, resumeFile]);

    const handleResumeChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setResumeFile(null);
            return;
        }
        const maxBytes = 5 * 1024 * 1024;
        const allowedExts = [".pdf", ".doc", ".docx"];
        const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (!allowedExts.includes(ext)) {
            toast.error("Only PDF, DOC, and DOCX files are allowed for resume.");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("university", university);
            formData.append("branch", branch);
            if (cgpa) formData.append("cgpa", cgpa);
            skills.forEach((s) => formData.append("skills[]", s));
            if (resumeFile) {
                formData.append("resume", resumeFile);
            }

            const res = await api.putForm("/auth/profile", formData);
            if (!res?.success) throw new Error(res?.message || "Profile update failed");
            await refreshUser();
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (<DashboardLayout navItems={navItems} title="Student Portal">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="max-w-2xl space-y-6">
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Profile Completion</h3>
          <Progress value={profileCompletion} className="h-2.5 mb-3"/>
          <p className="text-sm text-muted-foreground">
            {profileCompletion}% complete — {profileCompletion === 100 ? "Your profile is fully completed!" : "Fill in all fields to maximize interview visibility."}
          </p>
        </div>

        <form className="bg-card border rounded-xl p-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Your university or college"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Engineering Branch</Label>
              <BranchSelect value={branch} onValueChange={setBranch}/>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cgpa">CGPA (0 - 10)</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="8.50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="resume">Update Resume</Label>
                <span className="text-[10px] text-muted-foreground">PDF/DOC/DOCX, max 5MB</span>
              </div>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                className="cursor-pointer"
                onChange={handleResumeChange}
              />
              {user?.resumeURL && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current resume:{" "}
                  <a
                    href={user.resumeURL.startsWith("http") ? user.resumeURL : `${API_BASE_URL.replace(/\/api\/?$/, "")}${user.resumeURL}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3"/> View Resume
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <SkillsTagInput value={skills} onChange={setSkills} placeholder="Add a skill and press Enter..."/>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </DashboardLayout>);
}
