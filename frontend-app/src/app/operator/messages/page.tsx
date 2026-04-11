'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { 
  MdChat, MdSearch, MdFilterList, MdSend, MdAttachFile, 
  MdSentimentSatisfiedAlt, MdMoreVert, MdLocalShipping, 
  MdPerson, MdInfo, MdPhone, MdLocationOn, MdHistory,
  MdFiberManualRecord, MdDoneAll, MdCheck, MdNotifications,
  MdFingerprint, MdKeyboardArrowRight, MdTrendingUp, MdEmail,
  MdClose
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useChat } from '@/context/ChatContext';

function OperatorMessagesContent() {
  const searchParams = useSearchParams();
  const { messages, sendMessage, socket } = useChat();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Initial Data Fetching (Mocked for now but structure is real-ready)
  useEffect(() => {
    // In production, fetch via api.get('/messages/conversations')
    setConversations([
        { id: '1', type: 'driver', name: 'Sardor Rahimov', lastMsg: 'Mijoz telefoniga javob bermayapti...', time: '12:30', unread: 2, online: true, avatar: 'S', phone: '+998 90 111 22 33', car: 'Damas (01 A 123 BA)' },
        { id: '2', type: 'customer', name: 'Aliyev Vali', lastMsg: 'Buyurtma necha kundan keyin keladi?', time: '12:15', unread: 0, online: false, avatar: 'V', phone: '+998 90 123 45 67', address: 'Uchtepa, 11-kvartal, 12-uy' },
    ]);
  }, []);

  // Handle URL Deep-linking (e.g. from Logistics)
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      setSelectedId(userId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedId) scrollToBottom();
  }, [messages, selectedId]);

  const selectedConversation = conversations.find(c => c.id === selectedId);
  const currentMessages = useMemo(() => 
    messages.filter(m => (m.senderId === selectedId || m.recipientId === selectedId)), 
  [messages, selectedId]);

  const filteredConversations = useMemo(() => 
    conversations.filter(c => {
      const matchesFilter = filter === 'all' || c.type === filter;
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
      return matchesFilter && matchesSearch;
    }), [conversations, filter, search]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedId) return;

    sendMessage(selectedId, inputText);
    setInputText('');
  };

  return (
    <div className="h-[calc(100vh-140px)] w-full flex gap-1.5 lg:gap-2.5 overflow-hidden relative">
      
      {/* 1. LEFT: MICRO CONVERSATIONS LIST (Flush Aligned) */}
      <div className={`${selectedId ? 'hidden md:flex' : 'flex'} w-full md:w-[280px] lg:w-[320px] bg-white/40 backdrop-blur-3xl rounded-[20px] lg:rounded-[28px] border border-white/40 shadow-xl flex-col shrink-0 overflow-hidden transition-all duration-300`}>
        <div className="p-4 lg:p-5 pb-3">
           <div className="flex items-center justify-between mb-5">
              <h2 className="text-md font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                 <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><MdChat size={16} /></div>
                 Xabarlar
              </h2>
           </div>
           
           <div className="relative group">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input 
                 value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder="Search..."
                 className="w-full bg-white/60 border border-white/40 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold text-slate-800 outline-none focus:bg-white transition-all shadow-inner"
              />
           </div>

           <div className="mt-3.5 flex bg-white/50 p-0.5 rounded-xl gap-0.5 border border-white/20">
              {['all', 'driver', 'customer'].map(id => (
                 <button 
                    key={id} onClick={() => setFilter(id)}
                    className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                       filter === id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-700'
                    }`}
                 >
                    {id === 'all' ? 'All' : id === 'driver' ? 'Driver' : 'Client'}
                 </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
           {filteredConversations.map((conv) => (
              <motion.div 
                 layout key={conv.id} onClick={() => setSelectedId(conv.id)}
                 className={`p-2.5 rounded-[18px] cursor-pointer transition-all flex items-center gap-3 relative group ${
                    selectedId === conv.id ? 'bg-white shadow-lg border border-white translate-x-1' : 'hover:bg-white/40 border border-transparent'
                 }`}
              >
                 <div className="relative shrink-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                       conv.type === 'driver' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>{conv.avatar}</div>
                    {conv.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />}
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                       <h4 className="font-black text-slate-900 text-[10px] tracking-tight truncate">{conv.name}</h4>
                       <span className="text-[7px] font-black text-slate-400 capitalize">{conv.time}</span>
                    </div>
                    <p className={`text-[9px] truncate leading-tight ${conv.unread > 0 ? 'font-black text-indigo-600' : 'text-slate-500 font-medium opacity-60'}`}>{conv.lastMsg}</p>
                 </div>
              </motion.div>
           ))}
        </div>
      </div>

      {/* 2. CENTER: INTEGRATED CHAT SPACE */}
      <div className={`${!selectedId ? 'hidden md:flex' : 'flex'} flex-1 bg-white/30 backdrop-blur-4xl rounded-[20px] lg:rounded-[28px] border border-white/40 shadow-2xl flex-col overflow-hidden relative transition-all duration-300`}>
         <AnimatePresence mode="wait">
            {selectedId ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                  <div className="px-5 lg:px-8 py-3.5 lg:py-4 border-b border-white/10 flex items-center justify-between bg-white/20">
                     <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedId(null)} className="md:hidden w-8 h-8 rounded-lg bg-white/60 text-slate-400 flex items-center justify-center"><MdKeyboardArrowRight className="rotate-180" size={20}/></button>
                        <div className="relative">
                           <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center text-lg border border-white">{selectedConversation?.type === 'driver' ? <MdLocalShipping className="text-indigo-600" /> : <MdPerson className="text-emerald-500" />}</div>
                           <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-white ${selectedConversation?.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        </div>
                        <div className="min-w-0">
                           <h3 className="text-[12px] lg:text-[13px] font-black text-slate-900 tracking-tight mb-1 truncate">{selectedConversation?.name}</h3>
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest opacity-60 truncate">Active Signal</p>
                        </div>
                     </div>
                     <div className="flex gap-1.5 lg:gap-2">
                        <button className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl bg-white/60 hover:bg-white text-indigo-600 transition-all border border-white flex items-center justify-center"><MdPhone size={18}/></button>
                        <button onClick={() => setShowInfo(!showInfo)} className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl flex items-center justify-center transition-all border ${showInfo ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/60 text-slate-400 border-white hover:text-indigo-600'}`}><MdInfo size={18}/></button>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 lg:px-8 py-6 space-y-4 custom-scrollbar bg-white/5">
                     {currentMessages.map((msg: any) => (
                        <div key={msg.id} className={`flex ${msg.senderId === selectedId ? 'justify-start' : 'justify-end'}`}>
                           <div className={`max-w-[85%] md:max-w-[70%] relative group`}>
                              <div className={`p-3 lg:p-3.5 rounded-[18px] lg:rounded-[22px] shadow-sm ${msg.senderId !== selectedId ? 'bg-indigo-600 text-white rounded-tr-md' : 'bg-white text-slate-800 border border-white rounded-tl-md'}`}>
                                 <p className="text-[11px] lg:text-[12px] font-medium leading-relaxed">{msg.text}</p>
                              </div>
                              <div className={`flex items-center gap-2 mt-1.5 ${msg.senderId !== selectedId ? 'justify-end' : 'justify-start'}`}>
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 {msg.senderId !== selectedId && <MdDoneAll className={msg.isRead ? 'text-indigo-500' : 'text-slate-200'} size={14} />}
                              </div>
                           </div>
                        </div>
                     ))}
                     <div ref={chatEndRef} />
                  </div>

                  <div className="p-4 lg:p-6 bg-white/10">
                     <form onSubmit={handleSendMessage} className="bg-white/80 border border-white rounded-[22px] lg:rounded-[26px] p-1.5 shadow-xl flex items-center gap-2">
                        <button type="button" className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600"><MdAttachFile size={20}/></button>
                        <input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type signal..." className="flex-1 bg-transparent border-none outline-none px-2 text-[11px] lg:text-[12px] font-bold text-slate-800" />
                        <button type="submit" disabled={!inputText.trim()} className="w-10 h-10 lg:w-11 lg:h-11 bg-indigo-600 text-white rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg transition-all"><MdSend size={20} /></button>
                     </form>
                  </div>
               </motion.div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-5"><MdChat className="text-7xl lg:text-8xl text-slate-300" /></div>
            )}
         </AnimatePresence>
      </div>

      {/* 3. RIGHT: INTEGRATED INTELLIGENCE PANEL */}
      <AnimatePresence>
         {selectedId && showInfo && (
            <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} className="absolute md:relative top-0 right-0 h-full w-[240px] lg:w-[280px] z-50 md:z-auto">
               <div className="h-full bg-white/95 md:bg-white/40 backdrop-blur-5xl rounded-l-[18px] md:rounded-[18px] lg:rounded-[24px] border border-white/40 shadow-2xl flex flex-col overflow-hidden">
                  <div className="p-4 lg:p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
                     <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Intelligence <MdNotifications className="text-lg text-indigo-400" /></p>
                     <button onClick={() => setShowInfo(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center md:hidden"><MdClose /></button>
                  </div>

                  <div className="p-4 lg:p-5 border-b border-white/10 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4">Feed</p>
                     <div className="space-y-3.5">
                        {[1, 2].map(i => (
                           <div key={i} className="flex gap-2.5 group">
                              <div className="w-1 h-10 bg-slate-100 rounded-full shrink-0 group-hover:bg-indigo-500 transition-all" />
                              <div className="min-w-0">
                                 <p className="text-[10px] font-black text-slate-800 truncate leading-none mb-1">Signal Update #{i}49</p>
                                 <p className="text-[8px] font-bold text-slate-400 tracking-tighter">SUCCESS • NOV 04</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="mt-auto p-4 lg:p-5 space-y-4 bg-white/20 border-t border-white/10">
                     <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-xl ${selectedConversation?.type === 'driver' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>{selectedConversation?.avatar}</div>
                        <div className="min-w-0">
                           <h4 className="text-[11px] lg:text-[12px] font-black text-slate-900 truncate mb-1">{selectedConversation?.name}</h4>
                           <p className="text-[7px] font-black text-indigo-500 uppercase tracking-widest">Active Member</p>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <div className="p-2 bg-white/60 rounded-xl border border-white shadow-sm flex items-center justify-between">
                           <p className="text-[7px] font-black text-slate-400 uppercase">Tel</p>
                           <p className="text-[10px] font-black text-slate-800">{selectedConversation?.phone}</p>
                        </div>
                        <div className="p-2.5 bg-slate-950 text-white rounded-xl shadow-xl flex items-center justify-between overflow-hidden relative">
                           <p className="text-[7px] font-black text-white/40 uppercase">Details</p>
                           <p className="text-[9px] font-black truncate max-w-[120px]">{selectedConversation?.car || selectedConversation?.address}</p>
                           <MdFingerprint className="absolute -bottom-1 -right-1 text-2xl text-white/5" />
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .backdrop-blur-4xl { backdrop-filter: blur(80px); }
        .backdrop-blur-5xl { backdrop-filter: blur(120px); }
         .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default function OperatorMessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>}>
      <OperatorMessagesContent />
    </Suspense>
  );
}
