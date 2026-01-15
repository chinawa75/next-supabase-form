import { prisma } from "@/lib/prisma";
import AttendanceTable from "@/components/AttendanceTable";
import AdminDateFilter from "@/components/AdminDateFilter";
import { AttendanceWithUser } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ date?: string, session?: string }> }) {
    const params = await searchParams;
    let { date, session } = params;

    // Default to Today if no date selected
    if (!date) {
        date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    }

    // Fetch all distinct dates for the dropdown
    const availableDatesRaw = await prisma.attendances.findMany({
        distinct: ['date'],
        select: { date: true },
        orderBy: { date: 'desc' },
    });
    const availableDates = availableDatesRaw.map(d => d.date);

    // Prepare Query
    let whereClause: any = {};
    let takeLimit: number | undefined = undefined;

    if (date) {
        // Filter by specific date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        whereClause.check_in = {
            gte: startOfDay,
            lte: endOfDay,
        };
    } else {
        // Fallback (Should typically be covered by default date)
        takeLimit = 100;
    }

    if (session && session !== 'all') {
        whereClause.session = session;
    }

    const data: AttendanceWithUser[] = await prisma.attendances.findMany({
        where: whereClause,
        include: { user: true },
        orderBy: { check_in: 'desc' },
        take: takeLimit,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">ประวัติการเช็คชื่อ</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {date
                            ? `ข้อมูลวันที่ ${new Date(date).toLocaleDateString('th-TH', { dateStyle: 'long' })}`
                            : "แสดงข้อมูลล่าสุด 100 รายการ"}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <AdminDateFilter dates={availableDates} />
                    <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
                        พบ {data.length} รายการ
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <AttendanceTable
                    data={data}
                    showDateColumn={true}
                />
            </div>
        </div>
    )
}
