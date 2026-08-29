import { Building2, Mail, UserRound } from "lucide-react";
import { useGetMyOrganization } from "@workspace/api-client-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";

/** Read-only account destination; organization editing is introduced with Step 55. */
export function AccountPage() {
  const { user } = useAuth();
  const organizationQuery = useGetMyOrganization();
  const organization = organizationQuery.data?.data;

  return (
    <div className="min-h-full">
      <PageHeader title="حساب المؤسسة" />
      <div className="space-y-4 px-4 py-6 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-5 text-primary" aria-hidden="true" />
              بيانات المؤسسة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-muted-foreground">الاسم: </span>
              {organization?.name ?? "جارٍ تحميل بيانات المؤسسة..."}
            </p>
            {organization?.email && (
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
                {organization.email}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="size-5 text-primary" aria-hidden="true" />
              حسابي
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <span className="text-muted-foreground">البريد الإلكتروني: </span>
            {user?.email ?? "-"}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
