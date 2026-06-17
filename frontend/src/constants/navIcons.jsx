import {
  LayoutDashboard, Users, UserCheck, Bell, BookOpen,
  Calendar, FileText, ClipboardList,
} from 'lucide-react';

export const navIconMap = {
  Dashboard: LayoutDashboard,
  Students: Users,
  'My Students': Users,
  Professors: UserCheck,
  Notice: Bell,
  'Notice Board': Bell,
  Courses: BookOpen,
  Subjects: FileText,
  Leave: Calendar,
  'Leave Requests': Calendar,
  'Leave Approvals': Calendar,
  Leaves: Calendar,
  Attendance: ClipboardList,
  'Study Material': BookOpen,
  Profile: UserCheck,
};

export const getNavIcon = (name, size = 20) => {
  const Icon = navIconMap[name] || FileText;
  return <Icon size={size} />;
};
