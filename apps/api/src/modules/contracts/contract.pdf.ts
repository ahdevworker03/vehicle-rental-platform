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
  const rows = [
    ["Contract ID", escapeHtml(contract.id)],
    ["Rental ID", escapeHtml(contract.rentalId)],
    ["Pickup Date", formatDate(contract.pickupDate)],
    ["Expected Return Date", formatDate(contract.expectedReturnDate)],
    ["Daily Rate", formatMoney(contract.dailyRate)],
    ["Total Amount", formatMoney(contract.totalAmount)],
    ["Deposit Amount", formatMoney(contract.depositAmount)],
    [
      "Customer",
      `${escapeHtml(contract.customerFirstName)} ${escapeHtml(contract.customerLastName)}`,
    ],
    ["Customer National ID", escapeHtml(contract.customerNationalId)],
    [
      "Vehicle",
      `${escapeHtml(contract.vehicleMake)} ${escapeHtml(contract.vehicleModel)}`,
    ],
    ["Vehicle Plate Number", escapeHtml(contract.vehiclePlateNumber)],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td class="label">${label}</td><td class="value">${value}</td></tr>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8" />
<title>Rental Contract</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 40px; }
  h1 { font-size: 22px; border-bottom: 2px solid #333; padding-bottom: 8px; }
  table { border-collapse: collapse; width: 100%; margin-top: 20px; }
  td { padding: 10px 12px; border-bottom: 1px solid #ddd; font-size: 14px; }
  td.label { font-weight: bold; width: 40%; color: #444; }
  td.value { text-align: right; }
</style>
</head>
<body>
<h1>Vehicle Rental Contract</h1>
<table>
${rowsHtml}
</table>
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
