'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MdChat, 
  MdSearch, 
  MdFilterList, 
  MdSend, 
  MdAttachFile, 
  MdSentimentSatisfiedAlt, 
  MdMoreVert, 
  MdLocalShipping, 
  MdPerson, 
  MdInfo,
  MdPhone,
  MdLocationOn,
  MdHistory,
  MdFiberManualRecord,
  MdDoneAll,
  MdCheck,
  MdNotifications
} from 'react-icons/md';
import { useRouter } from 'next/navigation';
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
    car: 'Damas (01 A 123 BA)'
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
    address: 'Uchtepa, 11-kvartal, 12-uy'
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
    car: 'Labo (01 B 456 CA)'
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
    address: 'Chilonzor, 1-kvartal'
  },
  { 
    id: 5, 
    type: 'customer', 
    name: 'Ziyoeva Malika', 
    lastMsg: 'Qayta qo\'ng\'iroq qila olasizlarmi?', 
    time: 'Kecha', 
    unread: 0, 
    online: false, 
    avatar: 'M',
    phone: '+998 90 999 88 77',
    address: 'Yunusobod, 4-mavze'
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
  const [filter, setFilter] = useState('all'); // all, driver, customer
  const [search, setSearch] = useState('');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const router = useRouter();
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedId]);

  const selectedConversation = conversations.find(c => c.id === selectedId);
  
  const handleCall = () => {
    if (!selectedConversation) return;
    const params = new URLSearchParams({ phone: selectedConversation.phone });
    router.push(`/operator/calls?${params.toString()}`);
  };

  const handleViewProfile = () => {
    if (!selectedConversation) return;
    if (selectedConversation.type === 'driver') {
      router.push(`/operator/logistics?driverId=${selectedId}`);
    } else {
      router.push(`/operator/customers?customerId=${selectedId}`);
    }
  };

  const handleAction = (action: string) => {
    alert(`${selectedConversation?.name} uchun "${action}" amali bajarildi (Simulyatsiya)`);
    setIsMoreMenuOpen(false);
    if (action === 'Tozalash') {
      setMessages((prev: any) => ({ ...prev, [selectedId!]: [] }));
    }
  };

  const filteredConversations = conversations.filter(c => {
    const matchesFilter = filter === 'all' || c.type === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         c.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

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

    setMessages((prev: any) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMessage]
    }));
    setInputText('');

    // Update last message in conversation
    setConversations(prev => prev.map(c => 
      c.id === selectedId ? { ...c, lastMsg: inputText, time: 'Hozir' } : c
    ));

    // Simulate reply
    setTimeout(() => {
      const reply = {
          id: Date.now() + 1,
          text: "Tushundim, xabar oldim. ✅",
          sender: selectedConversation?.type || 'driver',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
      };
      setMessages((prev: any) => ({
          ...prev,
          [selectedId]: [...(prev[selectedId] || []), reply]
      }));
      setConversations(prev => prev.map(c => 
          c.id === selectedId ? { ...c, lastMsg: reply.text, time: 'Hozir' } : c
      ));
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-200px)] flex gap-4 overflow-hidden">
      {/* 1. LEFT SIDEBAR: CONVERSATION LIST */}
      <div className="w-80 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col shrink-0 overflow-hidden">
        <div className="p-6 pb-4">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <MdChat className="text-indigo-600" /> Xabarlar
          </h2>
          
          <div className="mt-6 relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidiruv..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="mt-4 flex bg-slate-50 p-1 rounded-xl gap-1">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'driver', label: 'Haydovchilar' },
              { id: 'customer', label: 'Mijozlar' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {filteredConversations.map((conv) => (
            <div 
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`p-4 rounded-[32px] cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden ${
                selectedId === conv.id ? 'bg-indigo-50/50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className="relative shrink-0">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${
                  conv.type === 'driver' ? 'bg-indigo-600 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {conv.avatar}
                </div>
                {conv.online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-slate-800 text-sm tracking-tight truncate">{conv.name}</h4>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{conv.time}</span>
                </div>
                <p className={`text-xs mt-0.5 truncate ${conv.unread > 0 ? 'font-black text-slate-800' : 'text-slate-400 font-medium'}`}>
                  {conv.lastMsg}
                </p>
              </div>

              {conv.unread > 0 && (
                <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0">
                  {conv.unread}
                </div>
              )}
            </div>
          ))}
          
          {filteredConversations.length === 0 && (
            <div className="text-center py-10 grayscale opacity-20">
              <MdChat className="text-5xl mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Xabarlar topilmadi</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. CENTER: CHAT AREA */}
      <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col overflow-hidden relative">
        {selectedId ? (
          <>
            {/* Chat Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl text-slate-400 border border-slate-100">
                  {selectedConversation?.type === 'driver' ? <MdLocalShipping className="text-indigo-500" /> : <MdPerson className="text-emerald-500" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">{selectedConversation?.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <MdFiberManualRecord className={`text-[10px] ${selectedConversation?.online ? 'text-emerald-500 shadow-none' : 'text-slate-300'}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {selectedConversation?.online ? 'Tarmoqda' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 relative">
                <button 
                  onClick={handleCall}
                  className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100"
                >
                  <MdPhone />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all border ${
                      isMoreMenuOpen ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-indigo-600'
                    }`}
                  >
                    <MdMoreVert />
                  </button>
                  
                  <AnimatePresence>
                    {isMoreMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50"
                      >
                        {[
                          { id: 'Tozalash', label: 'Chatni tozalash' },
                          { id: 'Bloklash', label: 'Foydalanuvchini bloklash' },
                          { id: 'Eksport', label: 'Suhbatni eksport qilish' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleAction(item.id)}
                            className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                          >
                            {item.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
              {messages[selectedId]?.map((msg: any) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender === 'operator' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] group relative`}>
                    <div className={`p-4 rounded-[28px] ${
                      msg.sender === 'operator' 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/10 rounded-tr-lg' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-lg'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    </div>
                    <div className={`flex items-center gap-2 mt-2 ${msg.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[9px] font-black text-slate-400 uppercase">{msg.time}</span>
                      {msg.sender === 'operator' && (
                        msg.status === 'read' ? <MdDoneAll className="text-indigo-500" /> : <MdCheck className="text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-8 pt-0">
              <form onSubmit={handleSendMessage} className="bg-slate-50 rounded-[30px] p-2 flex items-center gap-2 border border-slate-100 focus-within:border-indigo-200 transition-all">
                <button type="button" className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl text-slate-400 hover:text-indigo-600 transition-all">
                  <MdAttachFile />
                </button>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Xabarni kiriting..."
                  className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-medium text-slate-700"
                />
                <button type="button" className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl text-slate-300 hover:text-amber-500 transition-all mr-2">
                  <MdSentimentSatisfiedAlt />
                </button>
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-12 h-12 bg-indigo-600 text-white rounded-[20px] flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                >
                  <MdSend />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 grayscale opacity-20">
            <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <MdChat className="text-6xl text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Muloqotni boshlang</h3>
            <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm">Chap tomondagi ro'yxatdan haydovchi yoki mijozni tanlab, muloqotni boshlashingiz mumkin</p>
          </div>
        )}
      </div>

      {/* 3. RIGHT SIDEBAR: CONTEXT INFO */}
      <div className="w-72 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col shrink-0 overflow-hidden">
        {selectedId ? (
          <>
            <div className="p-8 pb-4 border-b border-slate-50 flex items-center gap-2">
              <MdInfo className="text-indigo-600 text-xl" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Profil ma'lumotlari</span>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto scrollbar-hide">
              <div className="text-center">
                 <div className={`w-24 h-24 mx-auto rounded-[32px] flex items-center justify-center font-black text-3xl mb-4 ${
                   selectedConversation?.type === 'driver' ? 'bg-indigo-600 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                 }`}>
                   {selectedConversation?.avatar}
                 </div>
                 <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none">{selectedConversation?.name}</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3">
                   {selectedConversation?.type === 'driver' ? 'Logistika Haydovchisi' : 'Doimiy Mijoz'}
                 </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefon raqami</p>
                  <p className="text-sm font-bold text-slate-700">{selectedConversation?.phone}</p>
                </div>
                
                {selectedConversation?.type === 'driver' ? (
                  <div className="p-4 bg-indigo-50/50 rounded-3xl border border-indigo-100/50">
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Avtomobil</p>
                    <p className="text-sm font-bold text-slate-700">{selectedConversation?.car}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Manzil</p>
                    <p className="text-sm font-bold text-slate-700">{selectedConversation?.address}</p>
                  </div>
                )}
              </div>

              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MdHistory className="text-lg" /> So'nggi amallar
                </h5>
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex gap-3 relative pb-4 last:pb-0">
                      {i !== 2 && <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-100"></div>}
                      <div className="w-5 h-5 bg-white border-2 border-slate-100 rounded-full shrink-0 relative z-10"></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-800">Buyurtma topshirildi</p>
                        <p className="text-[9px] font-medium text-slate-400 mt-1">12:30 • {i} kun oldin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleViewProfile}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-[20px] text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:-translate-y-1 transition-all"
                >
                  Profilni To'liq Ko'rish
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-10 text-center grayscale opacity-10">
             <MdNotifications className="text-5xl mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest">Bildirishnomalar</p>
          </div>
        )}
      </div>
    </div>
  );
}
