import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DocumentResponse } from "@workspace/api-client-react";
import { DocumentList } from "./DocumentList";

vi.mock("@/providers/AuthProvider", () => ({ useAuth: vi.fn() }));

import { useAuth } from "@/providers/AuthProvider";

const mockedUseAuth = vi.mocked(useAuth);

const document = {
  id: "document-1",
  category: "INSURANCE",
  expiryDate: "2026-12-31",
  originalFilename: "insurance.pdf",
  mimeType: "application/pdf",
  fileSize: 1024,
  url: "https://example.test/insurance.pdf",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
} as DocumentResponse;

describe("DocumentList", () => {
  beforeEach(() => {
    mockedUseAuth.mockReturnValue({ user: { role: "OWNER" } } as ReturnType<typeof useAuth>);
  });

  it("shows and saves a vehicle document expiry date", async () => {
    const onUpdateExpiry = vi.fn().mockResolvedValue(undefined);
    render(
      <DocumentList
        documents={[document]}
        isLoading={false}
        isError={false}
        error={null}
        isOwner
        uploading={false}
        deleting={false}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onDownload={vi.fn()}
        onUpdateExpiry={onUpdateExpiry}
      />,
    );

    expect(screen.getByText(/تاريخ الانتهاء:/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "تعديل تاريخ الانتهاء" }));
    fireEvent.change(screen.getByLabelText("تاريخ انتهاء المستند"), { target: { value: "2027-01-15" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ" }));

    await waitFor(() => expect(onUpdateExpiry).toHaveBeenCalledWith("document-1", "2027-01-15"));
    expect(await screen.findByText("تم تحديث تاريخ الانتهاء.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("bg-status-positive-bg");
    fireEvent.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(screen.queryByText("تم تحديث تاريخ الانتهاء.")).not.toBeInTheDocument();
  });

  it("uses alert feedback when a document upload fails", async () => {
    const onUpload = vi.fn().mockRejectedValue(new Error("failed"));
    const { container } = render(
      <DocumentList
        documents={[]}
        isLoading={false}
        isError={false}
        error={null}
        isOwner
        uploading={false}
        deleting={false}
        onUpload={onUpload}
        onDelete={vi.fn()}
        onDownload={vi.fn()}
      />,
    );

    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(["document"], "insurance.pdf", { type: "application/pdf" })] },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent("حدث خطأ في الاتصال بالخادم.");
  });

  it("omits file-size metadata and uses Western digits for document dates", () => {
    render(
      <DocumentList
        documents={[document]}
        isLoading={false}
        isError={false}
        error={null}
        isOwner
        uploading={false}
        deleting={false}
        onUpload={vi.fn()}
        onDelete={vi.fn()}
        onDownload={vi.fn()}
      />,
    );

    expect(screen.getByText("01/01/2026")).toHaveAttribute("dir", "ltr");
    expect(screen.queryByText(/ك\.ب|بايت|م\.ب/)).not.toBeInTheDocument();
  });
});
