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
  };

  return (
    <div className="h-[calc(100vh-140px)] w-full flex gap-3 overflow-hidden">
      
      {/* 1. LEFT: MICRO CONVERSATIONS LIST */}
      <div className="w-[280px] bg-white/40 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-xl flex flex-col shrink-0 overflow-hidden">
        <div className="p-5 pb-4">
           <div className="flex items-center justify-between mb-5">
              <h2 className="text-md font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                 <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                    <MdChat size={16} />
                 </div>
                 Xabarlar
              </h2>
           </div>
           
           <div className="relative group">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-indigo-600 transition-colors" />
              <input 
                 value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder="Qidiruv..."
                 className="w-full bg-white/60 border border-white/40 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold text-slate-800 outline-none focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
              />
           </div>

           <div className="mt-3.5 flex bg-white/50 p-0.5 rounded-xl gap-0.5 border border-white/20">
              {[
                { id: 'all', label: 'All' },
                { id: 'driver', label: 'Driver' },
                { id: 'customer', label: 'Client' }
              ].map(tab => (
                 <button 
                    key={tab.id} onClick={() => setFilter(tab.id)}
                    className={`flex-1 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                       filter === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
                    }`}
                 >
                    {tab.label}
                 </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-1 custom-scrollbar">
           {filteredConversations.map((conv) => (
              <motion.div 
                 layout key={conv.id} onClick={() => setSelectedId(conv.id)}
                 className={`p-2.5 rounded-[22px] cursor-pointer transition-all flex items-center gap-2.5 relative group ${
                    selectedId === conv.id ? 'bg-white shadow-lg border border-white translate-x-1.5' : 'hover:bg-white/40 border border-transparent'
                 }`}
              >
                 <div className="relative shrink-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                       conv.type === 'driver' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                       {conv.avatar}
                    </div>
                    {conv.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />}
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                       <h4 className="font-black text-slate-900 text-[10px] tracking-tight truncate">{conv.name}</h4>
                       <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{conv.time}</span>
                    </div>
                    <p className={`text-[9px] truncate leading-tight ${conv.unread > 0 ? 'font-black text-indigo-600' : 'text-slate-500 font-medium opacity-60'}`}>
                       {conv.lastMsg}
                    </p>
                 </div>
              </motion.div>
           ))}
        </div>
      </div>

      {/* 2. CENTER: COMPACT CHAT (Infinite Flow) */}
      <div className="flex-1 bg-white/30 backdrop-blur-4xl rounded-[32px] border border-white/40 shadow-2xl flex flex-col overflow-hidden relative">
         <AnimatePresence mode="wait">
            {selectedId ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                 className="flex flex-col h-full"
               >
                  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/20">
                     <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center text-lg border border-white shadow-inner">
                           {selectedConversation?.type === 'driver' ? <MdLocalShipping className="text-indigo-600" /> : <MdPerson className="text-emerald-500" />}
                        </div>
                        <div>
                           <h3 className="text-[13px] font-black text-slate-900 tracking-tight leading-none mb-1">{selectedConversation?.name}</h3>
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                              <MdFingerprint className="text-indigo-400" /> Active Session
                           </p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button className="w-8 h-8 rounded-lg bg-white/60 hover:bg-white text-indigo-600 transition-all border border-white flex items-center justify-center"><MdPhone size={18}/></button>
                        <button className="w-8 h-8 rounded-lg bg-white/60 hover:bg-white text-slate-400 transition-all border border-white flex items-center justify-center"><MdMoreVert size={20}/></button>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar bg-white/5">
                     {messages[selectedId]?.map((msg: any) => (
                        <div 
                           key={msg.id} className={`flex ${msg.sender === 'operator' ? 'justify-end' : 'justify-start'}`}
                        >
                           <div className={`max-w-[80%] relative group`}>
                              <div className={`p-3.5 rounded-[22px] shadow-sm ${
                                 msg.sender === 'operator' ? 'bg-indigo-600 text-white rounded-tr-md' : 'bg-white text-slate-800 border border-white rounded-tl-md'
                              }`}>
                                 <p className="text-[11px] font-medium leading-relaxed font-sans">{msg.text}</p>
                              </div>
                              <div className={`flex items-center gap-2 mt-1.5 ${msg.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                                 <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">{msg.time}</span>
                                 {msg.sender === 'operator' && <MdDoneAll className={msg.status === 'read' ? 'text-indigo-500' : 'text-slate-200'} size={14} />}
                              </div>
                           </div>
                        </div>
                     ))}
                     <div ref={chatEndRef} />
                  </div>

                  <div className="p-5 bg-white/10">
                     <form onSubmit={handleSendMessage} className="bg-white/80 border border-white rounded-[24px] p-1.5 shadow-xl flex items-center gap-2">
                        <button type="button" className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600"><MdAttachFile size={20}/></button>
                        <input 
                           value={inputText} onChange={(e) => setInputText(e.target.value)}
                           placeholder="Type..."
                           className="flex-1 bg-transparent border-none outline-none px-2 text-[11px] font-bold text-slate-800 placeholder:text-slate-300"
                        />
                        <button 
                           type="submit" disabled={!inputText.trim()}
                           className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg transition-all disabled:opacity-30"
                        >
                           <MdSend size={20} />
                        </button>
                     </form>
                  </div>
               </motion.div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-10">
                  <MdChat className="text-6xl text-slate-300" />
               </div>
            )}
         </AnimatePresence>
      </div>

      {/* 3. RIGHT: TRIPLE-SPLIT INTELLIGENCE (Bottom-Focus Profile) */}
      <div className="w-[240px] bg-white/40 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-xl flex flex-col shrink-0 overflow-hidden">
         <AnimatePresence mode="wait">
            {selectedId ? (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="flex flex-col h-full"
               >
                  {/* PART 1: PULSE FEED (Top) */}
                  <div className="p-5 border-b border-white/10 bg-white/5">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                        Pulse Feed <MdNotifications className="text-lg text-indigo-400" />
                     </p>
                     <div className="space-y-2">
                        <div className="p-3 bg-white/50 rounded-xl border border-white shadow-sm flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                           <p className="text-[9px] font-black text-slate-800">Order Dispatched</p>
                        </div>
                     </div>
                  </div>

                  {/* PART 2: INTERACTION HISTORY (Middle) */}
                  <div className="p-5 border-b border-white/10 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4">Activity Journal</p>
                     <div className="space-y-3.5">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="flex gap-2.5 relative group">
                              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mt-1.5 shrink-0 group-hover:bg-indigo-500 transition-all shadow-sm" />
                              <div className="min-w-0">
                                 <p className="text-[10px] font-black text-slate-800 leading-tight">Interaction #{i*213}</p>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">Apr 04 • Completed</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  {/* PART 3: THE PROFILE (Flush Bottom) */}
                  <div className="mt-auto p-5 space-y-4 bg-white/10 border-t border-white/10">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl ${
                           selectedConversation?.type === 'driver' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                           {selectedConversation?.avatar}
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-[11px] font-black text-slate-900 tracking-tight leading-none mb-0.5 truncate">{selectedConversation?.name}</h4>
                           <p className="text-[7px] font-black text-indigo-500 uppercase tracking-widest">
                              {selectedConversation?.type === 'driver' ? 'Logistic Pro' : 'V.I.P Client'}
                           </p>
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <div className="p-2.5 bg-white/50 rounded-xl border border-white shadow-sm flex items-center justify-between">
                           <p className="text-[7px] font-black text-slate-400 uppercase">Contact</p>
                           <p className="text-[9px] font-black text-slate-800">{selectedConversation?.phone}</p>
                        </div>
                        <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-between overflow-hidden relative">
                           <p className="text-[7px] font-black text-white/50 uppercase">Asset</p>
                           <p className="text-[8px] font-black truncate max-w-[120px]">{selectedConversation?.car || selectedConversation?.address}</p>
                           <MdFingerprint className="absolute -bottom-1 -right-1 text-2xl text-white/5 rotate-12" />
                        </div>
                     </div>

                     <button className="w-full py-3 bg-slate-950 text-white font-black rounded-xl text-[8px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                        View Intelligence <MdKeyboardArrowRight size={14}/>
                     </button>
                  </div>
               </motion.div>
            ) : (
               <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-5">
                  <MdFingerprint size={60} />
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
