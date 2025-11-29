import React, { useState, useEffect } from 'react';
import { Save, Trash2, Loader2, Wallet, TrendingDown, History, Plus } from 'lucide-react';

// --- Firebase Config & Init ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

// Config ของคุณฮาร์ท (ใช้ค่าเดิม)
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

// --- หมวดหมู่ (Icon แบบ Emoji เพื่อความเบาเครื่อง) ---
const categories = [
  { id: 'food', name: 'อาหาร', icon: '🍜', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'travel', name: 'เดินทาง', icon: '🚖', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'shopping', name: 'ช้อปปิ้ง', icon: '🛍️', color: 'bg-pink-50 text-pink-600 border-pink-200' },
  { id: 'home', name: 'ของใช้', icon: '🏠', color: 'bg-green-50 text-green-600 border-green-200' },
  { id: 'bill', name: 'บิลต่างๆ', icon: '🧾', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'other', name: 'อื่นๆ', icon: '✨', color: 'bg-slate-50 text-slate-600 border-slate-200' },
];

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // Load Data Realtime
  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Save Function (ตัดส่วนรูปภาพออก)
  const handleSave = async () => {
    // Validation
    if (!amount) return alert("⚠️ ลืมใส่จำนวนเงินครับ");
    if (!category) return alert("⚠️ ลืมเลือกหมวดหมู่ครับ");
    
    setLoading(true);
    try {
      await addDoc(collection(db, "transactions"), {
        amount: parseFloat(amount),
        category,
        timestamp: Date.now(),
        // Format วันที่แบบสั้น: "29 ต.ค. 14:30"
        dateDisplay: new Date().toLocaleString('th-TH', { 
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        })
      });
      // Reset Form
      setAmount(''); 
      setCategory('');
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(confirm("ลบรายการนี้?")) await deleteDoc(doc(db, "transactions", id));
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex justify-center min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <div className="w-full max-w-md bg-white h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden sm:rounded-3xl sm:h-[95vh] sm:my-auto sm:border border-slate-200">
        
        {/* --- 1. Header Section (ยอดรวม) --- */}
        <div className="bg-white px-6 pt-12 pb-6 z-10 sticky top-0 border-b border-slate-50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm font-medium tracking-wide">รายจ่ายรวมทั้งหมด</span>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <Wallet size={16} className="text-slate-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <h1 className="text-5xl font-bold text-slate-800 tracking-tighter">
              {totalAmount.toLocaleString()}
            </h1>
            <span className="text-xl text-slate-400 font-light">฿</span>
          </div>
        </div>

        {/* --- 2. Transaction List (รายการ) --- */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-48 no-scrollbar bg-slate-50/50">
          
          {transactions.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-300 gap-2 mt-10">
              <History size={48} strokeWidth={1} />
              <p className="text-sm font-light">ยังไม่มีรายการวันนี้</p>
            </div>
          ) : (
            <>
              <div className="px-2 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingDown size={14} /> รายการล่าสุด
              </div>
              {transactions.map(t => (
                <div key={t.id} className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-4 transition-all active:scale-[0.98]">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-slate-50`}>
                    {categories.find(c => c.name === t.category)?.icon || '💸'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700">{t.category}</p>
                    <p className="text-xs text-slate-400 font-medium">{t.dateDisplay}</p>
                  </div>

                  {/* Amount & Delete */}
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-lg">- {t.amount.toLocaleString()}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
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

        {/* --- 3. Input Area (ส่วนกรอกข้อมูล) --- */}
        <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 p-5 pb-8 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
          <div className="flex flex-col gap-5 max-w-sm mx-auto">
            
            {/* Amount Input */}
            <div className="relative group">
              <input
                type="number"
                inputMode="decimal" // คีย์บอร์ดมือถือจะขึ้นเป็นตัวเลขทันที
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 rounded-2xl py-4 pl-6 pr-16 text-3xl font-bold text-slate-800 placeholder-slate-200 outline-none transition-all text-center"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xl pointer-events-none">฿</span>
            </div>

            {/* Category Selector (Horizontal Scroll) */}
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
              onClick={handleSave} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white h-14 rounded-2xl shadow-lg shadow-blue-200/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-semibold text-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Plus strokeWidth={3} />}
              {loading ? 'บันทึก...' : 'จดรายการ'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}