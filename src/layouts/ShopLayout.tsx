import { Outlet } from "react-router";

import { SiteFooter } from "@/components/site";
import { UrgencyRail } from "@/components/site/UrgencyRail";
import { LoggedInBar } from "@/components/site/LoggedInBar";
import { useAuth } from "@/hooks/useAuth";

export function ShopLayout() {
  const { status } = useAuth();

  return (
    <div className="min-h-dvh flex flex-col bg-sand text-ink">
      <UrgencyRail />
      {status === "authenticated" && <LoggedInBar />}
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
