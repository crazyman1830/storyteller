import React, { useState, useRef, useEffect } from 'react';
import { NovelTemplate } from '../types';
import { NOVEL_TEMPLATES } from '../constants';

interface TemplateSelectorProps {
  onSelect: (template: NovelTemplate) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NovelTemplate | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = (template: NovelTemplate) => {
    setSelectedTemplate(template);
    onSelect(template);
    setIsOpen(false);
  };

  return (
    <div className="w-full mb-8 animate-fade-in relative z-50" ref={dropdownRef}>
      <div className="flex items-center gap-2 mb-2 px-1">
        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          스토리 템플릿
        </span>
      </div>
      
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
          isOpen 
            ? 'bg-white/10 border-primary/50 ring-1 ring-primary/50' 
            : 'bg-white/[0.02] border-white/10 hover:bg-white/5 hover:border-white/20'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedTemplate ? (
            <>
              <span className="text-2xl">{selectedTemplate.icon}</span>
              <div className="text-left overflow-hidden">
                <h3 className="text-sm font-bold text-white truncate">{selectedTemplate.label}</h3>
                <p className="text-xs text-gray-400 truncate">{selectedTemplate.description}</p>
              </div>
            </>
          ) : (
            <>
               <span className="text-xl">✨</span>
               <span className="text-sm text-gray-400 font-medium">원하는 이야기의 템플릿을 선택하세요</span>
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
        className={`absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-top ${
          isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-1">
          {NOVEL_TEMPLATES.map((template) => (
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