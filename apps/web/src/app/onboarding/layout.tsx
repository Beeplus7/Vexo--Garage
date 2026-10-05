import { SiteChrome } from "@/components/SiteChrome";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome variant="app">{children}</SiteChrome>;
}
