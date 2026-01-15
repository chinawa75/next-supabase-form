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

    try {
        const todayDate = getTodayDate();

        // Upsert User
        const user = await prisma.users.upsert({
            where: { code },
            update: { name },
            create: { code, name },
        });

        // Check for existing attendance
        const existing = await prisma.attendances.findUnique({
            where: {
                user_id_date: {
                    user_id: user.id,
                    date: todayDate,
                },
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
                message: `คุณ ${name} เช็คชื่อซ้ำ! ระบบได้อัปเดตเวลาล่าสุดให้แล้ว`,
                timestamp: Date.now()
            };
        }

        // New Attendance
        await prisma.attendances.create({
            data: {
                user_id: user.id,
                date: todayDate,
                check_in: new Date(),
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
            message: "เกิดข้อผิดพลาดในการเชื่อมต่อระบบ กรุณาลองใหม่",
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
