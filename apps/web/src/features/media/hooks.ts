import { useQueryClient } from "@tanstack/react-query";
import {
  useListVehiclePhotos,
  useUploadVehiclePhoto,
  useDeleteVehiclePhoto,
  getListVehiclePhotosQueryKey,
  useListVehicleDocuments,
  useUploadVehicleDocument,
  useDeleteVehicleDocument,
  getListVehicleDocumentsQueryKey,
  downloadVehicleDocument,
  useListCustomerDocuments,
  useUploadCustomerDocument,
  useDeleteCustomerDocument,
  getListCustomerDocumentsQueryKey,
  downloadCustomerDocument,
  type DocumentResponseCategory,
} from "@workspace/api-client-react";

export function useVehiclePhotos(vehicleId: string) {
  const queryClient = useQueryClient();
  const query = useListVehiclePhotos(vehicleId);
  const upload = useUploadVehiclePhoto({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListVehiclePhotosQueryKey(vehicleId) });
      },
    },
  });
  const remove = useDeleteVehiclePhoto({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListVehiclePhotosQueryKey(vehicleId) });
      },
    },
  });

  return { query, upload, remove };
}

export function useVehicleDocuments(vehicleId: string) {
  const queryClient = useQueryClient();
  const query = useListVehicleDocuments(vehicleId);
  const upload = useUploadVehicleDocument({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListVehicleDocumentsQueryKey(vehicleId) });
      },
    },
  });
  const remove = useDeleteVehicleDocument({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListVehicleDocumentsQueryKey(vehicleId) });
      },
    },
  });
  const download = (documentId: string) => downloadVehicleDocument(vehicleId, documentId);

  return { query, upload, remove, download };
}

export function useCustomerDocuments(customerId: string) {
  const queryClient = useQueryClient();
  const query = useListCustomerDocuments(customerId);
  const upload = useUploadCustomerDocument({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListCustomerDocumentsQueryKey(customerId) });
      },
    },
  });
  const remove = useDeleteCustomerDocument({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListCustomerDocumentsQueryKey(customerId) });
      },
    },
  });
  const download = (documentId: string) => downloadCustomerDocument(customerId, documentId);

  return { query, upload, remove, download };
}

export type { DocumentResponseCategory };
