import { useState } from "react";
import { useLocation, useSearchParams } from "wouter";
import { acceptEmployeeInvitation } from "@workspace/api-client-react";
import { FormField, inputClass } from "@/components/ui/FormField";
import { getApiErrorMessage } from "@/lib/api-error";
import { InlineFeedback } from "@/components/ui/FeedbackState";

export default function AcceptInvitationPage() {
  const [, setLocation] = useLocation(); const [params] = useSearchParams(); const token = params.get("token") ?? ""; const [password, setPassword] = useState(""); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); if (!token || password.length < 8 || saving) return; setSaving(true); setError(null); try { await acceptEmployeeInvitation({ token, password }); setLocation("/login", { replace: true }); } catch (cause) { setError(getApiErrorMessage(cause).title); } finally { setSaving(false); } }
  return <main className="min-h-dvh bg-background px-4 py-8"><form onSubmit={submit} className="mx-auto w-full max-w-sm space-y-4 rounded-2xl border border-card-border bg-card p-5 shadow-sm"><div><h1 className="text-2xl font-bold">قبول دعوة الموظف</h1><p className="mt-1 text-sm text-muted-foreground">عيّن كلمة مرور لتفعيل حسابك.</p></div>{!token && <InlineFeedback variant="error">رابط الدعوة غير صالح أو غير مكتمل.</InlineFeedback>}{error && <InlineFeedback variant="error">{error}</InlineFeedback>}<FormField label="كلمة المرور" htmlFor="invite-password"><input id="invite-password" required minLength={8} type="password" dir="ltr" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} /></FormField><button className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60" disabled={!token || password.length < 8 || saving}>{saving ? "جارٍ التفعيل" : "تفعيل الحساب"}</button></form></main>;
}
