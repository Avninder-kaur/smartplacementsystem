import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Star, Briefcase, MapPin, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";

const companies = [
  {
    id: 1,
    name: "TechPulse",
    industry: "Software & Cloud",
    location: "Bangalore",
    openings: 12,
    rating: 4.8,
    description: "A fast-growing placement partner for smart campus hiring.",
  },
  {
    id: 2,
    name: "CloudWave",
    industry: "Fintech",
    location: "Hyderabad",
    openings: 9,
    rating: 4.6,
    description: "Hiring talent for data-driven campus teams.",
  },
  {
    id: 3,
    name: "Insight Labs",
    industry: "Analytics",
    location: "Mumbai",
    openings: 7,
    rating: 4.7,
    description: "Campus-ready roles in analytics and business intelligence.",
  },
  {
    id: 4,
    name: "DesignHive",
    industry: "Design & UX",
    location: "Pune",
    openings: 5,
    rating: 4.5,
    description: "Creating delightful student experiences with design teams.",
  },
];

export default function Companies() {
  return (<div className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-20">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold">Explore top recruiting companies</h1>
            <p className="mt-4 text-muted-foreground font-body">Discover trusted campus employers, compare openings, and connect with teams hiring students now.</p>
          </div>
          <Button asChild>
            <Link to="/jobs">Browse jobs</Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {companies.map((company) => (<div key={company.id} className="rounded-3xl border bg-card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Building2 className="h-4 w-4" />
                        <span>{company.industry}</span>
                      </div>
                      <h2 className="text-2xl font-semibold">{company.name}</h2>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <Star className="h-3.5 w-3.5" />
                      {company.rating}
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{company.description}</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{company.location}</span>
                    <span className="inline-flex items-center gap-2"><Briefcase className="h-4 w-4" />{company.openings} openings</span>
                    <span className="inline-flex items-center gap-2"><Globe2 className="h-4 w-4" />SmartPlacement verified</span>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button variant="outline" asChild>
                      <Link to="/jobs">View Roles</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/contact">Connect</Link>
                    </Button>
                  </div>
                </div>))}
        </div>
      </section>
    </div>);
}
