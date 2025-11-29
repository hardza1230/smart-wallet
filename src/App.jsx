import React, { useState, useEffect } from 'react';
import { Save, Trash2, Loader2, Wallet, Plus, X, TrendingUp, TrendingDown, Settings, Pencil, ChevronDown, ArrowRight, PieChart, Activity, ArrowRightLeft } from 'lucide-react';

// --- Firebase Config & Init ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

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

// --- Static Data ---
const iconsList = ['💵', '💳', '🏦', '🐷', '🏠', '🚗', '✈️', '🛍️', '🎓', '💼'];
const colorsList = [
  { id: 'blue', class: 'from-blue-600 to-blue-800' },
  { id: 'emerald', class: 'from-emerald-600 to-emerald-800' },
  { id: 'rose', class: 'from-rose-500 to-rose-700' },
  { id: 'purple', class: 'from-purple-600 to-purple-800' },
  { id: 'slate', class: 'from-slate-700 to-slate-900' },
  { id: 'orange', class: 'from-orange-500 to-orange-700' },
];

const expenseCategories = [
  { id: 'food', name: 'อาหาร', icon: '🍔' },
  { id: 'travel', name: 'เดินทาง', icon: '🚕' },
  { id: 'shop', name: 'ช้อปปิ้ง', icon: '🛍️' },
  { id: 'bill', name: 'บิล/น้ำไฟ', icon: '🧾' },
  { id: 'ent', name: 'บันเทิง', icon: '🍿' },
  { id: 'other', name: 'อื่นๆ', icon: '✨' },
];

const incomeCategories = [
  { id: 'salary', name: 'เงินเดือน', icon: '💰' },
  { id: 'bonus', name: 'โบนัส', icon: '🎁' },
  { id: 'sell', name: 'ขายของ', icon: '📈' },
  { id: 'gift', name: 'ได้เงิน', icon: '🧧' },
];

