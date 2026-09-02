import { useState } from "react";
import { Building2, Mail, UserRound } from "lucide-react";
import { useCreateEmployeeInvitation, useGetMyOrganization, useUpdateMyOrganization } from "@workspace/api-client-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { FormField, inputClass } from "@/components/ui/FormField";
import { InlineFeedback } from "@/components/ui/FeedbackState";
import { getApiErrorMessage } from "@/lib/api-error";

export function AccountPage() {
  const { user } = useAuth();
  const organizationQuery = useGetMyOrganization();
  const organization = organizationQuery.data?.data;
  const isOwner = user?.role === "OWNER";
  const update = useUpdateMyOrganization();
  const invite = useCreateEmployeeInvitation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [inviteEmail, setInviteEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  async function save() { if (!name.trim()) return; setError(null); try { await update.mutateAsync({ data: { name: name.trim(), email: email.trim() || undefined } }); setEditing(false); setMessage("تم تحديث بيانات المؤسسة."); organizationQuery.refetch(); } catch (cause) { setError(getApiErrorMessage(cause).title); } }
  async function sendInvite() { if (!inviteEmail.trim()) return; setError(null); try { await invite.mutateAsync({ data: { email: inviteEmail.trim() } }); setInviteEmail(""); setMessage("تم إنشاء دعوة الموظف. شارك رابط الدعوة عبر القناة الآمنة المعتمدة."); } catch (cause) { setError(getApiErrorMessage(cause).title); } }

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
            {message && <InlineFeedback variant="success" onDismiss={() => setMessage(null)}>{message}</InlineFeedback>}{error && <InlineFeedback variant="error">{error}</InlineFeedback>}
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
            {isOwner && !editing && <Button variant="outline" size="sm" onClick={() => { setName(organization?.name ?? ""); setEmail(organization?.email ?? ""); setEditing(true); }}>تعديل بيانات المؤسسة</Button>}
            {isOwner && editing && <div className="space-y-3 border-t pt-3"><FormField label="اسم المؤسسة" htmlFor="organization-name"><input id="organization-name" className={inputClass} value={name} onChange={(event) => setName(event.target.value)} /></FormField><FormField label="بريد المؤسسة" htmlFor="organization-email"><input id="organization-email" type="email" dir="ltr" className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} /></FormField><div className="flex gap-2"><Button onClick={() => void save()} disabled={update.isPending}>{update.isPending ? "جارٍ الحفظ" : "حفظ"}</Button><Button variant="outline" onClick={() => setEditing(false)}>إلغاء</Button></div></div>}
          </CardContent>
        </Card>
        {isOwner && <Card><CardHeader><CardTitle className="text-base">دعوة موظف</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">أنشئ دعوة موظف للمؤسسة. لا توجد أدوات إدارية للمنصة هنا.</p><FormField label="بريد الموظف" htmlFor="employee-invite-email"><input id="employee-invite-email" type="email" dir="ltr" className={inputClass} value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} /></FormField><Button onClick={() => void sendInvite()} disabled={!inviteEmail || invite.isPending}>{invite.isPending ? "جارٍ الإنشاء" : "إرسال دعوة"}</Button></CardContent></Card>}

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
