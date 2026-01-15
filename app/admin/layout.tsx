import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { LogOut } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-blue-900 tracking-tight">
                                Admin Portal
                            </span>
                            <span className="ml-4 px-3 py-1 rounded-full bg-blue-50 text-xs font-medium text-blue-700">
                                ระบบจัดการ
                            </span>
                        </div>
                        <div className="flex items-center">
                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    ออกจากระบบ
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
