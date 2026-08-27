export type Appointment = {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  tokenNumber: number;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
};

export type Store = {
  doctor: { id: number; name: string; specialization: string; slug: string };
  availability: { startTime: string; endTime: string; slotDuration: number };
  appointments: Appointment[];
};
