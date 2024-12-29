import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
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

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/login');
        }
    }, [router]);

    const fetchSeats = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/booking/seats`);
            if (!response.ok) throw new Error('Failed to fetch seats');
            const data = await response.json();
            setSeats(data);
        } catch (error) {
            console.error('Failed to fetch seats:', error);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchSeats();
    }, [user, router, fetchSeats]);

    const handleReset = async () => {
        try {
            const response = await fetch(`${API_URL}/api/booking/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            if (!response.ok) throw new Error('Failed to reset seats');
            await fetchSeats();
        } catch (error) {
            console.error('Failed to reset seats:', error);
        }
    };

    const handleBooking = async (seatIds) => {
        try {
            const response = await fetch(`${API_URL}/api/booking/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                },
                body: JSON.stringify({ seatIds })
            });
            if (!response.ok) throw new Error('Failed to book seats');
            await fetchSeats();
        } catch (error) {
            console.error('Failed to book seats:', error);
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
                onBookSeats={handleBooking}
                onResetAllBookings={handleReset}
            />
        </Layout>
    );
} 