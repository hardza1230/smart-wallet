import React, { useState, useEffect, useMemo } from 'react';
import { Save, Wallet, Plus, X, TrendingUp, TrendingDown, Settings, ArrowRight, Activity, ArrowRightLeft, Target, Zap, AlertCircle, CheckCircle2, Edit3, Loader2, Trash2, BarChart3, Home, PieChart, CheckSquare, Share2, UserPlus, Flag, RefreshCw, Undo2, CalendarClock, Bell, Palette, BookOpen, Calculator, Delete, CalendarHeart, ThumbsUp, ThumbsDown, Plane, Utensils, MapPin, Gift, HeartHandshake, UserCog, Calendar, ChevronLeft, ChevronRight, Eye, EyeOff, LayoutGrid, List, GripVertical, Coffee, ShoppingBag, CreditCard, Pencil, SlidersHorizontal } from 'lucide-react';

// --- Firebase Config & Init ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, writeBatch, where, getDocs, setDoc } from "firebase/firestore";

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
const iconCategories = {
  'คน': ['👨🏻', '👩🏻', '👦🏻', '👧🏻', '👴🏻', '👵🏻', '👱🏻‍♂️', '👱🏻‍♀️', '🧔🏻‍♂️', '🧕🏻', '👼🏻', '👫'],
  'บ้าน & สถานที่': ['🏠', '🏦', '🏥'],
  'เงินและการเงิน': ['💵', '💳', '🐷', '💎', '💰', '🪙', '💸'],
  'ยานพาหนะ': ['🚗', '🛵', '✈️', '🚀', '🚤', '🚂', '🚌'],
  'อาหาร & เครื่องดื่ม': ['🍔', '🍕', '🍜', '☕', '🍺', '🍷', '🍿', '🍰', '🍎', '🥦', '🥩'],
  'ช้อปปิ้ง': ['🛍️', '👠', '👔', '🧢', '💍', '⌚', '🕶️', '🎒'],
  'เทคโนโลยี': ['💻', '📱', '📷', '🎧', '🎮', '🔋', '💡', '🔌'],
  'สุขภาพ & กีฬา': ['🏥', '💊', '💪', '🧘', '⚽', '🏀', '🎾', '⛳', '🏊'],
  'สัตว์เลี้ยง': ['🐶', '🐱', '🐹', '🐰', '🐠'],
  'ธรรมชาติ': ['🪴', '🌻', '🌲'],
  'การศึกษา': ['📚', '🎓', '✏️', '🎨'],
  'บันเทิง': ['🎸', '🎤', '🎬', '🎫'],
  'อื่นๆ': ['👶', '🎁', '🧸', '🎉', '🕯️', '🧼', '🧻', '🧹', '❤️', '⭐', '🔥', '💧', '⚡', '🌤️', '🌙', '🔒']
};

const bankPresets = [
  { name: 'KBank', color: '#138f2d', icon: 'K' },
  { name: 'SCB', color: '#4e2583', icon: 'SCB' },
  { name: 'BBL', color: '#1e4598', icon: 'BBL' },
  { name: 'KTB', color: '#00a6e6', icon: 'KTB' },
  { name: 'Krungsri', color: '#fec43b', icon: 'BAY' },
  { name: 'TTB', color: '#0050f0', icon: 'ttb' },
  { name: 'GSB', color: '#eb198d', icon: 'GSB' },
  { name: 'TrueMoney', color: '#ff5c00', icon: 'TM' },
  { name: 'Cash', color: '#64748b', icon: '💵' },
  { name: 'Credit', color: '#171717', icon: '💳' }
];

const defaultQuickMenus = [
  { name: 'ข้าวเช้า', amount: 50, icon: '🍳', category: 'อาหาร' },
  { name: 'กาแฟ', amount: 60, icon: '☕', category: 'อาหาร' },
  { name: 'วิน/รถเมล์', amount: 30, icon: '🚌', category: 'เดินทาง' },
  { name: 'ข้าวเที่ยง', amount: 60, icon: '🍛', category: 'อาหาร' },
  { name: 'น้ำเปล่า', amount: 10, icon: '💧', category: 'อาหาร' },
];

const colorsList = [
  { id: 'blue', class: 'from-blue-700 to-blue-900', hex: '#1e40af', bg: 'bg-blue-50', text: 'text-blue-900', accent: 'bg-blue-600' },
  { id: 'emerald', class: 'from-emerald-700 to-emerald-900', hex: '#047857', bg: 'bg-emerald-50', text: 'text-emerald-900', accent: 'bg-emerald-600' },
  { id: 'rose', class: 'from-rose-500 to-rose-700', hex: '#be123c', bg: 'bg-rose-50', text: 'text-rose-900', accent: 'bg-rose-500' },
  { id: 'purple', class: 'from-purple-600 to-purple-800', hex: '#7e22ce', bg: 'bg-purple-50', text: 'text-purple-900', accent: 'bg-purple-600' },
  { id: 'slate', class: 'from-slate-700 to-slate-900', hex: '#334155', bg: 'bg-slate-50', text: 'text-slate-900', accent: 'bg-slate-800' },
  { id: 'orange', class: 'from-orange-600 to-orange-800', hex: '#c2410c', bg: 'bg-orange-50', text: 'text-orange-900', accent: 'bg-orange-600' },
  { id: 'pink', class: 'from-pink-500 to-pink-700', hex: '#be185d', bg: 'bg-pink-50', text: 'text-pink-900', accent: 'bg-pink-500' },
  { id: 'cyan', class: 'from-cyan-600 to-cyan-800', hex: '#0891b2', bg: 'bg-cyan-50', text: 'text-cyan-900', accent: 'bg-cyan-600' },
  { id: 'amber', class: 'from-amber-500 to-amber-700', hex: '#d97706', bg: 'bg-amber-50', text: 'text-amber-900', accent: 'bg-amber-500' },
  { id: 'indigo', class: 'from-indigo-600 to-indigo-800', hex: '#4f46e5', bg: 'bg-indigo-50', text: 'text-indigo-900', accent: 'bg-indigo-600' },
  { id: 'black', class: 'from-gray-800 to-gray-950', hex: '#0f172a', bg: 'bg-gray-100', text: 'text-gray-900', accent: 'bg-gray-900' },
];

// Default categories for seeding
const defaultExpenseCategories = [
  { name: 'อาหาร', icon: '🍔', color: '#ef4444' },
  { name: 'เดินทาง', icon: '🚕', color: '#3b82f6' },
  { name: 'ช้อปปิ้ง', icon: '🛍️', color: '#a855f7' },
  { name: 'บิล/น้ำไฟ', icon: '🧾', color: '#eab308' },
  { name: 'ของใช้บ้าน', icon: '🏠', color: '#14b8a6' },
  { name: 'สุขภาพ', icon: '💊', color: '#ef4444' },
  { name: 'ความงาม', icon: '💅', color: '#f43f5e' },
  { name: 'บันเทิง', icon: '🍿', color: '#ec4899' },
  { name: 'สัตว์เลี้ยง', icon: '🐶', color: '#f97316' },
  { name: 'Subscription', icon: '📺', color: '#6366f1' },
  { name: 'บริจาค', icon: '🙏', color: '#8b5cf6' },
  { name: 'IT/Gadget', icon: '📱', color: '#3b82f6' },
  { name: 'อื่นๆ', icon: '✨', color: '#64748b' },
];

const defaultIncomeCategories = [
  { name: 'เงินเดือน', icon: '💰', color: '#10b981' },
  { name: 'โบนัส', icon: '🎁', color: '#8b5cf6' },
  { name: 'ขายของ', icon: '📈', color: '#f59e0b' },
  { name: 'ได้เงิน', icon: '🧧', color: '#ef4444' },
  { name: 'ลงทุน', icon: '💎', color: '#3b82f6' },
  { name: 'คืนเงิน', icon: '↩️', color: '#6366f1' },
];

const defaultProfiles = {
  hart: { name: 'Heart', theme: 'blue', icon: '👨🏻' },
  jah: { name: 'Jah', theme: 'rose', icon: '👩🏻' },
  family: { name: 'Family', theme: 'slate', icon: '🏠' }
};

// --- Custom Components ---

const CalculatorPad = ({ onConfirm, onClose }) => {
  const [display, setDisplay] = useState('');
  const handlePress = (val) => {
    if (val === 'C') setDisplay('');
    else if (val === '=') {
      try {
        // eslint-disable-next-line no-new-func
        const result = Function('"use strict";return (' + display + ')')();
        setDisplay(String(result));
      } catch { setDisplay('Error'); }
    } else setDisplay(prev => prev + val);
  };
  const handleConfirm = () => {
    try {
      const result = display ? Function('"use strict";return (' + display + ')')() : '';
      onConfirm(String(result));
    } catch { onConfirm(''); }
  };
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-full max-w-xs mx-auto animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-500 text-xs uppercase">เครื่องคิดเลข</h3><button onClick={onClose}><X size={16} className="text-gray-400"/></button></div>
      <div className="bg-gray-100 rounded-xl p-4 mb-4 text-right text-2xl font-bold text-gray-800 h-16 flex items-center justify-end overflow-hidden">{display || '0'}</div>
      <div className="grid grid-cols-4 gap-2">{['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (<button key={btn} onClick={() => handlePress(btn)} className={`h-12 rounded-lg font-bold text-lg shadow-sm active:scale-95 transition-all ${['/','*','-','+','='].includes(btn) ? 'bg-blue-100 text-blue-700' : btn === 'C' ? 'bg-red-100 text-red-600' : 'bg-white border border-gray-200 text-gray-700'}`}>{btn}</button>))}</div>
      <button onClick={handleConfirm} className="w-full mt-4 bg-gray-900 text-white py-3 rounded-xl font-bold">ใช้ยอดนี้</button>
    </div>
  );
};

const SimpleDonutChart = ({ income, expense }) => {
  const total = income + expense;
  if (total === 0) return (<div className="h-32 flex items-center justify-center text-gray-400 bg-white/50 rounded-full w-32 mx-auto border-4 border-gray-200"><span className="text-[10px]">ไม่มีข้อมูล</span></div>);
  const incomePercent = (income / total) * 100;
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const incomeStroke = (incomePercent / 100) * circumference;
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 42 42" className="transform -rotate-90 w-full h-full">
        <circle cx="21" cy="21" r={radius} fill="transparent" stroke="#f87171" strokeWidth="6" />
        <circle cx="21" cy="21" r={radius} fill="transparent" stroke="#4ade80" strokeWidth="6" strokeDasharray={`${incomeStroke} ${circumference}`} strokeDashoffset="0" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[9px] text-gray-500 font-bold uppercase">คงเหลือ</span><span className={`text-sm font-bold ${income >= expense ? 'text-green-700' : 'text-red-600'}`}>{(income - expense).toLocaleString()}</span></div>
    </div>
  );
};

