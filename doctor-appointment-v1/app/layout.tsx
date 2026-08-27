import "./globals.css";
import Link from "next/link";
export const metadata={title:"ClinicSlot V1",description:"One-doctor appointment booking MVP"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><div className="wrap"><nav className="nav"><Link className="brand" href="/">ClinicSlot</Link><div className="navlinks"><Link className="btn secondary" href="/doctor/dr-ravi">Patient View</Link><Link className="btn" href="/doctor/dashboard">Doctor Dashboard</Link></div></nav>{children}</div></body></html>}
