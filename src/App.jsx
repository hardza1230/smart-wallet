import React, { useState, useEffect, useMemo } from 'react';
import { Save, Wallet, Plus, X, TrendingUp, TrendingDown, Settings, ArrowRight, Activity, ArrowRightLeft, Target, Zap, AlertCircle, CheckCircle2, Edit3, Loader2, Trash2, BarChart3, Home, PieChart, CheckSquare, Share2, UserPlus, Flag, RefreshCw, Undo2, CalendarClock, Bell, Palette } from 'lucide-react';

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
const iconsList = ['💵', '💳', '🏦', '🐷', '🏠', '🚗', '✈️', '🛍️', '🎓', '💼', '💄', '💅', '🎮', '⚽', '🍔', '☕', '💡', '💧', '📶'];

// Bank Presets (Thai Banks) - Updated Colors
const bankPresets = [
  { name: 'KBank', color: '#138f2d', icon: 'K' },
  { name: 'SCB', color: '#4e2583', icon: 'SCB' },
  { name: 'BBL', color: '#1e4598', icon: 'BBL' },
  { name: 'KTB', color: '#00a6e6', icon: 'KTB' },
  { name: 'Krungsri', color: '#fec43b', icon: 'BAY' }, // Yellow might need dark text handling, but keeping white for consistency logic first
  { name: 'TTB', color: '#0050f0', icon: 'ttb' },
  { name: 'GSB', color: '#eb198d', icon: 'GSB' },
];

const expenseCategories = [
  { id: 'food', name: 'อาหาร', icon: '🍔', color: '#ef4444' },
  { id: 'travel', name: 'เดินทาง', icon: '🚕', color: '#3b82f6' },
  { id: 'shop', name: 'ช้อปปิ้ง', icon: '🛍️', color: '#a855f7' },
  { id: 'bill', name: 'บิล/น้ำไฟ', icon: '🧾', color: '#eab308' },
  { id: 'ent', name: 'บันเทิง', icon: '🍿', color: '#ec4899' },
  { id: 'beauty', name: 'ความงาม', icon: '💅', color: '#f43f5e' },
  { id: 'other', name: 'อื่นๆ', icon: '✨', color: '#64748b' },
];

const incomeCategories = [
  { id: 'salary', name: 'เงินเดือน', icon: '💰' },
  { id: 'bonus', name: 'โบนัส', icon: '🎁' },
  { id: 'sell', name: 'ขายของ', icon: '📈' },
  { id: 'gift', name: 'ได้เงิน', icon: '🧧' },
];

// Profiles
const profiles = {
  hart: { name: 'Heart', theme: 'blue', bg: 'bg-blue-100', primary: 'bg-blue-800', text: 'text-blue-950', icon: '👨🏻' },
  jah: { name: 'Jah', theme: 'rose', bg: 'bg-rose-100', primary: 'bg-rose-700', text: 'text-rose-950', icon: '👩🏻' },
  family: { name: 'Family', theme: 'slate', bg: 'bg-slate-200', primary: 'bg-slate-800', text: 'text-slate-900', icon: '🏠' }
};

// --- Custom Components ---

