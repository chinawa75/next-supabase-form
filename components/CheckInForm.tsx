"use client";

import { useActionState, useEffect } from "react";
import { checkIn, CheckInState } from "@/app/actions";
import { useFormStatus } from "react-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const initialState: CheckInState = {
    status: "idle",
    message: "",
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-700 to-rose-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-200 transition hover:from-pink-600 hover:to-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังบันทึก...
                </>
            ) : (
                "บันทึกการเช็คชื่อ"
            )}
        </button>
    );
}

export default function CheckInForm() {
    const [state, formAction] = useActionState(checkIn, initialState);

    useEffect(() => {
        if (state.status !== "idle" && state.message) {
            const isSuccess = state.status === "success";
            const isDuplicate = state.status === "duplicate";
            const isError = state.status === "error";

            MySwal.fire({
                icon: isSuccess ? "success" : isDuplicate ? "warning" : "error",
                title: isSuccess ? "บันทึกสำเร็จ" : isDuplicate ? "แจ้งเตือน" : "เกิดข้อผิดพลาด",
                text: state.message,
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                backdrop: `rgba(0,0,0,0.1)`, // Minimal backdrop
                customClass: {
                    popup: "rounded-2xl shadow-xl font-sans",
                    title: "text-lg font-bold text-slate-800",
                    htmlContainer: "text-sm text-slate-600",
                },
            });
        }
    }, [state.timestamp, state.status, state.message]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                    <label className="text-sm font-bold text-black">ชื่อ-นามสกุล</label>
                    <input
                        name="name"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-bold text-black">รหัสนักศึกษา</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        name="code"
                        placeholder="เช่น 69130000001 (11 หลัก)"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 placeholder:text-slate-400"
                        required
                        minLength={11}
                        maxLength={11}
                        pattern="\d{11}"
                        title="กรุณากรอกรหัสนักศึกษาเป็นตัวเลข 11 หลัก"
                    />
                </div>
            </div>
            <SubmitButton />
        </form>
    );
}
