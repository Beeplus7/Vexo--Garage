import type { Metadata } from "next";
import { AuthGate } from "@/components/AuthGate";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return <AuthGate mode="register" />;
}
