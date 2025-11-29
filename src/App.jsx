import React, { useState, useEffect } from 'react';
import { Save, Wallet, Plus, X, TrendingUp, TrendingDown, Settings, ArrowRight, Activity, ArrowRightLeft, Target, Zap, AlertCircle, CheckCircle2, Edit3, Loader2 } from 'lucide-react';

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
const iconsList = ['💵', '💳', '🏦', '🐷', '🏠', '🚗', '✈️', '🛍️', '🎓', '💼', '💄', '💅', '🎮', '⚽', '🍔', '☕'];
const colorsList = [
  { id: 'blue', class: 'from-blue-600 to-blue-800' },
  { id: 'emerald', class: 'from-emerald-600 to-emerald-800' },
  { id: 'rose', class: 'from-rose-400 to-rose-600' },
  { id: 'purple', class: 'from-purple-500 to-purple-700' },
  { id: 'slate', class: 'from-slate-700 to-slate-900' },
  { id: 'orange', class: 'from-orange-500 to-orange-700' },
  { id: 'pink', class: 'from-pink-400 to-pink-600' },
];

const expenseCategories = [
  { id: 'food', name: 'อาหาร', icon: '🍔' },
  { id: 'travel', name: 'เดินทาง', icon: '🚕' },
  { id: 'shop', name: 'ช้อปปิ้ง', icon: '🛍️' },
  { id: 'bill', name: 'บิล/น้ำไฟ', icon: '🧾' },
  { id: 'ent', name: 'บันเทิง', icon: '🍿' },
  { id: 'beauty', name: 'ความงาม', icon: '💅' },
  { id: 'other', name: 'อื่นๆ', icon: '✨' },
];

const incomeCategories = [
  { id: 'salary', name: 'เงินเดือน', icon: '💰' },
  { id: 'bonus', name: 'โบนัส', icon: '🎁' },
  { id: 'sell', name: 'ขายของ', icon: '📈' },
  { id: 'gift', name: 'ได้เงิน', icon: '🧧' },
];

const profiles = {
  hart: { name: 'Hart', theme: 'blue', bg: 'bg-slate-50', primary: 'bg-blue-600', text: 'text-blue-900', icon: '👨🏻' },
  jah: { name: 'Jah', theme: 'rose', bg: 'bg-pink-50', primary: 'bg-rose-400', text: 'text-pink-900', icon: '👩🏻' },
  family: { name: 'Family', theme: 'slate', bg: 'bg-gray-50', primary: 'bg-slate-800', text: 'text-slate-900', icon: '🏠' }
};

// --- Particles Component ---
const Particles = ({ active, type }) => {
  if (!active) return null;
  const particles = Array.from({ length: 20 });
  
  let colorClass = 'from-red-500 to-orange-500';
  let animName = 'animate-fly-up';
  
  if (type === 'income') {
    colorClass = 'from-green-400 to-yellow-400';
    animName = 'animate-fly-down';
  } else if (type === 'transfer') {
    colorClass = 'from-blue-400 to-cyan-400';
    animName = 'animate-fly-across';
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[70] overflow-hidden">
      {particles.map((_, i) => (
        <div
          key={i}
          className={`absolute w-4 h-4 rounded-full bg-gradient-to-r shadow-md ${colorClass} ${animName}`}
          style={{
            left: '50%',
            top: '50%',
            '--tx': `${(Math.random() - 0.5) * 350}px`,
            '--ty': type === 'income' ? `${window.innerHeight * 0.4}px` : `-${window.innerHeight * 0.4}px`, 
            '--tr': type === 'transfer' ? `${(Math.random() > 0.5 ? 1 : -1) * window.innerWidth}px` : '0px',
            '--d': `${Math.random() * 0.3}s`,
            '--s': `${0.8 + Math.random() * 1.2}`
          }}
        />
      ))}
    </div>
  );
};

// --- Toast Component ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 whitespace-nowrap ${type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={18} className="text-green-400"/> : <AlertCircle size={18} className="text-red-200"/>}
      <span className="text-sm font-medium font-sans">{message}</span>
    </div>
  );
};

