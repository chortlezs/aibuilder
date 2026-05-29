import { useState } from 'react';
import { useAppStore, Role } from '../store/appStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ROLES: Role[] = [
  {
    id: 'role_blue',
    name: '海盐蓝',
    color: '#89C4F4',
    gradient: 'linear-gradient(135deg, #A1C9F1 0%, #89C4F4 100%)',
    description: '',
  },
  {
    id: 'role_pink',
    name: '樱花粉',
    color: '#FFBFA9',
    gradient: 'linear-gradient(135deg, #FFD3C4 0%, #FFBFA9 100%)',
    description: '',
  },
  {
    id: 'role_white',
    name: '云朵白',
    color: '#F9FAFB',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F4F4F5 100%)',
    description: '',
  }
];

export const Roles = () => {
  const { currentRole, setCurrentRole } = useAppStore();
  const navigate = useNavigate();
  
  // Find initial index if role is already selected
  const initialIndex = ROLES.findIndex(r => r.id === currentRole?.id);
  const [activeIndex, setActiveIndex] = useState(initialIndex >= 0 ? initialIndex : 0);

  const handleSelect = (role: Role) => {
    setCurrentRole(role);
    setTimeout(() => {
      navigate('/');
    }, 200);
  };

  const nextRole = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % ROLES.length);
  };

  const prevRole = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + ROLES.length) % ROLES.length);
  };

  const activeRole = ROLES[activeIndex];
  const isWhite = activeRole.id === 'role_white';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-[#FAFAFA]">
      {/* Title */}
      <div className="absolute top-8 text-center z-20">
        <h1 className="text-[16px] font-semibold text-zinc-700 tracking-widest">选择伙伴</h1>
      </div>

      {/* Navigation Arrows */}
      <button onClick={prevRole} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 z-20 text-zinc-400 hover:text-zinc-600">
        <ChevronLeft size={24} />
      </button>
      <button onClick={nextRole} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 z-20 text-zinc-400 hover:text-zinc-600">
        <ChevronRight size={24} />
      </button>

      {/* Center Blob Container */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10 w-full h-full" onClick={() => handleSelect(activeRole)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            {/* Blob */}
            <div 
              className="relative w-36 h-36 rounded-[40%] flex items-center justify-center shadow-lg transition-all"
              style={{ 
                background: activeRole.gradient,
                borderRadius: '45% 55% 40% 60% / 55% 45% 60% 40%',
                border: isWhite ? '1px solid rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {/* Highlight */}
              <div className="absolute top-3 left-5 w-12 h-8 bg-white/40 rounded-full blur-[5px] transform -rotate-12 mix-blend-overlay" />
              
              {/* Face */}
              <div className={`text-2xl font-semibold opacity-80 ${isWhite ? 'text-zinc-600' : 'text-white'}`}>
                ( • _ • )
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Name */}
      <div className="absolute bottom-[50px] w-full text-center z-20 pointer-events-none">
        <h2 className="text-[14px] font-medium tracking-tight text-zinc-700">
          {activeRole.name}
        </h2>
      </div>
    </div>
  );
};
