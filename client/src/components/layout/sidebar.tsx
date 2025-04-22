import { useAuth } from "@/context/auth-context";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Image, 
  Package, 
  Clipboard, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut,
  CreditCard,
  Palette,
  Grid,
  ShoppingBag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      logout();
      toast({
        title: "Logged out successfully",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Navigation links with their paths and icons
  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="h-5 w-5 mr-3" /> },
    { name: "Design Upload", path: "/design", icon: <Image className="h-5 w-5 mr-3" /> },
    { 
      name: "My Designs", 
      path: "/my-designs", 
      icon: <Palette className="h-5 w-5 mr-3" />
    },
    { name: "Design Editor", path: "/design-editor", icon: <Grid className="h-5 w-5 mr-3" /> },
    { name: "Inventory", path: "/inventory", icon: <Package className="h-5 w-5 mr-3" /> },
    { 
      name: "Orders", 
      path: "/orders", 
      icon: <ShoppingBag className="h-5 w-5 mr-3" />,
      highlight: true  // Highlight the new Orders feature
    },
    { name: "Production", path: "/production", icon: <Clipboard className="h-5 w-5 mr-3" /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart3 className="h-5 w-5 mr-3" /> },
    { name: "Payments", path: "/payments", icon: <CreditCard className="h-5 w-5 mr-3" /> },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-secondary-200">
      {/* App Logo/Header */}
      <div className="p-4 border-b border-secondary-200">
        <h1 className="text-xl font-semibold text-primary-700">Balloon App</h1>
      </div>
      
      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-secondary-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-semibold">
            {user.fullName?.substring(0, 2) || user.username?.substring(0, 2) || "U"}
          </div>
          <div>
            <p className="font-medium">{user.fullName || user.username}</p>
            <p className="text-xs text-secondary-500 capitalize">{user.role}</p>
          </div>
        </div>
      )}
      
      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                href={link.path}
                className={`flex items-center p-2 rounded-md ${
                  location === link.path
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : link.highlight
                      ? "text-purple-600 font-medium bg-purple-50 hover:bg-purple-100 border border-purple-200"
                      : "text-secondary-500 hover:bg-secondary-100"
                }`}
              >
                {link.icon}
                {link.name}
                {link.highlight && (
                  <span className="ml-2 bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">New</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Bottom Links */}
      <div className="p-4 border-t border-secondary-200">
        <Link href="/settings" className="flex items-center p-2 rounded-md text-secondary-500 hover:bg-secondary-100">
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </Link>
        <Link href="/help" className="flex items-center p-2 rounded-md text-secondary-500 hover:bg-secondary-100">
          <HelpCircle className="h-5 w-5 mr-3" />
          Help
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-2 rounded-md text-secondary-500 hover:bg-secondary-100"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
