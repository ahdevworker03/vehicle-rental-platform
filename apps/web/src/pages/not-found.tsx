import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-full w-full flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            <AlertCircle className="h-8 w-8 text-destructive flex-shrink-0" />
            <h1 className="text-2xl font-bold text-foreground">404 الصفحة غير موجودة</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground text-center">
            لم يتم العثور على الصفحة المطلوبة
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
