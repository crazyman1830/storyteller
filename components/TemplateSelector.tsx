import React, { useState, useRef, useEffect } from 'react';
import { BaseTemplate } from '../types';

interface TemplateSelectorProps<T extends BaseTemplate> {
  title: string;
  templates: T[];
  onSelect: (template: T) => void;
  selectedId?: string;
  placeholder?: string;
}

const TemplateSelector = <T extends BaseTemplate>({ 
  title, 
  templates, 
  onSelect, 
  selectedId,
  placeholder = "옵션을 선택하세요"
}: TemplateSelectorProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedTemplate = templates.find(t => t.id === selectedId) || null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (template: T) => {
    onSelect(template);
    setIsOpen(false);
  };

  return (
    <div className="w-full relative z-50 mb-2" ref={dropdownRef}>
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
          {title}
        </span>
      </div>
      
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
          isOpen 
            ? 'bg-white/10 border-primary/50 ring-1 ring-primary/50' 
            : 'bg-white/[0.02] border-white/10 hover:bg-white/5 hover:border-white/20'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedTemplate ? (
            <>
              <span className="text-xl">{selectedTemplate.icon}</span>
              <div className="text-left overflow-hidden">
                <h3 className="text-sm font-bold text-white truncate">{selectedTemplate.label}</h3>
                <p className="text-[11px] text-gray-400 truncate">{selectedTemplate.description}</p>
              </div>
            </>
          ) : (
            <>
               <span className="text-lg">✨</span>
               <span className="text-sm text-gray-400 font-medium">{placeholder}</span>
            </>
          )}
        </div>

        <div className={`transform transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180 text-primary' : ''}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-top z-[100] ${
          isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-1">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left group ${
                selectedTemplate?.id === template.id 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lg group-hover:bg-white/10 transition-colors">
                  {template.icon}
              </div>
              <div className="flex-grow min-w-0">
                  <h3 className={`text-sm font-bold truncate ${selectedTemplate?.id === template.id ? 'text-primary' : 'text-gray-200 group-hover:text-white'}`}>
                      {template.label}
                  </h3>
                  <p className="text-xs text-gray-500 truncate group-hover:text-gray-400">
                      {template.description}
                  </p>
              </div>
              {selectedTemplate?.id === template.id && (
                 <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;