'use client';

import React, { useState } from 'react';
import { 
  MdSearch, 
  MdFilterList, 
  MdPerson, 
  MdPhone, 
  MdLocationOn, 
  MdHistory, 
  MdStar,
  MdPhoneInTalk,
  MdLocalShipping,
  MdArrowBack,
  MdAccessTime,
  MdAttachMoney,
  MdBusiness
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import { Suspense, useEffect } from 'react';

function CustomersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('Barchasi');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');

  const customers = [
    { id: 1, name: 'Aliyev Vali', phone: '+998 90 123 45 67', orders: 12, spent: '1,450,000', lastOrder: '2024-03-01', rating: 4.8, address: 'Chilonzor 9, 12-uy' },
    { id: 2, name: 'Karimov Anvar', phone: '+998 93 987 65 43', orders: 5, spent: '620,000', lastOrder: '2024-03-05', rating: 4.5, address: 'Yunusobod 4, 45-uy' },
    { id: 3, name: 'Rasulova Jamila', phone: '+998 99 111 22 33', orders: 24, spent: '3,200,000', lastOrder: '2024-02-28', rating: 5.0, address: 'Qatortol ko\'chasi, 7-uy' },
    { id: 4, name: 'Toshmatov Solih', phone: '+998 97 444 55 66', orders: 1, spent: '120,000', lastOrder: '2024-03-08', rating: 4.2, address: 'Mirzo Ulug\'bek tumani' },
  ];

  useEffect(() => {
    if (customerId) {
      const customer = customers.find(c => c.id === parseInt(customerId));
      if (customer) setSelectedCustomer(customer);
    }
  }, [customerId]);

  const orderHistory = [
    { 
      id: 'ORD-5501', 
      date: '2024-03-01', 
      type: 'Gilam (Oddiy)', 
      status: 'YETKAZIB BERILGAN', 
      price: '144,000',
      company: 'Pokiza MChJ',
      area: '12 kv.m',
      address: 'Chilonzor 9, 12-uy',
      time: '14:20'
    },
    { 
      id: 'ORD-5482', 
      date: '2024-02-15', 
      type: 'Odeyal', 
      status: 'YETKAZIB BERILGAN', 
      price: '200,000',
      company: 'Pokiza MChJ',
      area: '2 dona',
      address: 'Chilonzor 9, 12-uy',
      time: '11:05'
    },
    { 
      id: 'ORD-5401', 
      date: '2024-01-20', 
      type: 'Gilam (Lux)', 
      status: 'YETKAZIB BERILGAN', 
      price: '320,000',
      company: 'Pokiza MChJ',
      area: '15 kv.m',
      address: 'Chilonzor 9, 12-uy',
      time: '10:30'
    },
  ];

  const handleCallback = (phone: string) => {
    const params = new URLSearchParams({ phone: phone });
    router.push(`/operator/calls?${params.toString()}`);
  };

  const handleCloseModals = () => {
    setSelectedOrder(null);
    setSelectedCustomer(null);
  };

  const handleBackToCustomer = () => {
    setSelectedOrder(null);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          customer.phone.includes(searchQuery);
    
    let matchesSegment = true;
    if (segmentFilter === 'Premium') matchesSegment = customer.orders >= 10;
    else if (segmentFilter === 'Faol') matchesSegment = new Date(customer.lastOrder) >= new Date('2024-02-10');
    else if (segmentFilter === 'Yangi') matchesSegment = customer.orders === 1;

    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mijozlar Bazasi (CRM)</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Mijozlar ma'lumotlarini tahlil qiling va aloqada bo'ling</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input 
            type="text"
            placeholder="Mijoz ismi yoki telefon raqami orqali qidirish..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-white shadow-sm outline-none focus:border-indigo-500 transition-all font-medium text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative group min-w-[200px]">
          <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none" />
          <select 
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="w-full pl-12 pr-10 py-4 bg-white border border-slate-100 rounded-2xl text-slate-500 font-bold outline-none focus:border-indigo-500 transition-all shadow-sm appearance-none"
          >
            <option value="Barchasi">Barcha Mijozlar</option>
            <option value="Premium">Premium (10+ buyurtma)</option>
            <option value="Faol">Faol (Oxirgi oyda)</option>
            <option value="Yangi">Yangi (1 ta buyurtma)</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Mijoz / Aloqa</th>
                <th className="px-8 py-5 text-center">Buyurtmalar</th>
                <th className="px-8 py-5">Jami Summa</th>
                <th className="px-8 py-5">Reyting</th>
                <th className="px-8 py-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 border border-indigo-100">
                         {customer.name[0]}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800">{customer.name}</span>
                          <span className="text-xs font-bold text-slate-400 italic">{customer.phone}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
                       {customer.orders} ta
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-emerald-600">{customer.spent} so'm</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1 text-amber-500">
                       <MdStar />
                       <span className="text-sm font-black text-slate-800">{customer.rating}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
                        title="Batafsil ma'lumot"
                       >
                         <MdHistory className="text-xl" />
                       </button>
                       <button 
                        onClick={() => handleCallback(customer.phone)}
                        className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
                        title="Qo'ng'iroq qilish"
                       >
                         <MdPhoneInTalk className="text-xl" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={!!selectedCustomer} 
        onClose={handleCloseModals}
        title={selectedOrder ? "Buyurtma Tafsilotlari" : "Mijoz haqida batafsil"}
      >
        {selectedCustomer && (
          <div className="space-y-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div 
                  key="order-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <button 
                    onClick={handleBackToCustomer}
                    className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl mb-4 hover:bg-indigo-100 transition-all"
                  >
                    <MdArrowBack /> Orqaga
                  </button>

                  <div className="bg-slate-900 rounded-[30px] p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Buyurtma ID</p>
                          <h4 className="text-2xl font-black">#{selectedOrder.id}</h4>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {selectedOrder.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Xizmat turi</p>
                          <p className="font-bold text-sm">{selectedOrder.type}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Hajmi</p>
                          <p className="font-bold text-sm">{selectedOrder.area}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500">
                          <MdBusiness />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Bajargan Korxona</p>
                          <p className="text-sm font-black text-slate-700">{selectedOrder.company}</p>
                       </div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-500">
                          <MdAttachMoney />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Xizmat Narxi</p>
                          <p className="text-sm font-black text-emerald-600">{selectedOrder.price} so'm</p>
                       </div>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-start gap-4">
                       <MdLocationOn className="text-indigo-400 mt-1" />
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Topshirilgan Manzil</p>
                          <p className="text-sm font-bold text-slate-600 leading-relaxed">{selectedOrder.address}</p>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-4 text-slate-400 text-xs font-bold border-t border-slate-100">
                     <div className="flex items-center gap-2">
                        <MdAccessTime /> {selectedOrder.time}
                     </div>
                     <div className="flex items-center gap-2">
                        <MdHistory /> {selectedOrder.date}
                     </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="customer-profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                   <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[35px] border border-slate-100 relative overflow-hidden group">
                      <div className="w-20 h-20 rounded-[30px] bg-indigo-600 flex items-center justify-center text-3xl text-white font-black shadow-xl shadow-indigo-100 relative z-10">
                         {selectedCustomer.name[0]}
                      </div>
                      <div className="relative z-10">
                         <h3 className="text-xl font-black text-slate-800">{selectedCustomer.name}</h3>
                         <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                               <MdPhone className="text-indigo-500" />
                               {selectedCustomer.phone}
                            </div>
                            <div className="hidden md:block w-1 h-1 rounded-full bg-slate-200"></div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                               <MdLocationOn className="text-emerald-500" />
                               {selectedCustomer.address}
                            </div>
                         </div>
                      </div>
                      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                   </div>

                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-1">Buyurtmalar tarixi</h4>
                      <div className="space-y-3">
                         {orderHistory.map(order => (
                           <div 
                            key={order.id} 
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group"
                           >
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                                    <MdLocalShipping className="text-xl" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-700">{order.type} <span className="text-slate-300 font-bold ml-2">#{order.id}</span></p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{order.date}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-sm font-black text-emerald-600">{order.price} so'm</p>
                                 <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">{order.status}</span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="flex gap-4 border-t border-slate-100 pt-8">
                      <button 
                        onClick={() => handleCallback(selectedCustomer.phone)}
                        className="w-full py-5 bg-indigo-600 text-white font-black rounded-[25px] shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
                      >
                         <MdPhoneInTalk className="text-xl animate-pulse" /> Qayta Qo'ng'iroq Qilish
                      </button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function OperatorCustomersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CustomersContent />
    </Suspense>
  );
}
