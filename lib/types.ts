export type AttendanceWithUser = {
    id: string;
    date: Date;
    check_in: Date;
    session: string;
    user: { code: string; name: string };
};
