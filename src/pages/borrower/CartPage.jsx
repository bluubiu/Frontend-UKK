// import { useState } from 'react';
// import { useShop } from '../../context/ShopContext';
// import { useAuth } from '../../context/AuthContext';
// import { Trash2, ShoppingCart, ArrowRight, Calendar, Package } from 'lucide-react';
// import axios from '../../api/axios';
// import { useNavigate } from 'react-router-dom';

// const CartPage = () => {
//     const { cart, removeFromCart, cartCount } = useShop(); // We might need clearCart function later
//     const { user } = useAuth();
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
//     const [returnDate, setReturnDate] = useState('');
//     const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]); // Default today

//     // Initialize quantities (default 1 for everyone)
//     const [quantities, setQuantities] = useState(
//         cart.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {})
//     );

//     const handleQuantityChange = (itemId, val) => {
//         const value = parseInt(val);
//         if (value > 0) {
//             setQuantities(prev => ({ ...prev, [itemId]: value }));
//         }
//     };

//     const handleCheckout = async (e) => {
//         e.preventDefault();
//         if (cart.length === 0) return;
//         if (!returnDate) {
//             alert('Silakan pilih tanggal pengembalian.');
//             return;
//         }

//         if (!window.confirm('Apakah Anda yakin ingin mengajukan permohonan ini?')) return;
//         setLoading(true);
//         try {
//             // Prepare payload for backend
//             // Backend expects: loan_date, return_date, items: [{item_id, quantity}]
//             const itemsPayload = cart.map(item => ({
//                 item_id: item.id,
//                 quantity: quantities[item.id] || 1
//             }));

//             await axios.post('/loans', {
//                 loan_date: loanDate,
//                 return_date: returnDate,
//                 items: itemsPayload
//             });

//             alert('Permohonan telah dikirimkan dengan sukses!');
//             // Ideally clear cart here, but ShopContext needs clearCart function
//             // For now manually remove all (or we add clearCart to context next)
//             cart.forEach(item => removeFromCart(item.id));

//             navigate('/my-loans');
//         } catch (error) {
//             console.error('Proses checkout gagal', error);
//             alert(error.response?.data?.message || 'Proses checkout gagal. Silakan coba lagi.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getImageUrl = (item) => {
//         if (!item.image) return null;
//         if (item.image.startsWith('http')) return item.image;
//         const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
//         const storageUrl = baseUrl.replace(/\/api$/, '');
//         return `${storageUrl}/storage/${item.image}`;
//     };

//     if (cart.length === 0) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
//                 <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
//                     <ShoppingCart className="w-10 h-10 text-emerald-500 opacity-50" />
//                 </div>
//                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Keranjang Kosong</h2>
//                 <p className="text-gray-500 mb-8 max-w-md">
//                     Anda belum menambahkan barang apapun ke keranjang peminjaman.
//                 </p>
//                 <button
//                     onClick={() => navigate('/items')}
//                     className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
//                 >
//                     Cari Item <ArrowRight className="w-4 h-4" />
//                 </button>
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-5xl mx-auto pb-12">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">Keranjang Peminjaman</h1>
//             <p className="text-gray-500 mb-8">Periksa barang sebelum mengajukan peminjaman.</p>

//             <div className="flex flex-col lg:flex-row gap-8">
//                 {/* Cart Items List */}
//                 <div className="flex-1 space-y-4">
//                     {cart.map((item) => {
//                         const img = getImageUrl(item);
//                         return (
//                             <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-center">
//                                 <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
//                                     {img ? (
//                                         <img src={img} alt={item.name} className="w-full h-full object-contain p-2" />
//                                     ) : (
//                                         <Package className="w-8 h-8 text-gray-300" />
//                                     )}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                     <div className="flex justify-between items-start">
//                                         <div>
//                                             <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mb-1 inline-block">
//                                                 {item.category?.name}
//                                             </span>
//                                             <h3 className="font-bold text-gray-800 text-lg truncate">{item.name}</h3>
//                                         </div>
//                                         <button
//                                             onClick={() => removeFromCart(item.id)}
//                                             className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//                                         >
//                                             <Trash2 className="w-5 h-5" />
//                                         </button>
//                                     </div>
//                                     <p className="text-sm text-gray-500 line-clamp-1 mb-3">{item.description}</p>

//                                     <div className="flex items-center gap-4">
//                                         <div className="flex items-center border border-gray-200 rounded-lg">
//                                             <button
//                                                 className="px-3 py-1 hover:bg-gray-50 text-gray-600 font-bold border-r border-gray-200"
//                                                 onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) - 1)}
//                                                 disabled={(quantities[item.id] || 1) <= 1}
//                                             >-</button>
//                                             <input
//                                                 type="number"
//                                                 className="w-12 text-center text-sm font-bold border-none focus:ring-0 p-1"
//                                                 value={quantities[item.id] || 1}
//                                                 onChange={(e) => handleQuantityChange(item.id, e.target.value)}
//                                                 min="1"
//                                                 max={item.available_stock}
//                                             />
//                                             <button
//                                                 className="px-3 py-1 hover:bg-gray-50 text-gray-600 font-bold border-l border-gray-200"
//                                                 onClick={() => handleQuantityChange(item.id, (quantities[item.id] || 1) + 1)}
//                                                 disabled={(quantities[item.id] || 1) >= item.available_stock}
//                                             >+</button>
//                                         </div>
//                                         <div className="text-xs text-gray-400 font-medium">
//                                             Max: {item.available_stock} unit
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>

//                 {/* Checkout Panel */}
//                 <div className="lg:w-96 flex-shrink-0">
//                     <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg sticky top-28">
//                         <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
//                             <Calendar className="w-5 h-5 text-emerald-500" /> Detail Peminjaman
//                         </h3>

//                         <form onSubmit={handleCheckout} className="space-y-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
//                                 <input
//                                     type="date"
//                                     required
//                                     value={loanDate}
//                                     onChange={(e) => setLoanDate(e.target.value)}
//                                     className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kembali</label>
//                                 <input
//                                     type="date"
//                                     required
//                                     min={loanDate}
//                                     value={returnDate}
//                                     onChange={(e) => setReturnDate(e.target.value)}
//                                     className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold"
//                                 />
//                             </div>

//                             <div className="pt-4 border-t border-gray-100 space-y-2">
//                                 <div className="flex justify-between text-sm">
//                                     <span className="text-gray-500">Total Jenis Barang</span>
//                                     <span className="font-bold text-gray-900">{cartCount} jenis</span>
//                                 </div>
//                                 <div className="flex justify-between text-sm">
//                                     <span className="text-gray-500">Total Jumlah Barang</span>
//                                     <span className="font-bold text-gray-900">
//                                         {Object.values(quantities).reduce((a, b) => a + b, 0)} unit
//                                     </span>
//                                 </div>
//                             </div>

//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-300 mt-6 flex items-center justify-center gap-2"
//                             >
//                                 {loading ? 'Memproses...' : (
//                                     <>Ajukan Peminjaman <ArrowRight className="w-4 h-4" /></>
//                                 )}
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CartPage;