export default function App() {
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [activeWalletId, setActiveWalletId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState('hart');
  const [customSpaceNames, setCustomSpaceNames] = useState({});
  const [viewMode, setViewMode] = useState('dashboard');
  const [isFabOpen, setIsFabOpen] = useState(false);
  
  const [animState, setAnimState] = useState({ active: false, type: 'expense', key: 0 });
  const [toast, setToast] = useState(null);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [transferToWalletId, setTransferToWalletId] = useState('');

  const [walletForm, setWalletForm] = useState({ id: null, name: '', initialBalance: '', icon: '💵', color: 'blue', owner: 'hart' });
  const [budgetForm, setBudgetForm] = useState({ id: null, category: '', limit: '' });

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Styles Injection
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fly-up { 0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; } 20% { opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
      @keyframes fly-down { 0% { transform: translate(-50%, -150px) scale(0.5); opacity: 0; } 20% { opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(1.5); opacity: 0; } }
      @keyframes fly-across { 0% { transform: translate(0, 0) scale(0.5); opacity: 0; } 20% { opacity: 1; } 100% { transform: translate(var(--tr), var(--tx)) scale(0); opacity: 0; } }
      .animate-fly-up { animation: fly-up 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; animation-delay: var(--d); }
      .animate-fly-down { animation: fly-down 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; animation-delay: var(--d); }
      .animate-fly-across { animation: fly-across 0.8s ease-out forwards; animation-delay: var(--d); }
    `;
    document.head.appendChild(style);
    const savedNames = localStorage.getItem('customSpaceNames');
    if (savedNames) setCustomSpaceNames(JSON.parse(savedNames));
    return () => document.head.removeChild(style);
  }, []);

  // Load Data
  useEffect(() => {
    const unsubW = onSnapshot(query(collection(db, "wallets"), orderBy("createdAt", "asc")), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWallets(data);
      if (data.length === 0 && !snapshot.metadata.fromCache) {
        addDoc(collection(db, "wallets"), { name: "Hart Wallet", initialBalance: 0, icon: '💵', color: 'blue', owner: 'hart', createdAt: Date.now() });
      }
    });
    const unsubT = onSnapshot(query(collection(db, "transactions"), orderBy("timestamp", "desc")), (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubB = onSnapshot(query(collection(db, "budgets")), (snapshot) => {
      setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubW(); unsubT(); unsubB(); };
  }, []);

  const visibleWallets = wallets.filter(w => currentProfile === 'family' ? true : (w.owner === currentProfile || !w.owner));
  
  useEffect(() => {
    if (visibleWallets.length > 0 && !visibleWallets.find(w => w.id === activeWalletId)) {
      setActiveWalletId(visibleWallets[0].id);
    } else if (visibleWallets.length === 0) {
      setActiveWalletId(null);
    }
  }, [currentProfile, wallets]);

  const activeWallet = visibleWallets.find(w => w.id === activeWalletId) || {};
  const currentWalletTransactions = transactions.filter(t => t.walletId === activeWalletId);

  const calculateBalance = (wallet) => {
    if (!wallet) return 0;
    const walletTx = transactions.filter(t => t.walletId === wallet.id);
    const totalTx = walletTx.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
    return (parseFloat(wallet.initialBalance) || 0) + totalTx;
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const profileBudgets = budgets.filter(b => currentProfile === 'family' ? true : (b.owner === currentProfile));

  const getCategorySpent = (catName) => {
    return transactions
      .filter(t => {
        const txDate = new Date(t.timestamp);
        return t.category === catName && t.type === 'expense' && !t.isTransfer && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear && visibleWallets.some(w => w.id === t.walletId);
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const theme = profiles[currentProfile];
  const displaySpaceName = customSpaceNames[currentProfile] || `${theme.name}'s Space`;

  const handleEditSpaceName = () => {
    const newName = prompt("ตั้งชื่อ Space ของคุณ:", displaySpaceName);
    if (newName && newName.trim()) {
      const updatedNames = { ...customSpaceNames, [currentProfile]: newName };
      setCustomSpaceNames(updatedNames);
      localStorage.setItem('customSpaceNames', JSON.stringify(updatedNames));
    }
  };

  const handleOpenTransaction = (selectedType) => {
    setType(selectedType); setAmount(''); setCategory(''); setTransferToWalletId('');
    setViewMode('add-transaction'); setIsFabOpen(false);
  };

  const triggerAnimation = (animType) => {
    setAnimState({ active: true, type: animType, key: Date.now() });
    setTimeout(() => setAnimState(prev => ({ ...prev, active: false })), 1500);
  };

  const handleSaveTransaction = async () => {
    if (!amount) return showToast("กรุณากรอกจำนวนเงิน", "error");
    setLoading(true);
    const timestamp = Date.now();
    const dateDisplay = new Date().toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});

    try {
      if (type === 'transfer') {
        if (!transferToWalletId || transferToWalletId === activeWalletId) { setLoading(false); return showToast("เลือกกระเป๋าปลายทางให้ถูกต้อง", "error"); }
        const toWalletName = wallets.find(w => w.id === transferToWalletId)?.name || 'Unknown';
        await addDoc(collection(db, "transactions"), { amount: parseFloat(amount), category: `โอนไป ${toWalletName}`, type: 'expense', isTransfer: true, walletId: activeWalletId, timestamp, dateDisplay });
        await addDoc(collection(db, "transactions"), { amount: parseFloat(amount), category: `รับจาก ${activeWallet.name}`, type: 'income', isTransfer: true, walletId: transferToWalletId, timestamp, dateDisplay });
        triggerAnimation('transfer');
      } else {
        if (!category) { setLoading(false); return showToast("กรุณาเลือกหมวดหมู่", "error"); }
        await addDoc(collection(db, "transactions"), { amount: parseFloat(amount), category, type, isTransfer: false, walletId: activeWalletId, timestamp, dateDisplay });
        triggerAnimation(type);
      }
      setAmount(''); setCategory(''); setTransferToWalletId(''); setViewMode('dashboard');
      showToast("บันทึกสำเร็จ!");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  const handleSaveWallet = async () => {
    if (!walletForm.name) return showToast("ใส่ชื่อกระเป๋าด้วยครับ", "error");
    setLoading(true);
    try {
      const walletData = { name: walletForm.name, initialBalance: parseFloat(walletForm.initialBalance) || 0, icon: walletForm.icon, color: walletForm.color, owner: walletForm.owner };
      if (walletForm.id) await updateDoc(doc(db, "wallets", walletForm.id), walletData);
      else { const newRef = await addDoc(collection(db, "wallets"), { ...walletData, createdAt: Date.now() }); setActiveWalletId(newRef.id); }
      setWalletForm({ id: null, name: '', initialBalance: '', icon: '💵', color: 'blue', owner: currentProfile }); setViewMode('dashboard');
      showToast("บันทึกกระเป๋าเรียบร้อย");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  const handleSaveBudget = async () => {
    if (!budgetForm.category || !budgetForm.limit) return showToast("กรอกข้อมูลให้ครบถ้วน", "error");
    setLoading(true);
    try {
      const budgetData = { category: budgetForm.category, limit: parseFloat(budgetForm.limit), owner: currentProfile };
      if (budgetForm.id) await updateDoc(doc(db, "budgets", budgetForm.id), budgetData);
      else await addDoc(collection(db, "budgets"), budgetData);
      setBudgetForm({ id: null, category: '', limit: '' }); setViewMode('dashboard');
      showToast("ตั้งเป้าหมายเรียบร้อย!");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  const handleDeleteTransaction = async (id) => { if(confirm("ต้องการลบรายการนี้?")) await deleteDoc(doc(db, "transactions", id)); };
  const handleDeleteBudget = async (id) => { if(confirm("ต้องการลบงบประมาณนี้?")) await deleteDoc(doc(db, "budgets", id)); };

  const openEditWallet = (wallet) => { setWalletForm({ id: wallet.id, name: wallet.name, initialBalance: wallet.initialBalance, icon: wallet.icon, color: wallet.color, owner: wallet.owner || 'hart' }); setViewMode('manage-wallet'); };
  const openCreateWallet = () => { 
    const defaultOwner = currentProfile === 'family' ? 'hart' : currentProfile;
    const defaultColor = defaultOwner === 'jah' ? 'rose' : 'blue';
    setWalletForm({ id: null, name: '', initialBalance: '', icon: '💵', color: defaultColor, owner: defaultOwner }); setViewMode('manage-wallet'); 
  };
  const openCreateBudget = () => { setBudgetForm({ id: null, category: '', limit: '' }); setViewMode('manage-budget'); };
  const openEditBudget = (b) => { setBudgetForm({ id: b.id, category: b.category, limit: b.limit }); setViewMode('manage-budget'); };

  const getGradient = (colorName) => { return colorsList.find(c => c.id === colorName)?.class || colorsList[0].class; };

  return (
    <div className={`flex justify-center min-h-screen font-sans transition-colors duration-500 ${theme.bg} text-gray-900`}>
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative shadow-2xl sm:my-auto sm:border border-gray-200">
        
        <Particles key={animState.key} active={animState.active} type={animState.type} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* HEADER */}
        <div className="bg-white/95 backdrop-blur-md pt-8 pb-3 px-5 z-40 sticky top-0 border-b border-gray-100 flex justify-between items-center shadow-sm">
           <div className="flex items-center gap-2 cursor-pointer group" onClick={handleEditSpaceName}>
             <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-inner bg-gray-50 border border-gray-100`}>
               {theme.icon}
             </div>
             <div>
               <h1 className={`text-base font-bold leading-tight ${theme.text} flex items-center gap-1`}>
                 {displaySpaceName} 
                 <Edit3 size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors"/>
               </h1>
             </div>
           </div>
           <div className="flex bg-gray-100 p-1 rounded-full">
             {Object.keys(profiles).map((key) => (
               <button key={key} onClick={() => setCurrentProfile(key)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${currentProfile === key ? 'bg-white shadow-sm scale-105' : 'text-gray-400'}`}>{profiles[key].icon}</button>
             ))}
           </div>
        </div>

        {/* CONTENT */}
        <div className={`flex-1 flex flex-col transition-all duration-300 pb-24 ${viewMode === 'dashboard' ? 'opacity-100' : 'opacity-0 hidden'}`}>
          
          {/* Wallets */}
          <div className="pt-4 pb-2">
            <div className="px-5 mb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">กระเป๋าเงิน</span>
              {currentProfile !== 'family' && (
                <button onClick={openCreateWallet} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1 border border-gray-200"><Plus size={10} /> เพิ่ม</button>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar snap-x cursor-grab active:cursor-grabbing">
              {visibleWallets.length === 0 ? (
                <div className="w-full h-28 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 text-xs">ไม่พบกระเป๋าเงิน</div>
              ) : visibleWallets.map(wallet => {
                  const isActive = wallet.id === activeWalletId;
                  const balance = calculateBalance(wallet);
                  return (
                    <div key={wallet.id} className="relative group flex-shrink-0">
                      <button onClick={() => setActiveWalletId(wallet.id)} className={`relative w-64 h-32 p-4 rounded-2xl snap-center transition-all duration-300 text-left overflow-hidden shadow-md ${isActive ? `bg-gradient-to-br ${getGradient(wallet.color)} text-white ring-2 ring-offset-1 ring-${wallet.color}-400` : 'bg-white text-gray-500 border border-gray-100'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-2xl drop-shadow-sm">{wallet.icon}</span>
                          {isActive && <span className="bg-white/20 px-2 py-0.5 rounded text-[9px] text-white font-bold backdrop-blur-sm">ใช้งานอยู่</span>}
                        </div>
                        <div className="mt-auto">
                          <p className={`text-[10px] uppercase font-bold mb-0.5 ${isActive ? 'opacity-80' : 'opacity-40'}`}>{wallet.name}</p>
                          <span className="text-2xl font-bold tracking-tight">{balance.toLocaleString()}</span>
                        </div>
                        {isActive && <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>}
                      </button>
                      {isActive && currentProfile !== 'family' && <button onClick={() => openEditWallet(wallet)} className="absolute top-2 right-2 p-1.5 bg-black/10 rounded-full text-white/80 hover:bg-black/20"><Settings size={12} /></button>}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Budgets */}
          <div className="px-5 py-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Target size={12}/> เป้าหมายงบ (เดือนนี้)</span>
              {currentProfile !== 'family' && <button onClick={openCreateBudget} className="text-[10px] text-blue-500 font-bold flex items-center gap-1">+ ตั้งเป้า</button>}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
              {profileBudgets.length === 0 ? (
                <button onClick={openCreateBudget} className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-50 transition-colors">
                  <Plus size={20} />
                  <span className="text-xs">เริ่มตั้งงบประมาณแรกของคุณ</span>
                </button>
              ) : profileBudgets.map(b => {
                const spent = getCategorySpent(b.category);
                const percent = Math.min((spent / b.limit) * 100, 100);
                const isOver = spent > b.limit;
                return (
                  <div key={b.id} onClick={() => openEditBudget(b)} className="flex-shrink-0 w-40 bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer snap-start">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{expenseCategories.find(c => c.name === b.category)?.icon || '💸'}</span>
                        <span className="text-xs font-bold truncate w-20">{b.category}</span>
                      </div>
                      {isOver && <AlertCircle size={14} className="text-red-500 animate-pulse"/>}
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div style={{ width: `${percent}%` }} className={`h-full rounded-full ${isOver ? 'bg-red-500' : percent > 80 ? 'bg-orange-500' : 'bg-green-500'} transition-all duration-500`}></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className={`text-xs font-bold ${isOver ? 'text-red-600' : 'text-gray-700'}`}>{spent.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400">/ {b.limit.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions */}
          <div className="px-5 pt-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Activity size={12}/> รายการล่าสุด</h3>
            {currentWalletTransactions.length === 0 ? (
               <div className="py-10 flex flex-col items-center justify-center text-gray-300 gap-2 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                 <Wallet size={24} className="opacity-50"/><p className="text-xs">ยังไม่มีรายการ</p>
               </div>
            ) : (
               <div className="space-y-3">
                 {currentWalletTransactions.map(t => (
                   <div key={t.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.01)] flex items-center gap-3 active:scale-[0.99] transition-transform">
                      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xl ${t.type === 'income' ? 'bg-green-50' : t.type === 'transfer' ? 'bg-blue-50' : 'bg-red-50'}`}>
                        {t.type === 'transfer' ? <ArrowRightLeft size={16} className="text-blue-500"/> : (t.type === 'income' ? (incomeCategories.find(c => c.name === t.category)?.icon || '💰') : (expenseCategories.find(c => c.name === t.category)?.icon || '💸'))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-gray-700 text-sm truncate">{t.category}</span>
                          <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : t.type === 'transfer' ? 'text-blue-600' : 'text-red-500'}`}>{t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mt-0.5">
                          <span className="text-[10px] text-gray-400">{t.dateDisplay}</span>
                          {currentProfile !== 'family' && <button onClick={() => handleDeleteTransaction(t.id)} className="text-[10px] text-red-300 hover:text-red-500 px-2">ลบ</button>}
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* FAB (Fixed Overlap Issue) */}
        {currentProfile !== 'family' && viewMode === 'dashboard' && (
          <>
            {isFabOpen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-in fade-in" onClick={() => setIsFabOpen(false)}></div>}
            <div className={`fixed bottom-28 right-6 flex flex-col gap-3 z-50 items-end transition-all duration-300 ${isFabOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
              <div className="flex items-center gap-3"><span className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold shadow text-gray-600">รายรับ</span><button onClick={() => handleOpenTransaction('income')} className="w-10 h-10 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center"><TrendingUp size={18} /></button></div>
              <div className="flex items-center gap-3"><span className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold shadow text-gray-600">โอนเงิน</span><button onClick={() => handleOpenTransaction('transfer')} className="w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center"><ArrowRightLeft size={18} /></button></div>
              <div className="flex items-center gap-3"><span className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold shadow text-gray-600">รายจ่าย</span><button onClick={() => handleOpenTransaction('expense')} className="w-10 h-10 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center"><TrendingDown size={18} /></button></div>
            </div>
            <button onClick={() => setIsFabOpen(!isFabOpen)} className={`fixed bottom-8 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-50 ring-4 ring-white ${isFabOpen ? 'bg-gray-200 text-gray-600 rotate-45' : `${theme.primary} text-white hover:scale-105 active:scale-95`}`}><Plus size={28} /></button>
          </>
        )}

        {/* MODAL: ADD TRANSACTION (Fixed Background) */}
        {viewMode === 'add-transaction' && (
          <div className="fixed inset-0 bg-gray-50 z-[60] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
              <button onClick={() => setViewMode('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={24}/></button>
              <h2 className="text-base font-bold text-gray-800">เพิ่มรายการใหม่</h2>
              <div className="w-10"></div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Content here remains same, but bg is gray-50 now */}
              <div className="bg-white p-1 rounded-xl flex font-bold text-xs mb-6 shadow-sm border border-gray-100">
                <button onClick={() => setType('expense')} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'expense' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-400'}`}><TrendingDown size={14}/> รายจ่าย</button>
                <button onClick={() => setType('transfer')} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'transfer' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400'}`}><ArrowRightLeft size={14}/> โอนเงิน</button>
                <button onClick={() => setType('income')} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'income' ? 'bg-green-50 text-green-600 shadow-sm' : 'text-gray-400'}`}><TrendingUp size={14}/> รายรับ</button>
              </div>
              <div className="mb-6">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">จำนวนเงิน</label>
                <div className="relative"><input type="number" inputMode="decimal" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={`w-full text-5xl font-bold bg-transparent border-b-2 py-2 outline-none transition-colors ${type === 'expense' ? 'text-red-600 border-red-200 focus:border-red-500' : type === 'transfer' ? 'text-blue-600 border-blue-200 focus:border-blue-500' : 'text-green-600 border-green-200 focus:border-green-500'}`}/><span className="absolute right-0 bottom-4 text-gray-400 font-medium text-lg">บาท</span></div>
              </div>
              {type === 'transfer' ? (
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">ไปยังกระเป๋า</label>
                   <div className="space-y-2">{wallets.filter(w => w.id !== activeWalletId).map(w => (<button key={w.id} onClick={() => setTransferToWalletId(w.id)} className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all bg-white ${transferToWalletId === w.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}><div className="flex items-center gap-3"><span className="text-xl">{w.icon}</span><span className="font-semibold text-sm">{w.name}</span></div>{transferToWalletId === w.id && <div className="bg-blue-100 p-1 rounded-full text-blue-600"><ArrowRight size={14}/></div>}</button>))}</div>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">เลือกหมวดหมู่</label>
                  <div className="grid grid-cols-4 gap-3">{(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (<button key={cat.id} onClick={() => setCategory(cat.name)} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all bg-white ${category === cat.name ? 'border-gray-800 bg-gray-50 shadow-md transform scale-105' : 'border-gray-200 hover:border-gray-300'}`}><span className="text-2xl">{cat.icon}</span><span className="text-[10px] font-bold">{cat.name}</span></button>))}</div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-white">
              <button onClick={handleSaveTransaction} disabled={loading} className={`w-full h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-white ${type === 'expense' ? 'bg-red-600 shadow-red-200' : type === 'transfer' ? 'bg-blue-600 shadow-blue-200' : 'bg-green-600 shadow-green-200'}`}>{loading ? <Loader2 className="animate-spin"/> : (type === 'transfer' ? 'โอนเงิน' : 'บันทึก')}</button>
            </div>
          </div>
        )}

        {/* MODAL: MANAGE WALLET */}
        {viewMode === 'manage-wallet' && (
          <div className="fixed inset-0 bg-gray-50 z-[60] flex flex-col animate-in slide-in-from-right duration-200">
             <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white"><button onClick={() => setViewMode('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><ArrowRight size={24} className="rotate-180"/></button><h2 className="text-base font-bold text-gray-800">{walletForm.id ? 'แก้ไขกระเป๋า' : 'สร้างกระเป๋าใหม่'}</h2><div className="w-10"></div></div>
            <div className="flex-1 p-6 space-y-5 overflow-y-auto">
              <div className="bg-white p-3 rounded-xl flex items-center gap-3 border border-gray-200 shadow-sm"><div className="p-2 bg-gray-50 rounded-full">{profiles[walletForm.owner]?.icon}</div><div><p className="text-[10px] text-gray-400 font-bold uppercase">เจ้าของ</p><p className="font-semibold text-gray-800 text-sm">{profiles[walletForm.owner]?.name}</p></div></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ไอคอน</label><div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">{iconsList.map(icon => (<button key={icon} onClick={() => setWalletForm({...walletForm, icon})} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 transition-all flex-shrink-0 bg-white ${walletForm.icon === icon ? `border-${theme.theme}-500 bg-${theme.theme}-50` : 'border-gray-200'}`}>{icon}</button>))}</div></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ชื่อกระเป๋า</label><input type="text" value={walletForm.name} onChange={e => setWalletForm({...walletForm, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-800 outline-none focus:border-blue-500" placeholder="เช่น เงินเดือน"/></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">เงินตั้งต้น</label><input type="number" value={walletForm.initialBalance} onChange={e => setWalletForm({...walletForm, initialBalance: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-800 outline-none focus:border-blue-500" placeholder="0.00"/></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">สีธีม</label><div className="grid grid-cols-7 gap-2">{colorsList.map(c => (<button key={c.id} onClick={() => setWalletForm({...walletForm, color: c.id})} className={`h-8 rounded-lg bg-gradient-to-br ${c.class} transition-all ${walletForm.color === c.id ? 'ring-2 ring-offset-2 ring-gray-800 scale-105' : 'opacity-70 grayscale'}`}/>))}</div></div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-white"><button onClick={handleSaveWallet} disabled={loading} className={`w-full ${theme.primary} text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all`}>{loading ? 'กำลังบันทึก...' : 'บันทึกกระเป๋า'}</button></div>
          </div>
        )}

        {/* MODAL: MANAGE BUDGET */}
        {viewMode === 'manage-budget' && (
          <div className="fixed inset-0 bg-gray-50 z-[60] flex flex-col animate-in slide-in-from-right duration-200">
             <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
               <button onClick={() => setViewMode('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><ArrowRight size={24} className="rotate-180"/></button>
               <h2 className="text-base font-bold text-gray-800">{budgetForm.id ? 'แก้ไขงบ' : 'ตั้งเป้าใหม่'}</h2>
               {budgetForm.id ? <button onClick={() => handleDeleteBudget(budgetForm.id)} className="text-red-500"><Trash2 size={20}/></button> : <div className="w-5"></div>}
             </div>
             <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block">เลือกหมวดหมู่</label>
                  <div className="grid grid-cols-4 gap-3">
                    {expenseCategories.map(cat => (
                      <button key={cat.id} onClick={() => setBudgetForm({...budgetForm, category: cat.name})} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all bg-white ${budgetForm.category === cat.name ? `bg-${theme.theme}-600 text-white shadow-lg scale-105 border-${theme.theme}-600` : 'border-gray-200 hover:border-gray-300'}`}>
                        <span className="text-2xl">{cat.icon}</span><span className="text-[10px] font-bold">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">งบต่อเดือน (บาท)</label>
                  <input type="number" autoFocus value={budgetForm.limit} onChange={e => setBudgetForm({...budgetForm, limit: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-xl font-bold text-gray-800 outline-none focus:border-blue-500" placeholder="เช่น 5000"/>
                </div>
             </div>
             <div className="p-4 border-t border-gray-200 bg-white">
               <button onClick={handleSaveBudget} disabled={loading} className={`w-full ${theme.primary} text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all`}>{loading ? 'กำลังบันทึก...' : 'บันทึกเป้าหมาย'}</button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}