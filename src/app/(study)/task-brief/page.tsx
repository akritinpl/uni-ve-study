"use client";

import { useRouter } from "next/navigation";
import TaskBriefScreen from "@/components/screens/TaskBriefScreen";

export default function TaskBriefPage() {
  const router = useRouter();
  return (
    <TaskBriefScreen
      onContinue={() => router.push("/task")}
      onBack={() => router.push("/pre-task")}
    />
  );
}
