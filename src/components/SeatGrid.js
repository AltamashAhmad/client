import { useState, useEffect, useCallback } from 'react';

export default function SeatGrid({ seats, onBookSeats, onResetAllBookings }) {
    const [seatCount, setSeatCount] = useState('');
    const [previewSeats, setPreviewSeats] = useState([]);

    const findBestAvailableSeats = useCallback((count) => {
        const seatsByRow = seats.reduce((acc, seat) => {
            if (!acc[seat.row_number]) {
                acc[seat.row_number] = [];
            }
            acc[seat.row_number].push(seat);
            return acc;
        }, {});

        // First try: Look for consecutive seats in a single row
        for (let row in seatsByRow) {
            const rowSeats = seatsByRow[row];
            const availableSeats = rowSeats.filter(seat => !seat.is_booked);
            
            if (availableSeats.length >= count) {
                // Check if we have enough consecutive seats
                for (let i = 0; i <= availableSeats.length - count; i++) {
                    const consecutive = availableSeats.slice(i, i + count);
                    if (consecutive.length === count && 
                        consecutive.every((seat, index) => 
                            index === 0 || consecutive[index - 1].seat_number === seat.seat_number - 1
                        )) {
                        return consecutive.map(seat => seat.seat_id);
                    }
                }
            }
        }

        // Second try: Look for nearby seats across rows
        let selectedIds = [];
        let remainingCount = count;
        
        for (let row in seatsByRow) {
            if (remainingCount === 0) break;
            
            const rowSeats = seatsByRow[row];
            const availableSeats = rowSeats.filter(seat => !seat.is_booked);
            
            const seatsToTake = Math.min(remainingCount, availableSeats.length);
            selectedIds = [...selectedIds, ...availableSeats.slice(0, seatsToTake).map(seat => seat.seat_id)];
            remainingCount -= seatsToTake;
        }

        return selectedIds.length === count ? selectedIds : [];
    }, [seats]);

    useEffect(() => {
        if (seatCount && parseInt(seatCount) >= 1 && parseInt(seatCount) <= 7) {
            const bestSeats = findBestAvailableSeats(parseInt(seatCount));
            setPreviewSeats(bestSeats);
        } else {
            setPreviewSeats([]);
        }
    }, [seatCount, findBestAvailableSeats]);

    const getSeatColor = (seat) => {
        if (seat.is_booked) return 'bg-yellow-400';
        if (previewSeats.includes(seat.seat_id)) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const handleBookSeats = () => {
        if (previewSeats.length > 0) {
            // Call the parent's booking function
            onBookSeats(previewSeats);
            // Clear the form
            setSeatCount('');
            setPreviewSeats([]);
        }
    };

    const handleResetAllBookings = () => {
        const isConfirmed = window.confirm('Are you sure you want to reset all bookings? This action cannot be undone.');
        if (isConfirmed) {
            onResetAllBookings();
            setSeatCount('');
            setPreviewSeats([]);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-800 to-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Train Ticket Booking
                    </h2>
                    <button
                        onClick={handleResetAllBookings}
                        className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
                    >
                        Reset All Bookings
                    </button>
                </div>

                <div className="flex gap-8 mt-8">
                    {/* Left Side - Seat Grid */}
                    <div className="w-2/3">
                        <div className="grid grid-cols-7 gap-2">
                            {seats.map((seat) => (
                                <button
                                    key={seat.seat_id}
                                    className={`
                                        ${getSeatColor(seat)}
                                        w-12 h-10 rounded-lg
                                        flex items-center justify-center
                                        text-white font-medium text-sm
                                        transition-colors duration-200
                                        ${seat.is_booked ? 'cursor-not-allowed' : 'hover:opacity-90'}
                                        shadow-md
                                    `}
                                    disabled={seat.is_booked}
                                >
                                    {seat.seat_number}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 flex space-x-4">
                            <div className="bg-yellow-400 px-4 py-2 rounded-lg text-white font-medium shadow-md">
                                Booked Seats = {seats.filter(s => s.is_booked).length}
                            </div>
                            <div className="bg-green-500 px-4 py-2 rounded-lg text-white font-medium shadow-md">
                                Available Seats = {seats.filter(s => !s.is_booked).length}
                            </div>
                            <div className="bg-blue-500 px-4 py-2 rounded-lg text-white font-medium shadow-md">
                                Selected Seats = {previewSeats.length}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Booking Interface */}
                    <div className="w-1/3 bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">
                            Book Your Seats
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Number of Seats:
                                </label>
                                <input 
                                    type="text"
                                    pattern="[1-7]"
                                    value={seatCount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 7)) {
                                            setSeatCount(value);
                                        }
                                    }}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm 
                                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                             text-lg font-medium text-black placeholder-gray-400"
                                    placeholder="Enter number (1-7)"
                                />
                                {seatCount && (parseInt(seatCount) < 1 || parseInt(seatCount) > 7) && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">
                                        Please enter a number between 1 and 7
                                    </p>
                                )}
                            </div>

                            {previewSeats.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <p className="text-sm font-semibold text-blue-800 mb-2">
                                        Selected Seats:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {previewSeats.map(seatId => (
                                            <span key={seatId} 
                                                className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
                                                {seats.find(s => s.seat_id === seatId)?.seat_number}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleBookSeats}
                                disabled={!previewSeats.length}
                                className={`
                                    w-full py-3 px-4 rounded-lg text-sm font-semibold shadow-md
                                    transition-all duration-200 ease-in-out
                                    ${!previewSeats.length
                                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02]'
                                    }
                                `}
                            >
                                {!previewSeats.length ? 'Select Seats' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}