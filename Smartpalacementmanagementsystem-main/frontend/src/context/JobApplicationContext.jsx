import { createContext, useContext, useState, useCallback } from "react";
const JobApplicationContext = createContext(null);
export function JobApplicationProvider({ children }) {
    const [applications, setApplications] = useState([]);
    const [appliedIds, setAppliedIds] = useState(new Set());
    const applyToJob = useCallback((job) => {
        if (appliedIds.has(job.id))
            return false;
        setAppliedIds((prev) => new Set(prev).add(job.id));
        setApplications((prev) => [
            {
                job,
                appliedDate: new Date().toISOString().split("T")[0],
                status: "Pending",
            },
            ...prev,
        ]);
        return true;
    }, [appliedIds]);
    return (<JobApplicationContext.Provider value={{ applications, appliedIds, applyToJob }}>
      {children}
    </JobApplicationContext.Provider>);
}
export function useJobApplications() {
    const ctx = useContext(JobApplicationContext);
    if (!ctx)
        throw new Error("useJobApplications must be used within JobApplicationProvider");
    return ctx;
}
