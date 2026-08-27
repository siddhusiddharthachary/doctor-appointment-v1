import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import type { Appointment, Store } from "./types";

const filePath = path.join(process.cwd(), "data", "store.json");
const useDb = Boolean(process.env.DATABASE_URL);

async function readFileStore(): Promise<Store> {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}
async function writeFileStore(store: Store) {
  await fs.writeFile(filePath, JSON.stringify(store, null, 2));
}

export async function ensureSchema() {
  if (!useDb) return;
  const sql = neon(process.env.DATABASE_URL!);
  await sql`CREATE TABLE IF NOT EXISTS app_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    slot_duration INTEGER NOT NULL
  )`;
  await sql`CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    token_number INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(appointment_date, appointment_time)
  )`;
  await sql`INSERT INTO app_config(id,start_time,end_time,slot_duration)
    VALUES (1,'09:00','13:00',15)
    ON CONFLICT (id) DO NOTHING`;
}

export async function getAvailability() {
  if (!useDb) return (await readFileStore()).availability;
  await ensureSchema();
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT start_time, end_time, slot_duration FROM app_config WHERE id=1`;
  return { startTime: rows[0].start_time, endTime: rows[0].end_time, slotDuration: rows[0].slot_duration };
}

export async function setAvailability(startTime: string, endTime: string, slotDuration: number) {
  if (!useDb) {
    const store = await readFileStore();
    store.availability = { startTime, endTime, slotDuration };
    await writeFileStore(store);
    return store.availability;
  }
  await ensureSchema();
  const sql = neon(process.env.DATABASE_URL!);
  await sql`UPDATE app_config SET start_time=${startTime}, end_time=${endTime}, slot_duration=${slotDuration} WHERE id=1`;
  return { startTime, endTime, slotDuration };
}

export async function listAppointments(date?: string): Promise<Appointment[]> {
  if (!useDb) {
    const appts = (await readFileStore()).appointments;
    return date ? appts.filter(a => a.date === date) : appts;
  }
  await ensureSchema();
  const sql = neon(process.env.DATABASE_URL!);
  const rows = date
    ? await sql`SELECT * FROM appointments WHERE appointment_date=${date} ORDER BY appointment_time`
    : await sql`SELECT * FROM appointments ORDER BY appointment_date, appointment_time`;
  return rows.map((r:any) => ({
    id:r.id, patientName:r.patient_name, patientPhone:r.patient_phone, date:r.appointment_date,
    time:r.appointment_time, tokenNumber:r.token_number, status:r.status, createdAt:r.created_at
  }));
}

export async function createAppointment(input: Omit<Appointment,"id"|"tokenNumber"|"status"|"createdAt">): Promise<Appointment> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  if (!useDb) {
    const store = await readFileStore();
    const active = store.appointments.filter(a => a.date === input.date && a.status !== "CANCELLED");
    if (active.some(a => a.time === input.time)) throw new Error("SLOT_TAKEN");
    const [sh, sm] = store.availability.startTime.split(":").map(Number);
    const [th, tm] = input.time.split(":").map(Number);
    const tokenNumber = Math.floor(((th*60+tm)-(sh*60+sm))/store.availability.slotDuration) + 1;
    const appt: Appointment = { ...input, id, tokenNumber, status: "CONFIRMED", createdAt };
    store.appointments.push(appt);
    await writeFileStore(store);
    return appt;
  }
  await ensureSchema();
  const sql = neon(process.env.DATABASE_URL!);
  const cfg = await getAvailability();
  const [sh, sm] = cfg.startTime.split(":").map(Number);
  const [th, tm] = input.time.split(":").map(Number);
  const tokenNumber = Math.floor(((th*60+tm)-(sh*60+sm))/cfg.slotDuration) + 1;
  try {
    const rows = await sql`INSERT INTO appointments(id,patient_name,patient_phone,appointment_date,appointment_time,token_number,status,created_at)
      VALUES (${id},${input.patientName},${input.patientPhone},${input.date},${input.time},${tokenNumber},'CONFIRMED',${createdAt})
      RETURNING *`;
    const r:any = rows[0];
    return { id:r.id, patientName:r.patient_name, patientPhone:r.patient_phone, date:r.appointment_date, time:r.appointment_time, tokenNumber:r.token_number, status:r.status, createdAt:r.created_at };
  } catch (e:any) {
    if (String(e?.message || e).toLowerCase().includes("unique")) throw new Error("SLOT_TAKEN");
    throw e;
  }
}
