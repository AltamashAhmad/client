import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import SeatGrid from '../components/SeatGrid';
import toast from 'react-hot-toast';

export default function Booking() {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/login');
        }
    }, [router]);

    useEffect(() => {
        if (!user) {
            router.replace('/login');
            return;
        }
        fetchSeats();
    }, [user, router]);

    const fetchSeats = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/booking/seats');
            const data = await response.json();
            setSeats(data);
        } catch (error) {
            console.error('Failed to fetch seats:', error);
            toast.error('Failed to load seats');
        } finally {
            setLoading(false);
        }
    };

    const handleBookSeats = async (seatIds) => {
        try {
            const response = await fetch('http://localhost:5001/api/booking/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ seatIds })
            });

            const data = await response.json();
            
            if (response.ok) {
                toast.success('Booking successful!');
                fetchSeats(); // Refresh seats after booking
            } else {
                throw new Error(data.error || 'Booking failed');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleResetAllBookings = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/booking/reset', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (response.ok) {
                toast.success('All bookings have been reset');
                fetchSeats(); // Refresh seats after reset
            } else {
                throw new Error('Failed to reset bookings');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-800 to-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-gray-800 to-black">
            <div className="absolute top-4 right-4">
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md"
                >
                    Logout
                </button>
            </div>

            <SeatGrid 
                seats={seats}
                onBookSeats={handleBookSeats}
                onResetAllBookings={handleResetAllBookings}
            />
        </div>
    );
} 