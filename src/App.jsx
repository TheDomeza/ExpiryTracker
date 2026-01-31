import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Bell, Calendar, Hourglass, CheckSquare, Trash2, Edit, Plus, RefreshCw, X, Search, Filter, ArrowLeft, AlertTriangle } from 'lucide-react';

// --- ข้อมูลจำลอง (Mock Data) ---
// ย้ายออกมาข้างนอกเพื่อให้ทั้ง 2 หน้าใช้ข้อมูลชุดเดียวกัน (ในโปรเจกต์จริงควรใช้ Context หรือ Redux)
const INITIAL_ITEMS = [
  { id: 1, name: "นมสดพาสเจอร์ไรซ์", category: "เครื่องดื่ม", expiryDate: "2023-12-01" },
  { id: 2, name: "ขนมปังโฮลวีต", category: "อาหาร", expiryDate: "2023-12-05" },
  { id: 3, name: "เนื้อไก่สด", category: "อาหาร", expiryDate: "2023-12-15" },
  { id: 6, name: "ไข่ไก่", category: "อาหาร", expiryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0] }, 
  { id: 7, name: "ผักสลัด", category: "อาหาร", expiryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0] },
  { id: 11, name: "ข้าวหอมมะลิ", category: "อาหาร", expiryDate: "2026-05-20" },
  { id: 14, name: "ยาสีฟัน", category: "ของใช้", expiryDate: "2026-08-10" },
];

// --- Helper Functions ---
const getDaysRemaining = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateString);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getStatus = (days) => {
  if (days < 0) return 'expired';
  if (days <= 7) return 'soon';
  return 'good';
};

