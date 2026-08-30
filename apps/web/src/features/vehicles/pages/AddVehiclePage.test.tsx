import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AddVehiclePage from "./AddVehiclePage";

const setLocation = vi.fn();
const create = {
  isPending: false,
  mutateAsync: vi.fn().mockResolvedValue({ data: { id: "vehicle-1" } }),
};
const uploadPhoto = {
  isPending: false,
  mutateAsync: vi.fn().mockResolvedValue(undefined),
};
const uploadDocument = {
  isPending: false,
  mutateAsync: vi.fn().mockResolvedValue(undefined),
};

vi.mock("wouter", () => ({
  useLocation: () => ["/vehicles/add", setLocation],
}));

vi.mock("@/features/vehicles/api-hooks", () => ({
  useVehicleMutations: () => ({ create }),
}));

vi.mock("@workspace/api-client-react", () => ({
  useUploadVehiclePhoto: () => uploadPhoto,
  useUploadVehicleDocument: () => uploadDocument,
}));

beforeEach(() => {
  vi.clearAllMocks();
  create.mutateAsync.mockResolvedValue({ data: { id: "vehicle-1" } });
  uploadPhoto.mutateAsync.mockResolvedValue(undefined);
  uploadDocument.mutateAsync.mockResolvedValue(undefined);
});

describe("AddVehiclePage", () => {
  it("submits optional notes without legacy identifier fields", async () => {
    render(<AddVehiclePage />);

    expect(screen.queryByText("معرّفات إضافية")).toBeNull();
    expect(screen.queryByLabelText(/VIN/)).toBeNull();
    expect(screen.queryByLabelText(/رقم المحرك/)).toBeNull();

    fireEvent.change(screen.getByLabelText(/الشركة المصنعة/), {
      target: { value: "Toyota" },
    });
    fireEvent.change(screen.getByLabelText(/الطراز/), {
      target: { value: "Corolla" },
    });
    fireEvent.change(screen.getByLabelText(/رقم اللوحة/), {
      target: { value: "TEST-8237" },
    });
    fireEvent.change(screen.getByLabelText(/سنة الصنع/), {
      target: { value: "2024" },
    });
    fireEvent.change(screen.getByLabelText(/اللون/), {
      target: { value: "أبيض" },
    });
    fireEvent.change(screen.getByLabelText(/عدد المقاعد/), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/العداد الحالي/), {
      target: { value: "12000" },
    });
    fireEvent.change(screen.getByLabelText("ملاحظات"), {
      target: { value: "  فحص الإطارات دورياً  " },
    });
    fireEvent.click(screen.getByText("حفظ المركبة"));

    await waitFor(() => {
      expect(create.mutateAsync).toHaveBeenCalledWith({
        data: {
          make: "Toyota",
          model: "Corolla",
          plate_number: "TEST-8237",
          year: 2024,
          color: "أبيض",
          notes: "فحص الإطارات دورياً",
          transmission: "AUTOMATIC",
          fuel_type: "PETROL",
          seats: 5,
          current_mileage: 12000,
          status: "AVAILABLE",
        },
      });
    });
  });

  it("creates the vehicle before uploading queued photos and documents", async () => {
    const { container } = render(<AddVehiclePage />);

    fireEvent.change(screen.getByLabelText(/الشركة المصنعة/), {
      target: { value: "Toyota" },
    });
    fireEvent.change(screen.getByLabelText(/الطراز/), {
      target: { value: "Corolla" },
    });
    fireEvent.change(screen.getByLabelText(/رقم اللوحة/), {
      target: { value: "TEST-8237" },
    });
    fireEvent.change(screen.getByLabelText(/سنة الصنع/), {
      target: { value: "2024" },
    });
    fireEvent.change(screen.getByLabelText(/اللون/), {
      target: { value: "أبيض" },
    });
    fireEvent.change(screen.getByLabelText(/عدد المقاعد/), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/العداد الحالي/), {
      target: { value: "12000" },
    });

    const photo = new File(["photo"], "vehicle.jpg", { type: "image/jpeg" });
    const document = new File(["document"], "registration.pdf", {
      type: "application/pdf",
    });
    const inputs =
      container.querySelectorAll<HTMLInputElement>('input[type="file"]');
    fireEvent.change(inputs[0], { target: { files: [photo] } });
    fireEvent.change(inputs[1], { target: { files: [document] } });
    fireEvent.change(screen.getByLabelText("نوع المستند registration.pdf"), {
      target: { value: "REGISTRATION" },
    });
    fireEvent.click(screen.getByText("حفظ المركبة"));

    await waitFor(() => {
      expect(uploadPhoto.mutateAsync).toHaveBeenCalledWith({
        vehicleId: "vehicle-1",
        data: { file: photo },
      });
      expect(uploadDocument.mutateAsync).toHaveBeenCalledWith({
        vehicleId: "vehicle-1",
        data: { file: document, category: "REGISTRATION" },
      });
      expect(setLocation).toHaveBeenCalledWith("/vehicles/vehicle-1");
    });
  });

  it("keeps the vehicle created when a queued upload fails", async () => {
    uploadPhoto.mutateAsync.mockRejectedValueOnce(new Error("Upload failed"));
    const { container } = render(<AddVehiclePage />);

    fireEvent.change(screen.getByLabelText(/الشركة المصنعة/), {
      target: { value: "Toyota" },
    });
    fireEvent.change(screen.getByLabelText(/الطراز/), {
      target: { value: "Corolla" },
    });
    fireEvent.change(screen.getByLabelText(/رقم اللوحة/), {
      target: { value: "TEST-8237" },
    });
    fireEvent.change(screen.getByLabelText(/سنة الصنع/), {
      target: { value: "2024" },
    });
    fireEvent.change(screen.getByLabelText(/اللون/), {
      target: { value: "أبيض" },
    });
    fireEvent.change(screen.getByLabelText(/عدد المقاعد/), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/العداد الحالي/), {
      target: { value: "12000" },
    });

    const photo = new File(["photo"], "vehicle.jpg", { type: "image/jpeg" });
    fireEvent.change(
      container.querySelector<HTMLInputElement>('input[type="file"]')!,
      { target: { files: [photo] } },
    );
    fireEvent.click(screen.getByText("حفظ المركبة"));

    await waitFor(() =>
      expect(
        screen.getByText(
          /تم إنشاء المركبة، لكن تعذر رفع بعض الصور أو المستندات/,
        ),
      ).toBeTruthy(),
    );
    expect(setLocation).not.toHaveBeenCalled();
    expect(screen.getByText("vehicle.jpg")).toBeTruthy();
    expect(screen.getByText("إعادة رفع الملفات")).toBeTruthy();
  });
});
