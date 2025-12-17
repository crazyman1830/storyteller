import React from 'react';

// 1. Toggle Switch Component
export const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`group flex items-center gap-3 focus:outline-none transition-all duration-300 ${checked ? 'text-white' : 'text-gray-400'}`}
    role="switch"
    aria-checked={checked}
  >
    <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out border border-transparent ${checked ? 'bg-primary border-primary' : 'bg-white/10 group-hover:bg-white/20'}`}>
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
    <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${checked ? 'text-primary' : ''}`}>{label}</span>
  </button>
);

// 2. Length Selector Component
export const LengthSelector: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const options = [
    { label: '짧은글', value: 'Short' },
    { label: '보통', value: 'Medium' },
    { label: '긴글', value: 'Long' },
    { label: '최대', value: 'Max' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
            value === opt.value
              ? 'bg-primary text-black shadow-lg font-bold'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

// 3. General Setting Input Component
export const SettingInput: React.FC<{ 
  label: string; 
  isActive: boolean; 
  onToggle: () => void; // Simplified to just trigger toggle
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string;
}> = ({ label, isActive, onToggle, value, onChange, placeholder }) => (
  <div className={`p-4 rounded-xl border transition-all duration-300 ${isActive ? 'bg-white/5 border-primary/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'}`}>
    <div className="flex justify-between items-center h-8 mb-2">
      <label className={`text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`}>{label}</label>
      <ToggleSwitch checked={isActive} onChange={onToggle} label={isActive ? "입력" : "자동"} />
    </div>
    
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
       <input 
         type="text" 
         value={value} 
         onChange={(e) => onChange(e.target.value)} 
         placeholder={placeholder} 
         className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder-gray-600" 
       />
    </div>
    {!isActive && (
       <div className="h-[42px] w-full flex items-center px-1 text-sm text-gray-600 italic select-none">
         <span className="text-xs border border-white/5 bg-white/[0.02] px-2 py-1 rounded text-gray-500">AI 작가가 결정합니다</span>
       </div>
    )}
  </div>
);