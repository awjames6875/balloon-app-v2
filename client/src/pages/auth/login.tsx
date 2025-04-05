import LoginForm from "@/components/auth/login-form";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useLocation } from "wouter";

const Login = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
