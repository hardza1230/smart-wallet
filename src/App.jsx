import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, Image as ImageIcon, X, Trash2, Loader2, RotateCw } from 'lucide-react';

// --- Import Firebase ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- ส่วนตั้งค่า FIREBASE (Config ที่คุณฮาร์ทให้มา) ---
const firebaseConfig = {
  apiKey: "AIzaSyByueq9po9xamWC4y6gLokjj_jOlOjfDHI",
  authDomain: "hart-jah-wallet.firebaseapp.com",
  projectId: "hart-jah-wallet",
  storageBucket: "hart-jah-wallet.firebasestorage.app",
  messagingSenderId: "424761999742",
  appId: "1:424761999742:web:1051d737c9fdc756ebf32f",
  measurementId: "G-PH9TFHGT7R"
};

// เริ่มต้น Firebase (เชื่อมต่อ Database และ Storage)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- หมวดหมู่ ---
const quickCategories = [
  { id: 'food', name: 'อาหาร', color: 'bg-orange-100 text-orange-600' },
  { id: 'travel', name: 'เดินทาง', color: 'bg-blue-100 text-blue-600' },
  { id: 'shopping', name: 'ช้อปปิ้ง', color: 'bg-pink-100 text-pink-600' },
  { id: 'home', name: 'ของใช้บ้าน', color: 'bg-green-100 text-green-600' },
  { id: 'other', name: 'อื่นๆ', color: 'bg-gray-100 text-gray-600' },
];

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null); // ไฟล์รูปจริง
  const [imagePreview, setImagePreview] = useState(null); // รูปตัวอย่าง
  const [loading, setLoading] = useState(false); // สถานะกำลังโหลด

  const fileInputRef = useRef(null);

  // --- 1. ดึงข้อมูล Realtime จาก Firestore ---
  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(data);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. ฟังก์ชันย่อรูปภาพ (สำคัญมาก เพื่อประหยัดพื้นที่) ---
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // ย่อเหลือกว้าง 800px พอ
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.7); // คุณภาพ 70%
        };
      };
    });
  };

  // --- 3. ฟังก์ชันบันทึกข้อมูล ---
  const handleSave = async () => {
    if (!amount || !category) {
      alert("กรุณาใสยอดเงินและหมวดหมู่");
      return;
    }
    setLoading(true);

    try {
      let imageUrl = "";

      // ถ้ามีการแนบรูป ให้ทำการอัปโหลดก่อน
      if (imageFile) {
        const resizedBlob = await resizeImage(imageFile);
        const storageRef = ref(storage, `slips/${Date.now()}.jpg`);
        await uploadBytes(storageRef, resizedBlob);
        imageUrl = await getDownloadURL(storageRef);
      }

      // บันทึกลง Database
      await addDoc(collection(db, "transactions"), {
        amount: parseFloat(amount),
        category,
        imageUrl,
        timestamp: Date.now(), // ใช้เรียงลำดับ
        dateDisplay: new Date().toLocaleString('th-TH')
      });

      // Reset ค่า
      setAmount('');
      setCategory('');
      setImageFile(null);
      setImagePreview(null);
      
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("บันทึกไม่สำเร็จ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. ฟังก์ชันลบรายการ ---
  const handleDelete = async (id) => {
    if(confirm("ลบรายการนี้ใช่ไหม?")) {
      await deleteDoc(doc(db, "transactions", id));
    }
  };

  // --- UI ---
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative pb-20">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 rounded-b-3xl shadow-lg sticky top-0 z-10">
          <p className="text-gray-400 text-xs">ยอดรวมรายจ่ายทั้งหมด</p>
          <h1 className="text-4xl font-bold mt-1">฿{totalAmount.toLocaleString()}</h1>
        </div>

        {/* Input Form */}
        <div className="p-4 space-y-4">
          {/* ช่องใส่เงิน */}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full text-center text-5xl font-bold text-gray-800 placeholder-gray-200 outline-none py-4 border-b border-gray-100"
          />

          {/* ปุ่มถ่ายรูป */}
          <div className="flex justify-center">
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`w-full h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all ${imagePreview ? 'border-green-500 p-1' : 'border-gray-300 bg-gray-50'}`}
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img src={imagePreview} className="w-full h-full object-cover rounded-lg" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Camera size={32} />
                  <span className="text-sm mt-1">ถ่ายสลิป (ถ้ามี)</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" // เปิดกล้องทันทีบนมือถือ
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if(file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>

          {/* ปุ่มหมวดหมู่ */}
          <div className="grid grid-cols-5 gap-2">
            {quickCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.name)}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${category === cat.name ? 'bg-gray-800 text-white shadow-lg scale-105' : 'bg-white border border-gray-100 hover:bg-gray-50'}`}
              >
                <div className={`w-3 h-3 rounded-full ${cat.color.split(' ')[0]}`}></div>
                <span className="text-[10px] truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* ปุ่มบันทึก */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {loading ? 'กำลังบันทึก...' : 'จดเลย'}
          </button>
        </div>

        {/* History List */}
        <div className="px-4 pb-8">
          <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">รายการล่าสุด</h3>
          <div className="space-y-3">
            {transactions.map(t => (
              <div key={t.id} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm flex gap-3 items-center">
                {/* รูป */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden cursor-pointer" onClick={() => t.imageUrl && window.open(t.imageUrl)}>
                  {t.imageUrl ? (
                    <img src={t.imageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>
                  )}
                </div>

                {/* รายละเอียด */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{t.category}</p>
                  <p className="text-[10px] text-gray-400">{t.dateDisplay}</p>
                </div>

                {/* ยอดเงิน */}
                <div className="text-right">
                  <p className="font-bold text-red-500">-฿{t.amount.toLocaleString()}</p>
                  <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500 mt-1"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}