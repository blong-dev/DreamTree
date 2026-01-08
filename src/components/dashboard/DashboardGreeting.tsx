'use client';

interface DashboardGreetingProps {
  name: string;
}

export function DashboardGreeting({ name }: DashboardGreetingProps) {
  return (
    <h1 className="dashboard-greeting">
      Welcome back, {name}
    </h1>
  );
}
