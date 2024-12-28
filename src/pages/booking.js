import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import SeatGrid from '../components/SeatGrid';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import Layout from '../components/Layout';

export default function Booking() {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
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

    const LogoutConfirmationModal = () => {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Confirm Logout
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to logout?
                    </p>
                    <div className="flex space-x-4 justify-between">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="w-1/2 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                logout();
                                setShowLogoutModal(false);
                            }}
                            className="w-1/2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-800 to-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <Layout>
            {showLogoutModal && <LogoutConfirmationModal />}
            <div className="absolute top-4 right-4">
                <button
                    onClick={() => setShowLogoutModal(true)}
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
        </Layout>
    );
} 