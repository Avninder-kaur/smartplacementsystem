import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

const JobApplicationContext = createContext(null);

export function JobApplicationProvider({ children }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    if (!user || user.role !== "student") {
      setApplications([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get("/applications/student");
      setApplications(data.applications || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const appliedIds = useMemo(() => {
    const ids = new Set();
    applications.forEach((app) => {
      const id = app.jobId?._id || app.jobId;
      if (id) ids.add(String(id));
      if (app.job?.id) ids.add(String(app.job.id));
    });
    return ids;
  }, [applications]);

  const applyToJob = useCallback(
    async (jobOrId, coverNote = "", resumeFile = null) => {
      const jobId = typeof jobOrId === "object" ? (jobOrId._id || jobOrId.id) : jobOrId;
      if (!jobId) throw new Error("Job ID is required");

      if (appliedIds.has(String(jobId))) {
        return false;
      }

      let res;
      if (resumeFile) {
        const formData = new FormData();
        formData.append("jobId", jobId);
        if (coverNote) formData.append("coverNote", coverNote);
        formData.append("resume", resumeFile);
        res = await api.postForm("/applications/apply", formData);
      } else {
        res = await api.post("/applications/apply", { jobId, coverNote });
      }

      if (res?.success) {
        // Refresh full applications list from database to ensure consistency
        await fetchApplications();
        return true;
      }
      return false;
    },
    [appliedIds, fetchApplications]
  );

  const value = useMemo(
    () => ({
      applications,
      appliedIds,
      loading,
      error,
      fetchApplications,
      applyToJob,
    }),
    [applications, appliedIds, loading, error, fetchApplications, applyToJob]
  );

  return (
    <JobApplicationContext.Provider value={value}>
      {children}
    </JobApplicationContext.Provider>
  );
}

export function useJobApplications() {
  const ctx = useContext(JobApplicationContext);
  if (!ctx) {
    throw new Error("useJobApplications must be used within JobApplicationProvider");
  }
  return ctx;
}
