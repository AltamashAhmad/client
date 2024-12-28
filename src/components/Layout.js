import Footer from './Footer';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-800 to-black relative">
            <div className="min-h-screen pb-16"> {/* Added padding bottom for footer */}
                {children}
            </div>
            <div className="absolute bottom-0 w-full">
                <Footer />
            </div>
        </div>
    );
} 