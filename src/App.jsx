import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Bell, Calendar, Hourglass, CheckSquare, Trash2, Edit, Plus, RefreshCw, X, Search, Filter, ArrowLeft, AlertTriangle } from 'lucide-react';

// --- Helper Functions ---
const getDaysRemaining = (dateString) => {
  if (!dateString) return 0;
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
function HomePage({ items, setItems, fetchItems }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', category: '', expiryDate: '' });
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

  // ---------------------------------------------------------
  // 🟢 [REST API]: ฟังก์ชัน POST Method (เพิ่มข้อมูลลง Database)
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { ...form, category: form.category || categoriesList[0] };
    
    try {
      // เรียกใช้ API POST
      const response = await fetch('http://localhost:8080/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // แปลงข้อมูลฟอร์มเป็น JSON ส่งไปให้ Java
      });

      if (response.ok) {
        const newItem = await response.json();
        setItems([...items, newItem]); // อัปเดตหน้าจอทันที
        setForm({ name: '', category: '', expiryDate: '' }); // ล้างฟอร์ม
        setShowForm(false);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      console.error("Error posting data:", error);
      alert('ไม่สามารถติดต่อ Server ได้ (เช็คว่ารัน gradle bootRun หรือยัง)');
    }
  };

  // ---------------------------------------------------------
  // 🔴 [REST API]: ฟังก์ชัน DELETE Method (ลบข้อมูลจาก Database)
  // ---------------------------------------------------------
  const handleDelete = async (id) => {
    if(window.confirm("ยืนยันการลบรายการนี้?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/items/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setItems(items.filter(item => item.id !== id));
        }
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
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
      <header className="bg-[#114B30] text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-lg text-[#114B30] shadow-sm">
            <CheckSquare size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl md:text-2xl font-bold">Expiry Tracker</h1>
        </div>
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
          <div onClick={() => setFilterStatus(filterStatus === 'expired' ? 'all' : 'expired')} className={`cursor-pointer flex flex-col items-center justify-center p-6 rounded-lg border-4 bg-[#FFADAD] border-[#FF5252] text-[#B71C1C] h-[180px] transition-transform hover:scale-[1.02] ${filterStatus === 'expired' ? 'ring-4 ring-white shadow-xl' : 'shadow-md'}`}>
            <div className="bg-white/40 p-3 rounded-full mb-3"><Calendar size={32} className="text-[#B71C1C]" /></div>
            <h2 className="text-2xl font-bold mb-1">หมดอายุแล้ว</h2>
            <p className="text-lg font-medium">{stats.expired} รายการ</p>
          </div>
          <div onClick={() => setFilterStatus(filterStatus === 'soon' ? 'all' : 'soon')} className={`cursor-pointer flex flex-col items-center justify-center p-6 rounded-lg border-4 bg-[#FFF59D] border-[#FBC02D] text-[#7F6000] h-[180px] transition-transform hover:scale-[1.02] ${filterStatus === 'soon' ? 'ring-4 ring-white shadow-xl' : 'shadow-md'}`}>
            <div className="bg-white/40 p-3 rounded-full mb-3"><Hourglass size={32} className="text-[#7F6000]" /></div>
            <h2 className="text-2xl font-bold mb-1">ใกล้หมดอายุ</h2>
            <p className="text-lg font-medium">{stats.soon} รายการ</p>
          </div>
          <div onClick={() => setFilterStatus(filterStatus === 'good' ? 'all' : 'good')} className={`cursor-pointer flex flex-col items-center justify-center p-6 rounded-lg border-4 bg-[#A5D6A7] border-[#43A047] text-[#1B5E20] h-[180px] transition-transform hover:scale-[1.02] ${filterStatus === 'good' ? 'ring-4 ring-white shadow-xl' : 'shadow-md'}`}>
            <div className="bg-white/40 p-3 rounded-full mb-3"><CheckSquare size={32} className="text-[#1B5E20]" /></div>
            <h2 className="text-2xl font-bold mb-1">ยังใช้งานได้</h2>
            <p className="text-lg font-medium">{stats.good} รายการ</p>
          </div>
        </div>

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
               </div>
             </div>
             <div className="flex gap-2">
               <button onClick={fetchItems} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition" title="รีเฟรชข้อมูล">
                 <RefreshCw size={20} />
               </button>
               <button onClick={() => setShowForm(!showForm)} className="bg-[#0277BD] text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-[#01579B] transition shadow-md">
                 <Plus size={20} /> เพิ่มรายการ
               </button>
             </div>
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
                       <td className="py-3 px-2 text-center flex justify-center gap-2">
                         {/* ปิดปุ่ม Edit ไว้ก่อนเนื่องจาก Backend ยังไม่ได้ทำ PUT Method */}
                         <button onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 size={18}/></button>
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
             {items.length === 0 && <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล หรือ ไม่มีข้อมูลในระบบ...</div>}
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
  const alertItems = items.filter(item => getDaysRemaining(item.expiryDate) <= 7).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  return (
    <div className="min-h-screen bg-[#FFF8E1] font-sans">
      <header className="bg-[#E65100] text-white p-4 flex items-center shadow-lg sticky top-0 z-20">
        <button onClick={() => navigate('/')} className="mr-4 p-2 hover:bg-white/20 rounded-full transition"><ArrowLeft size={24} /></button>
        <div className="flex items-center gap-2"><Bell size={24} /><h1 className="text-xl font-bold">การแจ้งเตือน</h1></div>
      </header>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><AlertTriangle className="text-orange-600" /> รายการที่ต้องรีบจัดการ ({alertItems.length})</h2>
        <div className="space-y-4">
          {alertItems.map(item => {
            const days = getDaysRemaining(item.expiryDate);
            const isExpired = days < 0;
            return (
              <div key={item.id} className={`p-4 rounded-lg shadow-sm border-l-4 flex justify-between items-center bg-white ${isExpired ? 'border-red-500' : 'border-yellow-500'}`}>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">หมวดหมู่: {item.category}</p>
                  <p className={`text-sm font-semibold mt-1 ${isExpired ? 'text-red-600' : 'text-yellow-700'}`}>{isExpired ? `หมดอายุไปแล้ว ${Math.abs(days)} วัน` : `กำลังจะหมดอายุในอีก ${days} วัน`}</p>
                </div>
                <div className={`px-3 py-2 rounded-lg text-center min-w-[80px] ${isExpired ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  <span className="block text-xs font-bold uppercase">EXP</span><span className="block text-sm font-mono">{item.expiryDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. Main App Container (เชื่อมต่อ API)
// ==========================================
function App() {
  const [items, setItems] = useState([]); // เริ่มต้นเป็น Array ว่างๆ

  // ---------------------------------------------------------
  // 🔵 [REST API]: ฟังก์ชัน GET Method (ดึงข้อมูลตอนเปิดเว็บ)
  // ---------------------------------------------------------
  const fetchItems = async () => {
    try {
      // เรียกใช้ API GET
      const response = await fetch('http://localhost:8080/api/items');
      const data = await response.json();
      setItems(data); // นำข้อมูลที่ได้จาก Spring Boot มาใส่ในหน้าจอ
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // ใช้ useEffect เพื่อสั่งให้ดึงข้อมูล 1 ครั้ง ตอนเปิดเว็บมาครั้งแรก
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage items={items} setItems={setItems} fetchItems={fetchItems} />} />
        <Route path="/notifications" element={<NotificationPage items={items} />} />
      </Routes>
    </Router>
  );
}

export default App;