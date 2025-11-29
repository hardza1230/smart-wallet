import React, { useState, useEffect } from 'react';
import { Save, Trash2, Loader2, Wallet, TrendingDown, History, Plus, CreditCard, X, ChevronRight } from 'lucide-react';

// --- Firebase Config & Init ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByueq9po9xamWC4y6gLokjj_jOlOjfDHI",
  authDomain: "hart-jah-wallet.firebaseapp.com",
  projectId: "hart-jah-wallet",
  storageBucket: "hart-jah-wallet.firebasestorage.app",
  messagingSenderId: "424761999742",
  appId: "1:424761999742:web:1051d737c9fdc756ebf32f",
  measurementId: "G-PH9TFHGT7R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Categories ---
const categories = [
  { id: 'food', name: 'อาหาร', icon: '🍜', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'travel', name: 'เดินทาง', icon: '🚖', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'shopping', name: 'ช้อปปิ้ง', icon: '🛍️', color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { id: 'home', name: 'ของใช้', icon: '🏠', color: 'bg-green-50 text-green-600 border-green-200' },
  { id: 'bill', name: 'บิลต่างๆ', icon: '🧾', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'other', name: 'อื่นๆ', icon: '✨', color: 'bg-slate-50 text-slate-600 border-slate-200' },
];

export default function App() {
  // State หลัก
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeWalletId, setActiveWalletId] = useState(null); // ID ของกระเป๋าที่เลือกอยู่
  
  // State สำหรับฟอร์ม
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State สำหรับสร้างกระเป๋าใหม่
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');

  // 1. Load Wallets & Init
  useEffect(() => {
    const q = query(collection(db, "wallets"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedWallets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setWallets(loadedWallets);

      // ถ้ายังไม่มีกระเป๋าเลย ให้สร้างกระเป๋าแรกอัตโนมัติ (Default)
      if (loadedWallets.length === 0 && !snapshot.metadata.fromCache) {
        addDoc(collection(db, "wallets"), {
          name: "กระเป๋าหลัก",
          createdAt: Date.now(),
          theme: "blue"
        });
      }
      
      // ถ้าโหลดเสร็จแล้วยังไม่มี Active Wallet ให้เลือกอันแรก
      if (loadedWallets.length > 0 && !activeWalletId) {
        setActiveWalletId(loadedWallets[0].id);
      }
    });
    return () => unsubscribe();
  }, [activeWalletId]); // Dependency: run เมื่อ activeWalletId เปลี่ยน (เพื่อ re-check)

  // 2. Load Transactions (ดึงมาทั้งหมดแล้ว Filter ฝั่ง Client เพื่อลดความซับซ้อนเรื่อง Index)
  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Filter รายการเฉพาะของกระเป๋าปัจจุบัน
  const currentWalletTransactions = transactions.filter(t => t.walletId === activeWalletId);
  const currentWalletTotal = currentWalletTransactions.reduce((sum, t) => sum + t.amount, 0);

  // --- Functions ---

  const handleCreateWallet = async () => {
    if (!newWalletName.trim()) return;
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "wallets"), {
        name: newWalletName,
        createdAt: Date.now(),
        theme: ['blue', 'slate', 'purple', 'emerald'][Math.floor(Math.random() * 4)] // สุ่มสี
      });
      setNewWalletName('');
      setShowAddWallet(false);
      setActiveWalletId(docRef.id); // สร้างเสร็จสลับไปกระเป๋านั้นเลย
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTransaction = async () => {
    if (!amount) return alert("⚠️ ลืมใส่จำนวนเงินครับ");
    if (!category) return alert("⚠️ ลืมเลือกหมวดหมู่ครับ");
    if (!activeWalletId) return alert("⚠️ ไม่พบกระเป๋าเงิน");
    
    setLoading(true);
    try {
      await addDoc(collection(db, "transactions"), {
        amount: parseFloat(amount),
        category,
        walletId: activeWalletId, // หัวใจสำคัญ: ผูกรายการกับกระเป๋า
        timestamp: Date.now(),
        dateDisplay: new Date().toLocaleString('th-TH', { 
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        })
      });
      setAmount(''); 
      setCategory('');
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if(confirm("ลบรายการนี้?")) await deleteDoc(doc(db, "transactions", id));
  };

  // UI Helpers
  const activeWallet = wallets.find(w => w.id === activeWalletId) || {};

  return (
    <div className="flex justify-center min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md bg-white h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden sm:rounded-3xl sm:h-[95vh] sm:my-auto sm:border border-slate-200">
        
        {/* --- 1. Wallet Selector (Header) --- */}
        <div className="bg-slate-50 pt-10 pb-4 z-10 sticky top-0 border-b border-slate-200">
          <div className="px-6 mb-3 flex justify-between items-center">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">My Wallets</span>
            <button 
              onClick={() => setShowAddWallet(true)}
              className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-full flex items-center gap-1 transition-colors"
            >
              <Plus size={12} /> New
            </button>
          </div>
          
          {/* Horizontal Wallet List */}
          <div className="flex gap-4 overflow-x-auto px-6 pb-4 no-scrollbar snap-x">
            {wallets.map(wallet => {
              const isActive = wallet.id === activeWalletId;
              // คำนวณยอดเงินของกระเป๋านี้ (Realtime)
              const balance = transactions
                .filter(t => t.walletId === wallet.id)
                .reduce((sum, t) => sum + t.amount, 0);

              return (
                <button
                  key={wallet.id}
                  onClick={() => setActiveWalletId(wallet.id)}
                  className={`flex-shrink-0 w-64 p-5 rounded-2xl snap-center transition-all duration-300 border text-left relative overflow-hidden group ${
                    isActive 
                    ? 'bg-slate-800 text-white shadow-xl scale-100 ring-2 ring-slate-800 ring-offset-2' 
                    : 'bg-white text-slate-600 shadow-sm border-slate-200 scale-95 hover:scale-[0.97]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/10' : 'bg-slate-100'}`}>
                      <Wallet size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                    </div>
                    {isActive && <div className="px-2 py-1 bg-green-500/20 text-green-300 text-[10px] rounded-full font-bold">ACTIVE</div>}
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className={`text-sm font-medium mb-1 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{wallet.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">{balance.toLocaleString()}</span>
                      <span className="text-sm opacity-60">฿</span>
                    </div>
                  </div>

                  {/* Decorative Circle */}
                  <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-10 ${isActive ? 'bg-white' : 'bg-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* --- 2. Transaction List (Filtered by Wallet) --- */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-48 no-scrollbar bg-white">
          
          {currentWalletTransactions.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-slate-300 gap-3">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                <CreditCard size={32} className="text-slate-200" />
              </div>
              <p className="text-sm font-medium text-slate-400">กระเป๋า "{activeWallet.name}" ยังไม่มีรายการ</p>
              <p className="text-xs text-slate-300">เริ่มจดรายจ่ายแรกกันเลย!</p>
            </div>
          ) : (
            <>
              <div className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <span className="flex items-center gap-2"><History size={14} /> รายการล่าสุด ({activeWallet.name})</span>
                <span className="text-slate-300 text-[10px]">{currentWalletTransactions.length} รายการ</span>
              </div>

              {currentWalletTransactions.map(t => (
                <div key={t.id} className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-all active:scale-[0.98] hover:border-slate-200">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-slate-50 border border-slate-100`}>
                    {categories.find(c => c.name === t.category)?.icon || '💸'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700">{t.category}</p>
                    <p className="text-xs text-slate-400 font-medium">{t.dateDisplay}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-lg">- {t.amount.toLocaleString()}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(t.id); }}
                      className="text-[10px] text-red-300 hover:text-red-500 font-medium py-1 px-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* --- 3. Input Area --- */}
        <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 p-5 pb-8 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
          <div className="flex flex-col gap-5 max-w-sm mx-auto">
            {/* Amount Input */}
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-800 rounded-2xl py-4 pl-6 pr-16 text-3xl font-bold text-slate-800 placeholder-slate-200 outline-none transition-all text-center"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xl pointer-events-none">฿</span>
              
              {/* Wallet Indicator (บอกว่ากำลังจดลงกระเป๋าไหน) */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-[10px] text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">
                <Wallet size={10} /> {activeWallet.name}
              </div>
            </div>

            {/* Category */}
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x px-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.name)}
                  className={`flex-shrink-0 px-4 py-3 rounded-2xl border transition-all snap-start flex items-center gap-2 min-w-[100px] justify-center ${
                    category === cat.name 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-lg scale-[1.02]' 
                    : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSaveTransaction} 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-2xl shadow-lg shadow-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-semibold text-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Plus strokeWidth={3} />}
              {loading ? 'บันทึก...' : `จดลง "${activeWallet.name || '...'}"`}
            </button>
          </div>
        </div>

        {/* --- Modal: Add Wallet --- */}
        {showAddWallet && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">สร้างกระเป๋าใหม่</h3>
                <button onClick={() => setShowAddWallet(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full"><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase ml-1">ชื่อกระเป๋า</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="เช่น เงินสด, บัตรเครดิต KTC"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border-2 border-slate-200 focus:border-slate-800 rounded-xl px-4 py-3 text-lg font-medium text-slate-800 outline-none"
                  />
                </div>
                
                <button 
                  onClick={handleCreateWallet}
                  disabled={!newWalletName.trim() || loading}
                  className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? 'กำลังสร้าง...' : 'สร้างกระเป๋า'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}