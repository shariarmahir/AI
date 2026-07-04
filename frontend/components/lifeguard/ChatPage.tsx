'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Send,
  Paperclip,
  FileText,
  Camera,
  Microscope,
  Pill,
  Hospital,
  X,
  Bot,
  User,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
  Stethoscope,
  ChevronDown,
  Shield,
  Sparkles,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type UploadCategory = 'prescription' | 'injury' | 'report' | 'medicine' | 'hospital' | null;

interface UploadedFile {
  id: string;
  name: string;
  category: UploadCategory;
  preview?: string;
  size: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  files?: UploadedFile[];
  timestamp: string;
  status?: 'analyzing' | 'done';
}

const categories = [
  {
    id: 'prescription' as UploadCategory,
    icon: FileText,
    label: 'Prescription',
    desc: 'Doctor prescription slips',
    color: 'blue',
    accept: 'image/*,.pdf',
  },
  {
    id: 'injury' as UploadCategory,
    icon: Camera,
    label: 'Physical Injury',
    desc: 'Wound / bruise photos',
    color: 'orange',
    accept: 'image/*',
  },
  {
    id: 'report' as UploadCategory,
    icon: Microscope,
    label: 'Lab Report',
    desc: 'Blood work, X-rays, MRI',
    color: 'green',
    accept: 'image/*,.pdf',
  },
  {
    id: 'medicine' as UploadCategory,
    icon: Pill,
    label: 'Medicine Photo',
    desc: 'Pills, packages, labels',
    color: 'teal',
    accept: 'image/*',
  },
  {
    id: 'hospital' as UploadCategory,
    icon: Hospital,
    label: 'Hospital Search',
    desc: 'Find nearby hospitals',
    color: 'red',
    accept: null,
  },
];

const colorTokens: Record<string, { bg: string; border: string; text: string; selBg: string; selBorder: string; selText: string }> = {
  blue:   { bg: 'bg-[#EAF1FE]',   border: 'border-[#C9D9F5]',  text: 'text-[#2E6BE6]',  selBg: 'bg-[#2E6BE6]',  selBorder: 'border-[#2E6BE6]',  selText: 'text-white' },
  orange: { bg: 'bg-[#FBF3E4]',   border: 'border-[#F2DFB6]',  text: 'text-[#E8A13D]',  selBg: 'bg-[#E8A13D]',  selBorder: 'border-[#E8A13D]',  selText: 'text-white' },
  green:  { bg: 'bg-[#E9F7F2]',   border: 'border-[#CFEEE1]',  text: 'text-[#12A17C]',  selBg: 'bg-[#12A17C]',  selBorder: 'border-[#12A17C]',  selText: 'text-white' },
  teal:   { bg: 'bg-[#E9F7F2]',   border: 'border-[#CFEEE1]',  text: 'text-[#0B7A5E]',  selBg: 'bg-[#0B7A5E]',  selBorder: 'border-[#0B7A5E]',  selText: 'text-white' },
  red:    { bg: 'bg-[#FDEEEE]',   border: 'border-[#F5CFCF]',  text: 'text-[#E05252]',  selBg: 'bg-[#E05252]',  selBorder: 'border-[#E05252]',  selText: 'text-white' },
};

