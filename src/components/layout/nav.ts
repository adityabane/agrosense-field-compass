import { Activity, Bell, BarChart3, CalendarClock, Cpu, Droplets, Home, LayoutGrid, Map, Settings, SlidersHorizontal, Sprout, User } from "lucide-react";

export const primaryNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/monitor", label: "Monitor", icon: Activity },
  { to: "/irrigation", label: "Irrigation", icon: Droplets },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export const moreNav = [
  { to: "/plots", label: "My Plots", icon: Map },
  { to: "/crops", label: "Crop Management", icon: Sprout },
  { to: "/schedule", label: "Irrigation Schedule", icon: CalendarClock },
  { to: "/automation", label: "Automation Settings", icon: SlidersHorizontal },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/devices", label: "Device Management", icon: Cpu },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export const MoreIcon = LayoutGrid;
