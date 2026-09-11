import { useState } from "react";
import { useLocation } from "wouter";
import { registerOrganization } from "@workspace/api-client-react";
import { FormField, inputClass } from "@/components/ui/FormField";
import { getApiErrorMessage } from "@/lib/api-error";
import { InlineFeedback } from "@/components/ui/FeedbackState";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || password.length < 8 || !organizationName || saving) return;
    setSaving(true); setError(null);
    try { await registerOrganization({ email, password, organizationName }); setLocation("/login", { replace: true }); }
    catch (cause) { setError(getApiErrorMessage(cause).title); }
    finally { setSaving(false); }
  }
  return <main className="min-h-dvh bg-background px-4 py-8"><form onSubmit={submit} className="mx-auto w-full max-w-sm space-y-4 rounded-2xl border border-card-border bg-card p-5 shadow-sm"><div><img src="/brand/logos/markab-logo-ar.png" alt="مَركب" className="markab-auth-logo-light mb-4 h-auto w-32" /><img src="/brand/logos/markab-logo-monochrome-light.png" alt="مَركب Markab" className="markab-auth-logo-dark mb-4 h-auto w-28 object-contain" /><h1 className="text-2xl font-bold">إنشاء حساب الشركة</h1><p className="mt-1 text-sm text-muted-foreground">أنشئ مؤسسة جديدة للوصول إلى مَركب.</p></div>{error && <InlineFeedback variant="error">{error}</InlineFeedback>}<FormField label="اسم الشركة" htmlFor="register-company"><input id="register-company" required className={inputClass} value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} /></FormField><FormField label="البريد الإلكتروني" htmlFor="register-email"><input id="register-email" required type="email" dir="ltr" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} /></FormField><FormField label="كلمة المرور" hint="8 أحرف على الأقل" htmlFor="register-password"><input id="register-password" required minLength={8} type="password" dir="ltr" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} /></FormField><button className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60" disabled={saving}>{saving ? "جارٍ الإنشاء" : "إنشاء الحساب"}</button><button type="button" className="w-full text-sm text-primary" onClick={() => setLocation("/login")}>لديك حساب بالفعل؟ سجل الدخول</button></form></main>;
}
