import { useQueryClient } from "@tanstack/react-query";
import {
  useGetRentalContract,
  useGenerateRentalContract,
  useDeleteRentalContract,
  useListRentalContractSignedDocuments,
  useUploadRentalContractSignedDocument,
  useDeleteRentalContractSignedDocument,
  getGetRentalContractQueryKey,
  getListRentalContractSignedDocumentsQueryKey,
  getRentalContractPrintable,
  getRentalContractPdf,
  downloadRentalContractSignedDocument,
} from "@workspace/api-client-react";

export function useRentalContract(rentalId: string) {
  const queryClient = useQueryClient();

  const query = useGetRentalContract(rentalId);

  const generate = useGenerateRentalContract({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetRentalContractQueryKey(rentalId) });
      },
    },
  });

  const remove = useDeleteRentalContract({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetRentalContractQueryKey(rentalId) });
      },
    },
  });

  const printable = () => getRentalContractPrintable(rentalId);
  const pdf = () => getRentalContractPdf(rentalId);

  return { query, generate, remove, printable, pdf };
}

export function useRentalContractSignedDocuments(rentalId: string) {
  const queryClient = useQueryClient();

  const query = useListRentalContractSignedDocuments(rentalId);

  const upload = useUploadRentalContractSignedDocument({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListRentalContractSignedDocumentsQueryKey(rentalId) });
      },
    },
  });

  const remove = useDeleteRentalContractSignedDocument({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListRentalContractSignedDocumentsQueryKey(rentalId) });
      },
    },
  });

  const download = (documentId: string) => downloadRentalContractSignedDocument(rentalId, documentId);

  return { query, upload, remove, download };
}
