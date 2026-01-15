export type AttendanceWithUser = {
    id: string;
    check_in: Date;
    user: { code: string; name: string };
};
