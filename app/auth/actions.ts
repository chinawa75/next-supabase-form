"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function login(prevState: any, formData: FormData) {
    const username = (formData.get("username") as string)?.trim();
    const password = (formData.get("password") as string)?.trim();

    if (!username || !password) {
        return { message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" };
    }

    try {
        const admin = await prisma.admins.findUnique({
            where: { username },
        });

        if (!admin) {
            return { message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
        }

        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) {
            return { message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
        }

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set("admin_session", admin.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
        });

    } catch (error) {
        console.error("Login Error:", error);
        return { message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
    }

    redirect("/admin");
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    redirect("/login");
}