const sampleResponses: Record<string, string> = {
  prescription: `**Prescription Analysis Complete**

I've analyzed your prescription. Here's a breakdown:

**Medications Identified:**
- **Amoxicillin 500mg** — Antibiotic for bacterial infections. Take 3× daily with food for 7 days.
- **Ibuprofen 400mg** — Anti-inflammatory pain relief. Take every 6–8 hrs as needed. Do not exceed 1200mg/day.
- **ORS Sachets** — Oral rehydration. Mix 1 sachet in 200ml water after each loose stool.

**Important Interactions:** No major drug interactions detected between these medications.

**Warnings:** Avoid alcohol while on Amoxicillin. If you're allergic to penicillin, consult your doctor immediately.

**Next Refill:** Based on dosage, you'll need a refill in approximately 7 days.`,

  injury: `**Injury Assessment Analysis**

Based on the image provided, here is my assessment:

**Observations:**
- Visible soft tissue abrasion on the affected area
- Mild redness and swelling consistent with a Grade I injury
- No apparent bone deformity detected

**Severity:** Mild to Moderate (Grade I–II)

**Immediate First Aid:**
1. Clean the wound with antiseptic solution
2. Apply a cold compress for 15–20 minutes
3. Elevate the affected limb if possible
4. Apply a sterile bandage

**Recommendation:** Monitor for 24–48 hours. Seek emergency care if swelling worsens, severe pain develops, or signs of infection appear (fever, increased redness, discharge).`,

  report: `**Lab Report Analysis**

Your lab results have been reviewed. Here's a plain-language summary:

**Key Findings:**
| Test | Your Value | Normal Range | Status |
|------|-----------|--------------|--------|
| Hemoglobin | 12.8 g/dL | 13.5–17.5 | ⚠️ Slightly Low |
| Blood Sugar | 95 mg/dL | 70–100 | ✅ Normal |
| Creatinine | 0.9 mg/dL | 0.6–1.2 | ✅ Normal |
| WBC | 8,200/μL | 4,000–11,000 | ✅ Normal |

**Interpretation:** Your hemoglobin is slightly below the normal range, which may indicate mild anemia. Consider increasing iron-rich foods (spinach, red meat, lentils) and Vitamin C.

**Doctor Follow-up:** Recommended in 4–6 weeks for repeat CBC.`,

  medicine: `**Medicine Identification**

I've identified the medication from your image:

**Drug Name:** Metformin Hydrochloride 500mg
**Brand Name:** Glucophage / Obimet
**Drug Class:** Biguanide (Antidiabetic)

**What it's for:** Management of Type 2 Diabetes Mellitus.

**How to take:** With meals, typically 1–2 tablets twice daily.

**Common Side Effects:**
- Nausea (usually temporary)
- Stomach upset or diarrhea (improves over time)
- Loss of appetite

**Serious Warnings:** Do not take if you have kidney disease, liver disease, or are scheduled for contrast imaging. Report unusual fatigue, muscle pain, or difficulty breathing immediately.

**Storage:** Store below 30°C, away from moisture and sunlight.`,

  hospital: `**Nearby Hospital Search**

Based on your location, here are the top-rated medical facilities near you:

**Emergency Hospitals:**
1. 🏥 **City Medical Center** — 1.2 km | Open 24/7 | ⭐ 4.8 | (Emergency, ICU, Surgery)
2. 🏥 **Apollo Hospitals** — 2.4 km | Open 24/7 | ⭐ 4.9 | (Multi-specialty)
3. 🏥 **Fortis Healthcare** — 3.1 km | Open 24/7 | ⭐ 4.7 | (Cardiology, Neurology)

**Clinics & Urgent Care:**
4. 🏪 **QuickCare Clinic** — 0.8 km | Open 8AM–10PM | ⭐ 4.6 | Walk-in available
5. 🏪 **MedPlus Diagnostic** — 1.5 km | Open 7AM–9PM | ⭐ 4.5 | Lab + Imaging

**Recommendation:** For non-emergency needs, QuickCare Clinic is closest and has no wait time currently.

Switch to the **Hospitals tab** for a full interactive map.`,
};

