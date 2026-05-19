import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { parseExcel } from "./parserExcel";
import type { Activity, Filters } from "./types";

export interface FileUploadInfo {
  name: string;
  rowCount: number;
}

interface HorasStore {
  activities: Activity[];
  filters: Filters;
  isLoading: boolean;
  uploadedFiles: FileUploadInfo[];
  parseErrors: string[];
  addFiles: (files: File[]) => Promise<void>;
  clearData: () => void;
  setFilters: (partial: Partial<Filters>) => void;
  resetFilters: () => void;
}

const defaultFilters: Filters = {
  monthKeys: [],
  clientes: [],
};

export const useHorasStore = create<HorasStore>()(
  persist(
    (set) => ({
      activities: [],
      filters: defaultFilters,
      isLoading: false,
      uploadedFiles: [],
      parseErrors: [],

      addFiles: async (files) => {
        set({ isLoading: true, parseErrors: [] });
        const allErrors: string[] = [];
        const newActivities: Activity[] = [];
        const newFileInfos: FileUploadInfo[] = [];

        for (const file of files) {
          const { activities, errors } = await parseExcel(file);
          allErrors.push(...errors);
          if (activities.length > 0) {
            newActivities.push(...activities);
            newFileInfos.push({ name: file.name, rowCount: activities.length });
          }
        }

        set((state) => ({
          activities: [...state.activities, ...newActivities],
          uploadedFiles: [...state.uploadedFiles, ...newFileInfos],
          parseErrors: allErrors,
          isLoading: false,
        }));
      },

      clearData: () =>
        set({
          activities: [],
          uploadedFiles: [],
          parseErrors: [],
          filters: defaultFilters,
        }),

      setFilters: (partial) =>
        set((state) => ({
          filters: { ...state.filters, ...partial },
        })),

      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: "horas-laborales-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        activities: state.activities,
        uploadedFiles: state.uploadedFiles,
      }),
    }
  )
);

export function useHasData() {
  return useHorasStore((s) => s.activities.length > 0);
}
