"use client";

import { useState, useEffect } from "react";
import { AttendanceWithUser } from "@/lib/types";
import AttendanceTable from "./AttendanceTable";
import { Clock, Sun, Moon } from "lucide-react";

export default function TodayAttendance({ data }: { data: AttendanceWithUser[] }) {
    const [currentSession, setCurrentSession] = useState<'morning' | 'afternoon'>('morning');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Determine initial session based on current time
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        // Morning: <= 12:00
        // Afternoon: > 12:00
        if (hour < 12 || (hour === 12 && minute === 0)) {
            setCurrentSession('morning');
        } else {
            setCurrentSession('afternoon');
        }
    }, []);

    const morningList = data.filter(r => r.session === 'morning');
    const afternoonList = data.filter(r => r.session === 'afternoon');

    const displayList = currentSession === 'morning' ? morningList : afternoonList;

    if (!mounted) {
        return <div className="p-8 text-center text-slate-500">กำลังโหลด...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                <button
                    onClick={() => setCurrentSession('morning')}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${currentSession === 'morning'
                            ? 'bg-white text-green-700 shadow-sm ring-1 ring-green-200'
                            : 'text-slate-500 hover:text-green-700 hover:bg-green-50'}
                    `}
                >
                    <Sun className="w-4 h-4" />
                    ภาคเช้า ({morningList.length})
                </button>
                <button
                    onClick={() => setCurrentSession('afternoon')}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${currentSession === 'afternoon'
                            ? 'bg-white text-orange-600 shadow-sm ring-1 ring-orange-200'
                            : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'}
                    `}
                >
                    <div className="flex items-center">
                        <Moon className="w-4 h-4 mr-2" />
                    </div>
                    ภาคบ่าย ({afternoonList.length})
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900">
                        {currentSession === 'morning' ? 'รายชื่อผู้ลงทะเบียน (ภาคเช้า)' : 'รายชื่อผู้ลงทะเบียน (ภาคบ่าย)'}
                    </h3>
                </div>
                <div className="p-4 sm:p-6">
                    <AttendanceTable data={displayList} showStatusColumn={false} />
                </div>
            </div>
        </div>
    );
}
