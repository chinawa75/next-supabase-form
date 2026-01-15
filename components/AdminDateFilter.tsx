"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function AdminDateFilter({ dates }: { dates: Date[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentDate = searchParams.get("date") || "";
    const currentSession = searchParams.get("session") || "all";

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (val) {
            params.set("date", val);
        } else {
            params.delete("date");
        }
        router.push(`?${params.toString()}`);
    };

    const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (val && val !== 'all') {
            params.set("session", val);
        } else {
            params.delete("session");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
            <div className="flex items-center gap-2">
                <label htmlFor="date-filter" className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    วันที่:
                </label>
                <select
                    id="date-filter"
                    value={currentDate}
                    onChange={handleChange}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 shadow-sm cursor-pointer min-w-[180px]"
                >
                    <option value="">-- วันนี้ --</option>
                    {dates.map((date) => {
                        const dateStr = new Date(date).toLocaleDateString('en-CA');
                        const label = new Date(date).toLocaleDateString('th-TH', { dateStyle: 'long' });
                        return (
                            <option key={dateStr} value={dateStr}>{label}</option>
                        );
                    })}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label htmlFor="session-filter" className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    ช่วงเวลา:
                </label>
                <select
                    id="session-filter"
                    value={currentSession}
                    onChange={handleSessionChange}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 shadow-sm cursor-pointer min-w-[120px]"
                >
                    <option value="all">ทั้งหมด</option>
                    <option value="morning">ภาคเช้า</option>
                    <option value="afternoon">ภาคบ่าย</option>
                </select>
            </div>
        </div>
    );
}
