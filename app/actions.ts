"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CheckInState = {
    status: "idle" | "success" | "duplicate" | "error";
    message: string;
    timestamp?: number;
};

export async function checkIn(prevState: CheckInState, formData: FormData): Promise<CheckInState> {
    const name = (formData.get("name") as string)?.trim();
    const code = (formData.get("code") as string)?.trim();

    if (!name || !code) {
        return { status: "error", message: "กรุณากรอกชื่อและรหัสให้ครบถ้วน", timestamp: Date.now() };
    }

    // Validate Code: Must be exactly 11 digits
    if (!/^\d{11}$/.test(code)) {
        return {
            status: "error",
            message: "รหัสนักศึกษาต้องเป็นตัวเลข 11 หลักเท่านั้น",
            timestamp: Date.now()
        };
    }

    try {
        const todayDate = getTodayDate();

        // Determine Session
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            timeZone: "Asia/Bangkok",
            hour: "numeric",
            minute: "numeric",
            hour12: false,
        };
        const formatter = new Intl.DateTimeFormat("en-US", options);
        const parts = formatter.formatToParts(now);
        const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
        const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

        // Logic: Morning <= 12:00, Afternoon > 12:00
        let currentSession = "morning";
        if (hour > 12 || (hour === 12 && minute > 0)) {
            currentSession = "afternoon";
        }

        const sessionLabel = currentSession === "morning" ? "ภาคเช้า" : "ภาคบ่าย";

        // Upsert User
        const user = await prisma.users.upsert({
            where: { code },
            update: { name },
            create: { code, name },
        });

        // Check for existing attendance for THIS session
        // Using findFirst to avoid potential composite key naming mismatches during development
        const existing = await prisma.attendances.findFirst({
            where: {
                user_id: user.id,
                date: todayDate,
                session: currentSession,
            },
        });

        if (existing) {
            // Duplicate: Check-in again (Update time)
            await prisma.attendances.update({
                where: { id: existing.id },
                data: { check_in: new Date() },
            });
            revalidatePath("/");
            return {
                status: "duplicate",
                message: `คุณ ${name} เช็คชื่อ (${sessionLabel}) ซ้ำ! ระบบได้อัปเดตเวลาล่าสุดให้แล้ว`,
                timestamp: Date.now()
            };
        }

        // New Attendance
        await prisma.attendances.create({
            data: {
                user_id: user.id,
                date: todayDate,
                check_in: new Date(),
                session: currentSession,
            },
        });

        revalidatePath("/");
        return {
            status: "success",
            message: `บันทึกการเช็คชื่อคุณ ${name} สำเร็จ!`,
            timestamp: Date.now()
        };

    } catch (error) {
        console.error("CheckIn Error:", error);
        return {
            status: "error",
            message: error instanceof Error ? `Error: ${error.message}` : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
            timestamp: Date.now()
        };
    }
}

// Helpers duplicated from page.tsx to ensure server action independence
function getTodayDate() {
    const todayStr = toDateInputValue(new Date());
    return new Date(`${todayStr}T00:00:00.000Z`);
}

function toDateInputValue(date: Date) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
}
