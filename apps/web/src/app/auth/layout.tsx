import { SiteChrome } from "@/components/SiteChrome";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome variant="app">{children}</SiteChrome>;
}