const NetWorthLineChart = ({ transactions, wallets }) => {
  const [dataPoints, setDataPoints] = useState([]);

  useEffect(() => {
    if (!wallets.length) return;

    const today = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({ 
        label: d.toLocaleString('th-TH', { month: 'short' }), 
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        date: d
      });
    }

    const chartData = months.map(m => {
        const endOfThisMonth = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0, 23, 59, 59).getTime();
        
        const totalWealthAtMonth = wallets.reduce((acc, wallet) => {
            let balance = parseFloat(wallet.initialBalance) || 0;
            const relevantTx = transactions.filter(t => t.walletId === wallet.id && t.timestamp <= endOfThisMonth);
            const change = relevantTx.reduce((sum, t) => {
                if (t.type === 'income') return sum + t.amount;
                if (t.type === 'expense') return sum - t.amount;
                return sum;
            }, 0);
            return acc + balance + change;
        }, 0);
            
        return { label: m.label, value: totalWealthAtMonth };
    });

    setDataPoints(chartData);

  }, [transactions, wallets]);

  if (dataPoints.length === 0) return null;

  const minVal = Math.min(...dataPoints.map(d => d.value));
  const maxVal = Math.max(...dataPoints.map(d => d.value));
  const range = maxVal - minVal || 1;
  const padding = Math.abs(range) * 0.1; 
  const plotMin = minVal - padding;
  const plotMax = maxVal + padding;
  const plotRange = plotMax - plotMin || 1;

  const width = 100;
  const height = 50;
  
  const points = dataPoints.map((d, i) => {
    const x = (i / (dataPoints.length - 1)) * width;
    const y = height - ((d.value - plotMin) / plotRange) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm mb-6 h-full">
        <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-800 uppercase tracking-wider border-l-4 border-gray-800 pl-2">
            <TrendingUp size={16} className="text-blue-500"/> ความมั่งคั่ง (6 เดือนล่าสุด)
        </div>
        <div className="relative h-32 w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <line x1="0" y1="0" x2="100" y2="0" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" />
                <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />
                <polygon fill="url(#gradient)" points={`0,${height} ${points} ${width},${height}`} opacity="0.2" />
                <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {dataPoints.map((d, i) => {
                     const x = (i / (dataPoints.length - 1)) * width;
                     const y = height - ((d.value - plotMin) / plotRange) * height;
                     return (<circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke="#3b82f6" strokeWidth="1" />);
                })}
            </svg>
            <div className="flex justify-between mt-2 text-[9px] text-gray-400 font-bold">
                {dataPoints.map((d, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <span>{d.label}</span>
                        {(i === dataPoints.length - 1) && <span className="text-blue-600 bg-blue-50 px-1 rounded">{d.value.toLocaleString()}k</span>}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

const CategoryBar = ({ category, amount, total, color, icon }) => {
  const percent = Math.min((amount / total) * 100, 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1 text-xs">
        <div className="flex items-center gap-2"><span className="text-sm">{icon}</span><span className="font-semibold text-gray-700">{category}</span></div>
        <div className="text-right"><span className="font-bold text-gray-800">{amount.toLocaleString()}</span><span className="text-[10px] text-gray-500 ml-1">({percent.toFixed(0)}%)</span></div>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden"><div style={{ width: `${percent}%`, backgroundColor: color }} className="h-full rounded-full transition-all duration-500 ease-out"></div></div>
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
      {particles.map((_, i) => (<div key={i} className={`absolute w-4 h-4 rounded-full bg-gradient-to-r shadow-md ${colorClass} ${animName}`} style={{ left: '50%', top: '50%', '--tx': `${(Math.random() - 0.5) * 350}px`, '--ty': type === 'income' ? `${window.innerHeight * 0.4}px` : `-${window.innerHeight * 0.4}px`, '--tr': type === 'transfer' ? `${(Math.random() > 0.5 ? 1 : -1) * window.innerWidth}px` : '0px', '--d': `${Math.random() * 0.3}s`, '--s': `${0.8 + Math.random() * 1.2}` }} />))}
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return (<div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 whitespace-nowrap ${type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>{type === 'success' ? <CheckCircle2 size={18} className="text-green-400"/> : <AlertCircle size={18} className="text-red-200"/>}<span className="text-sm font-medium font-sans">{message}</span></div>);
};

const CalendarHeatmap = ({ transactions, selectedMonth }) => {
  const now = selectedMonth || new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dailySpending = {};
  let maxSpend = 0;
  transactions.forEach(t => {
    const d = new Date(t.timestamp);
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense' && !t.isTransfer) {
      const day = d.getDate();
      dailySpending[day] = (dailySpending[day] || 0) + t.amount;
      if (dailySpending[day] > maxSpend) maxSpend = dailySpending[day];
    }
  });
  const getColor = (amount) => {
    if (!amount) return 'bg-gray-50 text-gray-300';
    const intensity = amount / (maxSpend || 1);
    if (intensity > 0.7) return 'bg-red-500 text-white shadow-md ring-2 ring-red-200';
    if (intensity > 0.4) return 'bg-orange-400 text-white';
    if (intensity > 0) return 'bg-green-400 text-white';
    return 'bg-gray-100 text-gray-400';
  };
  const formatMoney = (amount) => {
    if (!amount) return '';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'k';
    return amount;
  };
  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-800 uppercase tracking-wider border-l-4 border-gray-800 pl-2"><Activity size={16} /> ปฏิทินการใช้เงิน ({now.toLocaleString('th-TH', { month: 'long' })})</div>
      <div className="grid grid-cols-7 gap-1.5">{days.map(day => (<div key={day} className="flex flex-col items-center"><div className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all border border-transparent ${getColor(dailySpending[day])}`} title={`วันที่ ${day}: ฿${dailySpending[day] || 0}`}><span className="text-[8px] opacity-60 leading-none mb-0.5">{day}</span><span className="leading-none text-[9px]">{formatMoney(dailySpending[day])}</span></div></div>))}</div>
    </div>
  );
};

export default function App() {
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [bills, setBills] = useState([]);
  const [debts, setDebts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [events, setEvents] = useState([]);
  const [quickMenus, setQuickMenus] = useState([]);
  const [appProfiles, setAppProfiles] = useState(defaultProfiles);
  
  // Dynamic Categories State
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', icon: '🍔', color: '#ef4444', type: 'expense' });
  
  const [activeWalletId, setActiveWalletId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentProfile, setCurrentProfile] = useState('hart');
  const [viewMode, setViewMode] = useState('dashboard'); 
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [reportRange, setReportRange] = useState('month');
  const [modalMode, setModalMode] = useState(null); 
  const [animState, setAnimState] = useState({ active: false, type: 'expense', key: 0 });
  const [toast, setToast] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  
  const [selectedMonth] = useState(new Date());

  // Forms
  const [transactionForm, setTransactionForm] = useState({
    id: null,
    amount: '',
    category: '',
    tags: '',
    type: 'expense',
    transferToWalletId: '',
    date: new Date().toISOString().slice(0, 10),
    isCustomCategory: false,
  });

  const [walletForm, setWalletForm] = useState({ id: null, name: '', initialBalance: '', icon: '💵', color: '#1e40af', owner: 'hart', type: 'cash' });
  const [budgetForm, setBudgetForm] = useState({ id: null, category: '', limit: '' });
  const [billForm, setBillForm] = useState({ title: '', amount: '', recurringDay: '' });
  const [debtForm, setDebtForm] = useState({ person: '', amount: '', type: 'lent', note: '' });
  const [wishlistForm, setWishlistForm] = useState({ id: null, title: '', price: '', link: '', notes: '', status: 'pending' });
  const [eventForm, setEventForm] = useState({ id: null, title: '', date: '', items: [] });
  const [eventItemForm, setEventItemForm] = useState({ name: '', cost: '' });
  const [profileForm, setProfileForm] = useState({ name: '', icon: '', theme: '' });
  const [quickMenuForm, setQuickMenuForm] = useState({ name: '', amount: '', icon: '🍔', category: 'อาหาร' });
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
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // --- Data Loading ---
  useEffect(() => {
    const unsubW = onSnapshot(query(collection(db, "wallets"), orderBy("createdAt", "asc")), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => {
          const orderA = a.order !== undefined ? a.order : 9999;
          const orderB = b.order !== undefined ? b.order : 9999;
          return orderA - orderB;
      });
      setWallets(data);
    });

    const unsubT = onSnapshot(query(collection(db, "transactions"), orderBy("timestamp", "desc")), (snap) => {
        setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Categories (Custom)
    const unsubCats = onSnapshot(collection(db, "custom_categories"), async (snap) => {
        if (snap.empty && !snap.metadata.fromCache) {
             // Initialize Default Categories
             const batch = writeBatch(db);
             defaultExpenseCategories.forEach(c => {
                 const ref = doc(collection(db, "custom_categories"));
                 batch.set(ref, { ...c, type: 'expense', createdAt: Date.now() });
             });
             defaultIncomeCategories.forEach(c => {
                 const ref = doc(collection(db, "custom_categories"));
                 batch.set(ref, { ...c, type: 'income', createdAt: Date.now() });
             });
             await batch.commit();
        } else {
             const allCats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             setExpenseCategories(allCats.filter(c => c.type === 'expense').sort((a,b) => (a.createdAt||0) - (b.createdAt||0)));
             setIncomeCategories(allCats.filter(c => c.type === 'income').sort((a,b) => (a.createdAt||0) - (b.createdAt||0)));
        }
    });

    const unsubQM = onSnapshot(collection(db, "quick_menus"), (snap) => {
        if (snap.empty) {
            defaultQuickMenus.forEach(m => addDoc(collection(db, "quick_menus"), m));
        } else {
            setQuickMenus(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
    });

    const unsubB = onSnapshot(query(collection(db, "budgets")), (snap) => setBudgets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubBills = onSnapshot(query(collection(db, "bills"), orderBy("createdAt", "desc")), (snap) => setBills(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubDebts = onSnapshot(query(collection(db, "debts"), orderBy("createdAt", "desc")), (snap) => setDebts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubWish = onSnapshot(query(collection(db, "wishlist"), orderBy("createdAt", "desc")), (snap) => setWishlist(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubEvents = onSnapshot(query(collection(db, "events"), orderBy("date", "asc")), (snap) => setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const unsubProfiles = onSnapshot(doc(db, "app_settings", "profiles_config"), (doc) => {
        if (doc.exists()) setAppProfiles(doc.data());
        else setDoc(doc.ref, defaultProfiles);
    });

    return () => { unsubW(); unsubT(); unsubCats(); unsubQM(); unsubB(); unsubBills(); unsubDebts(); unsubWish(); unsubEvents(); unsubProfiles(); };
  }, []);

  const visibleWallets = wallets.filter(w => currentProfile === 'family' ? true : (w.owner === currentProfile || !w.owner));
  
  useEffect(() => {
    if (visibleWallets.length > 0 && !visibleWallets.find(w => w.id === activeWalletId)) setActiveWalletId(visibleWallets[0].id);
    else if (visibleWallets.length === 0) setActiveWalletId(null);
  }, [currentProfile, wallets]); 

  const activeWallet = visibleWallets.find(w => w.id === activeWalletId) || {};
  
  const displayTransactions = useMemo(() => {
      const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getTime();
      const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59).getTime();
      return transactions.filter(t => t.timestamp >= start && t.timestamp <= end);
  }, [transactions, selectedMonth]);

  // All wallets transactions (sorted by newest first) with wallet info
  const allWalletsTransactions = useMemo(() => {
      return displayTransactions
          .map(t => ({
              ...t,
              walletName: wallets.find(w => w.id === t.walletId)?.name || 'Unknown',
              walletIcon: wallets.find(w => w.id === t.walletId)?.icon || '💵',
              walletColor: wallets.find(w => w.id === t.walletId)?.color || '#64748b'
          }))
          .sort((a, b) => b.timestamp - a.timestamp);
  }, [displayTransactions, wallets]);

  // Calculations
  const calculateBalance = (wallet) => {
    if (!wallet) return 0;
    const walletTx = transactions.filter(t => t.walletId === wallet.id);
    const calculated = (parseFloat(wallet.initialBalance) || 0) + walletTx.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
    return calculated;
  };

  const calculateDailyChange = (walletId) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return transactions
      .filter(t => t.walletId === walletId && t.timestamp >= startOfDay)
      .reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense') return sum - t.amount;
        return sum;
      }, 0);
  };

  const totalWealth = visibleWallets.reduce((acc, wallet) => acc + calculateBalance(wallet), 0);
  const myPendingBills = bills.filter(b => b.assignedTo === currentProfile && b.status !== 'paid');
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const profileBudgets = budgets.filter(b => currentProfile === 'family' ? true : (b.owner === currentProfile));
  const totalMonthlyBudget = profileBudgets.reduce((acc, b) => acc + b.limit, 0);
  
  const budgetedExpenses = transactions.filter(t => {
    const txDate = new Date(t.timestamp);
    const isBudgeted = profileBudgets.some(b => b.category === t.category);
    const isProfileTx = currentProfile === 'family' ? true : visibleWallets.some(w => w.id === t.walletId);
    return t.type === 'expense' && !t.isTransfer && isBudgeted && isProfileTx &&
           txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  }).reduce((sum, t) => sum + t.amount, 0);

  const remainingBudget = totalMonthlyBudget - budgetedExpenses;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayDate = new Date().getDate();
  const daysRemaining = Math.max(1, daysInMonth - todayDate + 1);
  const dailyBudget = totalMonthlyBudget > 0 ? (remainingBudget / daysRemaining) : 0;

  const reportStats = useMemo(() => {
    const filteredTx = displayTransactions.filter(t => {
       if (!visibleWallets.some(w => w.id === t.walletId)) return false;
       return true;
    });
    const income = filteredTx.filter(t => t.type === 'income' && !t.isTransfer).reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTx.filter(t => t.type === 'expense' && !t.isTransfer).reduce((sum, t) => sum + t.amount, 0);
    const catStats = {};
    filteredTx.filter(t => t.type === 'expense' && !t.isTransfer).forEach(t => { catStats[t.category] = (catStats[t.category] || 0) + t.amount; });
    return { income, expense, sortedCats: Object.entries(catStats).sort((a, b) => b[1] - a[1]) };
  }, [displayTransactions, visibleWallets]);

  // --- Desktop dashboard derived data ---
  const netSavings = reportStats.income - reportStats.expense;
  const savingsRate = reportStats.income > 0 ? Math.round((netSavings / reportStats.income) * 100) : 0;

  const monthlyFlow = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = d.getTime();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
      const tx = transactions.filter(t => visibleWallets.some(w => w.id === t.walletId) && !t.isTransfer && t.timestamp >= start && t.timestamp <= end);
      const income = tx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = tx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      months.push({ label: d.toLocaleDateString('th-TH', { month: 'short' }), income, expense });
    }
    const max = Math.max(1, ...months.flatMap(m => [m.income, m.expense]));
    return { months, max };
  }, [transactions, visibleWallets]);

  const spendingDonut = useMemo(() => {
    const total = reportStats.expense || 0;
    const palette = ['#0d9488', '#0ea5e9', '#f59e0b', '#10b981', '#64748b'];
    const top = reportStats.sortedCats.slice(0, 4);
    const othersAmt = reportStats.sortedCats.slice(4).reduce((s, [, a]) => s + a, 0);
    const segs = top.map(([name, amt], i) => ({ name, amt, color: palette[i] }));
    if (othersAmt > 0) segs.push({ name: 'อื่น ๆ', amt: othersAmt, color: palette[4] });
    let acc = 0;
    const stops = segs.map(s => {
      const from = total ? (acc / total) * 100 : 0;
      acc += s.amt;
      const to = total ? (acc / total) * 100 : 0;
      return `${s.color} ${from}% ${to}%`;
    });
    return { segs, total, gradient: stops.length ? `conic-gradient(${stops.join(',')})` : 'conic-gradient(#e2e8f0 0 100%)' };
  }, [reportStats]);

  const myDebts = debts.filter(d => d.owner === currentProfile);
  const debtLent = myDebts.filter(d => d.type === 'lent').reduce((s, d) => s + d.amount, 0);
  const debtBorrowed = myDebts.filter(d => d.type === 'borrowed').reduce((s, d) => s + d.amount, 0);
  const debtNet = debtLent - debtBorrowed;

  const getCategorySpent = (catName) => transactions.filter(t => {
        const txDate = new Date(t.timestamp);
        return t.category === catName && t.type === 'expense' && !t.isTransfer && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear && visibleWallets.some(w => w.id === t.walletId);
      }).reduce((sum, t) => sum + t.amount, 0);

  const profileData = appProfiles[currentProfile];
  const themeColor = colorsList.find(c => c.id === profileData.theme) || colorsList[0];

  // --- Handlers ---

  const handleEditProfile = () => {
      if (currentProfile === 'family') return showToast("โปรไฟล์ครอบครัวแก้ไขไม่ได้ครับ", "error");
      setProfileForm({ name: profileData.name, icon: profileData.icon, theme: profileData.theme });
      setModalMode('edit-profile');
  };

  const handleSaveProfile = async () => {
      if (!profileForm.name) return showToast("กรุณาใส่ชื่อ", "error");
      setLoading(true);
      try {
          const updatedProfiles = {
              ...appProfiles,
              [currentProfile]: { ...appProfiles[currentProfile], ...profileForm }
          };
          await setDoc(doc(db, "app_settings", "profiles_config"), updatedProfiles);
          setModalMode(null);
          showToast("อัปเดตโปรไฟล์เรียบร้อย!");
      } catch (error) {
          showToast("เกิดข้อผิดพลาด: " + error.message, "error");
      } finally {
          setLoading(false);
      }
  };

  const handleOpenTransaction = (selectedType = 'expense', editData = null) => { 
    if (editData) {
      setTransactionForm({
        id: editData.id,
        amount: editData.amount.toString(),
        category: editData.category,
        tags: editData.note ? editData.note.replace(/#/g, '').trim() : '',
        type: editData.type,
        transferToWalletId: '', 
        date: new Date(editData.timestamp).toISOString().slice(0, 10),
        isTransfer: editData.isTransfer,
        isCustomCategory: !expenseCategories.some(c => c.name === editData.category) && !incomeCategories.some(c => c.name === editData.category)
      });
      if (editData.isTransfer) {
        showToast("การแก้ไขรายการโอน อาจทำให้ยอดเงินไม่ตรงกัน แนะนำให้ลบแล้วสร้างใหม่ครับ", "error");
      }
    } else {
      setTransactionForm({
        id: null,
        amount: '',
        category: '',
        tags: '',
        type: selectedType,
        transferToWalletId: '',
        date: new Date().toISOString().slice(0, 10),
        isTransfer: false,
        isCustomCategory: false
      });
    }
    setModalMode('add-transaction'); 
    setIsFabOpen(false); 
  };

  const triggerAnimation = (animType) => { setAnimState({ active: true, type: animType, key: Date.now() }); setTimeout(() => setAnimState(prev => ({ ...prev, active: false })), 1500); };

  const handleSaveTransaction = async () => {
    const { id, amount, category, tags, type, transferToWalletId, date } = transactionForm;
    if (!amount) return showToast("กรุณากรอกจำนวนเงิน", "error");
    if (!category) return showToast("กรุณาเลือกหมวดหมู่", "error");

    setLoading(true);
    const selectedDate = new Date(date);
    const now = new Date();
    let timestamp = selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    if (date !== now.toISOString().slice(0,10)) {
        timestamp = new Date(date).setHours(12,0,0);
    }

    const dateDisplay = new Date(timestamp).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
    const note = tags; 
    const numericAmount = parseFloat(amount);

    try {
      if (type === 'transfer') {
        if (!transferToWalletId || transferToWalletId === activeWalletId) { setLoading(false); return showToast("ปลายทางไม่ถูกต้อง", "error"); }
        const toWalletName = wallets.find(w => w.id === transferToWalletId)?.name || 'Unknown';
        
        const batch = writeBatch(db);
        const expenseRef = doc(collection(db, "transactions"));
        const incomeRef = doc(collection(db, "transactions"));
        const transferGroupId = crypto.randomUUID(); 

        batch.set(expenseRef, { 
            amount: numericAmount, 
            category: `โอนไป ${toWalletName}`, 
            type: 'expense', 
            isTransfer: true, 
            walletId: activeWalletId, 
            timestamp, 
            dateDisplay, 
            note,
            transferGroupId 
        });

        batch.set(incomeRef, { 
            amount: numericAmount, 
            category: `รับจาก ${activeWallet.name}`, 
            type: 'income', 
            isTransfer: true, 
            walletId: transferToWalletId, 
            timestamp, 
            dateDisplay, 
            note,
            transferGroupId 
        });

        await batch.commit();
        triggerAnimation('transfer');
      } else {
        const txData = { amount: numericAmount, category, type, isTransfer: false, walletId: activeWalletId, timestamp, dateDisplay, note };
        if (id) {
           await updateDoc(doc(db, "transactions", id), txData);
           showToast("แก้ไขเรียบร้อย!");
        } else {
           await addDoc(collection(db, "transactions"), txData);
           triggerAnimation(type);
           showToast("บันทึกสำเร็จ!");
        }
      }
      setModalMode(null); 
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  const handleSaveWallet = async () => {
    if (!walletForm.name) return showToast("ใส่ชื่อกระเป๋า", "error");
    setLoading(true);
    try {
      const walletData = { 
          name: walletForm.name, 
          initialBalance: parseFloat(walletForm.initialBalance) || 0, 
          icon: walletForm.icon, 
          color: walletForm.color, 
          owner: walletForm.owner,
          type: 'general', 
          order: wallets.length 
      };
      if (walletForm.id) {
          delete walletData.order;
          await updateDoc(doc(db, "wallets", walletForm.id), walletData);
      }
      else { 
          const newRef = await addDoc(collection(db, "wallets"), { ...walletData, createdAt: Date.now() }); 
          setActiveWalletId(newRef.id); 
      }
      setWalletForm({ id: null, name: '', initialBalance: '', icon: '💵', color: '#1e40af', owner: currentProfile, type: 'cash' }); setModalMode(null); showToast("บันทึกกระเป๋าเรียบร้อย");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  const handleDeleteWallet = async (walletId) => {
    if (confirm("⚠️ ลบกระเป๋านี้จริงหรือไม่? ข้อมูลธุรกรรมทั้งหมดในกระเป๋านี้จะถูกลบด้วย!")) {
        setLoading(true);
        try {
            const q = query(collection(db, "transactions"), where("walletId", "==", walletId));
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => { batch.delete(doc.ref); });
            batch.delete(doc(db, "wallets", walletId));
            await batch.commit();
            if (activeWalletId === walletId) setActiveWalletId(null);
            setModalMode(null);
            showToast("ลบกระเป๋าเรียบร้อยแล้ว");
        } catch (error) {
            showToast("เกิดข้อผิดพลาด: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    }
  };

  const handleClearWalletTransactions = async (walletId) => {
    if (confirm("⚠️ แน่ใจไหม? ประวัติการใช้จ่ายทั้งหมดของกระเป๋านี้จะหายไป!")) {
      setLoading(true);
      try {
        const q = query(collection(db, "transactions"), where("walletId", "==", walletId));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => { batch.delete(doc.ref); });
        await batch.commit();
        showToast("ล้างประวัติเรียบร้อย (เริ่มใหม่!)");
        setModalMode(null);
      } catch (error) { showToast("เกิดข้อผิดพลาด: " + error.message, "error"); } finally { setLoading(false); }
    }
  };

  // --- CATEGORY MANAGEMENT ---
  const openManageCategory = () => { setCategoryForm({ id: null, name: '', icon: '✨', color: '#64748b', type: 'expense' }); setModalMode('manage-categories'); };
  
  const editCategory = (cat) => {
      if (!cat || !cat.id) {
          showToast("เกิดข้อผิดพลาด - ไม่พบข้อมูลหมวดหมู่", "error");
          return;
      }
      setCategoryForm({
          id: cat.id,
          name: cat.name || '',
          icon: cat.icon || '✨',
          color: cat.color || '#64748b',
          type: cat.type || 'expense'
      });
  };
  
  const handleSaveCategory = async () => {
      if (!categoryForm.name) return showToast("กรุณาใส่ชื่อหมวดหมู่", "error");
      setLoading(true);
      try {
          const categoryData = {
              name: categoryForm.name,
              icon: categoryForm.icon || '✨',
              color: categoryForm.color || '#64748b',
              type: categoryForm.type || 'expense'
          };
          if (categoryForm.id) {
              await updateDoc(doc(db, "custom_categories", categoryForm.id), categoryData);
          } else {
              await addDoc(collection(db, "custom_categories"), { ...categoryData, createdAt: Date.now() });
          }
          setCategoryForm({ id: null, name: '', icon: '✨', color: '#64748b', type: 'expense' });
          showToast("บันทึกหมวดหมู่แล้ว");
      } catch(e) { 
          showToast("บันทึกไม่สำเร็จ: " + e.message, "error"); 
      } finally { 
          setLoading(false); 
      }
  };
  const handleDeleteCategory = async (id) => {
      if (!id) {
          showToast("ไม่สามารถลบได้ - ไม่พบรหัสหมวดหมู่", "error");
          return;
      }
      if(confirm("ลบหมวดหมู่นี้?")) {
          setLoading(true);
          try {
              await deleteDoc(doc(db, "custom_categories", id));
              // Clear the form if we're editing this category
              if(categoryForm.id === id) {
                  setCategoryForm({ id: null, name: '', icon: '✨', color: '#64748b', type: 'expense' });
              }
              showToast("ลบหมวดหมู่เรียบร้อยแล้ว");
          } catch(e) {
              console.error("Delete error:", e);
              showToast("ลบไม่สำเร็จ: " + (e.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"), "error");
          } finally {
              setLoading(false);
          }
      }
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

  const handleAddBill = async () => { 
    if (!billForm.title || !billForm.amount) return showToast("กรอกชื่อและยอดเงิน", "error");
    setLoading(true);
    try {
      await addDoc(collection(db, "bills"), {
        title: billForm.title, amount: parseFloat(billForm.amount), recurringDay: billForm.recurringDay,
        assignedTo: null, assignedBy: null, status: 'pending', createdAt: Date.now()
      });
      setBillForm({ title: '', amount: '', recurringDay: '' }); setModalMode(null); showToast("สร้างบิลแล้ว");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };
  const handleAssignBill = async (billId, targetProfile) => {
    try { await updateDoc(doc(db, "bills", billId), { assignedTo: targetProfile, assignedBy: currentProfile }); showToast(`โยนบิลไปให้ ${appProfiles[targetProfile].name} แล้ว!`); } catch (error) { showToast(error.message, "error"); }
  };
  const handleUnassignBill = async (billId) => {
    try { await updateDoc(doc(db, "bills", billId), { assignedTo: null, assignedBy: null }); showToast("ยกเลิกการโยน"); } catch (error) { showToast(error.message, "error"); }
  };
  const handlePayBillClick = (bill) => { setPayBillData(bill); setModalMode('pay-bill'); };
  const confirmPayBill = async (walletId) => {
    if(!walletId) return showToast("เลือกกระเป๋าจ่าย", "error");
    setLoading(true);
    try {
      await updateDoc(doc(db, "bills", payBillData.id), { status: 'paid' });
      await addDoc(collection(db, "transactions"), { amount: parseFloat(payBillData.amount), category: 'จ่ายบิล', type: 'expense', isTransfer: false, walletId: walletId, note: `ชำระบิล: ${payBillData.title}`, timestamp: Date.now(), dateDisplay: new Date().toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'}) });
      triggerAnimation('expense'); setModalMode(null); setPayBillData(null); showToast(`จ่ายบิลเรียบร้อย`);
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };

  const handleSaveWishlist = async () => {
    if(!wishlistForm.title || !wishlistForm.price) return showToast("กรอกชื่อของและราคา", "error");
    setLoading(true);
    try {
      const wishlistData = {
        title: wishlistForm.title, price: parseFloat(wishlistForm.price), link: wishlistForm.link, notes: wishlistForm.notes,
        requester: wishlistForm.id ? wishlistForm.requester : currentProfile, status: wishlistForm.status, createdAt: Date.now()
      };
      if (wishlistForm.id) await updateDoc(doc(db, "wishlist", wishlistForm.id), wishlistData);
      else await addDoc(collection(db, "wishlist"), wishlistData);
      setWishlistForm({ id: null, title: '', price: '', link: '', notes: '', status: 'pending' }); setModalMode(null); showToast("บันทึกรายการแล้ว!");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };
  const handleWishlistAction = async (id, status) => {
    try { await updateDoc(doc(db, "wishlist", id), { status }); showToast(status === 'approved' ? 'อนุมัติแล้ว!' : (status === 'pending' ? 'รีเซ็ตสถานะแล้ว' : 'ปัดตกแล้ว')); } catch (error) { showToast(error.message, "error"); }
  };
  const handleDeleteWishlist = async (id) => { if(confirm("ลบรายการนี้?")) await deleteDoc(doc(db, "wishlist", id)); };
  const openEditWishlist = (item) => { setWishlistForm({ id: item.id, title: item.title, price: item.price, link: item.link, notes: item.notes, status: item.status, requester: item.requester }); setModalMode('manage-wishlist'); };

  const handleSaveEvent = async () => {
    if(!eventForm.title) return showToast("ใส่ชื่อกิจกรรม", "error");
    setLoading(true);
    try {
      const eventData = { title: eventForm.title, date: eventForm.date, items: eventForm.items, createdAt: Date.now() };
      if(eventForm.id) await updateDoc(doc(db, "events", eventForm.id), eventData);
      else await addDoc(collection(db, "events"), eventData);
      setEventForm({ id: null, title: '', date: '', items: [] }); setModalMode(null); showToast("บันทึกกิจกรรมแล้ว");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };
  const addEventItem = () => {
    if(!eventItemForm.name || !eventItemForm.cost) return;
    setEventForm(prev => ({ ...prev, items: [...prev.items, { name: eventItemForm.name, cost: parseFloat(eventItemForm.cost) }] }));
    setEventItemForm({ name: '', cost: '' });
  };
  const removeEventItem = (index) => { const newItems = [...eventForm.items]; newItems.splice(index, 1); setEventForm(prev => ({ ...prev, items: newItems })); };
  const handleDeleteEvent = async (id) => { if(confirm("ลบกิจกรรม?")) await deleteDoc(doc(db, "events", id)); };
  const openEditEvent = (event) => { setEventForm({ id: event.id, title: event.title, date: event.date, items: event.items || [] }); setModalMode('manage-event'); };

  const handleAddDebt = async () => {
    if (!debtForm.person || !debtForm.amount) return showToast("กรอกข้อมูล", "error");
    setLoading(true);
    try {
      await addDoc(collection(db, "debts"), { person: debtForm.person, amount: parseFloat(debtForm.amount), type: debtForm.type, note: debtForm.note, status: 'pending', owner: currentProfile, createdAt: Date.now() });
      setDebtForm({ person: '', amount: '', type: 'lent', note: '' }); setModalMode(null); showToast("บันทึกหนี้สินเรียบร้อย");
    } catch (error) { showToast(error.message, "error"); } finally { setLoading(false); }
  };
  const handleSettleDebt = async (id) => { if(confirm("เคลียร์ยอด?")) { try { await deleteDoc(doc(db, "debts", id)); showToast("ลบรายการแล้ว"); } catch (error) { showToast(error.message, "error"); } } };

  const handleDeleteTransaction = async (id) => { if(confirm("ลบรายการ?")) await deleteDoc(doc(db, "transactions", id)); };
  const handleDeleteBudget = async (id) => { if(confirm("ลบงบประมาณ?")) { await deleteDoc(doc(db, "budgets", id)); setModalMode(null); }};
  const handleDeleteBill = async (id) => { if(confirm("ลบบิลนี้?")) await deleteDoc(doc(db, "bills", id)); };

  const openEditWallet = (wallet) => { setWalletForm({ id: wallet.id, name: wallet.name, initialBalance: wallet.initialBalance, icon: wallet.icon, color: wallet.color, owner: wallet.owner || 'hart', type: wallet.type || 'cash' }); setModalMode('manage-wallet'); };
  const openCreateWallet = () => { 
    const defaultOwner = currentProfile === 'family' ? 'hart' : currentProfile;
    const defaultColor = defaultOwner === 'jah' ? '#be123c' : '#1e40af';
    setWalletForm({ id: null, name: '', initialBalance: '', icon: '💵', color: defaultColor, owner: defaultOwner, type: 'cash' }); setModalMode('manage-wallet'); 
  };
  const openCreateBudget = () => { setBudgetForm({ id: null, category: '', limit: '' }); setModalMode('manage-budget'); };
  const openEditBudget = (b) => { setBudgetForm({ id: b.id, category: b.category, limit: b.limit }); setModalMode('manage-budget'); };
  const openAddDebt = () => { setDebtForm({ person: '', amount: '', type: 'lent', note: '' }); setModalMode('add-debt'); };

  // --- Quick Menu Logic ---
  const handleQuickAdd = async (menu) => {
      setLoading(true);
      try {
          await addDoc(collection(db, "transactions"), {
              amount: parseFloat(menu.amount),
              category: menu.category,
              type: 'expense',
              isTransfer: false,
              walletId: activeWalletId,
              timestamp: Date.now(),
              dateDisplay: new Date().toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'}),
              note: `ด่วน: ${menu.name}`
          });
          triggerAnimation('expense');
          showToast(`บันทึก ${menu.name} ${menu.amount}฿ แล้ว!`);
      } catch(e) { 
          showToast("บันทึกไม่สำเร็จ: " + e.message, "error");
      } finally { 
          setLoading(false); 
      }
  };

  const openManageQuickMenu = () => { setQuickMenuForm({ name: '', amount: '', icon: '🍔', category: 'อาหาร' }); setModalMode('manage-quick-menu'); };
  const handleSaveQuickMenu = async () => {
      if(!quickMenuForm.name || !quickMenuForm.amount) return showToast("กรอกชื่อและราคา", "error");
      setLoading(true);
      try {
          if (quickMenuForm.id) {
              await updateDoc(doc(db, "quick_menus", quickMenuForm.id), quickMenuForm);
          } else {
              await addDoc(collection(db, "quick_menus"), quickMenuForm);
          }
          setModalMode(null);
          showToast("บันทึกเมนูลัดแล้ว");
      } catch(e) { showToast(e.message, "error"); } finally { setLoading(false); }
  };
  const handleDeleteQuickMenu = async (id) => {
      if(confirm("ลบเมนูนี้?")) await deleteDoc(doc(db, "quick_menus", id));
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen p-4 font-['IBM_Plex_Sans_Thai'] text-gray-900 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full h-[85vh] max-w-6xl bg-white flex flex-row relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-200 rounded-[2.5rem] overflow-hidden">
        
        <Particles key={animState.key} active={animState.active} type={animState.type} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* --- SIDEBAR NAVIGATION --- */}
        <nav className="flex flex-col w-20 bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r border-gray-100 items-center py-8 gap-6 z-20 shrink-0">
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm bg-white border border-gray-200 mb-4 cursor-pointer`} onClick={handleEditProfile}>{profileData.icon}</div>
           
           <button onClick={() => setViewMode('dashboard')} className={`p-3 rounded-2xl transition-all group relative ${viewMode === 'dashboard' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:shadow-md hover:text-gray-600'}`}>
             <Home size={20} />
             <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">หน้าหลัก</span>
           </button>
           
           <button onClick={() => setViewMode('planning')} className={`p-3 rounded-2xl transition-all group relative ${viewMode === 'planning' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:shadow-md hover:text-pink-500'}`}>
             <CalendarHeart size={20} />
             <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">วางแผน</span>
           </button>

           {currentProfile === 'family' ? (
             <button onClick={() => setViewMode('bills')} className={`p-3 rounded-2xl transition-all group relative ${viewMode === 'bills' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:shadow-md hover:text-purple-500'}`}>
               <CheckSquare size={20} />
               <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">บิลกลาง</span>
             </button>
           ) : (
             <button onClick={() => setViewMode('debts')} className={`p-3 rounded-2xl transition-all group relative ${viewMode === 'debts' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:shadow-md hover:text-orange-500'}`}>
               <BookOpen size={20} />
               <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">หนี้สิน</span>
             </button>
           )}

           <button onClick={() => setViewMode('report')} className={`p-3 rounded-2xl transition-all group relative ${viewMode === 'report' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:shadow-md hover:text-blue-500'}`}>
             <PieChart size={20} />
             <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">รายงาน</span>
           </button>
           
           <button onClick={() => openManageCategory()} className={`p-3 rounded-2xl transition-all group relative text-gray-400 hover:bg-white hover:shadow-md hover:text-gray-600`}>
             <SlidersHorizontal size={20} />
             <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">ปรับแต่ง</span>
           </button>

           <div className="mt-auto flex flex-col gap-4">
              <button onClick={() => setPrivacyMode(!privacyMode)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-all">{privacyMode ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              {currentProfile !== 'family' && <button onClick={() => handleOpenTransaction('expense')} className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all ${themeColor.accent} text-white hover:scale-110 active:scale-95`}><Plus size={20} /></button>}
           </div>
        </nav>

        {/* HEADER — profile switcher */}
        <div className="flex absolute top-6 right-8 z-30 gap-3 items-center">
             <div className="flex bg-gray-50 p-1 rounded-full border border-gray-100">
               {Object.keys(appProfiles).map((key) => (
                 <button key={key} onClick={() => setCurrentProfile(key)} className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all ${currentProfile === key ? 'bg-white shadow-sm border border-gray-200 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}><span>{appProfiles[key].icon}</span> {appProfiles[key].name}</button>
               ))}
             </div>
        </div>

        {/* === DASHBOARD VIEW (single-page overview) === */}
        {viewMode === 'dashboard' && (
          <div className="flex flex-col flex-1 overflow-hidden bg-[#f4f9f8]">
            {/* Title */}
            <div className="pt-7 px-8 pb-3 shrink-0">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2"><LayoutGrid className="text-teal-500" size={22}/> ภาพรวมกระเป๋าเงิน</h2>
              <p className="text-xs text-slate-400 mt-1">ยินดีต้อนรับกลับ, {profileData.name}! · {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">

              {/* Pending Bills Alert */}
              {myPendingBills.length > 0 && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-cyan-800 font-bold text-xs uppercase tracking-wider shrink-0">
                    <Bell size={15} className="animate-bounce"/> บิลรอจ่าย ({myPendingBills.length})
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {myPendingBills.map(bill => (
                      <div key={bill.id} className="flex-shrink-0 flex items-center gap-3 bg-white p-2 px-3 rounded-xl border border-cyan-100 shadow-sm">
                        <div><p className="font-bold text-slate-800 text-xs">{bill.title}</p><p className="text-cyan-700 font-bold text-sm">฿{bill.amount.toLocaleString()}</p></div>
                        <button onClick={() => handlePayBillClick(bill)} className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:opacity-90 whitespace-nowrap">จ่ายเลย</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KPI ROW */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="rounded-2xl p-4 text-white shadow-lg bg-gradient-to-br from-teal-600 to-cyan-600 relative overflow-hidden">
                  <Wallet className="absolute -right-3 -top-3 opacity-20" size={70}/>
                  <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">สินทรัพย์รวม</p>
                  <h3 className="text-2xl font-bold mt-2 tracking-tight">{privacyMode ? '••••••' : `฿${totalWealth.toLocaleString()}`}</h3>
                </div>
                <div className="rounded-2xl p-4 bg-white border border-slate-200/70 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">รายรับ</span><span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp size={16}/></span></div>
                  <h3 className="text-xl font-bold mt-2 text-emerald-600">{privacyMode ? '•••' : `฿${reportStats.income.toLocaleString()}`}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">เดือนนี้</p>
                </div>
                <div className="rounded-2xl p-4 bg-white border border-slate-200/70 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">รายจ่าย</span><span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center"><TrendingDown size={16}/></span></div>
                  <h3 className="text-xl font-bold mt-2 text-slate-800">{privacyMode ? '•••' : `฿${reportStats.expense.toLocaleString()}`}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">เดือนนี้</p>
                </div>
                <div className="rounded-2xl p-4 bg-white border border-slate-200/70 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">คงเหลือสุทธิ</span><span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center"><Activity size={16}/></span></div>
                  <h3 className={`text-xl font-bold mt-2 ${netSavings >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{privacyMode ? '•••' : `${netSavings >= 0 ? '+' : '-'}฿${Math.abs(netSavings).toLocaleString()}`}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">{savingsRate >= 0 ? `ออมได้ ${savingsRate}% ของรายรับ` : 'ใช้เกินรายรับ'}</p>
                </div>
                <div className="rounded-2xl p-4 bg-white border border-slate-200/70 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">ใช้ได้วันละ</span><span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><Target size={16}/></span></div>
                  {totalMonthlyBudget === 0 ? (
                    <h3 className="text-sm font-bold mt-2 text-slate-300 cursor-pointer hover:text-slate-400" onClick={() => showToast('ไปตั้งงบประมาณก่อนครับ')}>+ ตั้งงบก่อน</h3>
                  ) : (
                    <h3 className="text-xl font-bold mt-2 text-slate-800">{privacyMode ? '•••' : `฿${Math.floor(dailyBudget).toLocaleString()}`}</h3>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">{totalMonthlyBudget === 0 ? 'ยังไม่ได้ตั้งงบ' : `เหลืออีก ${daysRemaining} วัน`}</p>
                </div>
              </div>

              {/* BENTO GRID */}
              <div className="grid grid-cols-12 gap-5">

                {/* Wallets */}
                <div className="col-span-12 lg:col-span-8 rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><Wallet size={15} className="text-teal-600"/> กระเป๋าเงิน</h3>
                    {currentProfile !== 'family' && <button onClick={openCreateWallet} className="text-[10px] bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1 font-bold hover:opacity-90 transition-opacity"><Plus size={13}/> สร้างใหม่</button>}
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {visibleWallets.length === 0 ? (
                      <div className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">ไม่พบกระเป๋าเงิน</div>
                    ) : visibleWallets.map(wallet => {
                      const balance = calculateBalance(wallet);
                      const dailyChange = calculateDailyChange(wallet.id);
                      const isActive = wallet.id === activeWalletId;
                      return (
                        <div key={wallet.id} className="relative flex-shrink-0 group/w">
                          <button onClick={() => setActiveWalletId(wallet.id)} style={{ backgroundColor: wallet.color }} className={`w-44 rounded-2xl p-4 text-white text-left relative overflow-hidden flex flex-col justify-between min-h-[112px] transition-all ${isActive ? 'ring-2 ring-offset-2 ring-teal-400 scale-[1.02]' : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'}`}>
                            <div className="absolute -right-5 -bottom-6 w-20 h-20 rounded-full bg-white/10"></div>
                            <div className="flex items-center gap-2 z-10"><span className="text-2xl drop-shadow">{wallet.icon}</span><span className="text-[11px] font-semibold opacity-95 leading-tight">{wallet.name}</span></div>
                            <div className="z-10">
                              <p className={`text-xl font-bold tracking-tight ${balance < 0 ? 'text-rose-100' : 'text-white'}`}>{privacyMode ? '••••' : `฿${balance.toLocaleString()}`}</p>
                              {!privacyMode && dailyChange !== 0 && <p className={`text-[10px] font-semibold ${dailyChange > 0 ? 'text-green-100' : 'text-rose-100'}`}>{dailyChange > 0 ? '▲ +' : '▼ '}{Math.abs(dailyChange).toLocaleString()} วันนี้</p>}
                            </div>
                          </button>
                          {currentProfile !== 'family' && (
                            <button onClick={() => openEditWallet(wallet)} className="absolute top-2 right-2 p-1.5 bg-black/25 rounded-full text-white opacity-0 group-hover/w:opacity-100 hover:bg-black/45 transition-all z-20" title="แก้ไขกระเป๋า"><Settings size={13}/></button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Menu */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><Zap size={15} className="text-amber-500"/> เมนูลัด</h3>
                    <button onClick={openManageQuickMenu} className="text-slate-400 hover:text-slate-600"><Edit3 size={14}/></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {quickMenus.slice(0, 7).map((menu, idx) => (
                      <button key={idx} onClick={() => handleQuickAdd(menu)} disabled={loading} className="border border-slate-200 rounded-xl p-2 flex flex-col items-center hover:border-teal-400 hover:bg-teal-50/50 transition-all active:scale-95">
                        <span className="text-lg">{menu.icon}</span>
                        <span className="text-[9px] font-bold text-slate-600 truncate w-full text-center">{menu.name}</span>
                        <span className="text-[9px] text-slate-400">฿{menu.amount}</span>
                      </button>
                    ))}
                    <button onClick={openManageQuickMenu} className="border border-dashed border-slate-300 rounded-xl p-2 flex items-center justify-center text-slate-400 hover:bg-slate-50 min-h-[52px]"><Plus size={18}/></button>
                  </div>
                </div>

                {/* Cashflow */}
                <div className="col-span-12 lg:col-span-7 rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><BarChart3 size={15} className="text-cyan-600"/> กระแสเงินสด · 6 เดือนล่าสุด</h3>
                    <button onClick={() => setViewMode('report')} className="text-[11px] text-cyan-600 font-bold hover:underline">ดูรายงาน →</button>
                  </div>
                  <div className="flex items-end gap-3 h-36">
                    {monthlyFlow.months.map((m, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                        <div className="flex gap-1.5 items-end w-full justify-center h-full">
                          <div className="w-2.5 rounded-t bg-gradient-to-t from-teal-300 to-teal-600" style={{ height: `${(m.income / monthlyFlow.max) * 100}%` }} title={`รายรับ ฿${m.income.toLocaleString()}`}></div>
                          <div className="w-2.5 rounded-t bg-gradient-to-t from-sky-300 to-sky-500" style={{ height: `${(m.expense / monthlyFlow.max) * 100}%` }} title={`รายจ่าย ฿${m.expense.toLocaleString()}`}></div>
                        </div>
                        <span className="text-[10px] text-slate-400">{m.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-teal-600 inline-block"></i>รายรับ</span>
                    <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block"></i>รายจ่าย</span>
                  </div>
                </div>

                {/* Category Donut */}
                <div className="col-span-12 lg:col-span-5 rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><PieChart size={15} className="text-teal-600"/> รายจ่ายตามหมวด</h3>
                    <span className="text-[11px] text-slate-400">{selectedMonth.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })}</span>
                  </div>
                  {spendingDonut.segs.length === 0 ? (
                    <div className="py-10 text-center text-slate-300 text-xs">ยังไม่มีรายจ่ายเดือนนี้ 🎉</div>
                  ) : (
                    <div className="flex items-center gap-5">
                      <div className="relative w-28 h-28 shrink-0 rounded-full" style={{ background: spendingDonut.gradient }}>
                        <div className="absolute inset-[18px] rounded-full bg-white flex flex-col items-center justify-center text-center">
                          <span className="text-sm font-bold text-slate-800">{privacyMode ? '•••' : `฿${spendingDonut.total.toLocaleString()}`}</span>
                          <span className="text-[9px] text-slate-400">รวมทั้งเดือน</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        {spendingDonut.segs.map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <i className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }}></i>
                            <span className="flex-1 text-slate-500 truncate">{expenseCategories.find(c => c.name === s.name)?.icon || '✨'} {s.name}</span>
                            <span className="font-semibold text-slate-700">{privacyMode ? '•••' : `฿${s.amt.toLocaleString()}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Transactions */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><Activity size={15} className="text-teal-600"/> รายการล่าสุด</h3>
                  </div>
                  {allWalletsTransactions.length === 0 ? (
                    <div className="py-8 text-center text-slate-300 text-xs">ยังไม่มีรายการในเดือนนี้</div>
                  ) : allWalletsTransactions.slice(0, 6).map(t => (
                    <div key={t.id} onClick={() => handleOpenTransaction(t.type, t)} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${t.type === 'income' ? 'bg-emerald-50' : t.type === 'transfer' ? 'bg-cyan-50' : 'bg-slate-100'}`}>{t.type === 'transfer' ? <ArrowRightLeft size={15} className="text-cyan-600"/> : (t.type === 'income' ? (incomeCategories.find(c => c.name === t.category)?.icon || '💰') : (expenseCategories.find(c => c.name === t.category)?.icon || '💸'))}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{t.category}{t.note && <span className="text-slate-400 font-normal ml-1">{t.note}</span>}</p>
                        <p className="text-[10px] text-slate-400">{t.dateDisplay} · {t.walletName}</p>
                      </div>
                      <span className={`text-xs font-bold ${t.type === 'income' ? 'text-emerald-600' : t.type === 'transfer' ? 'text-cyan-600' : 'text-slate-800'}`}>{t.type === 'income' ? '+' : '-'}{privacyMode ? '•••' : t.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Budgets */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><Target size={15} className="text-amber-500"/> งบประมาณเดือนนี้</h3>
                    {currentProfile !== 'family' && <button onClick={openCreateBudget} className="text-[10px] text-teal-600 font-bold hover:underline">+ ตั้งเป้า</button>}
                  </div>
                  {profileBudgets.length === 0 ? (
                    <button onClick={openCreateBudget} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center gap-1 text-slate-400 hover:bg-slate-50 text-xs"><Plus size={16}/> เริ่มตั้งงบประมาณ</button>
                  ) : profileBudgets.slice(0, 5).map(b => {
                    const spent = getCategorySpent(b.category);
                    const percent = Math.min((spent / b.limit) * 100, 100);
                    const isOver = spent > b.limit;
                    return (
                      <div key={b.id} onClick={() => openEditBudget(b)} className="mb-3 last:mb-0 cursor-pointer">
                        <div className="flex justify-between items-center mb-1.5 text-xs">
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5"><span>{expenseCategories.find(c => c.name === b.category)?.icon || '💸'}</span>{b.category}</span>
                          <span className="text-[11px] text-slate-400">{privacyMode ? '•••' : spent.toLocaleString()} / {b.limit.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div style={{ width: `${percent}%` }} className={`h-full rounded-full ${isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-teal-500'}`}></div></div>
                      </div>
                    );
                  })}
                </div>

                {/* Pending Bills */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-2"><Bell size={15}/> บิลรอจ่าย ({myPendingBills.length})</h3>
                    {currentProfile === 'family' && <button onClick={() => setViewMode('bills')} className="text-[11px] text-cyan-600 font-bold hover:underline">ทั้งหมด →</button>}
                  </div>
                  {myPendingBills.length === 0 ? (
                    <div className="py-8 text-center text-slate-300 text-xs">ไม่มีบิลค้างจ่าย 👍</div>
                  ) : myPendingBills.slice(0, 4).map(bill => (
                    <div key={bill.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                      <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center text-base shrink-0">🧾</div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-slate-800 truncate">{bill.title}</p>{bill.recurringDay && <p className="text-[10px] text-slate-400">ทุกวันที่ {bill.recurringDay}</p>}</div>
                      <button onClick={() => handlePayBillClick(bill)} className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:opacity-90 whitespace-nowrap">฿{bill.amount.toLocaleString()} จ่าย</button>
                    </div>
                  ))}
                </div>

                {/* Debts */}
                <div className="col-span-12 md:col-span-6 rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><BookOpen size={15} className="text-teal-600"/> หนี้ & ลูกหนี้</h3>
                    <button onClick={() => setViewMode('debts')} className="text-[11px] text-teal-600 font-bold hover:underline">จัดการ →</button>
                  </div>
                  {myDebts.length === 0 ? (
                    <div className="py-8 text-center text-slate-300 text-xs">ยังไม่มีรายการหนี้สิน</div>
                  ) : (
                    <>
                      {myDebts.slice(0, 3).map(d => (
                        <div key={d.id} className="flex items-center gap-3 py-2 border-b border-slate-100">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${d.type === 'lent' ? 'bg-emerald-50' : 'bg-rose-50'}`}>{d.type === 'lent' ? '🙋' : '💳'}</div>
                          <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-slate-800 truncate">{d.person}</p><p className="text-[10px] text-slate-400 truncate">{d.type === 'lent' ? 'ยืมเราไป' : 'เรายืมเขา'}{d.note ? ` · ${d.note}` : ''}</p></div>
                          <span className={`text-xs font-bold ${d.type === 'lent' ? 'text-emerald-600' : 'text-rose-500'}`}>{d.type === 'lent' ? '+' : '-'}฿{d.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 text-xs"><span className="text-slate-500">สุทธิ</span><b className={debtNet >= 0 ? 'text-emerald-600' : 'text-rose-500'}>{debtNet >= 0 ? '+' : '-'}฿{Math.abs(debtNet).toLocaleString()}</b></div>
                    </>
                  )}
                </div>

                {/* Wishlist */}
                <div className="col-span-12 md:col-span-6 rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><Gift size={15} className="text-teal-600"/> ของอยากได้</h3>
                    <button onClick={() => setViewMode('planning')} className="text-[11px] text-teal-600 font-bold hover:underline">ทั้งหมด →</button>
                  </div>
                  {wishlist.length === 0 ? (
                    <div className="py-8 text-center text-slate-300 text-xs">ยังไม่มีของในลิสต์</div>
                  ) : wishlist.slice(0, 4).map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-sm shrink-0">🎁</div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p><p className="text-[10px] text-slate-400">ขอโดย: {appProfiles[item.requester]?.name || '-'}</p></div>
                      {item.status && item.status !== 'pending'
                        ? <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>{item.status === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'}</span>
                        : <span className="text-xs font-bold text-slate-700">฿{item.price.toLocaleString()}</span>}
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ... (Other Views: Planning, Bills, Debts... Kept same but wrapper updated) ... */}
        {viewMode === 'planning' && (
           <div className="flex-1 flex flex-col p-5 overflow-y-auto pb-32 md:pb-5 animate-in fade-in zoom-in-95 duration-300 bg-gray-50/50 md:p-8">
             <div className="max-w-4xl mx-auto w-full">
               <div className="mb-8">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Gift className="text-pink-500"/> รายการของที่อยากได้</h2>
                   <button onClick={() => setModalMode('manage-wishlist')} className="text-xs bg-pink-500 text-white px-3 py-1.5 rounded-full shadow hover:bg-pink-600 font-bold">+ เพิ่ม</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {wishlist.map(item => (
                     <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start">
                         <div className="flex-1">
                           <h3 className="font-bold text-gray-800 text-sm">{item.title}</h3>
                           <p className="text-pink-600 font-bold text-xs">฿{item.price.toLocaleString()}</p>
                           <p className="text-[9px] text-gray-400 mt-1">ขอโดย: {appProfiles[item.requester]?.name}</p>
                         </div>
                         <div className="flex gap-2 items-center">
                           {item.status === 'pending' ? (
                             <>
                               <button onClick={() => handleWishlistAction(item.id, 'approved')} className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200"><ThumbsUp size={14}/></button>
                               <button onClick={() => handleWishlistAction(item.id, 'rejected')} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"><ThumbsDown size={14}/></button>
                             </>
                           ) : (
                             <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status === 'approved' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ'}</span>
                           )}
                           <button onClick={() => openEditWishlist(item)} className="text-gray-300 hover:text-blue-400 ml-1"><Edit3 size={14}/></button>
                           <button onClick={() => handleDeleteWishlist(item.id)} className="text-gray-300 hover:text-red-400 ml-1"><Trash2 size={14}/></button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
               <div>
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><CalendarHeart className="text-blue-500"/> กิจกรรมครอบครัว</h2>
                   <button onClick={() => setModalMode('manage-event')} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full shadow hover:bg-blue-700 font-bold">+ เพิ่ม</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {events.map(event => (
                     <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-2">
                         <div><h3 className="font-bold text-gray-800 text-sm">{event.title}</h3><p className="text-[10px] text-gray-500 flex items-center gap-1"><CalendarClock size={10}/> {event.date}</p></div>
                         <div className="flex gap-2"><button onClick={() => openEditEvent(event)} className="text-gray-300 hover:text-blue-400"><Edit3 size={14}/></button><button onClick={() => handleDeleteEvent(event.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={14}/></button></div>
                       </div>
                       <div className="space-y-1 mt-3 pt-2 border-t border-gray-50">{event.items?.map((item, idx) => (<div key={idx} className="flex justify-between text-xs text-gray-600"><span>{item.name}</span><span>{item.cost.toLocaleString()}</span></div>))}</div>
                       <div className="mt-3 flex justify-between items-center text-sm font-bold text-blue-800 bg-blue-50 p-2 rounded-lg"><span>รวมงบประมาณ</span><span>฿{(event.items?.reduce((sum, item) => sum + item.cost, 0) || 0).toLocaleString()}</span></div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>
        )}

        {viewMode === 'bills' && currentProfile === 'family' && (
           <div className="flex-1 flex flex-col p-5 overflow-y-auto pb-32 md:pb-5 animate-in fade-in zoom-in-95 duration-300 bg-gray-50/50 md:p-8">
             <div className="max-w-4xl mx-auto w-full">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><CheckSquare className="text-purple-600"/> บิลกลาง (รอจ่าย)</h2>
                 <button onClick={() => setModalMode('add-bill')} className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-full shadow-lg hover:bg-purple-700 flex items-center gap-1 font-bold">+ เพิ่มบิล</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {bills.filter(b => b.status !== 'paid').map(bill => (
                   <div key={bill.id} className={`bg-white p-4 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md ${bill.assignedTo ? (bill.assignedTo === 'hart' ? 'border-l-blue-500' : 'border-l-pink-500') : 'border-l-gray-400'}`}>
                     <div className="flex justify-between items-start mb-2">
                       <div><div className="flex items-center gap-2"><h3 className="font-bold text-gray-800 text-sm">{bill.title}</h3>{bill.recurringDay && <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><CalendarClock size={10}/> ทุกวันที่ {bill.recurringDay}</span>}</div><p className="text-lg font-bold text-purple-700">฿{bill.amount.toLocaleString()}</p></div>
                       <button onClick={() => handleDeleteBill(bill.id)} className="text-gray-300 hover:text-red-400"><Trash2 size={14}/></button>
                     </div>
                     <div className="pt-2 border-t border-gray-100 mt-2">
                       {!bill.assignedTo ? (
                         <div className="flex gap-2">
                           <span className="text-[10px] text-gray-400 flex items-center mr-auto">โยนให้ใครจ่าย?</span>
                           <button onClick={() => handleAssignBill(bill.id, 'hart')} className="flex-1 bg-blue-50 text-blue-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1 border border-blue-200">👉 {appProfiles['hart'].name}</button>
                           <button onClick={() => handleAssignBill(bill.id, 'jah')} className="flex-1 bg-pink-50 text-pink-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-pink-100 flex items-center justify-center gap-1 border border-pink-200">👉 {appProfiles['jah'].name}</button>
                         </div>
                       ) : (
                         <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                           <div className="flex items-center gap-2"><div className="text-xl">{appProfiles[bill.assignedTo]?.icon}</div><div><p className="text-[10px] text-gray-600 font-bold">รอ {appProfiles[bill.assignedTo].name} จ่าย</p>{bill.assignedBy && <p className="text-[9px] text-gray-400">({appProfiles[bill.assignedBy].name} โยนมา)</p>}</div></div>
                           <div className="flex gap-1"><button onClick={() => handleUnassignBill(bill.id)} className="p-1.5 rounded-lg bg-gray-200 text-gray-500 hover:bg-gray-300"><Undo2 size={14}/></button><button onClick={() => handlePayBillClick(bill)} className="bg-green-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow hover:bg-green-600 flex items-center gap-1"><CheckCircle2 size={12}/> จ่ายแล้ว</button></div>
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        )}

        {viewMode === 'debts' && (
           <div className="flex-1 flex flex-col p-5 overflow-y-auto pb-32 md:pb-5 animate-in fade-in zoom-in-95 duration-300 bg-gray-50/50 md:p-8">
             <div className="max-w-4xl mx-auto w-full">
               <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><BookOpen className="text-orange-600"/> สมุดหนี้สิน</h2>
                 <button onClick={openAddDebt} className="text-xs bg-orange-600 text-white px-3 py-1.5 rounded-full shadow-lg hover:bg-orange-700 flex items-center gap-1 font-bold">+ เพิ่มรายการ</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <h3 className="text-xs font-bold text-green-700 uppercase mb-2 ml-1">คนยืมเรา (รอเก็บ)</h3>
                   {debts.filter(d => d.type === 'lent' && d.owner === currentProfile).map(debt => (
                     <div key={debt.id} className="bg-white p-3 rounded-xl border-l-4 border-green-500 shadow-sm flex justify-between items-center mb-2 hover:shadow-md transition-shadow">
                       <div><p className="font-bold text-gray-800 text-sm">{debt.person}</p><p className="text-green-600 font-bold text-xs">฿{debt.amount.toLocaleString()}</p>{debt.note && <p className="text-[9px] text-gray-400">{debt.note}</p>}</div>
                       <button onClick={() => handleSettleDebt(debt.id)} className="text-[10px] bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 px-2 py-1 rounded">เคลียร์แล้ว</button>
                     </div>
                   ))}
                 </div>
                 <div>
                   <h3 className="text-xs font-bold text-red-700 uppercase mb-2 ml-1">เรายืมเขา (รอคืน)</h3>
                   {debts.filter(d => d.type === 'borrowed' && d.owner === currentProfile).map(debt => (
                     <div key={debt.id} className="bg-white p-3 rounded-xl border-l-4 border-red-500 shadow-sm flex justify-between items-center mb-2 hover:shadow-md transition-shadow">
                       <div><p className="font-bold text-gray-800 text-sm">{debt.person}</p><p className="text-red-600 font-bold text-xs">฿{debt.amount.toLocaleString()}</p>{debt.note && <p className="text-[9px] text-gray-400">{debt.note}</p>}</div>
                       <button onClick={() => handleSettleDebt(debt.id)} className="text-[10px] bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700 px-2 py-1 rounded">คืนแล้ว</button>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>
        )}

        {/* ... (Report View) ... */}
        {viewMode === 'report' && (
           <div className="flex-1 flex flex-col p-5 overflow-y-auto pb-32 md:pb-5 animate-in fade-in zoom-in-95 duration-300 md:p-8">
             <div className="max-w-5xl mx-auto w-full">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><BarChart3 className="text-blue-600"/> สรุปผล</h2>
                 <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                   <button onClick={() => setReportRange('month')} className={`px-3 py-1 text-[10px] rounded-md font-bold transition-all ${reportRange === 'month' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>เดือนนี้</button>
                   <button onClick={() => setReportRange('all')} className={`px-3 py-1 text-[10px] rounded-md font-bold transition-all ${reportRange === 'all' ? 'bg-gray-800 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>ทั้งหมด</button>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <NetWorthLineChart transactions={transactions} wallets={visibleWallets} />
                  </div>
                  <div>
                    <CalendarHeatmap transactions={displayTransactions} selectedMonth={selectedMonth} />
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center">
                     <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-l-4 border-gray-800 pl-2">สัดส่วนการเงิน (เดือนนี้)</h3>
                     <SimpleDonutChart income={reportStats.income} expense={reportStats.expense} />
                     <div className="grid grid-cols-2 gap-4 w-full mt-6">
                       <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100"><p className="text-[10px] text-green-600 font-bold mb-1">รายรับ</p><p className="font-bold text-green-800">{reportStats.income.toLocaleString()}</p></div>
                       <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100"><p className="text-[10px] text-red-600 font-bold mb-1">รายจ่าย</p><p className="font-bold text-red-800">{reportStats.expense.toLocaleString()}</p></div>
                     </div>
                  </div>
                  <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
                     <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-l-4 border-gray-800 pl-2">อันดับค่าใช้จ่าย</h3>
                     {reportStats.sortedCats.length === 0 ? <div className="text-center py-8 text-gray-300 text-xs">ว่างเปล่า... ดีแล้ว!</div> : reportStats.sortedCats.map(([catName, amount]) => {
                        const catInfo = expenseCategories.find(c => c.name === catName) || { icon: '💸', color: '#94a3b8' };
                        return <CategoryBar key={catName} category={catName} amount={amount} total={reportStats.expense} color={catInfo.color} icon={catInfo.icon}/>;
                     })}
                  </div>
               </div>
             </div>
           </div>
        )}

        {/* QUICK-ADD SPEED DIAL */}
        {currentProfile !== 'family' && viewMode === 'dashboard' && (
          <>
            {isFabOpen && <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-in fade-in" onClick={() => setIsFabOpen(false)}></div>}
            <div className={`absolute bottom-24 right-8 flex flex-col gap-3 z-50 items-end transition-all duration-300 ${isFabOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'}`}>
              <div className="flex items-center gap-3"><span className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold shadow text-gray-600">รายรับ</span><button onClick={() => handleOpenTransaction('income')} className="w-11 h-11 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"><TrendingUp size={20} /></button></div>
              <div className="flex items-center gap-3"><span className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold shadow text-gray-600">โอนเงิน</span><button onClick={() => handleOpenTransaction('transfer')} className="w-11 h-11 bg-cyan-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"><ArrowRightLeft size={20} /></button></div>
              <div className="flex items-center gap-3"><span className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold shadow text-gray-600">รายจ่าย</span><button onClick={() => handleOpenTransaction('expense')} className="w-11 h-11 bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"><TrendingDown size={20} /></button></div>
            </div>
            <button onClick={() => setIsFabOpen(!isFabOpen)} className={`absolute bottom-8 right-8 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-50 ring-4 ring-white ${isFabOpen ? 'bg-gray-200 text-gray-600 rotate-45' : 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white hover:scale-105 active:scale-95'}`}><Plus size={28} /></button>
          </>
        )}

        {/* MODAL: ADD/EDIT TRANSACTION */}
        {modalMode === 'add-transaction' && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex flex-col animate-in slide-in-from-bottom duration-200 md:items-center md:justify-center md:bg-black/40">
            <div className="bg-gradient-to-b from-white to-gray-50 w-full h-full md:h-auto md:max-w-md md:rounded-3xl flex flex-col shadow-2xl overflow-hidden md:drop-shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
                    <button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors duration-200"><X size={24}/></button>
                    <h2 className="text-base font-bold text-gray-800">{transactionForm.id ? 'แก้ไขรายการ' : 'เพิ่มรายการ'}</h2>
                    {transactionForm.id ? <button onClick={() => { handleDeleteTransaction(transactionForm.id); setModalMode(null); }} className="text-red-500 p-2"><Trash2 size={20}/></button> : <div className="w-10"></div>}
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  {!transactionForm.id && (
                      <div className="bg-white p-1 rounded-xl flex font-bold text-xs mb-6 shadow-sm border border-gray-100">
                        <button onClick={() => setTransactionForm(p => ({...p, type: 'expense'}))} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${transactionForm.type === 'expense' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-400'}`}><TrendingDown size={14}/> รายจ่าย</button>
                        <button onClick={() => setTransactionForm(p => ({...p, type: 'transfer'}))} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${transactionForm.type === 'transfer' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400'}`}><ArrowRightLeft size={14}/> โอนเงิน</button>
                        <button onClick={() => setTransactionForm(p => ({...p, type: 'income'}))} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${transactionForm.type === 'income' ? 'bg-green-50 text-green-600 shadow-sm' : 'text-gray-400'}`}><TrendingUp size={14}/> รายรับ</button>
                      </div>
                  )}
                  <div className="mb-6"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">จำนวนเงิน</label><div className="relative flex gap-2"><div className="relative flex-1"><input type="number" inputMode="decimal" autoFocus value={transactionForm.amount} onChange={(e) => setTransactionForm(p => ({...p, amount: e.target.value}))} placeholder="0" className={`w-full text-5xl font-bold bg-transparent border-b-2 py-2 outline-none transition-colors ${transactionForm.type === 'expense' ? 'text-red-600 border-red-200 focus:border-red-500' : transactionForm.type === 'transfer' ? 'text-blue-600 border-blue-200 focus:border-blue-500' : 'text-green-600 border-green-200 focus:border-green-500'}`}/><span className="absolute right-0 bottom-4 text-gray-400 font-medium text-lg">บาท</span></div><button onClick={() => setShowCalculator(true)} className="p-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200"><Calculator size={24}/></button></div></div>
                  
                  {showCalculator && (<div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><CalculatorPad onConfirm={(val) => { setTransactionForm(p => ({...p, amount: val})); setShowCalculator(false); }} onClose={() => setShowCalculator(false)} /></div>)}
                  
                  <div className="mb-6"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">วันที่</label><input type="date" value={transactionForm.date} onChange={(e) => setTransactionForm(p => ({...p, date: e.target.value}))} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-gray-400"/></div>
                  <div className="mb-6"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">บันทึกช่วยจำ / Memo</label><input type="text" value={transactionForm.tags} onChange={(e) => setTransactionForm(p => ({...p, tags: e.target.value}))} placeholder="เช่น ค่าซักผ้า, ค่าปรับจราจร" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-gray-400"/></div>
                  {transactionForm.type === 'transfer' ? (
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">ไปยังกระเป๋า</label><div className="space-y-2 max-h-40 overflow-y-auto">{wallets.filter(w => w.id !== activeWalletId).map(w => {
                        const ownerProfile = appProfiles[w.owner]; 
                        return (
                            <button key={w.id} onClick={() => setTransactionForm(p => ({...p, transferToWalletId: w.id}))} className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all bg-white ${transactionForm.transferToWalletId === w.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <span className="text-xl" style={{color: w.color}}>{w.icon}</span>
                                        {ownerProfile && (
                                            <span className="absolute -bottom-1 -right-1 text-[10px] bg-gray-100 border border-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm" title={`ของ ${ownerProfile.name}`}>
                                                {ownerProfile.icon}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <span className="font-semibold text-sm block text-gray-800">{w.name}</span>
                                        <span className="text-[10px] text-gray-400 block -mt-0.5">ของ {ownerProfile?.name || 'ไม่ระบุ'}</span>
                                    </div>
                                </div>
                                {transactionForm.transferToWalletId === w.id && <div className="bg-blue-100 p-1 rounded-full text-blue-600"><ArrowRight size={14}/></div>}
                            </button>
                        );
                    })}</div></div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">หมวดหมู่</label>
                          <button onClick={() => openManageCategory()} className="text-[10px] text-gray-400 flex items-center gap-1 hover:text-gray-600">
                              <Settings size={10}/> จัดการ
                          </button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2">
                          {(transactionForm.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                              <button key={cat.id} onClick={() => setTransactionForm(p => ({...p, category: cat.name}))} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all bg-white ${transactionForm.category === cat.name ? 'border-gray-800 bg-gray-50 shadow-md transform scale-105' : 'border-gray-200 hover:border-gray-300'}`}>
                                  <span className="text-2xl">{cat.icon}</span>
                                  <span className="text-[10px] font-bold">{cat.name}</span>
                              </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={handleSaveTransaction} disabled={loading} className={`w-full h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-white hover:shadow-xl disabled:opacity-50 ${transactionForm.type === 'expense' ? 'bg-red-600 shadow-red-200' : transactionForm.type === 'transfer' ? 'bg-blue-600 shadow-blue-200' : 'bg-green-600 shadow-green-200'}`}>{loading ? <Loader2 className="animate-spin"/> : (transactionForm.id ? 'บันทึกการแก้ไข' : (transactionForm.type === 'transfer' ? 'โอนเงิน' : 'บันทึก'))}</button></div>
            </div>
          </div>
        )}

        {/* ... (Other Modals: PayBill, Wallet, Budget, Wishlist, Event, Profile, QuickMenu... Kept same) ... */}
        {/* MODAL: ADD BILL */}
        {modalMode === 'add-bill' && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex flex-col animate-in slide-in-from-bottom duration-200 md:items-center md:justify-center md:bg-black/40">
            <div className="bg-gradient-to-b from-white to-gray-50 w-full h-full md:h-auto md:max-w-md md:rounded-3xl flex flex-col shadow-2xl overflow-hidden md:drop-shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"><X size={24}/></button><h2 className="text-base font-bold text-gray-800">เพิ่มบิลกลาง</h2><div className="w-10"></div></div>
                <div className="flex-1 p-6">
                  <div className="mb-4"><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ชื่อบิล</label><input type="text" autoFocus value={billForm.title} onChange={e => setBillForm({...billForm, title: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 outline-none focus:border-purple-500" placeholder="..."/></div>
                  <div className="mb-4"><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ยอดเงิน</label><input type="number" value={billForm.amount} onChange={e => setBillForm({...billForm, amount: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold text-gray-800 outline-none focus:border-purple-500" placeholder="0.00"/></div>
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">จ่ายทุกวันที่</label><input type="number" min="1" max="31" value={billForm.recurringDay} onChange={e => setBillForm({...billForm, recurringDay: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 outline-none focus:border-purple-500" placeholder="1-31"/></div>
                </div>
                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={handleAddBill} disabled={loading} className="w-full bg-purple-600 text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all hover:shadow-xl hover:bg-purple-700">{loading ? '...' : 'สร้างบิล'}</button></div>
            </div>
          </div>
        )}

        {/* MODAL: ADD DEBT */}
        {modalMode === 'add-debt' && (
          <div className="fixed inset-0 bg-gray-50 z-[60] flex flex-col animate-in slide-in-from-bottom duration-200 md:items-center md:justify-center md:bg-black/50">
            <div className="bg-white w-full h-full md:h-auto md:max-w-md md:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={24}/></button><h2 className="text-base font-bold text-gray-800">เพิ่มรายการหนี้</h2><div className="w-10"></div></div>
                <div className="flex-1 p-6">
                  <div className="bg-white p-1 rounded-xl flex font-bold text-xs mb-6 shadow-sm border border-gray-100">
                    <button onClick={() => setDebtForm({...debtForm, type: 'lent'})} className={`flex-1 py-2.5 rounded-lg transition-all ${debtForm.type === 'lent' ? 'bg-green-100 text-green-700' : 'text-gray-400'}`}>คนยืมเรา (รายรับ)</button>
                    <button onClick={() => setDebtForm({...debtForm, type: 'borrowed'})} className={`flex-1 py-2.5 rounded-lg transition-all ${debtForm.type === 'borrowed' ? 'bg-red-100 text-red-700' : 'text-gray-400'}`}>เรายืมเขา (รายจ่าย)</button>
                  </div>
                  <div className="mb-4"><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ชื่อคน</label><input type="text" autoFocus value={debtForm.person} onChange={e => setDebtForm({...debtForm, person: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 outline-none focus:border-orange-500" placeholder="..."/></div>
                  <div className="mb-4"><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">จำนวนเงิน</label><input type="number" value={debtForm.amount} onChange={e => setDebtForm({...debtForm, amount: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold text-gray-800 outline-none focus:border-orange-500" placeholder="0.00"/></div>
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">หมายเหตุ</label><input type="text" value={debtForm.note} onChange={e => setDebtForm({...debtForm, note: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-orange-500" placeholder="..."/></div>
                </div>
                <div className="p-4 border-t border-gray-200 bg-white"><button onClick={handleAddDebt} disabled={loading} className="w-full bg-orange-600 text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all">{loading ? '...' : 'บันทึก'}</button></div>
            </div>
          </div>
        )}

        {/* MODAL: PAY BILL (Select Wallet) */}
        {modalMode === 'pay-bill' && payBillData && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-gray-800">จ่ายด้วยกระเป๋าไหน?</h3><button onClick={() => { setModalMode(null); setPayBillData(null); }} className="p-1 rounded-full hover:bg-gray-100"><X size={20}/></button></div>
              <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100"><p className="text-xs text-gray-500 font-bold uppercase">ยอดชำระ</p><div className="flex justify-between items-end"><p className="text-xl font-bold text-purple-700">{payBillData.title}</p><p className="text-xl font-bold text-purple-700">฿{payBillData.amount.toLocaleString()}</p></div></div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase">กระเป๋าของ {appProfiles[payBillData.assignedTo]?.name}</p>
                {wallets.filter(w => w.owner === payBillData.assignedTo).length === 0 && <p className="text-xs text-red-500">ไม่พบกระเป๋าเงิน</p>}
                {wallets.filter(w => w.owner === payBillData.assignedTo).map(wallet => (
                  <button key={wallet.id} onClick={() => confirmPayBill(wallet.id)} className="w-full p-3 rounded-xl border border-gray-200 flex items-center justify-between hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <div className="flex items-center gap-3"><span className="text-xl" style={{color: wallet.color}}>{wallet.icon}</span><div className="text-left"><p className="font-bold text-sm text-gray-800">{wallet.name}</p><p className="text-xs text-gray-500">คงเหลือ: {calculateBalance(wallet).toLocaleString()}</p></div></div><ArrowRight size={16} className="text-gray-400"/>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: MANAGE WALLET */}
        {modalMode === 'manage-wallet' && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex flex-col animate-in slide-in-from-right duration-200 md:items-center md:justify-center md:bg-black/40 md:slide-in-from-bottom">
             <div className="bg-gradient-to-b from-white to-gray-50 w-full h-full md:h-auto md:max-w-md md:rounded-3xl flex flex-col shadow-2xl overflow-hidden md:drop-shadow-2xl">
                 <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><ArrowRight size={24} className="rotate-180 md:rotate-0 md:hidden"/><X size={24} className="hidden md:block"/></button><h2 className="text-base font-bold text-gray-800">{walletForm.id ? 'แก้ไขกระเป๋า' : 'สร้างกระเป๋าใหม่'}</h2><div className="w-10"></div></div>
                <div className="flex-1 p-6 space-y-5 overflow-y-auto">
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ชื่อกระเป๋า</label><input type="text" value={walletForm.name} onChange={e => setWalletForm({...walletForm, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-800 outline-none focus:border-blue-500" placeholder="เช่น เงินเดือน"/></div>
                  
                  {/* Removed Credit Card Toggle, Replaced with simple Balance Input */}
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">เงินตั้งต้น (ใส่ลบได้ เช่น -5000)</label><input type="number" value={walletForm.initialBalance} onChange={e => setWalletForm({...walletForm, initialBalance: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-800 outline-none focus:border-blue-500" placeholder="0.00 หรือ -10000"/></div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ธนาคาร (ทางลัด)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {bankPresets.map(bank => (
                        <button key={bank.name} onClick={() => setWalletForm({ ...walletForm, name: bank.name, color: bank.color, icon: bank.icon })} className="flex flex-col items-center justify-center p-2 rounded-xl border border-gray-100 bg-white shadow-sm hover:scale-105 transition-transform" style={{ borderTop: `4px solid ${bank.color}` }}>
                          <span className="font-bold text-xs" style={{color: bank.textColor || 'text-gray-800'}}>{bank.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ไอคอน หรือ ตัวย่อ</label>
                    <div className="flex gap-2 mb-3"><input type="text" maxLength={4} value={walletForm.icon} onChange={e => setWalletForm({...walletForm, icon: e.target.value})} className="w-16 text-center bg-white border border-gray-200 rounded-xl px-2 py-2 font-bold text-lg outline-none focus:border-blue-500" placeholder="✏️" /></div>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {Object.entries(iconCategories).map(([category, icons]) => (
                        <div key={category}>
                          <p className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">{category}</p>
                          <div className="grid grid-cols-6 gap-1.5">
                            {icons.map(icon => (
                              <button key={icon} onClick={() => setWalletForm({...walletForm, icon})} className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border-2 transition-all flex-shrink-0 bg-white ${walletForm.icon === icon ? 'border-blue-500 bg-blue-50 scale-110' : 'border-gray-200 hover:border-gray-300'}`}>{icon}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">สีธีม</label><div className="flex items-center gap-4"><input type="color" value={walletForm.color} onChange={e => setWalletForm({...walletForm, color: e.target.value})} className="w-12 h-12 rounded-full border-2 border-gray-200 cursor-pointer"/><span className="text-xs text-gray-500 font-mono">{walletForm.color}</span></div></div>
                </div>
                <div className="p-4 border-t border-gray-200 bg-white space-y-3">
                   <button onClick={handleSaveWallet} disabled={loading} className={`w-full ${themeColor.accent} text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all`}>{loading ? 'กำลังบันทึก...' : 'บันทึกกระเป๋า'}</button>
                   {walletForm.id && (
                     <>
                        <button onClick={() => handleClearWalletTransactions(walletForm.id)} className="w-full bg-orange-50 text-orange-600 h-12 rounded-xl font-bold text-sm hover:bg-orange-100 transition-all flex items-center justify-center gap-2"><RefreshCw size={16}/> ล้างประวัติธุรกรรม</button>
                        <button onClick={() => handleDeleteWallet(walletForm.id)} className="w-full bg-red-50 text-red-600 h-12 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"><Trash2 size={16}/> ลบกระเป๋า</button>
                     </>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* MODAL: MANAGE QUICK MENU */}
        {modalMode === 'manage-quick-menu' && (
          <div className="fixed inset-0 bg-gray-50 z-[60] flex flex-col animate-in slide-in-from-bottom duration-200 md:items-center md:justify-center md:bg-black/50">
            <div className="bg-white w-full h-full md:h-auto md:max-w-md md:rounded-3xl flex flex-col shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={24}/></button><h2 className="text-base font-bold text-gray-800">จัดการเมนูลัด</h2><div className="w-10"></div></div>
                <div className="flex-1 p-6 overflow-y-auto">
                    
                    {/* Add New Form */}
                    <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                        <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase">เพิ่ม/แก้ไข เมนู</h3>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <input type="text" value={quickMenuForm.name} onChange={e => setQuickMenuForm({...quickMenuForm, name: e.target.value})} placeholder="ชื่อเมนู (เช่น กะเพรา)" className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"/>
                            <input type="number" value={quickMenuForm.amount} onChange={e => setQuickMenuForm({...quickMenuForm, amount: e.target.value})} placeholder="ราคา" className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"/>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-3">
                            {['🍔','🍜','☕','🚌','🛒','💊','⛽'].map(icon => (
                                <button key={icon} onClick={() => setQuickMenuForm({...quickMenuForm, icon})} className={`w-8 h-8 rounded-lg border flex-shrink-0 ${quickMenuForm.icon === icon ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-200'}`}>{icon}</button>
                            ))}
                        </div>
                        <button onClick={handleSaveQuickMenu} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold">บันทึกเมนู</button>
                    </div>

                    {/* List Existing */}
                    <div className="space-y-2">
                        {quickMenus.map(menu => (
                            <div key={menu.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{menu.icon}</span>
                                    <div><p className="text-xs font-bold text-gray-800">{menu.name}</p><p className="text-[10px] text-gray-400">{menu.amount} บาท</p></div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setQuickMenuForm(menu)} className="p-1.5 text-gray-400 hover:text-blue-500"><Edit3 size={14}/></button>
                                    <button onClick={() => handleDeleteQuickMenu(menu.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}
        
        {/* MODAL: MANAGE CATEGORIES */}
        {modalMode === 'manage-categories' && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex flex-col animate-in slide-in-from-bottom duration-200 md:items-center md:justify-center md:bg-black/40">
            <div className="bg-gradient-to-b from-white to-gray-50 w-full h-full md:h-auto md:max-w-md md:rounded-3xl flex flex-col shadow-2xl overflow-hidden md:drop-shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"><X size={24}/></button><h2 className="text-base font-bold text-gray-800">ปรับแต่งหมวดหมู่</h2><div className="w-10"></div></div>
                <div className="flex-1 p-6 overflow-y-auto">
                    
                    {/* Add/Edit Form */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl mb-6 border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">{categoryForm.id ? '✏️ แก้ไข' : '➕ เพิ่มใหม่'}</h3>
                        
                        <div className="flex gap-2 mb-3">
                             <button onClick={() => setCategoryForm({...categoryForm, type: 'expense'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${categoryForm.type === 'expense' ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 hover:border-red-400'}`}>💸 รายจ่าย</button>
                             <button onClick={() => setCategoryForm({...categoryForm, type: 'income'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${categoryForm.type === 'income' ? 'bg-green-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300 hover:border-green-400'}`}>💰 รายรับ</button>
                        </div>

                        <div className="flex gap-3 mb-3">
                             <div className="relative group">
                                <div className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg text-xl hover:border-blue-400 transition-colors cursor-pointer">{categoryForm.icon}</div>
                                {/* Icon Picker by Category */}
                                <div className="absolute top-12 left-0 w-72 bg-white shadow-xl rounded-xl p-3 z-50 hidden group-hover:block border border-gray-200 max-h-60 overflow-y-auto">
                                     <div className="space-y-2">
                                       {Object.entries(iconCategories).map(([category, icons]) => (
                                         <div key={category}>
                                           <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">{category}</p>
                                           <div className="grid grid-cols-8 gap-0.5">
                                             {icons.map(i => <button key={i} onClick={() => setCategoryForm({...categoryForm, icon: i})} className={`w-6 h-6 flex items-center justify-center text-sm hover:bg-blue-100 rounded transition-colors ${categoryForm.icon === i ? 'bg-blue-200' : ''}`}>{i}</button>)}
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                </div>
                             </div>
                             <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="ชื่อหมวดหมู่" className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"/>
                        </div>
                        <button onClick={handleSaveCategory} disabled={loading} className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-2 rounded-lg text-xs font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">{loading ? '⏳ บันทึก...' : 'บันทึก'}</button>
                    </div>

                    {/* List */}
                    <div>
                        <h3 className="text-xs font-bold text-red-500 mb-3 uppercase tracking-wider border-l-4 border-red-500 pl-2">💸 รายจ่าย</h3>
                        <div className="grid grid-cols-1 gap-2 mb-6">
                            {expenseCategories.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-3">ไม่มีหมวดรายจ่าย</p>
                            ) : (
                                expenseCategories.map(cat => (
                                    <div key={cat.id} className="flex justify-between items-center p-3 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{cat.icon}</span>
                                            <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => editCategory(cat)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="แก้ไข"><Edit3 size={14}/></button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} disabled={loading} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50" title="ลบ"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <h3 className="text-xs font-bold text-green-500 mb-3 uppercase tracking-wider border-l-4 border-green-500 pl-2">💰 รายรับ</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {incomeCategories.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-3">ไม่มีหมวดรายรับ</p>
                            ) : (
                                incomeCategories.map(cat => (
                                    <div key={cat.id} className="flex justify-between items-center p-3 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{cat.icon}</span>
                                            <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => editCategory(cat)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="แก้ไข"><Edit3 size={14}/></button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} disabled={loading} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50" title="ลบ"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
          </div>
        )}

        {/* MODAL: MANAGE BUDGET */}
        {modalMode === 'manage-budget' && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex flex-col animate-in slide-in-from-right duration-200 md:items-center md:justify-center md:bg-black/40 md:slide-in-from-bottom">
             <div className="bg-gradient-to-b from-white to-gray-50 w-full h-full md:h-auto md:max-w-md md:rounded-3xl flex flex-col shadow-2xl overflow-hidden md:drop-shadow-2xl">
                 <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"><ArrowRight size={24} className="rotate-180 md:rotate-0 md:hidden"/><X size={24} className="hidden md:block"/></button><h2 className="text-base font-bold text-gray-800">{budgetForm.id ? 'แก้ไขงบ' : 'ตั้งงบประมาณใหม่'}</h2>{budgetForm.id ? <button onClick={() => handleDeleteBudget(budgetForm.id)} className="text-red-500 hover:text-red-700"><Trash2 size={20}/></button> : <div className="w-5"></div>}</div>
                 <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                   <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block">หมวดหมู่</label><div className="grid grid-cols-4 gap-3">{expenseCategories.map(cat => (<button key={cat.id} onClick={() => setBudgetForm({...budgetForm, category: cat.name})} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all bg-white ${budgetForm.category === cat.name ? `bg-${themeColor.theme}-600 text-white shadow-lg scale-105 border-${themeColor.theme}-600` : 'border-gray-200 hover:border-gray-300'}`}><span className="text-2xl">{cat.icon}</span><span className="text-[10px] font-bold">{cat.name}</span></button>))}</div></div>
                   <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">งบ (บาท)</label><input type="number" autoFocus value={budgetForm.limit} onChange={e => setBudgetForm({...budgetForm, limit: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-xl font-bold text-gray-800 outline-none focus:border-blue-500" placeholder="เช่น 5000"/></div>
                 </div>
                 <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={handleSaveBudget} disabled={loading} className={`w-full ${themeColor.accent} text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all hover:shadow-xl`}>{loading ? '...' : 'บันทึก'}</button></div>
             </div>
          </div>
        )}
        
        {/* MODAL: MANAGE WISHLIST */}
        {modalMode === 'manage-wishlist' && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex flex-col animate-in slide-in-from-bottom duration-200 md:items-center md:justify-center md:bg-black/40">
            <div className="bg-gradient-to-b from-white to-gray-50 w-full h-full md:h-auto md:max-w-md md:rounded-3xl flex flex-col shadow-2xl overflow-hidden md:drop-shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"><X size={24}/></button><h2 className="text-base font-bold text-gray-800">{wishlistForm.id ? 'แก้ไขรายการ' : 'เพิ่มของที่อยากได้'}</h2><div className="w-10"></div></div>
                <div className="flex-1 p-6">
                  <div className="mb-4"><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ชื่อของ</label><input type="text" autoFocus value={wishlistForm.title} onChange={e => setWishlistForm({...wishlistForm, title: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 outline-none focus:border-pink-500" placeholder="..."/></div>
                  <div className="mb-4"><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ราคา</label><input type="number" value={wishlistForm.price} onChange={e => setWishlistForm({...wishlistForm, price: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xl font-bold text-gray-800 outline-none focus:border-pink-500" placeholder="0.00"/></div>
                  <div className="mb-4"><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">เหตุผล / Link</label><input type="text" value={wishlistForm.notes} onChange={e => setWishlistForm({...wishlistForm, notes: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-pink-500" placeholder="..."/></div>
                  
                  {wishlistForm.id && wishlistForm.status !== 'pending' && (
                    <div className="mt-6 bg-yellow-50 p-3 rounded-xl border border-yellow-200 flex items-center justify-between">
                      <span className="text-xs text-yellow-800 font-bold">สถานะ: {wishlistForm.status === 'approved' ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ'}</span>
                      <button onClick={() => setWishlistForm({ ...wishlistForm, status: 'pending' })} className="text-[10px] bg-white border border-yellow-300 px-2 py-1 rounded shadow-sm text-yellow-700 font-bold">รีเซ็ตเป็นรอดำเนินการ</button>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={handleSaveWishlist} disabled={loading} className="w-full bg-pink-500 text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all hover:shadow-xl hover:bg-pink-600">{loading ? '...' : 'บันทึก'}</button></div>
            </div>
          </div>
        )}

        {/* MODAL: MANAGE EVENT */}
        {modalMode === 'manage-event' && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex flex-col animate-in slide-in-from-bottom duration-200 md:items-center md:justify-center md:bg-black/40">
            <div className="bg-gradient-to-b from-white to-gray-50 w-full h-full md:h-auto md:max-w-md md:rounded-3xl flex flex-col shadow-2xl overflow-hidden md:drop-shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"><X size={24}/></button><h2 className="text-base font-bold text-gray-800">{eventForm.id ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรม'}</h2><div className="w-10"></div></div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="mb-4"><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ชื่อทริป / กิจกรรม</label><input type="text" autoFocus value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 outline-none focus:border-blue-500" placeholder="..."/></div>
                  <div className="mb-6"><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">วันที่</label><input type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-blue-500"/></div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                    <h3 className="text-xs font-bold text-gray-500 mb-3">รายการค่าใช้จ่าย (ประมาณการ)</h3>
                    <div className="flex gap-2 mb-3">
                      <input type="text" value={eventItemForm.name} onChange={e => setEventItemForm({...eventItemForm, name: e.target.value})} placeholder="รายการ" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"/>
                      <input type="number" value={eventItemForm.cost} onChange={e => setEventItemForm({...eventItemForm, cost: e.target.value})} placeholder="บาท" className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"/>
                      <button onClick={addEventItem} className="bg-blue-600 text-white p-2 rounded-lg"><Plus size={16}/></button>
                    </div>
                    <div className="space-y-2">
                      {eventForm.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-700 border-b border-gray-50 pb-1 items-center">
                          <span>{item.name}</span>
                          <div className="flex items-center gap-3">
                            <span>{item.cost.toLocaleString()}</span>
                            <button onClick={() => removeEventItem(idx)} className="text-gray-400 hover:text-red-500"><X size={12}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={handleSaveEvent} disabled={loading} className="w-full bg-blue-600 text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all hover:shadow-xl hover:bg-blue-700">{loading ? '...' : 'บันทึก'}</button></div>
            </div>
          </div>
        )}

        {/* MODAL: MANAGE PROFILE */}
        {modalMode === 'edit-profile' && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex flex-col animate-in slide-in-from-right duration-200 md:items-center md:justify-center md:bg-black/40 md:slide-in-from-bottom">
             <div className="bg-gradient-to-b from-white to-gray-50 w-full h-full md:h-auto md:max-w-md md:rounded-3xl flex flex-col shadow-2xl overflow-hidden md:drop-shadow-2xl">
                 <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={() => setModalMode(null)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"><ArrowRight size={24} className="rotate-180 md:rotate-0 md:hidden"/><X size={24} className="hidden md:block"/></button><h2 className="text-base font-bold text-gray-800">แก้ไขโปรไฟล์</h2><div className="w-10"></div></div>
                 <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                   <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ชื่อเล่น</label><input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-semibold text-gray-800 outline-none focus:border-blue-500" placeholder="ชื่อของคุณ"/></div>
                   <div>
                     <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ไอคอนประจำตัว</label>
                     <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                       {Object.entries(iconCategories).map(([category, icons]) => (
                         <div key={category}>
                           <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">{category}</p>
                           <div className="grid grid-cols-6 gap-1.5">
                             {icons.map(icon => (
                               <button key={icon} onClick={() => setProfileForm({...profileForm, icon})} className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg border-2 transition-all flex-shrink-0 bg-white ${profileForm.icon === icon ? `border-blue-500 bg-blue-50 scale-110` : 'border-gray-200 hover:border-gray-300'}`}>{icon}</button>
                             ))}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                   <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">ธีมสีหลัก</label><div className="grid grid-cols-5 gap-3">{colorsList.map(c => (<button key={c.id} onClick={() => setProfileForm({...profileForm, theme: c.id})} className={`h-10 rounded-xl bg-gradient-to-br ${c.class} transition-all ${profileForm.theme === c.id ? 'ring-4 ring-offset-2 ring-gray-300 scale-105' : 'opacity-70 grayscale'}`}/>))}</div></div>
                 </div>
                 <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50"><button onClick={handleSaveProfile} disabled={loading} className={`w-full ${themeColor.accent} text-white h-12 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all hover:shadow-xl`}>{loading ? '...' : 'บันทึก'}</button></div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}