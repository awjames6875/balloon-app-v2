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
    <div className="min-h-screen flex bg-secondary-50">
      {/* Form Section */}
      <div className="flex flex-col justify-center w-full md:w-1/2 p-6 md:p-10">
        <div className="max-w-md mx-auto w-full">
          <RegisterForm />
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-primary-600 text-white p-10">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">Join Our Platform</h1>
          <p className="text-xl mb-8">
            Create an account to access our AI-powered balloon design tools and 
            start managing your balloon business more efficiently.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="rounded-full bg-white p-1 mr-3">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Upload design images for instant analysis</p>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-white p-1 mr-3">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Get real-time inventory alerts</p>
            </div>
            <div className="flex items-start">
              <div className="rounded-full bg-white p-1 mr-3">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Comprehensive analytics and sales tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
