import PDFDocument from "pdfkit";
import type { ContractResponse } from "./contract.types";

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Builds the printable HTML representation from the immutable Contract snapshot. */
export function renderContractHtml(contract: ContractResponse): string {
  const field = (label: string, value: string, ltr = false) =>
    `<div class="field"><span>${label}</span><strong${ltr ? ' dir="ltr"' : ""}>${value}</strong></div>`;

  const customerName = `${escapeHtml(contract.customerFirstName)} ${escapeHtml(contract.customerLastName)}`;
  const vehicleName = `${escapeHtml(contract.vehicleMake)} ${escapeHtml(contract.vehicleModel)}`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>عقد تأجير مركبة</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Tahoma, Arial, sans-serif; color: #172033; margin: 0; font-size: 13px; line-height: 1.7; }
  .contract { max-width: 820px; margin: 0 auto; padding: 36px 42px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1d4f6e; padding-bottom: 16px; }
  h1 { margin: 0; font-size: 24px; color: #123b56; }
  .subtitle { margin: 3px 0 0; color: #5b6472; }
  .contract-number { text-align: left; font-weight: 700; color: #334155; }
  .contract-number strong { display: block; direction: ltr; font-size: 11px; font-weight: 600; overflow-wrap: anywhere; }
  h2 { margin: 22px 0 9px; font-size: 15px; color: #123b56; }
  .details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; border: 1px solid #d7dee7; background: #d7dee7; }
  .field { min-height: 58px; padding: 8px 11px; background: #fff; }
  .field span { display: block; color: #64748b; font-size: 11px; }
  .field strong { display: block; font-size: 13px; overflow-wrap: anywhere; }
  .terms { margin: 0; padding-right: 20px; }
  .terms li { margin-bottom: 5px; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 52px; }
  .signature { border-top: 1px solid #64748b; padding-top: 8px; text-align: center; color: #475569; font-weight: 700; }
  @media print { .contract { padding: 0; } }
</style>
</head>
<body>
<main class="contract">
  <header class="header">
    <div><h1>عقد تأجير مركبة</h1><p class="subtitle">وثيقة تأجير صادرة لعملية الحجز الموضحة أدناه</p></div>
    <div class="contract-number">رقم العقد<strong>${escapeHtml(contract.id)}</strong></div>
  </header>
  <section><h2>بيانات المستأجر</h2><div class="details">
    ${field("الاسم", customerName)}
    ${field("رقم الهوية", escapeHtml(contract.customerNationalId), true)}
  </div></section>
  <section><h2>بيانات المركبة</h2><div class="details">
    ${field("المركبة", vehicleName)}
    ${field("رقم اللوحة", escapeHtml(contract.vehiclePlateNumber), true)}
  </div></section>
  <section><h2>فترة الإيجار</h2><div class="details">
    ${field("تاريخ الاستلام", formatDate(contract.pickupDate), true)}
    ${field("تاريخ الإرجاع المتوقع", formatDate(contract.expectedReturnDate), true)}
  </div></section>
  <section><h2>التكاليف</h2><div class="details">
    ${field("السعر اليومي", formatMoney(contract.dailyRate), true)}
    ${field("إجمالي العقد", formatMoney(contract.totalAmount), true)}
    ${field("مبلغ التأمين", formatMoney(contract.depositAmount), true)}
  </div></section>
  <section><h2>شروط مختصرة</h2><ol class="terms"><li>يلتزم المستأجر بإعادة المركبة في الموعد والحالة المتفق عليها.</li><li>يتحمل المستأجر المخالفات أو الأضرار الناتجة خلال مدة التأجير وفق الاتفاق.</li><li>تطبق الرسوم الإضافية عند التأخير أو مخالفة شروط الاستخدام.</li></ol></section>
  <section class="signatures"><div class="signature">توقيع المستأجر</div><div class="signature">توقيع المؤجر</div></section>
</main>
</body>
</html>`;
}

/** Generates a PDF Buffer from the immutable Contract snapshot. */
export async function renderContractPdf(
  contract: ContractResponse,
): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  await new Promise<void>((resolve, reject) => {
    doc.on("end", () => resolve());
    doc.on("error", reject);

    doc.fontSize(20).text("Vehicle Rental Contract", { align: "center" });
    doc.moveDown();

    const labelWidth = 180;
    const valueX = 50 + labelWidth;

    const line = (label: string, value: string) => {
      doc.fontSize(11);
      doc
        .font("Helvetica-Bold")
        .text(label, 50, undefined, { continued: true });
      doc.font("Helvetica").text(` ${value}`, valueX);
      doc.moveDown(0.4);
    };

    line("Contract ID:", contract.id);
    line("Rental ID:", contract.rentalId);
    line("Pickup Date:", formatDate(contract.pickupDate));
    line("Expected Return Date:", formatDate(contract.expectedReturnDate));
    line("Daily Rate:", formatMoney(contract.dailyRate));
    line("Total Amount:", formatMoney(contract.totalAmount));
    line("Deposit Amount:", formatMoney(contract.depositAmount));
    line(
      "Customer:",
      `${contract.customerFirstName} ${contract.customerLastName}`,
    );
    line("Customer National ID:", contract.customerNationalId);
    line("Vehicle:", `${contract.vehicleMake} ${contract.vehicleModel}`);
    line("Vehicle Plate Number:", contract.vehiclePlateNumber);

    doc.end();
  });

  return Buffer.concat(chunks);
}
