'use client';

import React, { useState } from 'react';
import { 
  MdTrendingUp, 
  MdTrendingDown, 
  MdAttachMoney,
  MdAdd,
  MdFilterList,
  MdLibraryBooks
} from 'react-icons/md';
import Modal from '@/components/ui/Modal';

export default function CompanyFinancePage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily'); 
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('ALL');

  const [expenses, setExpenses] = useState([
    { id: 1, title: 'Yoqilg\'i', amount: '150,000', category: 'Logistika', comment: 'Isuzu uchun dizel', date: '2026-03-09' },
    { id: 2, title: 'Xodim haqi', amount: '450,000', category: 'Ish haqi', comment: 'Kunlik to\'lovlar', date: '2026-03-08' },
  ]);

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Boshqa',
    comment: ''
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const expense = {
      id: expenses.length + 1,
      ...newExpense,
      date: new Date().toISOString().split('T')[0]
    };
    setExpenses([expense, ...expenses]);
    setIsExpenseModalOpen(false);
    setNewExpense({ title: '', amount: '', category: 'Boshqa', comment: '' });
    alert('Xarajat muvaffaqiyatli saqlandi! ✅');
  };

  const revenueData = {
    daily: { total: "840,000", expected: "1,200,000", expenses: "150,000" },
    weekly: { total: "5,800,000", expected: "7,500,000", expenses: "1,200,000" },
    monthly: { total: "24,500,000", expected: "32,000,000", expenses: "4,800,000" }
  };

  const currentData = revenueData[period];
  const residual = parseInt(currentData.total.replace(/,/g, '')) - parseInt(currentData.expenses.replace(/,/g, ''));

  const stats = [
    { title: "Tushum", value: currentData.total, icon: MdAttachMoney, color: "emerald", up: true, trend: "+12%" },
    { title: "Kutilayotgan Tushum", value: currentData.expected, icon: MdTrendingUp, color: "blue", up: true, trend: "+5%" },
    { title: "Jami Xarajatlar", value: currentData.expenses, icon: MdTrendingDown, color: "rose", up: false, trend: "+2%" },
    { title: "Qoldiq Summa", value: residual.toLocaleString(), icon: MdLibraryBooks, color: "amber", up: true, trend: "Sof foyda" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Moliyaviy Xisobotlar 📈</h1>
          <p className="text-slate-500 mt-1 font-medium">Tushum va xarajatlarni batafsil nazorat qiling.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${
                  period === p 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p === 'daily' ? 'KUNLIK' : p === 'weekly' ? 'HAFTALIK' : 'OYLIK'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Dan</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none transition-all"
              />
            </div>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Gacha</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-slate-900/30 hover:-translate-y-0.5 transition-all"
          >
            <MdAdd className="text-xl" />
            Yangi Xarajat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-100 transition-colors`}>
                <stat.icon className="text-2xl" />
              </div>
              <span className={`flex items-center text-sm font-bold ${stat.up ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-1 rounded-md`}>
                {stat.up ? <MdTrendingUp className="mr-1" /> : <MdTrendingDown className="mr-1" />}
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value} so'm</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MdLibraryBooks className="text-blue-500" /> Xarajatlar Tarixi
          </h2>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Qidirish (Nomi yoki izoh)..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <select 
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none cursor-pointer hover:bg-slate-50 transition-all appearance-none pr-8 relative"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org.w3c.dom.svg.SVGPathElement@c100414\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="ALL">Barcha Kategoriyalar</option>
              <option value="Logistika">Logistika</option>
              <option value="Ish haqi">Ish haqi</option>
              <option value="Ijara">Ijara</option>
              <option value="Kommunal">Kommunal</option>
              <option value="Mijozga pul qaytarish">Mijozga pul qaytarish</option>
              <option value="Boshqa">Boshqa</option>
            </select>
          </div>
        </div>
        <div className="p-0 overflow-x-auto text-nowrap">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3">Sana / Nomi</th>
                <th className="px-6 py-3">Kategoriya</th>
                <th className="px-6 py-3">Izoh</th>
                <th className="px-6 py-3 text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses
                .filter(exp => 
                  (expenseCategory === 'ALL' || exp.category === expenseCategory) &&
                  (exp.title.toLowerCase().includes(expenseSearch.toLowerCase()) || 
                   exp.comment.toLowerCase().includes(expenseSearch.toLowerCase()))
                )
                .map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{exp.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{exp.date}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] uppercase font-black">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 italic max-w-xs truncate">
                    {exp.comment || "-"}
                  </td>
                  <td className="px-6 py-4 text-right text-rose-600 font-bold">
                    -{exp.amount} so'm
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Ma'lumotlar mavjud emas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Yangi Xarajat Qo'shish">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Xarajat Nomi</label>
              <input 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800"
                placeholder="Masalan: Yoqilg'i"
                value={newExpense.title}
                onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Summa</label>
                <input 
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800"
                  placeholder="Summa..."
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Kategoriya</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 bg-white"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                >
                  <option value="Logistika">Logistika</option>
                  <option value="Ish haqi">Ish haqi</option>
                  <option value="Ijara">Ijara</option>
                  <option value="Kommunal">Kommunal</option>
                  <option value="Mijozga pul qaytarish">Mijozga pul qaytarish</option>
                  <option value="Boshqa">Boshqa</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Izoh (Kommentariya)</label>
              <textarea 
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 resize-none"
                placeholder="Qo'shimcha tafsilotlar..."
                value={newExpense.comment}
                onChange={(e) => setNewExpense({...newExpense, comment: e.target.value})}
              />
            </div>
          </div>
          <div className="pt-6 flex gap-3">
             <button 
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              Saqlash
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
