"use client";

import { useRouter } from "next/navigation";
import WelcomeScreen from "@/components/screens/WelcomeScreen";

export default function WelcomePage() {
  const router = useRouter();
  return <WelcomeScreen onContinue={() => router.push("/consent")} />;
}
