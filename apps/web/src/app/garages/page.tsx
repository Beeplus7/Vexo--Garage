import type { Metadata } from "next";
import { GarageFinder } from "@/components/GarageFinder";

export const metadata: Metadata = {
  title: "Garages",
  description: "Find MOT and service garages near you — exact quote, Stripe hold.",
};

export default function Page() {
  return <GarageFinder initialPostcode="OL8 4" initialService="MOT" />;
}
