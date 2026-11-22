import PortalLoginForm from "@/components/auth/PortalLoginForm";

import { useLocation } from "react-router-dom";

export default function Login() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const roleParam = params.get("role") || "student";
  return (<PortalLoginForm
    title="Sign in to your account"
    subtitle="Enter your credentials to access the portal"
    initialRole={roleParam}
    showRoleSelect={true}
    loginButtonLabel="Sign In"
    successMessage="Welcome back!"
  />);
}