const SimpleDonutChart = ({ income, expense }) => {
  const total = income + expense;
  if (total === 0) return (
    <div className="h-32 flex items-center justify-center text-gray-400 bg-white/50 rounded-full w-32 mx-auto border-4 border-gray-200">
      <span className="text-[10px]">ไม่มีข้อมูล</span>
    </div>
  );

  const incomePercent = (income / total) * 100;
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const incomeStroke = (incomePercent / 100) * circumference;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 42 42" className="transform -rotate-90 w-full h-full">
        <circle cx="21" cy="21" r={radius} fill="transparent" stroke="#f87171" strokeWidth="6" />
        <circle cx="21" cy="21" r={radius} fill="transparent" stroke="#4ade80" strokeWidth="6" 
          strokeDasharray={`${incomeStroke} ${circumference}`} strokeDashoffset="0" 
          strokeLinecap="round" 
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[9px] text-gray-500 font-bold uppercase">คงเหลือ</span>
        <span className={`text-sm font-bold ${income >= expense ? 'text-green-700' : 'text-red-600'}`}>
          {(income - expense).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const CategoryBar = ({ category, amount, total, color, icon }) => {
  const percent = Math.min((amount / total) * 100, 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="font-semibold text-gray-700">{category}</span>
        </div>
        <div className="text-right">
          <span className="font-bold text-gray-800">{amount.toLocaleString()}</span>
          <span className="text-[10px] text-gray-500 ml-1">({percent.toFixed(0)}%)</span>
        </div>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div style={{ width: `${percent}%`, backgroundColor: color }} className="h-full rounded-full transition-all duration-500 ease-out"></div>
      </div>
    </div>
  );
};

const Particles = ({ active, type }) => {
  if (!active) return null;
  const particles = Array.from({ length: 20 });
  let colorClass = 'from-red-500 to-orange-500';
  let animName = 'animate-fly-up';
  if (type === 'income') { colorClass = 'from-green-400 to-yellow-400'; animName = 'animate-fly-down'; }
  else if (type === 'transfer') { colorClass = 'from-blue-400 to-cyan-400'; animName = 'animate-fly-across'; }

  return (
    <div className="fixed inset-0 pointer-events-none z-[70] overflow-hidden">
      {particles.map((_, i) => (
        <div key={i} className={`absolute w-4 h-4 rounded-full bg-gradient-to-r shadow-md ${colorClass} ${animName}`}
          style={{
            left: '50%', top: '50%',
            '--tx': `${(Math.random() - 0.5) * 350}px`, '--ty': type === 'income' ? `${window.innerHeight * 0.4}px` : `-${window.innerHeight * 0.4}px`, 
            '--tr': type === 'transfer' ? `${(Math.random() > 0.5 ? 1 : -1) * window.innerWidth}px` : '0px',
            '--d': `${Math.random() * 0.3}s`, '--s': `${0.8 + Math.random() * 1.2}`
          }}
        />
      ))}
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 whitespace-nowrap ${type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={18} className="text-green-400"/> : <AlertCircle size={18} className="text-red-200"/>}
      <span className="text-sm font-medium font-sans">{message}</span>
    </div>
  );
};

export default function App() {
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [bills, setBills] = useState([]);
  const [activeWalletId, setActiveWalletId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState('hart');
  const [customSpaceNames, setCustomSpaceNames] = useState({});
  const [viewMode, setViewMode] = useState('dashboard'); 
  const [isFabOpen, setIsFabOpen] = useState(false);
  
  const [reportRange, setReportRange] = useState('month');
  const [modalMode, setModalMode] = useState(null); 
  const [animState, setAnimState] = useState({ active: false, type: 'expense', key: 0 });
  const [toast, setToast] = useState(null);

  // Forms
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('expense');
  const [transferToWalletId, setTransferToWalletId] = useState('');

  const [walletForm, setWalletForm] = useState({ id: null, name: '', initialBalance: '', icon: '💵', color: '#1e40af', owner: 'hart' });
  const [budgetForm, setBudgetForm] = useState({ id: null, category: '', limit: '' });
  const [billForm, setBillForm] = useState({ title: '', amount: '', recurringDay: '' });
  
  const [payBillData, setPayBillData] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Styles
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
    const unsubW = onSnapshot(query(collection(db, "wallets"), orderBy("createdAt", "asc")), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWallets(data);
      if (data.length === 0 && !snap.metadata.fromCache) {
        addDoc(collection(db, "wallets"), { name: "Heart Wallet", initialBalance: 0, icon: '💵', color: '#1e40af', owner: 'hart', createdAt: Date.now() });
      }
    });
    const unsubT = onSnapshot(query(collection(db, "transactions"), orderBy("timestamp", "desc")), (snap) => setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubB = onSnapshot(query(collection(db, "budgets")), (snap) => setBudgets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubBills = onSnapshot(query(collection(db, "bills"), orderBy("createdAt", "desc")), (snap) => setBills(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    
    return () => { unsubW(); unsubT(); unsubB(); unsubBills(); };
  }, []);

  const visibleWallets = wallets.filter(w => currentProfile === 'family' ? true : (w.owner === currentProfile || !w.owner));
  
  const getProfileName = (key) => customSpaceNames[key] || profiles[key].name;

  useEffect(() => {
    if (visibleWallets.length > 0 && !visibleWallets.find(w => w.id === activeWalletId)) setActiveWalletId(visibleWallets[0].id);
    else if (visibleWallets.length === 0) setActiveWalletId(null);
  }, [currentProfile, wallets]);

  const activeWallet = visibleWallets.find(w => w.id === activeWalletId) || {};
  const currentWalletTransactions = transactions.filter(t => t.walletId === activeWalletId);

  const calculateBalance = (wallet) => {
    if (!wallet) return 0;
    const walletTx = transactions.filter(t => t.walletId === wallet.id);
    return (parseFloat(wallet.initialBalance) || 0) + walletTx.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
  };

  // Calculate Total Wealth
  const totalWealth = visibleWallets.reduce((acc, wallet) => acc + calculateBalance(wallet), 0);

  // My Pending Bills
  const myPendingBills = bills.filter(b => b.assignedTo === currentProfile && b.status !== 'paid');

  const reportStats = useMemo(() => {
    const now = new Date();
    const filteredTx = transactions.filter(t => {
      if (!visibleWallets.some(w => w.id === t.walletId)) return false;
      const txDate = new Date(t.timestamp);
      if (reportRange === 'day') { 
         const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
         return txDate.getDate() === yesterday.getDate() && txDate.getMonth() === yesterday.getMonth() && txDate.getFullYear() === yesterday.getFullYear();
      }
      if (reportRange === 'week') { 
         const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
         return txDate >= sevenDaysAgo;
      }
      if (reportRange === 'month') return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      return true;
    });
    const income = filteredTx.filter(t => t.type === 'income' && !t.isTransfer).reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTx.filter(t => t.type === 'expense' && !t.isTransfer).reduce((sum, t) => sum + t.amount, 0);
    const catStats = {};
    filteredTx.filter(t => t.type === 'expense' && !t.isTransfer).forEach(t => { catStats[t.category] = (catStats[t.category] || 0) + t.amount; });
    return { income, expense, sortedCats: Object.entries(catStats).sort((a, b) => b[1] - a[1]) };
  }, [transactions, reportRange, visibleWallets]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const profileBudgets = budgets.filter(b => currentProfile === 'family' ? true : (b.owner === currentProfile));
  const getCategorySpent = (catName) => transactions.filter(t => {
        const txDate = new Date(t.timestamp);
        return t.category === catName && t.type === 'expense' && !t.isTransfer && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear && visibleWallets.some(w => w.id === t.walletId);
      }).reduce((sum, t) => sum + t.amount, 0);

  const theme = profiles[currentProfile];
  const displaySpaceName = getProfileName(currentProfile) + (currentProfile !== 'family' ? "'s Space" : "");

  // Actions
  const handleEditSpaceName = () => {
    const newName = prompt("ตั้งชื่อ Space ของคุณ:", customSpaceNames[currentProfile] || profiles[currentProfile].name);
    if (newName?.trim()) {
      const updatedNames = { ...customSpaceNames, [currentProfile]: newName };
      setCustomSpaceNames(updatedNames);
      localStorage.setItem('customSpaceNames', JSON.stringify(updatedNames));
    }
  };

  const handleOpenTransaction = (selectedType) => { setType(selectedType); setAmount(''); setCategory(''); setTransferToWalletId(''); setModalMode('add-transaction'); setIsFabOpen(false); };
  const triggerAnimation = (animType) => { setAnimState({ active: true, type: animType, key: Date.now() }); setTimeout(() => setAnimState(prev => ({ ...prev, active: false })), 1500); };

  const handleSaveTransaction = async () => {
    if (!amount) return showToast("กรุณากรอกจำนวนเงิน", "error");
    setLoading(true);
    const timestamp = Date.now();
    const dateDisplay = new Date().toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
    try {
      if (type === 'transfer') {
        if (!transferToWalletId || transferToWalletId === activeWalletId) { setLoading(false); return showToast("ปลายทางไม่ถูกต้อง", "error"); }
        const toWalletName = wallets.find(w => w.id === transferToWalletId)?.name || 'Unknown';
        await addDoc(collection(db, "transactions"), { amount: parseFloat(amount), category: `โอนไป ${toWalletName}`, type: 'expense', isTransfer: true, walletId: activeWalletId, timestamp, dateDisplay });
        await addDoc(collection(db, "transactions"), { amount: parseFloat(amount), category: `รับจาก ${activeWallet.name}`, type: 'income', isTransfer: true, walletId: transferToWalletId, timestamp, dateDisplay });
        triggerAnimation('transfer');
      } else {
        if (!category) { setLoading(false); return showToast("เลือกหมวดหมู่", "error"); }
        await addDoc(collection(db, "transactions"), { amount: parseFloat(amount), category, type, isTransfer: false, walletId: activeWalletId, timestamp, dateDisplay });
        triggerAnimation(type);
      }
      setAmount(''); setCategory(''); setTransferToWalletId(''); setModalMode(null); showToast("บันทึกสำเร็จ!");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  const handleSaveWallet = async () => {
    if (!walletForm.name) return showToast("ใส่ชื่อกระเป๋า", "error");
    setLoading(true);
    try {
      const walletData = { name: walletForm.name, initialBalance: parseFloat(walletForm.initialBalance) || 0, icon: walletForm.icon, color: walletForm.color, owner: walletForm.owner };
      if (walletForm.id) await updateDoc(doc(db, "wallets", walletForm.id), walletData);
      else { const newRef = await addDoc(collection(db, "wallets"), { ...walletData, createdAt: Date.now() }); setActiveWalletId(newRef.id); }
      setWalletForm({ id: null, name: '', initialBalance: '', icon: '💵', color: '#1e40af', owner: currentProfile }); setModalMode(null); showToast("บันทึกกระเป๋าเรียบร้อย");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  const handleSaveBudget = async () => {
    if (!budgetForm.category || !budgetForm.limit) return showToast("กรอกข้อมูลให้ครบ", "error");
    setLoading(true);
    try {
      const budgetData = { category: budgetForm.category, limit: parseFloat(budgetForm.limit), owner: currentProfile };
      if (budgetForm.id) await updateDoc(doc(db, "budgets", budgetForm.id), budgetData);
      else await addDoc(collection(db, "budgets"), budgetData);
      setBudgetForm({ id: null, category: '', limit: '' }); setModalMode(null); showToast("ตั้งเป้าหมายเรียบร้อย!");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  // --- Bill Functions ---
  const handleAddBill = async () => {
    if (!billForm.title || !billForm.amount) return showToast("กรอกชื่อรายการและยอดเงิน", "error");
    setLoading(true);
    try {
      await addDoc(collection(db, "bills"), {
        title: billForm.title,
        amount: parseFloat(billForm.amount),
        recurringDay: billForm.recurringDay,
        assignedTo: null,
        assignedBy: null,
        status: 'pending',
        createdAt: Date.now()
      });
      setBillForm({ title: '', amount: '', recurringDay: '' });
      setModalMode(null);
      showToast("สร้างรายการบิลแล้ว");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  const handleAssignBill = async (billId, targetProfile) => {
    try {
      await updateDoc(doc(db, "bills", billId), {
        assignedTo: targetProfile,
        assignedBy: currentProfile
      });
      showToast(`โยนบิลไปให้ ${getProfileName(targetProfile)} แล้ว!`);
    } catch (error) { showToast(error.message, "error"); }
  };

  const handleUnassignBill = async (billId) => {
    try {
      await updateDoc(doc(db, "bills", billId), {
        assignedTo: null,
        assignedBy: null
      });
      showToast("ดึงบิลกลับมากองกลางแล้ว");
    } catch (error) { showToast(error.message, "error"); }
  };

  const handlePayBillClick = (bill) => {
    setPayBillData(bill);
    setModalMode('pay-bill');
  };

  const confirmPayBill = async (walletId) => {
    if(!walletId) return showToast("กรุณาเลือกกระเป๋าที่จะจ่าย", "error");
    setLoading(true);
    try {
      await updateDoc(doc(db, "bills", payBillData.id), { status: 'paid' });
      const selectedWallet = wallets.find(w => w.id === walletId);
      const timestamp = Date.now();
      const dateDisplay = new Date().toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
      
      await addDoc(collection(db, "transactions"), { 
        amount: parseFloat(payBillData.amount), 
        category: 'จ่ายบิล',
        type: 'expense', 
        isTransfer: false, 
        walletId: walletId, 
        note: `ชำระบิล: ${payBillData.title}`,
        timestamp, 
        dateDisplay 
      });

      triggerAnimation('expense');
      setModalMode(null);
      setPayBillData(null);
      showToast(`จ่ายบิลเรียบร้อยด้วยกระเป๋า ${selectedWallet.name}`);
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  const handleDeleteTransaction = async (id) => { if(confirm("ลบรายการ?")) await deleteDoc(doc(db, "transactions", id)); };
  const handleDeleteBudget = async (id) => { if(confirm("ลบงบประมาณ?")) { await deleteDoc(doc(db, "budgets", id)); setModalMode(null); }};
  const handleDeleteBill = async (id) => { if(confirm("ลบบิลนี้?")) await deleteDoc(doc(db, "bills", id)); };

  const openEditWallet = (wallet) => { setWalletForm({ id: wallet.id, name: wallet.name, initialBalance: wallet.initialBalance, icon: wallet.icon, color: wallet.color, owner: wallet.owner || 'hart' }); setModalMode('manage-wallet'); };
  const openCreateWallet = () => { 
    const defaultOwner = currentProfile === 'family' ? 'hart' : currentProfile;
    const defaultColor = defaultOwner === 'jah' ? '#be123c' : '#1e40af';
    setWalletForm({ id: null, name: '', initialBalance: '', icon: '💵', color: defaultColor, owner: defaultOwner }); setModalMode('manage-wallet'); 
  };
  const openCreateBudget = () => { setBudgetForm({ id: null, category: '', limit: '' }); setModalMode('manage-budget'); };
  const openEditBudget = (b) => { setBudgetForm({ id: b.id, category: b.category, limit: b.limit }); setModalMode('manage-budget'); };
  
  return (
    <div className={`flex justify-center min-h-screen font-sans transition-colors duration-500 ${theme.bg} text-gray-900`}>
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative shadow-2xl sm:my-auto sm:border border-gray-200">
        
        <Particles key={animState.key} active={animState.active} type={animState.type} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* HEADER */}
        <div className="bg-white/95 backdrop-blur-md pt-8 pb-3 px-5 z-40 sticky top-0 border-b border-gray-200 flex justify-between items-center shadow-sm">
           <div className="flex items-center gap-2 cursor-pointer group" onClick={handleEditSpaceName}>
             <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-inner bg-gray-50 border border-gray-200`}>{theme.icon}</div>
             <div><h1 className={`text-base font-bold leading-tight ${theme.text} flex items-center gap-1`}>{displaySpaceName} <Edit3 size={12} className="text-gray-400 group-hover:text-gray-600 transition-colors"/></h1></div>
           </div>
           <div className="flex bg-gray-100 p-1 rounded-full">
             {Object.keys(profiles).map((key) => (
               <button key={key} onClick={() => setCurrentProfile(key)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${currentProfile === key ? 'bg-white shadow-sm scale-105 border border-gray-200' : 'text-gray-400'}`}>{profiles[key].icon}</button>
             ))}
           </div>
        </div>

        {/* === DASHBOARD VIEW === */}
        {viewMode === 'dashboard' && (
          <div className="flex-1 flex flex-col transition-all duration-300 pb-32 opacity-100">
            
            {/* Pending Bills Alert (New Feature) */}
            {myPendingBills.length > 0 && (
              <div className="px-5 pt-4">
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-purple-800 font-bold text-xs uppercase tracking-wider">
                    <Bell size={14} className="animate-bounce" /> บิลรอจ่าย ({myPendingBills.length})
                  </div>
                  <div className="space-y-2">
                    {myPendingBills.map(bill => (
                      <div key={bill.id} className="flex justify-between items-center bg-white p-2 rounded-xl border border-purple-100">
                        <div>
                          <p className="font-bold text-gray-800 text-xs">{bill.title}</p>
                          <p className="text-purple-600 font-bold text-sm">฿{bill.amount.toLocaleString()}</p>
                        </div>
                        <button onClick={() => handlePayBillClick(bill)} className="bg-purple-600 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-sm hover:bg-purple-700">
                          จ่ายเลย
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Total Wealth */}
            <div className="px-5 pt-4">
              <div className={`p-4 rounded-2xl text-white shadow-lg bg-gradient-to-br ${currentProfile === 'hart' ? 'from-blue-800 to-blue-950' : currentProfile === 'jah' ? 'from-rose-700 to-rose-900' : 'from-slate-700 to-slate-900'}`}>
                <p className="text-[10px] font-bold opacity-70 mb-1 uppercase tracking-wide">สินทรัพย์รวม</p>
                <h2 className="text-3xl font-bold tracking-tight">฿{totalWealth.toLocaleString()}</h2>
              </div>
            </div>

            {/* Wallets (Colored & Interactive) */}
            <div className="pt-4 pb-2">
              <div className="px-5 mb-2 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">กระเป๋าเงิน</span>
                {currentProfile !== 'family' && (<button onClick={openCreateWallet} className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1 border border-gray-300"><Plus size={10} /> เพิ่ม</button>)}
              </div>
              <div className="flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar snap-x cursor-grab active:cursor-grabbing">
                {visibleWallets.length === 0 ? (
                  <div className="w-full h-20 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 text-xs">ไม่พบกระเป๋าเงิน</div>
                ) : visibleWallets.map(wallet => {
                    const isActive = wallet.id === activeWalletId;
                    const balance = calculateBalance(wallet);
                    return (
                      <div key={wallet.id} className="relative group flex-shrink-0">
                        <button 
                          onClick={() => setActiveWalletId(wallet.id)} 
                          className={`relative w-40 h-24 p-3 rounded-2xl snap-center transition-all duration-300 text-left overflow-hidden shadow-md 
                            ${isActive 
                              ? 'ring-2 ring-offset-1 ring-gray-400 scale-100 opacity-100' 
                              : 'scale-95 opacity-80 hover:opacity-100'}`}
                          style={{ backgroundColor: wallet.color, color: 'white' }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xl drop-shadow-sm">{wallet.icon}</span>
                            {isActive && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[8px] font-bold backdrop-blur-sm">ACTIVE</span>}
                          </div>
                          <div className="mt-auto">
                            <p className="text-[9px] uppercase font-bold mb-0.5 truncate pr-2 opacity-90">{wallet.name}</p>
                            <span className="text-lg font-bold tracking-tight">{balance.toLocaleString()}</span>
                          </div>
                          {isActive && <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-white/10 blur-xl"></div>}
                        </button>
                        {isActive && currentProfile !== 'family' && <button onClick={() => openEditWallet(wallet)} className="absolute top-2 right-2 p-1.5 bg-black/20 rounded-full text-white/90 hover:bg-black/30"><Settings size={10} /></button>}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Budgets */}
            <div className="px-5 py-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1"><Target size={12}/> เป้าหมาย (เดือนนี้)</span>
                {currentProfile !== 'family' && <button onClick={openCreateBudget} className="text-[10px] text-blue-600 font-bold flex items-center gap-1 hover:text-blue-800">+ ตั้งเป้า</button>}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
                {profileBudgets.length === 0 ? (
                  <button onClick={openCreateBudget} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-1 hover:bg-gray-50 transition-colors">
                    <Plus size={16} /> <span className="text-[10px]">เริ่มตั้งงบประมาณ</span>
                  </button>
                ) : profileBudgets.map(b => {
                  const spent = getCategorySpent(b.category);
                  const percent = Math.min((spent / b.limit) * 100, 100);
                  const isOver = spent > b.limit;
                  return (
                    <div key={b.id} onClick={() => openEditBudget(b)} className="flex-shrink-0 w-36 bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group cursor-pointer snap-start hover:border-gray-300">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{expenseCategories.find(c => c.name === b.category)?.icon || '💸'}</span>
                          <span className="text-[10px] font-bold truncate w-16 text-gray-700">{b.category}</span>
                        </div>
                        {isOver && <AlertCircle size={12} className="text-red-500 animate-pulse"/>}
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div style={{ width: `${percent}%` }} className={`h-full rounded-full ${isOver ? 'bg-red-500' : percent > 80 ? 'bg-orange-500' : 'bg-green-500'} transition-all duration-500`}></div>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className={`text-[10px] font-bold ${isOver ? 'text-red-600' : 'text-gray-700'}`}>{spent.toLocaleString()}</span>
                        <span className="text-[9px] text-gray-400">/ {b.limit.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transactions */}
            <div className="px-5 pt-2">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1"><Activity size={12}/> รายการล่าสุด</h3>
              {currentWalletTransactions.length === 0 ? (
                 <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                   <Wallet size={20} className="opacity-50"/><p className="text-[10px]">ยังไม่มีรายการ</p>
                 </div>
              ) : (
                 <div className="space-y-2">
                   {currentWalletTransactions.map(t => (
                     <div key={t.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 active:scale-[0.99] transition-transform hover:border-gray-300">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-lg ${t.type === 'income' ? 'bg-green-100' : t.type === 'transfer' ? 'bg-blue-100' : 'bg-red-100'}`}>
                          {t.type === 'transfer' ? <ArrowRightLeft size={14} className="text-blue-600"/> : (t.type === 'income' ? (incomeCategories.find(c => c.name === t.category)?.icon || '💰') : (expenseCategories.find(c => c.name === t.category)?.icon || '💸'))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-gray-800 text-xs truncate">{t.category}</span>
                            <span className={`font-bold text-xs ${t.type === 'income' ? 'text-green-700' : t.type === 'transfer' ? 'text-blue-700' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between mt-0.5">
                            <span className="text-[9px] text-gray-400">{t.dateDisplay} {t.note && `(${t.note})`}</span>
                            {currentProfile !== 'family' && <button onClick={() => handleDeleteTransaction(t.id)} className="text-[9px] text-red-400 hover:text-red-600 px-1">ลบ</button>}
                          </div>
                        </div>
                     </div>
                   ))}
                 </div>
              )}
            </div>
          </div>
        )}

        {/* === BILLS / CHECKLIST VIEW (Only in Family) === */}
        {viewMode === 'bills' && currentProfile === 'family' && (
          <div className="flex-1 flex flex-col p-5 overflow-y-auto pb-32 animate-in fade-in zoom-in-95 duration-300 bg-gray-50/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><CheckSquare className="text-purple-600"/> บิลกลาง (รอจ่าย)</h2>
              <button onClick={() => setModalMode('add-bill')} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-full shadow-lg hover:bg-purple-700 flex items-center gap-1 font-bold">+ เพิ่มบิล</button>
            </div>

            {/* Bills List */}
            <div className="space-y-3">
              {bills.filter(b => b.status !== 'paid').length === 0 && (
                <div className="text-center py-10 text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-xl">ไม่มีบิลค้างจ่าย เยี่ยมมาก!</div>
              )}
              {bills.filter(b => b.status !== 'paid').map(bill => {
                const isAssigned = !!bill.assignedTo;
                const assignerName = bill.assignedBy ? getProfileName(bill.assignedBy) : 'ใครสักคน';
                const assigneeName = bill.assignedTo ? getProfileName(bill.assignedTo) : '';
                
                return (
                  <div key={bill.id} className={`bg-white p-4 rounded-xl border-l-4 shadow-sm transition-all ${isAssigned ? (bill.assignedTo === 'heart' ? 'border-l-blue-500' : 'border-l-pink-500') : 'border-l-gray-400'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-800 text-sm">{bill.title}</h3>
                          {bill.recurringDay && <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><CalendarClock size={10}/> ทุกวันที่ {bill.recurringDay}</span>}
                        </div>
                        <p className="text-lg font-bold text-purple-700">฿{bill.amount.toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleDeleteBill(bill.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={14}/></button>
                    </div>

                    {/* Actions Area */}
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      {!isAssigned ? (
                        <div className="flex gap-2">
                          <span className="text-[10px] text-gray-400 flex items-center mr-auto">โยนให้ใครจ่าย?</span>
                          <button onClick={() => handleAssignBill(bill.id, 'hart')} className="flex-1 bg-blue-50 text-blue-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1 border border-blue-200">
                            👉 {getProfileName('hart')}
                          </button>
                          <button onClick={() => handleAssignBill(bill.id, 'jah')} className="flex-1 bg-pink-50 text-pink-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-pink-100 flex items-center justify-center gap-1 border border-pink-200">
                            👉 {getProfileName('jah')}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="text-xl">{profiles[bill.assignedTo]?.icon}</div>
                            <div>
                              <p className="text-[10px] text-gray-600 font-bold">รอ {assigneeName} จ่าย</p>
                              {bill.assignedBy && <p className="text-[9px] text-gray-400">({assignerName} โยนมา)</p>}
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                             {/* Undo Assign */}
                             <button onClick={() => handleUnassignBill(bill.id)} className="p-1.5 rounded-lg bg-gray-200 text-gray-500 hover:bg-gray-300"><Undo2 size={14}/></button>
                             {/* Pay Button */}
                             <button onClick={() => handlePayBillClick(bill)} className="bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow hover:bg-green-600 flex items-center gap-1">
                                <CheckCircle2 size={12}/> จ่ายแล้ว
                             </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paid History */}
            <div className="mt-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">ประวัติการจ่ายล่าสุด</h3>
              {bills.filter(b => b.status === 'paid').slice(0, 5).map(b => (
                <div key={b.id} className="flex justify-between items-center py-2 border-b border-gray-100 text-xs text-gray-400 opacity-70">
                  <span className="line-through">{b.title}</span>
                  <span className="line-through">{b.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === REPORT VIEW === */}
        {viewMode === 'report' && (
          <div className="flex-1 flex flex-col p-5 overflow-y-auto pb-32 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><BarChart3 className="text-blue-600"/> สรุปผล</h2>
              <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                <button onClick={() => setReportRange('day')} className={`px-3 py-1 text-[10px] rounded-md font-bold transition-all ${reportRange === 'day' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>เมื่อวาน</button>
                <button onClick={() => setReportRange('week')} className={`px-3 py-1 text-[10px] rounded-md font-bold transition-all ${reportRange === 'week' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>7 วัน</button>
                <button onClick={() => setReportRange('month')} className={`px-3 py-1 text-[10px] rounded-md font-bold transition-all ${reportRange === 'month' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>เดือนนี้</button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-6 flex flex-col items-center">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">สัดส่วนการเงิน</h3>
              <SimpleDonutChart income={reportStats.income} expense={reportStats.expense} />
              
              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-[10px] text-green-600 font-bold mb-1">รายรับ</p>
                  <p className="font-bold text-green-800">{reportStats.income.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-[10px] text-red-600 font-bold mb-1">รายจ่าย</p>
                  <p className="font-bold text-red-800">{reportStats.expense.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">อันดับค่าใช้จ่าย</h3>
              {reportStats.sortedCats.length === 0 ? (
                <div className="text-center py-8 text-gray-300 text-xs">ว่างเปล่า... ดีแล้ว!</div>
              ) : (
                reportStats.sortedCats.map(([catName, amount]) => {
                  const catInfo = expenseCategories.find(c => c.name === catName) || { icon: '💸', color: '#94a3b8' };
                  return (
                    <CategoryBar key={catName} category={catName} amount={amount} total={reportStats.expense} color={catInfo.color} icon={catInfo.icon}/>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* BOTTOM NAV */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-full px-2 py-2 flex gap-2 z-50">
          <button onClick={() => setViewMode('dashboard')} className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${viewMode === 'dashboard' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>
            <Home size={18} />{viewMode === 'dashboard' && <span className="text-xs font-bold animate-in fade-in slide-in-from-left-2">หน้าหลัก</span>}
          </button>
          
          {/* Bills Button: Only Show in Family Profile */}
          {currentProfile === 'family' && (
            <button onClick={() => setViewMode('bills')} className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${viewMode === 'bills' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>
              <CheckSquare size={18} />{viewMode === 'bills' && <span className="text-xs font-bold animate-in fade-in slide-in-from-left-2">บิลกลาง</span>}
            </button>
          )}

          <button onClick={() => setViewMode('report')} className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${viewMode === 'report' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}>
            <PieChart size={18} />{viewMode === 'report' && <span className="text-xs font-bold animate-in fade-in slide-in-from-right-2">สรุป</span>}
          </button>
        </div>

        {/* FAB (Only Dashboard & Not Family) */}
        {currentProfile !== 'family' && viewMode === 'dashboard' && (
          <>
            {isFabOpen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-in fade-in" onClick={() => setIsFabOpen(false)}></div>}
            <div className={`fixed bottom-40 right-6 flex flex-col gap-3 z-50 items-end transition-all duration-300 ${isFabOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
              <div className="flex items-center gap-3"><span className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold shadow text-gray-600">รายรับ</span><button onClick={() => handleOpenTransaction('income')} className="w-10 h-10 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center"><TrendingUp size={18} /></button></div>
              <div className="flex items-center gap-3"><span className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold shadow text-gray-600">โอนเงิน</span><button onClick={() => handleOpenTransaction('transfer')} className="w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center"><ArrowRightLeft size={18} /></button></div>
              <div className="flex items-center gap-3"><span className="bg-white px-2 py-1 rounded-lg text-[10px] font-bold shadow text-gray-600">รายจ่าย</span><button onClick={() => handleOpenTransaction('expense')} className="w-10 h-10 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center"><TrendingDown size={18} /></button></div>
            </div>
            <button onClick={() => setIsFabOpen(!isFabOpen)} className={`fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-50 ring-4 ring-white ${isFabOpen ? 'bg-gray-200 text-gray-600 rotate-45' : `${theme.primary} text-white hover:scale-105 active:scale-95`}`}><Plus size={28} /></button>
          </>
        )}

        {/* MODAL: ADD TRANSACTION */}
        {modalMode === 'add-transaction' && (
          <div className="fixed inset-0 bg-gray-50 z-[60] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={24}/></button><h2 className="text-base font-bold text-gray-800">เพิ่มรายการ</h2><div className="w-10"></div></div>
            <div className="flex-1 p-6 overflow-y-auto">
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
                <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">ไปยังกระเป๋า</label><div className="space-y-2">{wallets.filter(w => w.id !== activeWalletId).map(w => (<button key={w.id} onClick={() => setTransferToWalletId(w.id)} className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all bg-white ${transferToWalletId === w.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}><div className="flex items-center gap-3"><span className="text-xl">{w.icon}</span><span className="font-semibold text-sm">{w.name}</span></div>{transferToWalletId === w.id && <div className="bg-blue-100 p-1 rounded-full text-blue-600"><ArrowRight size={14}/></div>}</button>))}</div></div>
              ) : (
                <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">หมวดหมู่</label><div className="grid grid-cols-4 gap-3">{(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (<button key={cat.id} onClick={() => setCategory(cat.name)} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all bg-white ${category === cat.name ? 'border-gray-800 bg-gray-50 shadow-md transform scale-105' : 'border-gray-200 hover:border-gray-300'}`}><span className="text-2xl">{cat.icon}</span><span className="text-[10px] font-bold">{cat.name}</span></button>))}</div></div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 bg-white"><button onClick={handleSaveTransaction} disabled={loading} className={`w-full h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-white ${type === 'expense' ? 'bg-red-600 shadow-red-200' : type === 'transfer' ? 'bg-blue-600 shadow-blue-200' : 'bg-green-600 shadow-green-200'}`}>{loading ? <Loader2 className="animate-spin"/> : (type === 'transfer' ? 'โอนเงิน' : 'บันทึก')}</button></div>
          </div>
        )}

        {/* MODAL: ADD BILL */}
        {modalMode === 'add-bill' && (
          <div className="fixed inset-0 bg-gray-50 z-[60] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={24}/></button><h2 className="text-base font-bold text-gray-800">เพิ่มบิลกลาง</h2><div className="w-10"></div></div>
            <div className="flex-1 p-6">
              <div className="mb-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ชื่อบิล (เช่น ค่าไฟ, ค่าเน็ต)</label>
                <input type="text" autoFocus value={billForm.title} onChange={e => setBillForm({...billForm, title: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 outline-none focus:border-purple-500" placeholder="..."/>
              </div>
              <div className="mb-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ยอดเงินที่ต้องจ่าย</label>
                <input type="number" value={billForm.amount} onChange={e => setBillForm({...billForm, amount: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold text-gray-800 outline-none focus:border-purple-500" placeholder="0.00"/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">จ่ายทุกวันที่ (Recurring Day)</label>
                <input type="number" min="1" max="31" value={billForm.recurringDay} onChange={e => setBillForm({...billForm, recurringDay: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 outline-none focus:border-purple-500" placeholder="1-31 (ว่างได้)"/>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-white"><button onClick={handleAddBill} disabled={loading} className="w-full bg-purple-600 text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all">{loading ? '...' : 'สร้างบิล'}</button></div>
          </div>
        )}

        {/* MODAL: PAY BILL (Select Wallet) */}
        {modalMode === 'pay-bill' && payBillData && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">จ่ายด้วยกระเป๋าไหน?</h3>
                <button onClick={() => { setModalMode(null); setPayBillData(null); }} className="p-1 rounded-full hover:bg-gray-100"><X size={20}/></button>
              </div>
              
              <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-xs text-gray-500 font-bold uppercase">ยอดชำระ</p>
                <div className="flex justify-between items-end">
                  <p className="text-xl font-bold text-purple-700">{payBillData.title}</p>
                  <p className="text-xl font-bold text-purple-700">฿{payBillData.amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase">กระเป๋าของ {getProfileName(payBillData.assignedTo)}</p>
                {wallets.filter(w => w.owner === payBillData.assignedTo).length === 0 && (
                  <p className="text-xs text-red-500">ไม่พบกระเป๋าเงินของ {getProfileName(payBillData.assignedTo)}</p>
                )}
                {wallets.filter(w => w.owner === payBillData.assignedTo).map(wallet => (
                  <button 
                    key={wallet.id} 
                    onClick={() => confirmPayBill(wallet.id)}
                    className="w-full p-3 rounded-xl border border-gray-200 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl" style={{color: wallet.color}}>{wallet.icon}</span>
                      <div className="text-left">
                        <p className="font-bold text-sm text-gray-800">{wallet.name}</p>
                        <p className="text-xs text-gray-500">คงเหลือ: {calculateBalance(wallet).toLocaleString()}</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400"/>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: MANAGE WALLET */}
        {modalMode === 'manage-wallet' && (
          <div className="fixed inset-0 bg-gray-50 z-[60] flex flex-col animate-in slide-in-from-right duration-200">
             <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><ArrowRight size={24} className="rotate-180"/></button><h2 className="text-base font-bold text-gray-800">{walletForm.id ? 'แก้ไขกระเป๋า' : 'สร้างกระเป๋าใหม่'}</h2><div className="w-10"></div></div>
            <div className="flex-1 p-6 space-y-5 overflow-y-auto">
              <div className="bg-white p-3 rounded-xl flex items-center gap-3 border border-gray-200 shadow-sm"><div className="p-2 bg-gray-50 rounded-full">{profiles[walletForm.owner]?.icon}</div><div><p className="text-[10px] text-gray-400 font-bold uppercase">เจ้าของ</p><p className="font-semibold text-gray-800 text-sm">{profiles[walletForm.owner]?.name}</p></div></div>
              
              {/* Name & Balance */}
              <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ชื่อกระเป๋า</label><input type="text" value={walletForm.name} onChange={e => setWalletForm({...walletForm, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-800 outline-none focus:border-blue-500" placeholder="เช่น เงินเดือน"/></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">เงินตั้งต้น</label><input type="number" value={walletForm.initialBalance} onChange={e => setWalletForm({...walletForm, initialBalance: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-800 outline-none focus:border-blue-500" placeholder="0.00"/></div>

              {/* Bank Presets */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ธนาคาร (ทางลัด)</label>
                <div className="grid grid-cols-4 gap-2">
                  {bankPresets.map(bank => (
                    <button 
                      key={bank.name} 
                      onClick={() => setWalletForm({ ...walletForm, name: bank.name, color: bank.color, icon: bank.icon })}
                      className="flex flex-col items-center justify-center p-2 rounded-xl border border-gray-100 bg-white shadow-sm hover:scale-105 transition-transform"
                      style={{ borderTop: `4px solid ${bank.color}` }}
                    >
                      <span className="font-bold text-xs">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ไอคอน หรือ ตัวย่อ</label>
                <div className="flex gap-2">
                   <input type="text" maxLength={4} value={walletForm.icon} onChange={e => setWalletForm({...walletForm, icon: e.target.value})} className="w-16 text-center bg-white border border-gray-200 rounded-xl px-2 py-2 font-bold text-lg outline-none focus:border-blue-500" />
                   <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar flex-1">{iconsList.map(icon => (<button key={icon} onClick={() => setWalletForm({...walletForm, icon})} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 transition-all flex-shrink-0 bg-white ${walletForm.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>{icon}</button>))}</div>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">สีธีม</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={walletForm.color} 
                    onChange={e => setWalletForm({...walletForm, color: e.target.value})}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 font-mono">{walletForm.color}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-white"><button onClick={handleSaveWallet} disabled={loading} className={`w-full ${theme.primary} text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all`}>{loading ? 'กำลังบันทึก...' : 'บันทึกกระเป๋า'}</button></div>
          </div>
        )}

        {/* MODAL: MANAGE BUDGET */}
        {modalMode === 'manage-budget' && (
          <div className="fixed inset-0 bg-gray-50 z-[60] flex flex-col animate-in slide-in-from-right duration-200">
             <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><ArrowRight size={24} className="rotate-180"/></button><h2 className="text-base font-bold text-gray-800">{budgetForm.id ? 'แก้ไขงบ' : 'ตั้งเป้าใหม่'}</h2>{budgetForm.id ? <button onClick={() => handleDeleteBudget(budgetForm.id)} className="text-red-500"><Trash2 size={20}/></button> : <div className="w-5"></div>}</div>
             <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block">หมวดหมู่</label><div className="grid grid-cols-4 gap-3">{expenseCategories.map(cat => (<button key={cat.id} onClick={() => setBudgetForm({...budgetForm, category: cat.name})} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all bg-white ${budgetForm.category === cat.name ? `bg-${theme.theme}-600 text-white shadow-lg scale-105 border-${theme.theme}-600` : 'border-gray-200 hover:border-gray-300'}`}><span className="text-2xl">{cat.icon}</span><span className="text-[10px] font-bold">{cat.name}</span></button>))}</div></div>
                <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">งบ (บาท)</label><input type="number" autoFocus value={budgetForm.limit} onChange={e => setBudgetForm({...budgetForm, limit: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-xl font-bold text-gray-800 outline-none focus:border-blue-500" placeholder="เช่น 5000"/></div>
             </div>
             <div className="p-4 border-t border-gray-200 bg-white"><button onClick={handleSaveBudget} disabled={loading} className={`w-full ${theme.primary} text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all`}>{loading ? '...' : 'บันทึก'}</button></div>
          </div>
        )}

      </div>
    </div>
  );
}