import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListTasks,
  useGetTask,
  useCreateTask,
  useCompleteTask,
  useDeleteTask,
  getListTasksQueryKey,
  getGetTaskQueryKey,
} from "@workspace/api-client-react";

export function useTasks() {
  const query = useListTasks();
  return query;
}

export function useTask(id: string) {
  const query = useGetTask(id);
  return query;
}

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
  };

  const create = useCreateTask({
    mutation: {
      onSuccess: () => invalidateAll(),
    },
  });

  const complete = useCompleteTask({
    mutation: {
      onSuccess: (_data, variables) => {
        invalidateAll();
        void queryClient.invalidateQueries({
          queryKey: getGetTaskQueryKey(variables.id),
        });
      },
    },
  });

  const remove = useDeleteTask({
    mutation: {
      onSuccess: (_data, variables) => {
        invalidateAll();
        void queryClient.invalidateQueries({
          queryKey: getGetTaskQueryKey(variables.id),
        });
      },
    },
  });

  return { create, complete, remove };
}

export function useTasksList() {
  const query = useListTasks();

  const tasks = useMemo(() => query.data?.data ?? [], [query.data]);

  return { ...query, tasks };
}
