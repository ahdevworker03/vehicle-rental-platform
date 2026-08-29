import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { useGetMyOrganization } from "@workspace/api-client-react";
import { LogoutButton } from "./LogoutButton";

interface OrganizationStatusGateProps {
  children: ReactNode;
}

const organizationStatusContent = {
  SUSPENDED: {
    title: "تم تعليق حساب المؤسسة",
    description:
      "تم إيقاف العمليات مؤقتاً. تواصل مع مالك الحساب أو دعم النظام لمعرفة الخطوات التالية.",
  },
  CANCELLED: {
    title: "تم إلغاء حساب المؤسسة",
    description:
      "لم تعد العمليات متاحة لهذا الحساب. تواصل مع مالك الحساب أو دعم النظام إذا كان ذلك غير متوقع.",
  },
} as const;

/** Blocks tenant operations when the authoritative organization lifecycle state is inactive. */
export function OrganizationStatusGate({ children }: OrganizationStatusGateProps) {
  const organizationQuery = useGetMyOrganization();
  const organization = organizationQuery.data?.data;
  const content = organization
    ? organizationStatusContent[
        organization.status as keyof typeof organizationStatusContent
      ]
    : undefined;

  if (!content) return <>{children}</>;

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <section
        aria-labelledby="organization-status-title"
        className="w-full max-w-md rounded-xl border border-card-border bg-card p-6 text-center shadow-sm"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-status-warning-bg text-status-warning">
          <CircleAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 id="organization-status-title" className="ui-page-title mt-4">
          {content.title}
        </h1>
        <p className="ui-secondary-text mt-2">{content.description}</p>
        <LogoutButton className="mt-6 w-full" />
      </section>
    </main>
  );
}