const initialMessages: Message[] = [
  {
    id: '0',
    role: 'assistant',
    content: `**Hello! I'm LifeGuard NeXus, your AI health agent.**

I'm here to help you with:
- **Prescription Analysis** — Upload doctor prescriptions for medicine explanations
- **Injury Assessment** — Photo-based triage and first-aid guidance
- **Lab Report Insights** — Plain-language interpretation of your test results
- **Medicine Identification** — Identify pills, tablets, or packages by photo
- **Hospital Search** — Find verified hospitals and clinics near you

Choose a category below and upload your file, or simply describe your symptoms. How can I assist you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'done',
  },
];

interface ChatPageProps {
  setSidebarOpen: (v: boolean) => void;
}

export default function ChatPage({ setSidebarOpen }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<UploadCategory>(null);
  const [pendingFiles, setPendingFiles] = useState<UploadedFile[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newFile: UploadedFile = {
          id: Math.random().toString(36).slice(2),
          name: file.name,
          category: selectedCategory,
          preview: file.type.startsWith('image/') ? ev.target?.result as string : undefined,
          size: file.size > 1024 * 1024
            ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`,
        };
        setPendingFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, [selectedCategory]);

  const removeFile = (id: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== id));
  };

  const simulateTyping = useCallback((text: string, msgId: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: msgId,
          role: 'assistant',
          content: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'done',
        },
      ]);
      setTimeout(scrollToBottom, 100);
    }, 1800);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text && pendingFiles.length === 0) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      files: pendingFiles.length > 0 ? [...pendingFiles] : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingFiles([]);
    setShowCategories(false);
    setTimeout(scrollToBottom, 100);

    const cat = pendingFiles[0]?.category || selectedCategory;
    const responseKey = cat && sampleResponses[cat] ? cat : 'prescription';
    simulateTyping(sampleResponses[responseKey], (Date.now() + 1).toString());
  }, [input, pendingFiles, selectedCategory, simulateTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCategorySelect = (cat: UploadCategory) => {
    if (cat === 'hospital') {
      setSelectedCategory('hospital');
      setInput('Find nearby hospitals in my area');
      return;
    }
    setSelectedCategory(cat);
    fileInputRef.current?.click();
  };

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
          return <p key={i} className="font-bold text-[#0F1E40] mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
        }
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="ml-4 list-disc text-[#3D4E73] leading-relaxed">
              {line.slice(2).split(/\*\*(.*?)\*\*/g).map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-[#0F1E40] font-semibold">{part}</strong> : part
              )}
            </li>
          );
        }
        if (/^\d+\./.test(line)) {
          return (
            <li key={i} className="ml-4 list-decimal text-[#3D4E73] leading-relaxed">
              {line.replace(/^\d+\.\s/, '').split(/\*\*(.*?)\*\*/g).map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="text-[#0F1E40] font-semibold">{part}</strong> : part
              )}
            </li>
          );
        }
        if (line.startsWith('|')) {
          const cells = line.split('|').filter(Boolean);
          if (line.includes('---')) return null;
          return (
            <div key={i} className="flex gap-3 py-1 border-b border-[#E3EAF6] last:border-0">
              {cells.map((cell, j) => (
                <span key={j} className={cn('text-xs flex-1', j === 0 ? 'font-semibold text-[#26355A]' : 'text-[#5B6B8C]')}>
                  {cell.trim()}
                </span>
              ))}
            </div>
          );
        }
        if (line === '') return <div key={i} className="h-2" />;
        return (
          <p key={i} className="text-[#3D4E73] leading-relaxed">
            {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-[#0F1E40] font-semibold">{part}</strong> : part
            )}
          </p>
        );
      });
  };

  const currentCat = categories.find(c => c.id === selectedCategory);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-[#E3EAF6] px-4 md:px-6 py-3 flex items-center gap-3">
        <button className="md:hidden text-[#5B6B8C] p-1" onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </button>
        <div className="w-9 h-9 bg-gradient-to-br from-[#2E6BE6] to-[#1E4FC0] rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
          <Stethoscope size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[#0F1E40] text-sm">LifeGuard NeXus AI</div>
          <div className="flex items-center gap-1.5 text-xs text-[#12A17C]">
            <span className="w-1.5 h-1.5 bg-[#12A17C] rounded-full" />
            Medical AI Online — Ready to analyze
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs text-[#8B98B5] bg-[#F5F8FE] border border-[#E3EAF6] px-3 py-1.5 rounded-full font-medium">
            HIPAA Compliant
          </span>
          <span className="text-xs text-[#8B98B5] bg-[#F5F8FE] border border-[#E3EAF6] px-3 py-1.5 rounded-full font-medium">
            End-to-end Encrypted
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-4 md:px-8 py-6 space-y-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3 animate-fade-in-up',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {msg.role === 'assistant' ? (
                <div className="w-9 h-9 bg-gradient-to-br from-[#2E6BE6] to-[#1E4FC0] rounded-xl flex items-center justify-center shadow-md">
                  <Bot size={18} className="text-white" />
                </div>
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-[#A8C3F5] to-[#2E6BE6] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  P
                </div>
              )}
            </div>

            <div className={cn('max-w-[80%] md:max-w-[70%]', msg.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col gap-2')}>
              {/* Files */}
              {msg.files && msg.files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {msg.files.map(f => {
                    const cat = categories.find(c => c.id === f.category);
                    const ct = colorTokens[cat?.color || 'blue'];
                    return (
                      <div key={f.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${ct.border} ${ct.bg}`}>
                        {f.preview ? (
                          <img src={f.preview} alt={f.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ct.bg}`}>
                            <ImageIcon size={16} className={ct.text} />
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-semibold text-[#26355A] max-w-[120px] truncate">{f.name}</div>
                          <div className={`text-[10px] ${ct.text} font-medium`}>{cat?.label} · {f.size}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bubble */}
              {msg.content && (
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm',
                    msg.role === 'user'
                      ? 'bg-[#2E6BE6] text-white rounded-tr-sm'
                      : 'bg-white border border-[#E3EAF6] text-[#3D4E73] rounded-tl-sm shadow-sm'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                  ) : (
                    <p className="leading-relaxed">{msg.content}</p>
                  )}
                </div>
              )}

              <div className="text-[10px] text-[#B9C6E0] px-1">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 animate-fade-in-up">
            <div className="w-9 h-9 bg-gradient-to-br from-[#2E6BE6] to-[#1E4FC0] rounded-xl flex items-center justify-center shadow-md">
              <Bot size={18} className="text-white" />
            </div>
            <div className="bg-white border border-[#E3EAF6] rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
              <div className="flex items-center gap-1">
                <Sparkles size={12} className="text-[#2E6BE6] mr-1" />
                <span className="text-xs text-[#8B98B5] mr-2">Analyzing</span>
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-[#2E6BE6] rounded-full typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Category pills */}
      {showCategories && (
        <div className="flex-shrink-0 px-4 md:px-8 pb-2">
          <div className="flex items-center gap-1 text-xs text-[#8B98B5] mb-2 font-semibold">
            <Upload size={11} />
            Choose upload category:
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(({ id, icon: Icon, label, color }) => {
              const ct = colorTokens[color];
              const isSelected = selectedCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => handleCategorySelect(id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150',
                    isSelected
                      ? `${ct.selBg} ${ct.selBorder} ${ct.selText} shadow-md`
                      : `${ct.bg} ${ct.border} ${ct.text} hover:opacity-80`
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* File queue */}
      {pendingFiles.length > 0 && (
        <div className="flex-shrink-0 px-4 md:px-8 pb-2">
          <div className="flex gap-2 flex-wrap">
            {pendingFiles.map(f => {
              const cat = categories.find(c => c.id === f.category);
              const ct = colorTokens[cat?.color || 'blue'];
              return (
                <div key={f.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${ct.border} ${ct.bg} text-xs`}>
                  {f.preview ? (
                    <img src={f.preview} alt="" className="w-6 h-6 rounded-md object-cover" />
                  ) : (
                    <ImageIcon size={14} className={ct.text} />
                  )}
                  <span className="text-[#26355A] font-medium max-w-[100px] truncate">{f.name}</span>
                  <button onClick={() => removeFile(f.id)} className="text-[#8B98B5] hover:text-[#E05252]">
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 bg-white border-t border-[#E3EAF6] px-4 md:px-8 py-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 bg-[#F5F8FE] border border-[#E3EAF6] rounded-2xl flex items-end gap-2 px-4 py-3 focus-within:border-[#2E6BE6] focus-within:ring-2 focus-within:ring-[#EAF1FE] transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms, or choose a category and upload a file…"
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-[#0F1E40] placeholder:text-[#B9C6E0] font-medium min-h-[24px] max-h-32"
              style={{ lineHeight: '1.5' }}
            />
            <button
              onClick={() => setShowCategories(v => !v)}
              className="flex-shrink-0 text-[#8B98B5] hover:text-[#2E6BE6] transition-colors"
              title="Toggle categories"
            >
              <Paperclip size={18} />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() && pendingFiles.length === 0}
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md',
              (input.trim() || pendingFiles.length > 0)
                ? 'bg-[#2E6BE6] text-white hover:bg-[#1E4FC0] shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 active:scale-95 animate-pulse-glow'
                : 'bg-[#E3EAF6] text-[#B9C6E0] cursor-not-allowed'
            )}
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-1 text-[10px] text-[#B9C6E0]">
            <Shield size={10} />
            Files encrypted — not stored permanently
          </div>
          <div className="text-[10px] text-[#B9C6E0]">Enter to send · Shift+Enter for new line</div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={currentCat?.accept || 'image/*,.pdf'}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
