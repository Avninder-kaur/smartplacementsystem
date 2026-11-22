import { useState, useEffect, useMemo } from "react";
import { Bell, Check, Briefcase, CheckCircle2, Calendar, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const iconMap = {
    job: Briefcase,
    shortlisted: CheckCircle2,
    interview: Calendar,
    rejected: XCircle,
};
const colorMap = {
    job: "text-primary",
    shortlisted: "text-emerald-400",
    interview: "text-amber-400",
    rejected: "text-destructive",
};

export function NotificationDropdown() {
    const { user } = useAuth();
    const [liveItems, setLiveItems] = useState([]);
    const [readIds, setReadIds] = useState(() => new Set());

    useEffect(() => {
        let isMounted = true;
        const promises = [api.get("/jobs?limit=4")];
        if (user?.role === "student") {
            promises.push(api.get("/applications/student"));
        }

        Promise.allSettled(promises).then(([jobsRes, appsRes]) => {
            if (!isMounted) return;
            const items = [];

            if (appsRes?.status === "fulfilled" && appsRes.value?.applications) {
                appsRes.value.applications.slice(0, 3).forEach((app) => {
                    const title = app.jobId?.title || "Job";
                    const company = app.jobId?.company || "Company";
                    if (app.status === "Shortlisted") {
                        items.push({
                            id: `app-s-${app._id}`,
                            type: "shortlisted",
                            message: `Shortlisted for ${title} at ${company}!`,
                            time: "Recent",
                        });
                    } else if (app.status === "Interview Scheduled") {
                        items.push({
                            id: `app-i-${app._id}`,
                            type: "interview",
                            message: `Interview for ${title} at ${company}`,
                            time: "Scheduled",
                        });
                    }
                });
            }

            if (jobsRes.status === "fulfilled" && jobsRes.value?.jobs) {
                jobsRes.value.jobs.slice(0, 3).forEach((j) => {
                    items.push({
                        id: `job-${j._id}`,
                        type: "job",
                        message: `New job: ${j.title} at ${j.company}`,
                        time: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "New",
                    });
                });
            }

            setLiveItems(items);
        });

        return () => { isMounted = false; };
    }, [user]);

    const notifications = useMemo(() => {
        return liveItems.map((n) => ({
            ...n,
            read: readIds.has(n.id),
        }));
    }, [liveItems, readIds]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id) => {
        setReadIds((prev) => new Set([...prev, id]));
    };

    const markAllRead = () => {
        setReadIds(new Set(notifications.map((n) => n.id)));
    };

    return (<Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5"/>
          {unreadCount > 0 && (<span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (<button onClick={markAllRead} className="text-xs text-primary hover:underline">
              Mark all read
            </button>)}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No new notifications</p>
          ) : (
            notifications.slice(0, 4).map((n) => {
              const Icon = iconMap[n.type] || Briefcase;
              return (<div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors hover:bg-accent/50 ${!n.read ? "bg-primary/5" : ""}`}>
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${colorMap[n.type] || "text-primary"}`}/>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? "font-medium" : "text-muted-foreground"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  {!n.read && (<button onClick={() => markAsRead(n.id)} className="shrink-0 p-1 rounded hover:bg-accent" title="Mark as read">
                      <Check className="h-3.5 w-3.5 text-muted-foreground"/>
                    </button>)}
                </div>);
            })
          )}
        </div>
        <div className="border-t px-4 py-2">
          <Link to="/student/notifications" className="text-xs text-primary hover:underline block text-center">
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>);
}
