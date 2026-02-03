import { useState } from 'react';
import { Heart, ShoppingCart, ChevronDown, Info } from 'lucide-react';
import PropTypes from 'prop-types';
import { useShop } from '../context/ShopContext';

const ProductCard = ({ item, onAction, actionLabel = "Ajukan Pinjaman", theme = "light" }) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [imageError, setImageError] = useState(false);
    const { addToCart, removeFromCart, isInCart, toggleWishlist, isInWishlist } = useShop();

    const inCart = isInCart(item.id);
    const inWishlist = isInWishlist(item.id);

    // Determine image URL
    const getImageUrl = () => {
        if (!item.image || imageError) {
            return null; // Will show placeholder
        }
        // If image path starts with http, use it directly, otherwise prepend backend URL
        if (item.image.startsWith('http')) {
            return item.image;
        }
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        const storageUrl = baseUrl.replace(/\/api$/, '');
        return `${storageUrl}/storage/${item.image}`;
    };

    const imageUrl = getImageUrl();

    // Determine availability color
    const getAvailabilityColor = () => {
        const ratio = item.available_stock / item.stock;
        if (ratio > 0.5) return 'emerald';
        if (ratio > 0) return 'amber';
        return 'red';
    };

    const availabilityColor = getAvailabilityColor();

    // Truncate description
    const description = item.description || 'Tidak ada deskripsi';
    const shouldTruncate = description.length > 120;
    const displayDescription = showFullDescription ? description : (shouldTruncate ? description.substring(0, 120) + '...' : description);

    const isDark = theme === "dark";

    const handleToggleLike = () => toggleWishlist(item);
    const handleToggleCart = () => {
        if (inCart) {
            removeFromCart(item.id);
        } else {
            addToCart(item);
        }
    };

    return (
        <div className={`group relative rounded-[32px] p-2 transition-all duration-500 hover:-translate-y-2 ${isDark
            ? 'bg-gray-800 border border-gray-700 hover:shadow-2xl hover:shadow-emerald-900/50'
            : 'bg-white border border-gray-100 hover:shadow-2xl hover:shadow-emerald-100'
            }`}>
            <div className={`rounded-[28px] p-6 transition-colors ${isDark
                ? 'bg-gray-900 group-hover:bg-gray-850'
                : 'bg-gray-50 group-hover:bg-emerald-50/50'
                }`}>
                {/* Heart Icon - Top Right */}
                <div className="absolute top-6 right-6 z-10">
                    <button
                        onClick={handleToggleLike}
                        className={`p-2.5 rounded-full transition-all duration-300 ${inWishlist
                            ? 'bg-red-50 text-red-500 hover:bg-red-100'
                            : isDark
                                ? 'bg-gray-800/80 backdrop-blur-sm text-gray-400 hover:text-red-400 hover:bg-gray-700'
                                : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white'
                            } shadow-lg ring-1 ring-black/5`}>
                        <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Product Image */}
                <div className={`relative w-full aspect-[4/3] rounded-2xl mb-4 overflow-hidden flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-white'
                    }`}>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <div className={`text-center ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                                <ShoppingCart className="w-16 h-16 mx-auto mb-2 opacity-30" />
                                <p className="text-xs font-medium">Tidak ada gambar</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Category & Availability */}
                <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${isDark
                        ? 'bg-gray-800 text-gray-400'
                        : 'bg-white text-gray-500'
                        }`}>
                        {item.category?.name || 'Uncategorized'}
                    </span>
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${availabilityColor === 'emerald'
                        ? 'bg-emerald-100 text-emerald-600'
                        : availabilityColor === 'amber'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                        {item.available_stock} Tersedia
                    </span>
                </div>

                {/* Product Name */}
                <h3 className={`text-xl font-bold mb-2 transition-colors ${isDark
                    ? 'text-white group-hover:text-emerald-400'
                    : 'text-gray-900 group-hover:text-emerald-700'
                    }`}>
                    {item.name}
                </h3>

                {/* Description */}
                <div className="mb-4">
                    <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {displayDescription}
                    </p>
                    {shouldTruncate && (
                        <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                            {showFullDescription ? 'Lihat Lebih Sedikit' : 'Lihat Lebih Banyak'}
                            <ChevronDown className={`w-3 h-3 transition-transform ${showFullDescription ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>

                {/* Condition Info */}
                <div className="mb-6">
                    <div className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        <Info className="w-4 h-4 text-emerald-500" />
                        <span>Kondisi: <span className={`font-bold capitalize ${isDark ? 'text-gray-300' : 'text-gray-900'
                            }`}>{item.condition}</span></span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onAction && onAction(item)}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${item.available_stock === 0
                            ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200'
                            : isDark
                                ? 'bg-gray-800 border-2 border-gray-700 text-white hover:bg-emerald-600 hover:border-emerald-600'
                                : 'bg-white border-2 border-gray-100 text-gray-900 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                            }`}
                    >
                        <span>{item.available_stock === 0 ? 'Daftar Tunggu' : actionLabel}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

ProductCard.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        image: PropTypes.string,
        category: PropTypes.shape({
            name: PropTypes.string
        }),
        stock: PropTypes.number.isRequired,
        available_stock: PropTypes.number.isRequired,
        condition: PropTypes.string.isRequired,
    }).isRequired,
    onAction: PropTypes.func,
    actionLabel: PropTypes.string,
    theme: PropTypes.oneOf(['light', 'dark'])
};

export default ProductCard;
