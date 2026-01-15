"use client";

import React, { useState, useEffect } from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700"] });

export default function HeaderClock() {
    const [mounted, setMounted] = useState(false);
    const [date, setDate] = useState<Date | null>(null);

    useEffect(() => {
        setMounted(true);
        setDate(new Date());
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!mounted || !date) {
        // Return a placeholder with same dimensions to avoid layout shift
        return (
            <div className="flex flex-col items-center justify-center space-y-1 animate-pulse">
                <div className="h-6 w-32 bg-slate-200 rounded"></div>
                <div className="h-10 w-48 bg-slate-200 rounded mt-1"></div>
            </div>
        );
    }

    // Format Date: 15 มกราคม 2568
    const days = [
        "วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ",
        "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"
    ];
    const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    const dayName = days[date.getDay()];
    const dayDate = date.getDate();
    const monthName = months[date.getMonth()];
    const thaiYear = date.getFullYear() + 543;

    const dateString = `ประจำวันที่ ${dayDate} ${monthName} ${thaiYear}`;

    return (
        <div className="flex flex-col items-center justify-center mb-6 space-y-3">
            <div className="text-xl md:text-2xl font-bold text-blue-900 tracking-wide drop-shadow-sm">
                {dateString}
            </div>
            <div className="bg-white border-2 border-blue-200 px-10 py-3 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.1)] hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all ease-in-out duration-300">
                <div className={`${orbitron.className} text-4xl md:text-6xl font-bold text-black tracking-wider tabular-nums`}>
                    {date.toLocaleTimeString("th-TH", { hour12: false })}
                </div>
            </div>
        </div>
    );
}
