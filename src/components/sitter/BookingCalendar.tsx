import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BookingRequest } from '@/core/types';

interface BookingCalendarProps {
    bookings: BookingRequest[];
}

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const getBookingsForDate = (day: number) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        // Reset time to 0 for comparison
        checkDate.setHours(0,0,0,0);

        return bookings.filter(b => {
             // Handle simplistic range overlap
             // b.start_date and b.end_date are strings (YYYY-MM-DD usually)
             const start = new Date(b.start_date);
             start.setHours(0,0,0,0);
             const end = new Date(b.end_date);
             end.setHours(0,0,0,0);
             
             // Check allowing for UTC inconsistencies by being careful?
             // Assuming string YYYY-MM-DD is parsed as UTC in many envs or local.
             // For simplicity, let's normalize to string comparison YYYY-MM-DD.
             const checkStr = checkDate.toISOString().split('T')[0];
             // Simple string compare for this demo if strings are YYYY-MM-DD
             return b.start_date <= checkStr && b.end_date >= checkStr;
        });
    };

    const renderDays = () => {
        const days = [];
        // Empty slots for days before start
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="bg-gray-50 h-24 md:h-32 border border-gray-100"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayBookings = getBookingsForDate(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            days.push(
                <div key={day} className={`h-24 md:h-32 border border-gray-100 p-1 relative ${isToday ? 'bg-indigo-50' : 'bg-white'}`}>
                    <span className={`text-sm font-semibold h-6 w-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                        {day}
                    </span>
                    <div className="mt-1 overflow-y-auto max-h-[calc(100%-24px)] space-y-1">
                        {dayBookings.map(b => (
                            <div key={b.id} className="text-xs bg-indigo-100 text-indigo-800 rounded px-1 py-0.5 truncate border border-indigo-200" title={`${b.customers?.name || 'Unknown'} (${b.status})`}>
                                {b.customers?.name}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
                     <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">{monthName} {year}</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
                     <ChevronRight className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-px text-center text-sm font-medium text-gray-500 mb-2">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded overflow-hidden">
                {renderDays()}
            </div>
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded"></span>
                    <span>Booked/Active</span>
                </div>
            </div>
        </div>
    );
}
