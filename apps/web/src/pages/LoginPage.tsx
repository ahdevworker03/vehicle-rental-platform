import { useState } from "react";
import { useLocation } from "wouter";

import { useAuth } from "@/providers/AuthProvider";
import { FormField, inputClass } from "@/components/ui/FormField";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

interface FormState {
  email: string;
  password: string;
}

const INITIAL: FormState = { email: "", password: "" };

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.email.trim()) e.email = "هذا الحقل مطلوب";
    if (!form.password) e.password = "هذا الحقل مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    setFormError(null);

    try {
      await login({ email: form.email.trim(), password: form.password });
      setLocation("/", { replace: true });
    } catch (err) {
      setFormError(getApiErrorMessage(err).title);
    } finally {
      setSubmitting(false);
    }
  }

  const isFormFilled = form.email.trim().length > 0 && form.password.length > 0;

  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">تسجيل الدخول</h1>
          <p className="text-sm text-muted-foreground">أدخل بياناتك للوصول إلى النظام</p>
        </div>

        {formError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <div className="bg-card rounded-2xl border border-card-border shadow-sm p-4 space-y-4">
          <FormField label="البريد الإلكتروني" required error={errors.email}>
            <input
              className={errors.email ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              placeholder="example@company.com"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
              dir="ltr"
            />
          </FormField>

          <FormField label="كلمة المرور" required error={errors.password}>
            <input
              className={errors.password ? `${inputClass} border-destructive focus:ring-destructive/30` : inputClass}
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              autoComplete="current-password"
              dir="ltr"
            />
          </FormField>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isFormFilled || submitting}
          className={cn(
            "w-full rounded-2xl py-4 text-base font-bold transition-all shadow-sm flex items-center justify-center gap-2",
            isFormFilled && !submitting
              ? "bg-primary text-primary-foreground active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {submitting ? <Spinner /> : "دخول"}
        </button>
      </div>
    </div>
  );
}
