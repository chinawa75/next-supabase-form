"use client";

import * as React from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
    SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AttendanceWithUser } from "@/lib/types";

// Helper function for Thai time (client-side)
const formatTime = (date: Date | string) => {
    return new Intl.DateTimeFormat("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Bangkok",
    }).format(new Date(date));
};

// Helper function for Thai date (client-side)
const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Bangkok",
    }).format(new Date(date));
};

const getCheckInStatus = (checkIn: Date, session: string) => {
    const d = new Date(checkIn);
    const h = d.getHours();
    const m = d.getMinutes();

    // Fallback session if empty (though Schema ensures default 'morning')
    const currentSession = session || (h < 12 ? 'morning' : 'afternoon');

    let isLate = false;
    if (currentSession === 'morning') {
        // Late after 8:30
        if (h > 8 || (h === 8 && m > 30)) isLate = true;
    } else {
        // Late after 13:30
        if (h > 13 || (h === 13 && m > 30)) isLate = true;
    }

    return isLate
        ? { label: "สาย", className: "text-red-700 bg-red-50 border-red-200" }
        : { label: "ปกติ", className: "text-green-700 bg-green-50 border-green-200" };
};

export default function AttendanceTable({
    data,
    showDateColumn = false,
    showStatusColumn = true,
}: {
    data: AttendanceWithUser[],
    showDateColumn?: boolean,
    showStatusColumn?: boolean,
}) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = React.useState("");

    // Custom filter for Date objects vs string input YYYY-MM-DD
    const columns: ColumnDef<AttendanceWithUser>[] = [
        {
            accessorFn: (row) => row.user.code,
            id: "code",
            header: ({ column }) => {
                return (
                    <div
                        className="flex items-center gap-2 cursor-pointer select-none group text-slate-500 hover:text-slate-800 transition-colors"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        รหัส
                        <ArrowUpDown className={`h-3 w-3 transition-opacity ${column.getIsSorted() ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                    </div>
                );
            },
            cell: (info) => (
                <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                    {info.getValue() as string}
                </span>
            ),
        },
        {
            accessorFn: (row) => row.user.name,
            id: "name",
            header: ({ column }) => {
                return (
                    <div
                        className="flex items-center gap-2 cursor-pointer select-none group text-slate-500 hover:text-slate-800 transition-colors"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        ชื่อ-นามสกุล
                        <ArrowUpDown className={`h-3 w-3 transition-opacity ${column.getIsSorted() ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                    </div>
                );
            },
            cell: (info) => <span className="text-slate-900 font-medium">{info.getValue() as string}</span>,
        },
        ...(showDateColumn ? [{
            accessorFn: (row: AttendanceWithUser) => {
                // Return YYYY-MM-DD string for easier filtering
                return row.date ? new Date(row.date).toISOString().split('T')[0] : '';
            },
            id: "date",
            header: ({ column }: { column: any }) => {
                return (
                    <div
                        className="flex items-center gap-2 cursor-pointer select-none group text-slate-500 hover:text-slate-800 transition-colors"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        วันที่
                        <ArrowUpDown className={`h-3 w-3 transition-opacity ${column.getIsSorted() ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                    </div>
                );
            },
            cell: (info: any) => <span className="text-slate-600">{formatDate(info.row.original.date)}</span>,
            filterFn: "equalsString" as const,
        }] : []),
        {
            accessorKey: "check_in",
            header: ({ column }) => {
                return (
                    <div
                        className="flex items-center gap-2 cursor-pointer select-none group text-slate-500 hover:text-slate-800 transition-colors"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        เวลาเช็คอิน
                        <ArrowUpDown className={`h-3 w-3 transition-opacity ${column.getIsSorted() ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                    </div>
                );
            },
            cell: (info) => (
                <span className="text-slate-600 font-medium tabular-nums">
                    {formatTime(info.getValue() as Date)}
                </span>
            ),
        },
        ...(showStatusColumn ? [{
            id: "status",
            header: "สถานะ",
            cell: (info: any) => {
                const { label, className } = getCheckInStatus(info.row.original.check_in, info.row.original.session);
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
                        {label}
                    </span>
                );
            },
        }] : []),
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            }
        }
    });

    return (
        <div className="space-y-4 w-full">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
                            placeholder="ค้นหาชื่อ หรือ รหัส..."
                        />
                    </div>

                    {/* Date Filter Input - Only show if date column is enabled */}

                </div>
                <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                    แสดง {table.getFilteredRowModel().rows.length} จาก {data.length} รายการ
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm ring-1 ring-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="px-6 py-4 font-medium text-xs uppercase tracking-wider">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-slate-50/60 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Search className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <p className="font-medium">ไม่พบข้อมูลที่ค้นหา</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {table.getPageCount() > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                        <div className="text-sm text-slate-500">
                            หน้า <span className="font-medium text-slate-900">{table.getState().pagination.pageIndex + 1}</span> จาก <span className="font-medium text-slate-900">{table.getPageCount()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="h-4 w-4 text-slate-600" />
                            </button>
                            <button
                                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronRight className="h-4 w-4 text-slate-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
