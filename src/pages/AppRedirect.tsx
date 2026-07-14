import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AppRedirect = () => {
  const { isAdmin, loading, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || userRole === null) return;
    if (isAdmin) {
      navigate("/app/admin/dashboard", { replace: true });
    } else {
      navigate("/app/feed", { replace: true }); // Change to /app/feed if that's your feed route
    }
  }, [isAdmin, loading, userRole, navigate]);

  if (loading || userRole === null) {
    return <div>Loading...</div>;
  }

  return null;
};

export default AppRedirect; 