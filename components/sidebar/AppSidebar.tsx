'use client';

import React from 'react';
import {
  BarChartIcon,
  Calendar,
  ClipboardListIcon,
  DatabaseIcon,
  FileIcon,
  HeartHandshake,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MessageCircle,
  SettingsIcon,
  SwatchBook,
} from 'lucide-react';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';
import Logo from '@/components/Logo';
import { NavSecondary } from './nav-secondary-';
import { NavUser } from './nav-user';
import Dashboard from "@/app/dashboard/page";
import MealPlans from "../meal-plans";
import WorkoutPlans from "../workout-plans";
import Habits from "../habits";
import HealthAssessments from "../health-assessments.tsx";
import ProgressTrack from "../progress-track";
import { ExerciseTrack } from "../exercise-track"
import { UserSettings } from "../settings";
import Link from "next/link";

export interface NavItem {
  title: string;
  url?: string;
  component?: React.ComponentType;
  icon?: React.ComponentType<{ size?: number }>;
}

interface SidebarMenuProps extends React.ComponentProps<typeof Sidebar> {
  items: NavItem[];
  activeItem: string | null;
  onSelectComponent: (title: string, callback: () => React.ComponentType<any> | null) => void;
}

export const data = {
  navMain: [
    {
      title: 'Dashboard',
      component: Dashboard,
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Meal Plans',
      component: MealPlans,
      icon: Calendar,
    },
    {
      title: 'Workout Programs',
      component: WorkoutPlans,
      icon: BarChartIcon,
    },
    {
      title: 'Habits',
      component: Habits,
      icon: HeartHandshake,
    },
    {
      title: 'Health Assessments',
      component: HealthAssessments,
      icon: SwatchBook,
    },
    {
      title: 'Progress Tracking',
      component: ProgressTrack,
      icon: DatabaseIcon,
    },
    {
      title: 'Exercise Tracking',
      component: ExerciseTrack,
      icon: DatabaseIcon,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      component: UserSettings,
      icon: SettingsIcon,
    },
    {
      title: 'Get Help',
      url: '/',
      icon: HelpCircleIcon,
    },
    {
      title: 'Feedback',
      component: FeedbackForm,
      icon: MessageCircle,
    },
  ],
  documents: [
    {
      name: 'Assets',
      url: '/assets',
      icon: DatabaseIcon,
    },
    {
      name: 'Social Accounts',
      url: '/reports',
      icon: ClipboardListIcon,
    },
    {
      name: 'Word Assistant',
      url: '/word-assistant',
      icon: FileIcon,
    },
  ],
};

export function AppSidebar({
  items,
  activeItem,
  onSelectComponent,
  ...props
}: SidebarMenuProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="#">
                <Logo height={30} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Pass onSelectComponent so NavMain can trigger inline component changes if needed */}
        <NavMain items={data.navMain} activeItem={activeItem} onSelectComponent={onSelectComponent} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary 
          items={data.navSecondary} 
          activeItem={activeItem}
          onSelectComponent={onSelectComponent}
          className="mt-auto" 
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
