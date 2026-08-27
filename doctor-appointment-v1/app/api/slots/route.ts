import { NextResponse } from "next/server";
import { getAvailability, listAppointments } from "@/lib/store";
import { generateSlots } from "@/lib/slots";
export async function GET(req:Request){
  const date=new URL(req.url).searchParams.get("date");
  if(!date) return NextResponse.json({error:"date is required"},{status:400});
  const a=await getAvailability();
  const booked=new Set((await listAppointments(date)).filter(x=>x.status!=="CANCELLED").map(x=>x.time));
  return NextResponse.json(generateSlots(a.startTime,a.endTime,a.slotDuration).map(time=>({time,available:!booked.has(time)})));
}
