'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MdChat, MdSearch, MdFilterList, MdSend, MdAttachFile, 
  MdSentimentSatisfiedAlt, MdMoreVert, MdLocalShipping, 
  MdPerson, MdInfo, MdPhone, MdLocationOn, MdHistory,
  MdFiberManualRecord, MdDoneAll, MdCheck, MdNotifications,
  MdFingerprint, MdKeyboardArrowRight, MdTrendingUp, MdEmail
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_CONVERSATIONS = [
  { 
    id: 1, 
    type: 'driver', 
    name: 'Sardor Rahimov', 
    lastMsg: 'Mijoz telefoniga javob bermayapti...', 
    time: '12:30', 
    unread: 2, 
    online: true, 
    avatar: 'S',
    phone: '+998 90 111 22 33',
    car: 'Damas (01 A 123 BA)',
    recentOrders: 12
  },
  { 
    id: 2, 
    type: 'customer', 
    name: 'Aliyev Vali', 
    lastMsg: 'Buyurtma necha kundan keyin keladi?', 
    time: '12:15', 
    unread: 0, 
    online: false, 
    avatar: 'V',
    phone: '+998 90 123 45 67',
    address: 'Uchtepa, 11-kvartal, 12-uy',
    totalOrders: 45
  },
  { 
    id: 3, 
    type: 'driver', 
    name: 'Jamshid Karimov', 
    lastMsg: 'Tushunarli, yo\'lda davom etavering.', 
    time: '11:45', 
    unread: 0, 
    online: true, 
    avatar: 'J',
    phone: '+998 90 444 55 66',
    car: 'Labo (01 B 456 CA)',
    recentOrders: 8
  },
  { 
    id: 4, 
    type: 'customer', 
    name: 'Karimov Anvar', 
    lastMsg: 'Rahmat, gilamlar juda toza yuvipti!', 
    time: 'Kecha', 
    unread: 0, 
    online: false, 
    avatar: 'A',
    phone: '+998 93 456 78 90',
    address: 'Chilonzor, 1-kvartal',
    totalOrders: 12
  }
];

const INITIAL_MESSAGES: any = {
  1: [
    { id: 101, text: "Assalomu alaykum, drayver! Buyurtmani Chilonzordan olishingiz kerak.", sender: 'operator', time: '12:20', status: 'read' },
    { id: 102, text: "Va alaykum assalom. Hozir boraman.", sender: 'driver', time: '12:22', status: 'read' },
    { id: 103, text: "Mijoz telefoniga javob bermayapti, 2-marotaba qo'ng'iroq qildim.", sender: 'driver', time: '12:30', status: 'unread' },
  ],
  2: [
    { id: 201, text: "Assalomu alaykum, Vali aka. Gilamlaringiz jarayonda.", sender: 'operator', time: '12:10', status: 'read' },
    { id: 202, text: "Buyurtma necha kundan keyin keladi?", sender: 'customer', time: '12:15', status: 'read' },
  ]
};

