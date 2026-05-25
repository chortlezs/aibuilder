import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '主页' },
    { path: '/roles', icon: Users, label: '角色' },
    { path: '/report', icon: BarChart2, label: '报告' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] text-zinc-800 font-sans overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full h-20 bg-white/80 backdrop-blur-md border-t border-zinc-100 flex items-center justify-around px-6 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-colors duration-300",
                isActive ? "text-[#A1C9F1]" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-all duration-300",
                isActive ? "bg-[#A1C9F1]/10" : "bg-transparent"
              )}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
