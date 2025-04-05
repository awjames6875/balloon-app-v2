import { useLocation, Link } from "wouter";
import { Home, Image, Package, Clipboard, BarChart3, CreditCard } from "lucide-react";

const MobileNav = () => {
  const [location] = useLocation();

  const navItems = [
    { name: "Home", icon: <Home className="h-6 w-6" />, path: "/dashboard" },
    { name: "Design", icon: <Image className="h-6 w-6" />, path: "/design" },
    { name: "Inventory", icon: <Package className="h-6 w-6" />, path: "/inventory" },
    { name: "Production", icon: <Clipboard className="h-6 w-6" />, path: "/production" },
    { name: "Analytics", icon: <BarChart3 className="h-6 w-6" />, path: "/analytics" },
    { name: "Payments", icon: <CreditCard className="h-6 w-6" />, path: "/payments" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 py-2 z-30">
      <div className="grid grid-cols-6 gap-1">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a className={`flex flex-col items-center p-2 ${
                location === item.path
                  ? "text-primary-600"
                  : "text-secondary-500"
              }`}>
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
