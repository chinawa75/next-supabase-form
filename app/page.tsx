import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import HeaderClock from "@/components/HeaderClock";
type AttendanceWithUser = {
  id: string;
  check_in: Date;
  user: { code: string; name: string };
};

// ป้องกันการ prerender ตอน build ที่ต้องต่อฐานข้อมูล ให้รันแบบไดนามิก
export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || "";
  const todayDate = getTodayDate();

  const todayList: AttendanceWithUser[] = await prisma.attendances.findMany({
    where: {
      date: todayDate,
      user: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
        ],
      },
    },
    include: { user: true },
    orderBy: { check_in: "asc" },
  });

  async function checkIn(formData: FormData) {
    "use server";

    const name = (formData.get("name") as string)?.trim();
    const code = (formData.get("code") as string)?.trim();

    if (!name || !code) return;

    const date = getTodayDate();

    const user = await prisma.users.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });

    await prisma.attendances.upsert({
      where: { user_id_date: { user_id: user.id, date } },
      update: { check_in: new Date() },
      create: { user_id: user.id, date },
    });

    revalidatePath("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <main className="max-w-4xl mx-auto space-y-8 py-12 px-4 sm:px-6 lg:px-8">
        <section className="space-y-3 text-center">
          <HeaderClock />

        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/70 shadow-lg shadow-slate-200/50 backdrop-blur p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">เช็คชื่อ</p>
              <h2 className="text-xl font-semibold text-slate-900">เช็คชื่อวันนี้</h2>
            </div>

          </div>
          <form action={checkIn} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">ชื่อ</label>
                <input
                  name="name"
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">รหัส</label>
                <input
                  name="code"
                  placeholder="เช่น EMP001"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:from-blue-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 md:w-auto"
            >
              บันทึกการเช็คชื่อ
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">รายการ</p>
              <h2 className="text-xl font-semibold text-slate-900">
                รายการเช็คชื่อวันนี้ <span className="text-slate-500 font-normal text-base ml-2">{formatThaiDate(new Date())}</span>
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              ทั้งหมด {todayList.length} รายการ
            </span>
          </div>

          <form className="relative">
            <input
              name="q"
              defaultValue={query}
              placeholder="ค้นหาชื่อ หรือ รหัส..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2 pl-4 pr-20 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder:text-slate-400"
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500 shadow-sm transition-all active:scale-95"
            >
              ค้นหา
            </button>
          </form>

          {todayList.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-inner">
                🙂
              </span>
              ยังไม่มีการเช็คชื่อ
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">รหัส</th>
                    <th className="text-left px-4 py-3 font-semibold">ชื่อ</th>
                    <th className="text-left px-4 py-3 font-semibold">เวลาเช็คอิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayList.map((record: AttendanceWithUser, idx: number) => (
                    <tr key={record.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                      <td className="px-4 py-3 font-mono text-slate-800">{record.user.code}</td>
                      <td className="px-4 py-3 text-slate-900">{record.user.name}</td>
                      <td className="px-4 py-3 text-slate-800">
                        {formatTime(record.check_in)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
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

function formatThaiDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}
