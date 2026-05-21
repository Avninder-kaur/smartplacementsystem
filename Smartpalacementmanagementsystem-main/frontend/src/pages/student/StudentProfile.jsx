import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, User, Briefcase, FileCheck, Activity, Bell, } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { BranchSelect } from "@/components/ui/BranchSelect";
import { SkillsTagInput } from "@/components/ui/SkillsTagInput";
import { api } from "@/lib/api";
const navItems = [
    { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Profile", to: "/student/profile", icon: User },
    { label: "Available Jobs", to: "/student/jobs", icon: Briefcase },
    { label: "Applied Jobs", to: "/student/applied", icon: FileCheck },
    { label: "Application Status", to: "/student/status", icon: Activity },
    { label: "Notifications", to: "/student/notifications", icon: Bell },
];
export default function StudentProfile() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [university, setUniversity] = useState("");
    const [course, setCourse] = useState("");
    const [branch, setBranch] = useState("");
    const [cgpa, setCgpa] = useState("");
    const [skills, setSkills] = useState([]);
    const [resume, setResume] = useState(null);
    const [profilePic, setProfilePic] = useState(null);
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get("/user/profile");
            if (response?.success && response?.user) {
                const user = response.user;
                setName(user.name || "");
                setEmail(user.email || "");
                setUniversity(user.university || "");
                setCourse(user.course || "");
                setBranch(user.branch || "");
                setCgpa(user.cgpa || "");
                setSkills(user.skills || []);
                if (user.profilePic) {
                    setProfilePic(user.profilePic);
                }
            }
        } catch (error) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("university", university);
            formData.append("course", course);
            formData.append("branch", branch);
            formData.append("cgpa", cgpa);
            formData.append("skills", JSON.stringify(skills));

            if (profilePicFile) {
                formData.append("profilePic", profilePicFile);
            }
            if (resume) {
                formData.append("resume", resume);
            }

            const response = await api.putForm("/user/profile", formData);
            if (response?.success) {
                toast.success("Profile updated successfully!");
                fetchProfile();
            } else {
                toast.error(response?.message || "Failed to update profile");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update profile");
        }
    };
    return (<DashboardLayout navItems={navItems} title="Student Portal">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="max-w-2xl space-y-6">
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Profile Completion</h3>
          <Progress value={20} className="h-2.5 mb-3"/>
          <p className="text-sm text-muted-foreground">20% complete — Fill in all fields to boost your profile.</p>
        </div>

        <form className="bg-card border rounded-xl p-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input placeholder="you@university.edu" value={email} disabled/>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>University</Label>
              <Input placeholder="Your university" value={university} onChange={(e) => setUniversity(e.target.value)}/>
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Input placeholder="B.Tech, M.Tech, etc." value={course} onChange={(e) => setCourse(e.target.value)}/>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <Input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setProfilePicFile(file);
                if (file) {
                    setProfilePic(URL.createObjectURL(file));
                }
            }}/>
          </div>
          {profilePic ? (<div className="space-y-2">
            <Label>Current Profile Photo</Label>
            <img src={profilePic.startsWith("http") ? profilePic : `${profilePic}`} alt="Profile" className="h-24 w-24 rounded-full object-cover"/>
          </div>) : null}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Engineering Branch</Label>
              <BranchSelect value={branch} onValueChange={setBranch}/>
            </div>
            <div className="space-y-2">
              <Label>CGPA</Label>
              <Input type="number" step="0.01" min="0" max="10" placeholder="8.50" value={cgpa} onChange={(e) => setCgpa(e.target.value)}/>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Skills</Label>
            <SkillsTagInput value={skills} onChange={setSkills}/>
          </div>
          <div className="space-y-2">
            <Label>Resume</Label>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files?.[0] || null)}/>
          </div>
          <Button type="submit" disabled={loading}>Save Changes</Button>
        </form>
      </div>
    </DashboardLayout>);
}
