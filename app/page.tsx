import { prisma } from "@/lib/prisma";
import HeaderClock from "@/components/HeaderClock";
import CheckInForm from "@/components/CheckInForm";
import TodayAttendance from "@/components/TodayAttendance";
import { AttendanceWithUser } from "@/lib/types";
// ป้องกันการ prerender ตอน build ที่ต้องต่อฐานข้อมูล ให้รันแบบไดนามิก
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const todayDate = getTodayDate();

  const todayList: AttendanceWithUser[] = await prisma.attendances.findMany({
    where: {
      date: todayDate,
    },
    include: { user: true },
    orderBy: { check_in: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <main className="max-w-4xl mx-auto space-y-8 py-12 px-4 sm:px-6 lg:px-8">
        <section className="space-y-3 text-center">
          <h1 className="text-lg md:text-xl font-bold text-pink-700 mb-4 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            ลงทะเบียนเข้าร่วมอบรม หลักสูตรฝึกอบรมการพยาบาลเฉพาะทาง <br className="hidden sm:block" />
            สาขาการพยาบาลเวชปฏิบัติครอบครัว รุ่นที่ 5
          </h1>
          <HeaderClock />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/70 shadow-lg shadow-slate-200/50 backdrop-blur p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
          </div>
          <CheckInForm />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur p-6 space-y-6">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-pink-700 flex items-center gap-2">
                รายการเช็คชื่อวันนี้
                <span className="text-slate-400 font-normal text-sm">|</span>
                <span className="text-slate-500 font-normal text-base">{formatThaiDate(new Date())} {getSession(new Date())}</span>
              </h2>
            </div>
          </div>

          <TodayAttendance data={todayList} />

        </section>
      </main>
    </div >
  );
}

function getTodayDate() {
  const todayStr = toDateInputValue(new Date());
  return new Date(`${todayStr}T00:00:00.000Z`);
}

function toDateInputValue(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function getSession(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Bangkok",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  };

  // Get parts specifically for Thai time
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(date);
  const hourPart = parts.find((p) => p.type === "hour")?.value;
  const minutePart = parts.find((p) => p.type === "minute")?.value;

  if (!hourPart || !minutePart) return "";

  const hour = parseInt(hourPart, 10);
  const minute = parseInt(minutePart, 10);

  // Logic: 06:00 - 12:00 = ภาคเช้า
  // > 12:00 = ภาคบ่าย (12:01 onwards)
  const totalMinutes = hour * 60 + minute;
  const cutoff = 12 * 60; // 12:00

  // Optional: Check start time 06:00 if needed, usually anything before noon is morning session contextually?
  // User spec: 6.00-12.00 is Morning.

  if (totalMinutes <= cutoff) {
    return "ภาคเช้า";
  } else {
    return "ภาคบ่าย";
  }
}

function formatThaiDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}
