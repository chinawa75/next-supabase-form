"use client";

import { useActionState } from "react";
import { login } from "@/app/auth/actions";
import { Loader2 } from "lucide-react";

const initialState = {
    message: "",
};

export default function LoginPage() {
    const [state, action, isPending] = useActionState(login, initialState);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">
                        เข้าสู่ระบบ
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        สำหรับผู้ดูแลระบบ
                    </p>
                </div>

                <form action={action} className="space-y-5">
                    <div className="space-y-2">
                        <label
                            htmlFor="username"
                            className="text-sm font-medium text-slate-700 block"
                        >
                            ชื่อผู้ใช้
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-slate-400"
                            placeholder="username"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-slate-700 block"
                        >
                            รหัสผ่าน
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-slate-400"
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.message && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center">
                            {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-pink-700 hover:bg-pink-800 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md shadow-pink-700/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isPending ? "กำลังเข้า..." : "เข้าสู่ระบบ"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <a href="/" className="text-sm text-slate-400 hover:text-pink-700 transition-colors">
                        ← กลับไปหน้าหลัก
                    </a>
                </div>
            </div>
        </div>
    );
}
