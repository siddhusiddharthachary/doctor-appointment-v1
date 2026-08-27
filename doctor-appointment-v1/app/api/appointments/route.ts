import { NextResponse } from "next/server";
import { createAppointment, listAppointments } from "@/lib/store";
export async function GET(req:Request){
  const date=new URL(req.url).searchParams.get("date") || undefined;
  return NextResponse.json(await listAppointments(date));
}
export async function POST(req:Request){
  const b=await req.json();
  if(!b.patientName || !b.patientPhone || !b.date || !b.time) return NextResponse.json({error:"Missing required fields"},{status:400});
  try { return NextResponse.json(await createAppointment({patientName:b.patientName,patientPhone:b.patientPhone,date:b.date,time:b.time}),{status:201}); }
  catch(e:any){ if(e.message==="SLOT_TAKEN") return NextResponse.json({error:"This slot was just booked. Please choose another."},{status:409}); throw e; }
}