export default function App() {
  // --- Global State ---
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeWalletId, setActiveWalletId] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Modals State ---
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'add-transaction', 'manage-wallet'
  
  // --- Form State (Transaction) ---
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense'); // 'expense', 'income', 'transfer'
  const [transferToWalletId, setTransferToWalletId] = useState(''); // สำหรับโอนเงิน

  // --- Form State (Wallet) ---
  const [walletForm, setWalletForm] = useState({
    id: null,
    name: '',
    initialBalance: '',
    icon: '💵',
    color: 'blue'
  });

  // 1. Load Data
  useEffect(() => {
    // Wallets
    const qW = query(collection(db, "wallets"), orderBy("createdAt", "asc"));
    const unsubW = onSnapshot(qW, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWallets(data);
      if (data.length > 0 && !activeWalletId) setActiveWalletId(data[0].id);
      if (data.length === 0 && !snapshot.metadata.fromCache) {
        addDoc(collection(db, "wallets"), { 
          name: "กระเป๋าหลัก", 
          initialBalance: 0,
          icon: '💵', 
          color: 'blue', 
          createdAt: Date.now() 
        });
      }
    });

    // Transactions
    const qT = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsubT = onSnapshot(qT, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubW(); unsubT(); };
  }, [activeWalletId]);

  // --- Logic ---
  const activeWallet = wallets.find(w => w.id === activeWalletId) || {};
  const currentWalletTransactions = transactions.filter(t => t.walletId === activeWalletId);

  // คำนวณยอดเงิน (Balance)
  const calculateBalance = (wallet) => {
    if (!wallet) return 0;
    const walletTx = transactions.filter(t => t.walletId === wallet.id);
    const totalTx = walletTx.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
    return (parseFloat(wallet.initialBalance) || 0) + totalTx;
  };

  // คำนวณ Dashboard Stats (ไม่รวมรายการ Transfer เพื่อให้เห็นยอดใช้จ่ายจริง)
  const walletIncome = currentWalletTransactions
    .filter(t => t.type === 'income' && !t.isTransfer) 
    .reduce((sum, t) => sum + t.amount, 0);
  
  const walletExpense = currentWalletTransactions
    .filter(t => t.type === 'expense' && !t.isTransfer)
    .reduce((sum, t) => sum + t.amount, 0);

  const spendingPercentage = walletIncome > 0 ? (walletExpense / walletIncome) * 100 : (walletExpense > 0 ? 100 : 0);
  
  let progressBarColor = 'bg-blue-500';
  if (spendingPercentage > 100) progressBarColor = 'bg-red-500';
  else if (spendingPercentage > 80) progressBarColor = 'bg-orange-500';
  else if (spendingPercentage > 50) progressBarColor = 'bg-yellow-500';
  else progressBarColor = 'bg-green-500';


  // --- Actions ---

  const handleSaveTransaction = async () => {
    if (!amount) return alert("⚠️ กรุณากรอกจำนวนเงิน");
    
    setLoading(true);
    const timestamp = Date.now();
    const dateDisplay = new Date().toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});

    try {
      if (type === 'transfer') {
        if (!transferToWalletId) {
           setLoading(false);
           return alert("⚠️ กรุณาเลือกกระเป๋าปลายทาง");
        }
        if (transferToWalletId === activeWalletId) {
           setLoading(false);
           return alert("⚠️ โอนเข้ากระเป๋าตัวเองไม่ได้ครับ");
        }

        const toWalletName = wallets.find(w => w.id === transferToWalletId)?.name || 'Unknown';

        // 1. ตัดเงินออกจากกระเป๋าต้นทาง (Expense)
        await addDoc(collection(db, "transactions"), {
          amount: parseFloat(amount),
          category: `โอนไป ${toWalletName}`,
          type: 'expense',
          isTransfer: true, // Flag บอกว่าเป็นรายการโอน (ไม่นำไปคิดเป็นรายจ่ายจริงในกราฟ)
          walletId: activeWalletId,
          timestamp,
          dateDisplay
        });

        // 2. เพิ่มเงินเข้ากระเป๋าปลายทาง (Income)
        await addDoc(collection(db, "transactions"), {
          amount: parseFloat(amount),
          category: `รับจาก ${activeWallet.name}`,
          type: 'income',
          isTransfer: true, // Flag บอกว่าเป็นรายการโอน
          walletId: transferToWalletId,
          timestamp,
          dateDisplay
        });

      } else {
        // รายรับ-รายจ่าย ปกติ
        if (!category) {
           setLoading(false);
           return alert("⚠️ กรุณาเลือกหมวดหมู่");
        }
        await addDoc(collection(db, "transactions"), {
          amount: parseFloat(amount),
          category,
          type,
          isTransfer: false,
          walletId: activeWalletId,
          timestamp,
          dateDisplay
        });
      }

      setAmount(''); setCategory(''); setTransferToWalletId(''); setViewMode('dashboard');
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  const handleSaveWallet = async () => {
    if (!walletForm.name) return alert("⚠️ ใส่ชื่อกระเป๋าด้วยครับ");
    setLoading(true);
    try {
      const walletData = {
        name: walletForm.name,
        initialBalance: parseFloat(walletForm.initialBalance) || 0,
        icon: walletForm.icon,
        color: walletForm.color,
      };

      if (walletForm.id) {
        await updateDoc(doc(db, "wallets", walletForm.id), walletData);
      } else {
        const newRef = await addDoc(collection(db, "wallets"), {
          ...walletData,
          createdAt: Date.now()
        });
        setActiveWalletId(newRef.id);
      }
      setWalletForm({ id: null, name: '', initialBalance: '', icon: '💵', color: 'blue' });
      setViewMode('dashboard');
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  };

  const handleDeleteTransaction = async (id) => {
    if(confirm("ลบรายการนี้?")) await deleteDoc(doc(db, "transactions", id));
  };

  const openEditWallet = (wallet) => {
    setWalletForm({
      id: wallet.id,
      name: wallet.name,
      initialBalance: wallet.initialBalance,
      icon: wallet.icon,
      color: wallet.color
    });
    setViewMode('manage-wallet');
  };

  const openCreateWallet = () => {
    setWalletForm({ id: null, name: '', initialBalance: '', icon: '💵', color: 'blue' });
    setViewMode('manage-wallet');
  };

  const getGradient = (colorName) => {
    return colorsList.find(c => c.id === colorName)?.class || colorsList[0].class;
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      <div className="w-full max-w-md bg-gray-50 h-[100dvh] flex flex-col relative shadow-2xl sm:rounded-[2rem] sm:h-[95vh] sm:my-auto sm:border border-gray-200 overflow-hidden">
        
        {/* ================= DASHBOARD VIEW ================= */}
        <div className={`flex flex-col h-full transition-all duration-300 ${viewMode === 'dashboard' ? 'opacity-100' : 'opacity-0 pointer-events-none scale-95 absolute inset-0'}`}>
          
          {/* Header */}
          <div className="bg-white pt-10 pb-4 shadow-sm border-b border-gray-100 z-10">
            <div className="px-5 mb-4 flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800">My Wallets</h1>
              <button onClick={openCreateWallet} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
                <Plus size={14} /> New
              </button>
            </div>
            
            {/* Wallet Slider */}
            <div className="flex gap-4 overflow-x-auto px-5 pb-4 no-scrollbar snap-x cursor-grab active:cursor-grabbing">
              {wallets.map(wallet => {
                const isActive = wallet.id === activeWalletId;
                const balance = calculateBalance(wallet);
                return (
                  <div key={wallet.id} className="relative group flex-shrink-0">
                    <button
                      onClick={() => setActiveWalletId(wallet.id)}
                      className={`relative w-72 h-44 p-6 rounded-2xl snap-center transition-all duration-300 text-left overflow-hidden shadow-lg ${
                        isActive 
                        ? `bg-gradient-to-br ${getGradient(wallet.color)} text-white scale-100 ring-4 ring-white` 
                        : 'bg-white text-gray-400 border border-gray-200 scale-95 opacity-70 grayscale'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{wallet.icon}</span>
                          <span className="font-semibold text-lg tracking-wide opacity-90">{wallet.name}</span>
                        </div>
                        {isActive && <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">Active</div>}
                      </div>
                      <div className="mt-auto">
                        <p className="text-xs opacity-70 mb-1">Available Balance</p>
                        <span className="text-3xl font-bold tracking-tight">{balance.toLocaleString()}</span>
                        <span className="text-sm font-medium opacity-60 ml-1">THB</span>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl"></div>
                      <div className="absolute top-[-20px] left-[-20px] w-20 h-20 rounded-full bg-white/10 blur-xl"></div>
                    </button>
                    {isActive && (
                      <button 
                        onClick={() => openEditWallet(wallet)}
                        className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Settings size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Dashboard Summary Section */}
          <div className="px-5 py-4 bg-gray-50/50">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Activity size={14}/> Monthly Overview
                </h3>
                {walletIncome > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${spendingPercentage > 100 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {Math.min(spendingPercentage, 999).toFixed(0)}% Used
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-green-200 rounded-full"><TrendingUp size={12} className="text-green-700"/></div>
                    <span className="text-xs text-green-600 font-semibold">Income</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{walletIncome.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-red-200 rounded-full"><TrendingDown size={12} className="text-red-700"/></div>
                    <span className="text-xs text-red-600 font-semibold">Expense</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">{walletExpense.toLocaleString()}</p>
                </div>
              </div>

              <div className="relative pt-1">
                <div className="flex mb-1 items-center justify-between">
                  <div className="text-[10px] font-semibold text-gray-400">Spending Limit</div>
                  <div className="text-[10px] font-bold text-gray-500">{walletExpense.toLocaleString()} / {walletIncome > 0 ? walletIncome.toLocaleString() : '∞'}</div>
                </div>
                <div className="overflow-hidden h-2.5 mb-1 text-xs flex rounded-full bg-gray-100">
                  <div 
                    style={{ width: `${Math.min(spendingPercentage, 100)}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ease-out ${progressBarColor}`}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="flex-1 overflow-y-auto bg-gray-50 px-4 pt-0 pb-24 no-scrollbar">
             {currentWalletTransactions.length === 0 ? (
               <div className="h-40 flex flex-col items-center justify-center text-gray-300 gap-3 mt-4">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"><Wallet size={24}/></div>
                 <p className="text-sm">No transactions yet</p>
               </div>
             ) : (
               <>
                 <div className="px-1 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Transactions</div>
                 {currentWalletTransactions.map(t => (
                   <div key={t.id} className="bg-white p-3.5 mb-3 rounded-xl border border-gray-100 shadow-[0_2px_5px_rgba(0,0,0,0.02)] flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg ${
                        t.type === 'income' ? 'bg-green-100 text-green-600' : 
                        t.type === 'transfer' ? 'bg-blue-100 text-blue-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {t.type === 'transfer' ? <ArrowRightLeft size={16}/> : (
                            t.type === 'income' 
                            ? incomeCategories.find(c => c.name === t.category)?.icon || '💰'
                            : expenseCategories.find(c => c.name === t.category)?.icon || '💸'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-700 text-sm">{t.category}</span>
                          <span className={`font-bold text-sm ${
                            t.type === 'income' ? 'text-green-600' : 
                            t.type === 'transfer' ? 'text-blue-600' : 'text-red-500'
                          }`}>
                            {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-gray-400">{t.dateDisplay} {t.isTransfer && '(Transfer)'}</span>
                          <button onClick={() => handleDeleteTransaction(t.id)} className="text-[10px] text-red-300 hover:text-red-500">Delete</button>
                        </div>
                      </div>
                   </div>
                 ))}
               </>
             )}
          </div>

          {/* FAB */}
          <button
            onClick={() => { setAmount(''); setCategory(''); setTransferToWalletId(''); setViewMode('add-transaction'); }}
            className="absolute bottom-6 right-6 w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 ring-4 ring-gray-50"
          >
            <Plus size={28} />
          </button>
        </div>

        {/* ================= ADD TRANSACTION MODAL ================= */}
        {viewMode === 'add-transaction' && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <button onClick={() => setViewMode('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={24}/></button>
              <h2 className="text-lg font-bold text-gray-800">New Transaction</h2>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
              {/* Type Switcher (Income / Expense / Transfer) */}
              <div className="bg-gray-100 p-1 rounded-xl flex font-bold text-sm">
                <button onClick={() => setType('expense')} className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}><TrendingDown size={16}/> Expense</button>
                <button onClick={() => setType('transfer')} className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'transfer' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}><ArrowRightLeft size={16}/> Transfer</button>
                <button onClick={() => setType('income')} className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}><TrendingUp size={16}/> Income</button>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Amount</label>
                <div className="relative">
                  <input
                    type="number" inputMode="decimal" autoFocus
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className={`w-full text-4xl font-bold bg-transparent border-b-2 py-2 outline-none transition-colors ${
                      type === 'expense' ? 'text-red-600 border-red-100 focus:border-red-500' : 
                      type === 'transfer' ? 'text-blue-600 border-blue-100 focus:border-blue-500' :
                      'text-green-600 border-green-100 focus:border-green-500'
                    }`}
                  />
                  <span className="absolute right-0 bottom-4 text-gray-400 font-medium">THB</span>
                </div>
              </div>

              {/* Conditional Form: Categories or Transfer Target */}
              {type === 'transfer' ? (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Transfer To Wallet</label>
                  <div className="space-y-3">
                    {wallets.filter(w => w.id !== activeWalletId).map(wallet => (
                      <button
                        key={wallet.id}
                        onClick={() => setTransferToWalletId(wallet.id)}
                        className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                          transferToWalletId === wallet.id 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                           <span className="text-2xl">{wallet.icon}</span>
                           <span className="font-semibold">{wallet.name}</span>
                         </div>
                         {transferToWalletId === wallet.id && <div className="bg-white/20 p-1 rounded-full"><ArrowRight size={16}/></div>}
                      </button>
                    ))}
                    {wallets.length <= 1 && (
                      <div className="text-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">
                        You need at least 2 wallets to transfer.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Category</label>
                  <div className="grid grid-cols-4 gap-3">
                    {(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.name)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${category === cat.name ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-105' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <span className="text-[10px] font-bold">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={handleSaveTransaction}
                disabled={loading}
                className={`w-full h-14 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-white ${
                  type === 'expense' ? 'bg-red-600 shadow-red-200' :
                  type === 'transfer' ? 'bg-blue-600 shadow-blue-200' :
                  'bg-green-600 shadow-green-200'
                }`}
              >
                {loading ? <Loader2 className="animate-spin"/> : (type === 'transfer' ? 'Confirm Transfer' : 'Save Transaction')}
              </button>
            </div>
          </div>
        )}

        {/* ================= WALLET EDITOR MODAL ================= */}
        {viewMode === 'manage-wallet' && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <button onClick={() => setViewMode('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><ArrowRight size={24} className="rotate-180"/></button>
              <h2 className="text-lg font-bold text-gray-800">{walletForm.id ? 'Edit Wallet' : 'New Wallet'}</h2>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Icon</label>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {iconsList.map(icon => (
                    <button key={icon} onClick={() => setWalletForm({...walletForm, icon})} className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all flex-shrink-0 ${walletForm.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Wallet Name</label>
                <input 
                  type="text" value={walletForm.name} onChange={e => setWalletForm({...walletForm, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-800 outline-none focus:border-blue-500"
                  placeholder="e.g. เงินเดือน"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Initial Balance (เงินตั้งต้น)</label>
                <input 
                  type="number" value={walletForm.initialBalance} onChange={e => setWalletForm({...walletForm, initialBalance: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-800 outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
                <p className="text-[10px] text-gray-400 mt-1">* เงินที่มีอยู่จริงในกระเป๋า ณ วันที่เริ่มใช้แอพ</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Theme Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {colorsList.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => setWalletForm({...walletForm, color: c.id})}
                      className={`h-10 rounded-lg bg-gradient-to-br ${c.class} transition-all ${walletForm.color === c.id ? 'ring-2 ring-offset-2 ring-gray-800 scale-105' : 'opacity-70 grayscale'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100">
               <button onClick={handleSaveWallet} disabled={loading} className="w-full bg-blue-600 text-white h-14 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all">
                 {loading ? 'Saving...' : 'Save Wallet'}
               </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}