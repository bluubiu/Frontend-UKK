import { useShop } from '../../context/ShopContext';
import ProductCard from '../../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WishlistPage = () => {
    const { wishlist, toggleWishlist } = useShop();
    const navigate = useNavigate();

    // Wrapper to handle removing from wishlist directly
    // ProductCard's onAction usually is "Request Borrow", here maybe "Remove"? 
    // Or we just rely on the heart icon inside ProductCard to toggle (remove).

    if (wishlist.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-10 h-10 text-red-500 opacity-50" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Wishlist Kosong</h2>
                <p className="text-gray-500 mb-8 max-w-md">
                    Simpan barang favorit Anda di sini untuk akses cepat.
                </p>
                <button
                    onClick={() => navigate('/items')}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
                >
                    Browse Items <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Wishlist Saya</h1>
            <p className="text-gray-500 mb-8">Barang favorit Anda tersimpan di sini untuk akses cepat.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {wishlist.map(item => (
                    <ProductCard
                        key={item.id}
                        item={item}
                    // On wishlist page, maybe action button goes to detail or add to cart?
                    // For simplicity, let's keep "Request to Borrow" or change to "Remove"
                    // But ProductCard defaults to "Request" behavior which is good.
                    // We can just utilize the Cart/Heart buttons inside card.
                    />
                ))}
            </div>
        </div>
    );
};

export default WishlistPage;
