import { create } from 'zustand';

export type Report = {
  id: string;
  category: string;
  subject: string;
  reason: string;
  details?: string;
  route?: string;
  createdAt: number;
};

type ReportsState = {
  reports: Report[];
  addReport: (input: Omit<Report, 'id' | 'createdAt'>) => void;
};

export const useReportsStore = create<ReportsState>((set) => ({
  reports: [],

  addReport: (input) =>
    set((s) => ({
      reports: [
        { ...input, id: `report-${Date.now()}-${s.reports.length}`, createdAt: Date.now() },
        ...s.reports,
      ],
    })),
}));
