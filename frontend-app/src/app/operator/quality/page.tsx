'use client';

import React, { useState } from 'react';
import { 
  MdVerifiedUser, 
  MdThumbUp, 
  MdThumbDown, 
  MdMessage, 
  MdStar, 
  MdHistory,
  MdInsertChartOutlined,
  MdCheckCircleOutline,
  MdReply,
  MdArchive,
  MdSend
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/ui/Modal';

export default function OperatorQualityPage() {
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [reviews, setReviews] = useState([
    { id: 1, customer: 'Aliyev Vali', service: 'Gilam yuvish', rating: 5, comment: 'Juda tez va sifatli yuvib berishdi. Raxmat!', date: '2 kun oldin', status: 'POSITIVE', archived: false },
    { id: 2, customer: 'Karimov Anvar', service: 'Yumshoq mebel', rating: 3, comment: 'Biroz dog\'lar qolib ketgan, lekin umumiy yaxshi.', date: '3 kun oldin', status: 'NEUTRAL', archived: false },
    { id: 3, customer: 'Rasulova Jamila', service: 'Pardalar', rating: 5, comment: 'Ajoyib servis, drayver xushmuomala.', date: 'Hafta boshida', status: 'POSITIVE', archived: false },
  ]);

  const handleArchive = (id: number) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, archived: true } : r));
    setSelectedReview(null);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    alert(`Mijozga javob yuborildi: ${replyText}`);
    setReplyText('');
    setSelectedReview(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
           <MdVerifiedUser className="text-emerald-500" /> Sifat Nazorati (Feedback)
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Mijozlar fikrini o'rganing va xizmat sifatini oshiring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <motion.div whileHover={{ y: -5 }} className="bg-emerald-500 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-500/20">
            <MdThumbUp className="text-3xl mb-4 text-emerald-200" />
            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em] mb-1">Mijozlar mamnunligi</p>
            <h3 className="text-3xl font-black">94%</h3>
         </motion.div>
         <motion.div whileHover={{ y: -5 }} className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-500/20">
            <MdStar className="text-3xl mb-4 text-indigo-300" />
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">O'rtacha reyting</p>
            <h3 className="text-3xl font-black">4.9 / 5</h3>
         </motion.div>
         <motion.div whileHover={{ y: -5 }} className="bg-slate-800 rounded-[32px] p-8 text-white shadow-xl shadow-slate-900/20">
            <MdMessage className="text-3xl mb-4 text-slate-400" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Jami sharhlar</p>
            <h3 className="text-3xl font-black">428 ta</h3>
         </motion.div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
         <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">So'nggi sharhlar</h2>
            <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
               <button className="px-4 py-2 bg-white rounded-lg text-[10px] font-black text-slate-800 shadow-sm uppercase tracking-widest">Barchasi</button>
               <button className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Negativ</button>
            </div>
         </div>
         <div className="p-0">
            {reviews.filter(r => !r.archived).map((rev) => (
              <div key={rev.id} className="p-8 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group relative">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                         rev.status === 'POSITIVE' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
                       }`}>
                          {rev.status === 'POSITIVE' ? <MdThumbUp /> : <MdThumbDown />}
                       </div>
                       <div>
                          <h4 className="font-black text-slate-800 tracking-tight">{rev.customer}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Xizmat: {rev.service}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {[...Array(5)].map((_, i) => (
                         <MdStar key={i} className={i < rev.rating ? 'text-amber-400' : 'text-slate-200'} />
                       ))}
                    </div>
                 </div>
                 <p className="text-slate-600 text-sm font-medium leading-relaxed italic">"{rev.comment}"</p>
                 <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rev.date}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button 
                        onClick={() => setSelectedReview(rev)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                       >
                          <MdReply /> Javob berish
                       </button>
                       <button 
                        onClick={() => handleArchive(rev.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-200 hover:text-slate-600 transition-all"
                       >
                          <MdArchive /> Arxiv
                       </button>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      <Modal 
        isOpen={!!selectedReview} 
        onClose={() => setSelectedReview(null)}
        title="Mijoz fikriga javob"
      >
        {selectedReview && (
          <div className="space-y-6">
             <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{selectedReview.customer} yozgan:</p>
                <p className="text-sm font-medium text-slate-700 italic">"{selectedReview.comment}"</p>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Javob matni (SMS bo'lib boradi)</label>
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Fikringiz uchun rahmat! Kamchiliklarni bartaraf etamiz..."
                  className="w-full h-32 p-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium transition-all resize-none"
                />
             </div>

             <button 
              onClick={handleSendReply}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
             >
               <MdSend className="text-xl" />
               Javobni Yuborish
             </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
