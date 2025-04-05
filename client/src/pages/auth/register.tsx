import RegisterForm from "@/components/auth/register-form";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { useLocation } from "wouter";

const Register = () => {
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
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
