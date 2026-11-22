import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, MapPin, IndianRupee, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

const categories = ["All", "Full-time", "Internship", "Remote", "Contract", "Hybrid"];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/jobs");
      const rawJobs = data.jobs || [];
      const mapped = rawJobs.map((j) => ({
        id: j._id,
        title: j.title,
        company: j.company,
        location: j.location,
        salary: j.salary || "Best in Industry",
        type: j.jobType || j.workMode || "Full-time",
        workMode: j.workMode,
        tags: Array.isArray(j.skills) ? j.skills : [],
        posted: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "Recently",
      }));
      setJobs(mapped);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesQuery =
        query === "" ||
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      const matchesLocation =
        location === "" ||
        job.location.toLowerCase().includes(location.toLowerCase());
      const matchesCategory =
        category === "All" ||
        job.type === category ||
        job.workMode === category;
      return matchesQuery && matchesLocation && matchesCategory;
    });
  }, [jobs, query, location, category]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-20">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold">Find your next campus opportunity</h1>
            <p className="mt-4 text-muted-foreground font-body">
              Browse the latest placement-ready roles from top recruiters and apply with confidence.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90 transition-colors"
          >
            Create profile & apply
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                Search jobs
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Role, company, skill"
                    className="pl-10"
                  />
                </div>
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                Location
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or remote"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    category === item
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="rounded-3xl border bg-card p-12 text-center flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                  <p className="text-sm text-muted-foreground">Loading active job listings...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="rounded-3xl border bg-card p-8 text-center text-muted-foreground">
                  No jobs match your filters. Try a broader search.
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div key={job.id} className="rounded-3xl border bg-card p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold">{job.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {job.company} · {job.location}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {job.type}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {job.salary}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.posted}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button asChild>
                        <Link to="/register">Apply now</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/contact">Request details</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border bg-card p-6">
              <h3 className="text-lg font-semibold">Why SmartPlacement?</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>Curated recruiter-driven listings for campus placements.</li>
                <li>Fast apply flow with verified student profiles.</li>
                <li>Track applications and interviews from one dashboard.</li>
              </ul>
            </div>
            <div className="rounded-3xl border bg-card p-6">
              <h3 className="text-lg font-semibold">Campus Placement Portal</h3>
              <p className="text-xs text-muted-foreground mt-2">
                Designed to bridge top tech recruiters with college students for internships and full-time engineering roles.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
