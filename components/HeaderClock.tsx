"use client";

import React, { useState, useEffect } from "react";

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

    const dateString = `${dayDate} ${monthName} ${thaiYear}`;

    return (
        <div className="flex flex-col items-center justify-center mb-6">
            <div className="text-xl md:text-2xl font-bold text-slate-700 tracking-wide">
                {dateString}
            </div>
            <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-mono tracking-wider tabular-nums mt-1 shadow-sm">
                {date.toLocaleTimeString("th-TH", { hour12: false })}
            </div>
        </div>
    );
}