export default function OperatorMessagesPage() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (selectedId) scrollToBottom();
  }, [messages, selectedId]);

  const selectedConversation = conversations.find(c => c.id === selectedId);
  const filteredConversations = useMemo(() => 
    conversations.filter(c => {
      const matchesFilter = filter === 'all' || c.type === filter;
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
      return matchesFilter && matchesSearch;
    }), [conversations, filter, search]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedId) return;

    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'operator',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages((prev: any) => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), newMessage] }));
    setInputText('');
    setConversations(p => p.map(c => c.id === selectedId ? { ...c, lastMsg: inputText, time: 'Hozir' } : c));

    setTimeout(() => {
      const reply = {
          id: Date.now() + 1,
          text: "Tushundim, xabar oldim. ✅",
          sender: selectedConversation?.type || 'driver',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
      };
      setMessages((prev: any) => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), reply] }));
      setConversations(p => p.map(c => c.id === selectedId ? { ...c, lastMsg: reply.text, time: 'Hozir' } : c));
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-140px)] w-full flex gap-3 overflow-hidden">
      
      {/* 1. LEFT: MICRO CONVERSATIONS LIST (Glassmorphic) */}
      <div className="w-[300px] bg-white/40 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-xl flex flex-col shrink-0 overflow-hidden">
        <div className="p-6 pb-4">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <MdChat size={16} />
                 </div>
                 Xabarlar
              </h2>
              <button className="w-8 h-8 bg-white/50 border border-white rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"><MdFilterList size={18}/></button>
           </div>
           
           <div className="relative group">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-indigo-600 transition-colors" />
              <input 
                 value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder="Search..."
                 className="w-full bg-white/60 border border-white/40 rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold text-slate-800 outline-none focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
              />
           </div>

           <div className="mt-4 flex bg-white/50 p-0.5 rounded-xl gap-0.5 border border-white/20">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'driver', label: 'Drayver' },
                { id: 'customer', label: 'Mijoz' }
              ].map(tab => (
                 <button 
                    key={tab.id} onClick={() => setFilter(tab.id)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                       filter === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
                    }`}
                 >
                    {tab.label}
                 </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1.5 custom-scrollbar">
           {filteredConversations.map((conv) => (
              <motion.div 
                 layout key={conv.id} onClick={() => setSelectedId(conv.id)}
                 className={`p-3 rounded-[24px] cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden group ${
                    selectedId === conv.id ? 'bg-white shadow-xl border border-white translate-x-2' : 'hover:bg-white/40 border border-transparent'
                 }`}
              >
                 <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner ${
                       conv.type === 'driver' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                       {conv.avatar}
                    </div>
                    {conv.online && (
                       <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white transition-all rounded-full shadow-md" />
                    )}
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                       <h4 className="font-black text-slate-900 text-[11px] tracking-tight truncate">{conv.name}</h4>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{conv.time}</span>
                    </div>
                    <p className={`text-[10px] truncate leading-tight ${conv.unread > 0 ? 'font-black text-indigo-600' : 'text-slate-500 font-medium opacity-60'}`}>
                       {conv.lastMsg}
                    </p>
                 </div>

                 {conv.unread > 0 && (
                    <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-md">
                       {conv.unread}
                    </div>
                 )}
              </motion.div>
           ))}
        </div>
      </div>

      {/* 2. CENTER: COMPACT CHAT SPACE (Ultra-Glass) */}
      <div className="flex-1 bg-white/30 backdrop-blur-4xl rounded-[32px] border border-white/40 shadow-2xl flex flex-col overflow-hidden relative">
         <AnimatePresence mode="wait">
            {selectedId ? (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                 className="flex flex-col h-full"
               >
                  {/* Chat Header */}
                  <div className="px-8 py-4 border-b border-white/10 flex items-center justify-between bg-white/20">
                     <div className="flex items-center gap-3">
                        <div className="relative">
                           <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-xl border border-white shadow-inner">
                              {selectedConversation?.type === 'driver' ? <MdLocalShipping className="text-indigo-600" /> : <MdPerson className="text-emerald-500" />}
                           </div>
                           <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-white shadow-md ${selectedConversation?.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{selectedConversation?.name}</h3>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 opacity-60">
                              <MdFingerprint className="text-indigo-400" /> Active Session
                           </p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button className="w-9 h-9 rounded-xl bg-white/60 hover:bg-white text-indigo-600 transition-all border border-white shadow-sm flex items-center justify-center"><MdPhone size={20}/></button>
                        <button className="w-9 h-9 rounded-xl bg-white/60 hover:bg-white text-slate-400 transition-all border border-white shadow-sm flex items-center justify-center"><MdMoreVert size={22}/></button>
                     </div>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto px-8 py-8 space-y-5 custom-scrollbar bg-white/5">
                     {messages[selectedId]?.map((msg: any) => (
                        <motion.div 
                           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                           key={msg.id} className={`flex ${msg.sender === 'operator' ? 'justify-end' : 'justify-start'}`}
                        >
                           <div className={`max-w-[80%] relative group`}>
                              <div className={`p-4 rounded-[24px] shadow-sm ${
                                 msg.sender === 'operator' 
                                 ? 'bg-indigo-600 text-white rounded-tr-md shadow-indigo-100' 
                                 : 'bg-white text-slate-800 border border-white shadow-sm rounded-tl-md'
                              }`}>
                                 <p className="text-[12px] font-medium leading-relaxed">{msg.text}</p>
                              </div>
                              <div className={`flex items-center gap-2 mt-2 ${msg.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{msg.time}</span>
                                 {msg.sender === 'operator' && (
                                    <MdDoneAll className={msg.status === 'read' ? 'text-indigo-500 text-md' : 'text-slate-200 text-md'} />
                                 )}
                              </div>
                           </div>
                        </motion.div>
                     ))}
                     <div ref={chatEndRef} />
                  </div>

                  {/* Compact Input Box */}
                  <div className="p-6 bg-white/10">
                     <form onSubmit={handleSendMessage} className="bg-white/80 border border-white rounded-[28px] p-2 shadow-xl flex items-center gap-2 transition-all">
                        <button type="button" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"><MdAttachFile size={22}/></button>
                        <input 
                           value={inputText} onChange={(e) => setInputText(e.target.value)}
                           placeholder="Message..."
                           className="flex-1 bg-transparent border-none outline-none px-3 text-[12px] font-bold text-slate-800 placeholder:text-slate-300"
                        />
                        <button type="button" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-amber-500 transition-all"><MdSentimentSatisfiedAlt size={22}/></button>
                        <button 
                           type="submit" disabled={!inputText.trim()}
                           className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-100 hover:bg-slate-900 transition-all disabled:opacity-30"
                        >
                           <MdSend size={22} />
                        </button>
                     </form>
                  </div>
               </motion.div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-20">
                  <MdChat className="text-6xl text-slate-300 mb-6" />
                  <h3 className="text-xl font-black text-slate-900 mb-2">Select a Conversation</h3>
               </div>
            )}
         </AnimatePresence>
      </div>

      {/* 3. RIGHT: COMPACT INTELLIGENCE PANEL (Profile moved down focus) */}
      <div className="w-[260px] bg-white/40 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-xl flex flex-col shrink-0 overflow-hidden">
         <AnimatePresence mode="wait">
            {selectedId ? (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="flex flex-col h-full"
               >
                  {/* TOP: QUICK NOTIFICATIONS / STATUS */}
                  <div className="p-6 border-b border-white/10">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                        Pulse Feed <MdHistory className="text-lg text-slate-300" />
                     </p>
                     <div className="space-y-3">
                        {[1, 2].map(i => (
                           <div key={i} className="flex gap-3">
                              <div className="w-1 h-8 bg-indigo-500/20 rounded-full shrink-0" />
                              <div className="min-w-0">
                                 <p className="text-[10px] font-black text-slate-800 truncate">Delivery #4928 Update</p>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase">2 min ago</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  {/* BOTTOM FOCUS: PROFILE SECTION */}
                  <div className="mt-auto p-6 space-y-6 pt-10">
                     <div className="text-center group">
                        <div className={`w-16 h-16 mx-auto rounded-[24px] flex items-center justify-center font-black text-2xl mb-4 shadow-xl transition-transform group-hover:scale-105 ${
                           selectedConversation?.type === 'driver' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                           {selectedConversation?.avatar}
                        </div>
                        <h4 className="text-md font-black text-slate-900 tracking-tight leading-none mb-1.5">{selectedConversation?.name}</h4>
                        <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">
                           {selectedConversation?.type === 'driver' ? 'Logistic Agent' : 'Premium Client'}
                        </p>
                     </div>

                     <div className="space-y-2.5">
                        <div className="p-3 bg-white/50 rounded-[20px] border border-white shadow-sm">
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile</p>
                           <p className="text-[11px] font-black text-slate-800">{selectedConversation?.phone}</p>
                        </div>
                        
                        {selectedConversation?.type === 'driver' ? (
                           <div className="p-3 bg-indigo-600 text-white rounded-[20px] shadow-lg shadow-indigo-100">
                              <p className="text-[7px] font-black text-white/50 uppercase tracking-widest mb-1">Assigned</p>
                              <p className="text-[10px] font-black tracking-tight">{selectedConversation?.car}</p>
                           </div>
                        ) : (
                           <div className="p-3 bg-emerald-500 text-white rounded-[20px] shadow-lg shadow-emerald-100">
                              <p className="text-[7px] font-black text-white/50 uppercase tracking-widest mb-1">Address</p>
                              <p className="text-[9px] font-black truncate">{selectedConversation?.address}</p>
                           </div>
                        )}
                     </div>

                     <button className="w-full py-3.5 bg-slate-900 text-white font-black rounded-xl text-[8px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 mt-4">
                        Deep Profile <MdKeyboardArrowRight size={16}/>
                     </button>
                  </div>
               </motion.div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-10">
                  <MdNotifications className="text-5xl text-slate-100" />
               </div>
            )}
         </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .backdrop-blur-4xl { backdrop-filter: blur(80px); }
      `}</style>
    </div>
  );
}
