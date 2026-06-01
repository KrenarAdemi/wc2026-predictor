import {
  CalendarDays,
  Trophy,
  Users,
  Flag,
  ShieldCheck,
  KeyRound,
  BookOpen,
} from "lucide-react";

export const tabs = [
  { id: "dashboard", label: "Dashboard", icon: Trophy },
  { id: "fixtures", label: "Fixtures", icon: CalendarDays },
  { id: "members", label: "Members", icon: Users },
  { id: "standings", label: "Standings", icon: ShieldCheck },
  { id: "nations", label: "Nations", icon: Flag },
  { id: "rules", label: "Rules", icon: BookOpen },
  { id: "admin", label: "Admin", icon: KeyRound, adminOnly: true },
];