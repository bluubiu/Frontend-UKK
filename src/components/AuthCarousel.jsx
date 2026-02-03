import { useState, useEffect } from 'react';
import asset1 from '../assets/asset1.jpg';
import asset2 from '../assets/asset2.jpg';
import asset3 from '../assets/asset3.jpg';

const images = [asset1, asset2, asset3];

const AuthCarousel = ({ title, subtitle }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
            {images.map((img, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <img
                        src={img}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-12 text-white z-10">
                <h1 className="text-4xl font-bold mb-4">{title}</h1>
                <p className="text-xl text-gray-200">{subtitle}</p>

                {/* Indicators */}
                <div className="flex gap-2 mt-8">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-gray-500'
                                }`}
                        ></div>
                    ))}
                </div>
            </div>

            <div className="absolute top-8 left-8 text-white font-bold text-2xl tracking-widest z-10">
                MediUKS
            </div>
        </div>
    );
};

export default AuthCarousel;