// ==========================================
// 1. Component: หน้าหลัก (Home Page)
// ==========================================
function HomePage({ items, setItems }) {
  const navigate = useNavigate(); // ใช้สำหรับเปลี่ยนหน้า
  const [form, setForm] = useState({ name: '', category: '', expiryDate: '' });
  const [isEditing, setIsEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('ทั้งหมด');

  const categoriesList = ["อาหาร", "เครื่องดื่ม", "ยา/เวชภัณฑ์", "เครื่องสำอาง", "ของใช้", "อื่นๆ"];

  // Stats
  const stats = {
    expired: items.filter(i => getStatus(getDaysRemaining(i.expiryDate)) === 'expired').length,
    soon: items.filter(i => getStatus(getDaysRemaining(i.expiryDate)) === 'soon').length,
    good: items.filter(i => getStatus(getDaysRemaining(i.expiryDate)) === 'good').length,
  };

  // Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { ...form, category: form.category || categoriesList[0] };
    if (isEditing) {
      setItems(items.map(item => item.id === isEditing ? { ...formData, id: isEditing } : item));
      setIsEditing(null);
    } else {
      setItems([...items, { ...formData, id: Date.now() }]);
    }
    setForm({ name: '', category: '', expiryDate: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if(window.confirm("ยืนยันการลบรายการนี้?")) setItems(items.filter(item => item.id !== id));
  };

  const handleEdit = (item) => {
    setForm(item);
    setIsEditing(item.id);
    setShowForm(true);
  };

  const filteredItems = items.filter(item => {
    const days = getDaysRemaining(item.expiryDate);
    const status = getStatus(days);
    return (filterStatus === 'all' || status === filterStatus) &&
           (filterCategory === 'ทั้งหมด' || item.category === filterCategory) &&
           item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#A8D5BA] font-sans pb-10">
      {/* Header */}
      <header className="bg-[#114B30] text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-lg text-[#114B30] shadow-sm">
            <CheckSquare size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl md:text-2xl font-bold">Expiry Tracker</h1>
        </div>
        {/* ปุ่มกระดิ่ง: กดแล้วไปหน้า Notifications */}
        <button onClick={() => navigate('/notifications')} className="relative p-2 hover:bg-[#2E7D32] rounded-full transition cursor-pointer">
          <Bell className="w-6 h-6" />
          {stats.soon > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-[#1B5E20]">
              {stats.soon}
            </span>
          )}
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Expired */}
          <div onClick={() => setFilterStatus(filterStatus === 'expired' ? 'all' : 'expired')}
            className={`cursor-pointer flex flex-col items-center justify-center p-6 rounded-lg border-4 bg-[#FFADAD] border-[#FF5252] text-[#B71C1C] h-[180px] transition-transform hover:scale-[1.02] ${filterStatus === 'expired' ? 'ring-4 ring-white shadow-xl' : 'shadow-md'}`}>
            <div className="bg-white/40 p-3 rounded-full mb-3"><Calendar size={32} className="text-[#B71C1C]" /></div>
            <h2 className="text-2xl font-bold mb-1">หมดอายุแล้ว</h2>
            <p className="text-lg font-medium">{stats.expired} รายการ</p>
          </div>
          {/* Card Soon */}
          <div onClick={() => setFilterStatus(filterStatus === 'soon' ? 'all' : 'soon')}
            className={`cursor-pointer flex flex-col items-center justify-center p-6 rounded-lg border-4 bg-[#FFF59D] border-[#FBC02D] text-[#7F6000] h-[180px] transition-transform hover:scale-[1.02] ${filterStatus === 'soon' ? 'ring-4 ring-white shadow-xl' : 'shadow-md'}`}>
            <div className="bg-white/40 p-3 rounded-full mb-3"><Hourglass size={32} className="text-[#7F6000]" /></div>
            <h2 className="text-2xl font-bold mb-1">ใกล้หมดอายุ</h2>
            <p className="text-lg font-medium">{stats.soon} รายการ</p>
          </div>
          {/* Card Good */}
          <div onClick={() => setFilterStatus(filterStatus === 'good' ? 'all' : 'good')}
            className={`cursor-pointer flex flex-col items-center justify-center p-6 rounded-lg border-4 bg-[#A5D6A7] border-[#43A047] text-[#1B5E20] h-[180px] transition-transform hover:scale-[1.02] ${filterStatus === 'good' ? 'ring-4 ring-white shadow-xl' : 'shadow-md'}`}>
            <div className="bg-white/40 p-3 rounded-full mb-3"><CheckSquare size={32} className="text-[#1B5E20]" /></div>
            <h2 className="text-2xl font-bold mb-1">ยังใช้งานได้</h2>
            <p className="text-lg font-medium">{stats.good} รายการ</p>
          </div>
        </div>

        {/* Filter Indicator */}
        {filterStatus !== 'all' && (
          <div className="flex justify-center">
             <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                <span className="text-sm text-gray-600">แสดงเฉพาะ:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-sm ${filterStatus === 'expired' ? 'bg-red-100 text-red-700' : filterStatus === 'soon' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {filterStatus === 'expired' ? 'หมดอายุแล้ว' : filterStatus === 'soon' ? 'ใกล้หมดอายุ' : 'ยังใช้งานได้'}
                </span>
                <button onClick={() => setFilterStatus('all')}><X size={14} /></button>
             </div>
          </div>
        )}

        {/* List Section */}
        <div className="bg-[#F5F5F5] rounded-xl shadow-lg p-6 min-h-[500px]">
           <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b border-gray-300">
             <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
               <div className="relative w-full sm:w-64">
                 <input type="text" placeholder="ชื่อสินค้า..." className="pl-3 pr-10 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                 <Search size={18} className="absolute right-3 top-2.5 text-gray-400" />
               </div>
               <div className="relative w-full sm:w-48">
                 <select className="pl-3 pr-8 py-2 border rounded-md w-full bg-[#1F2937] text-white" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                   <option value="ทั้งหมด">หมวดหมู่ทั้งหมด</option>
                   {categoriesList.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                 </select>
                 <Filter size={16} className="absolute right-3 top-2.5 text-white pointer-events-none" />
               </div>
             </div>
             <button onClick={() => setShowForm(!showForm)} className="bg-[#0277BD] text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-[#01579B] transition shadow-md">
               <Plus size={20} /> เพิ่มรายการ
             </button>
           </div>
           
           {/* Form (Show/Hide) */}
           {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 bg-gray-100 p-6 rounded-lg border border-gray-200 shadow-inner grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
               <div className="flex flex-col gap-1"><label className="text-sm font-bold">ชื่อสินค้า</label><input required className="p-2 border rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
               <div className="flex flex-col gap-1"><label className="text-sm font-bold">หมวดหมู่</label><select className="p-2 border rounded bg-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option value="" disabled>เลือกประเภท</option>{categoriesList.map((c,i)=><option key={i} value={c}>{c}</option>)}</select></div>
               <div className="flex flex-col gap-1"><label className="text-sm font-bold">วันหมดอายุ</label><input required type="date" className="p-2 border rounded" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} /></div>
               <div className="flex gap-2"><button type="submit" className="bg-[#2E7D32] text-white p-2 rounded w-full">บันทึก</button><button type="button" onClick={() => setShowForm(false)} className="bg-gray-400 text-white p-2 rounded w-full">ยกเลิก</button></div>
            </form>
           )}

           {/* Table */}
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead><tr className="border-b-2 border-gray-400 text-gray-700"><th className="py-3 px-2">ชื่อสินค้า</th><th className="py-3 px-2">หมวดหมู่</th><th className="py-3 px-2">วันหมดอายุ</th><th className="py-3 px-2 text-center">สถานะ</th><th className="py-3 px-2 text-center">จัดการ</th></tr></thead>
               <tbody>
                 {filteredItems.map(item => {
                   const days = getDaysRemaining(item.expiryDate);
                   const status = getStatus(days);
                   let statusClass = status === 'expired' ? "text-red-600 bg-red-100" : status === 'soon' ? "text-yellow-700 bg-yellow-100" : "text-green-600 bg-green-100";
                   return (
                     <tr key={item.id} className="border-b hover:bg-gray-50">
                       <td className="py-3 px-2">{item.name}</td>
                       <td className="py-3 px-2"><span className="bg-gray-200 px-2 py-1 rounded text-sm">{item.category}</span></td>
                       <td className="py-3 px-2">{item.expiryDate}</td>
                       <td className="py-3 px-2 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}>{days < 0 ? `หมดอายุ (${Math.abs(days)} วัน)` : `${days} วัน`}</span></td>
                       <td className="py-3 px-2 text-center flex justify-center gap-2"><button onClick={() => handleEdit(item)} className="text-blue-500"><Edit size={18}/></button><button onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 size={18}/></button></td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. Component: หน้าแจ้งเตือน (Notification Page)
// ==========================================
function NotificationPage({ items }) {
  const navigate = useNavigate();
  
  // กรองเฉพาะรายการที่ "หมดอายุ" หรือ "ใกล้หมด"
  const alertItems = items.filter(item => {
    const days = getDaysRemaining(item.expiryDate);
    return days <= 7; // น้อยกว่า 7 วัน (รวมถึงติดลบคือหมดอายุ)
  }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)); // เรียงตามวันหมดอายุ

  return (
    <div className="min-h-screen bg-[#FFF8E1] font-sans">
      {/* Header Notification */}
      <header className="bg-[#E65100] text-white p-4 flex items-center shadow-lg sticky top-0 z-20">
        <button onClick={() => navigate('/')} className="mr-4 p-2 hover:bg-white/20 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
           <Bell size={24} />
           <h1 className="text-xl font-bold">การแจ้งเตือน</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <AlertTriangle className="text-orange-600" />
          รายการที่ต้องรีบจัดการ ({alertItems.length})
        </h2>

        {alertItems.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
             <CheckSquare size={48} className="mx-auto mb-4 opacity-30 text-green-500" />
             <p className="text-lg">ไม่มีรายการแจ้งเตือน</p>
             <p className="text-sm">สินค้าทุกชิ้นยังอยู่ในสภาพดี</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alertItems.map(item => {
              const days = getDaysRemaining(item.expiryDate);
              const isExpired = days < 0;
              
              return (
                <div key={item.id} className={`p-4 rounded-lg shadow-sm border-l-4 flex justify-between items-center bg-white ${isExpired ? 'border-red-500' : 'border-yellow-500'}`}>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">หมวดหมู่: {item.category}</p>
                    <p className={`text-sm font-semibold mt-1 ${isExpired ? 'text-red-600' : 'text-yellow-700'}`}>
                       {isExpired ? `หมดอายุไปแล้ว ${Math.abs(days)} วัน` : `กำลังจะหมดอายุในอีก ${days} วัน`}
                    </p>
                  </div>
                  <div className={`px-3 py-2 rounded-lg text-center min-w-[80px] ${isExpired ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    <span className="block text-xs font-bold uppercase">EXP</span>
                    <span className="block text-sm font-mono">{item.expiryDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. Main App Container (Routing Setup)
// ==========================================
function App() {
  // State หลักอยู่ที่นี่ เพื่อส่งไปให้ทั้ง 2 หน้า
  const [items, setItems] = useState(INITIAL_ITEMS);

  // Notification System (Browser API)
  useEffect(() => {
    if ("Notification" in window) {
       Notification.requestPermission();
       const expiringCount = items.filter(i => getDaysRemaining(i.expiryDate) <= 7 && getDaysRemaining(i.expiryDate) >= 0).length;
       if (expiringCount > 0 && Notification.permission === "granted") {
          new Notification("แจ้งเตือน!", { body: `มี ${expiringCount} รายการใกล้หมดอายุ` });
       }
    }
  }, [items]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage items={items} setItems={setItems} />} />
        <Route path="/notifications" element={<NotificationPage items={items} />} />
      </Routes>
    </Router>
  );
}

export default App;