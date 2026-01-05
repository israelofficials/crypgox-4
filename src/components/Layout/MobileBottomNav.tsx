"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

const navItems = [
  {
    label: "Home",
    href: "/#main-banner",
    icon: "solar:home-2-bold-duotone",
    match: (path: string) => path === "/",
  },
  {
    label: "Exchange",
    href: "/exchange",
    icon: "solar:chart-square-bold-duotone",
    match: (path: string) => path.startsWith("/exchange"),
  },
  {
    label: "Me",
    href: "/me",
    icon: "solar:user-bold-duotone",
    match: (path: string) => path.startsWith("/me"),
  },
];

const MobileBottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#070b12]/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        {navItems.map((item) => {
          const isActive = item.match(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-4 py-2 text-xs font-medium transition-colors ${
                isActive ? "bg-primary/15 text-primary" : "text-white/70 hover:text-white"
              }`}
              scroll
            >
              <Icon icon={item.icon} className="text-xl" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
