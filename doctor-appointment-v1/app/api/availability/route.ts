import { NextResponse } from "next/server";
import { getAvailability, setAvailability } from "@/lib/store";
export async function GET(){ return NextResponse.json(await getAvailability()); }
export async function POST(req:Request){
  const body=await req.json();
  const duration=Number(body.slotDuration);
  if(!body.startTime || !body.endTime || ![10,15,20,30,45,60].includes(duration)) return NextResponse.json({error:"Invalid availability"},{status:400});
  return NextResponse.json(await setAvailability(body.startTime,body.endTime,duration));
}
