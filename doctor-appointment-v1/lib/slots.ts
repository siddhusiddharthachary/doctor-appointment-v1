export function generateSlots(startTime: string, endTime: string, slotDuration: number) {
  const toMin=(t:string)=>{const [h,m]=t.split(":").map(Number); return h*60+m};
  const fmt=(m:number)=>`${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
  const slots:string[]=[];
  for(let m=toMin(startTime); m<toMin(endTime); m+=slotDuration) slots.push(fmt(m));
  return slots;
}
