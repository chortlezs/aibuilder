import { useAppStore, Role } from '../store/appStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ROLES: Role[] = [
  {
    id: 'role_blue',
    name: '海盐蓝',
    color: '#89C4F4',
    gradient: 'linear-gradient(135deg, #A1C9F1 0%, #89C4F4 100%)',
    description: '像夏日晴空一样清澈，能吹散所有的烦躁与阴霾。',
  },
  {
    id: 'role_pink',
    name: '樱花粉',
    color: '#FFBFA9',
    gradient: 'linear-gradient(135deg, #FFD3C4 0%, #FFBFA9 100%)',
    description: '温柔又治愈，像一个带着花香的柔软拥抱。',
  },
  {
    id: 'role_white',
    name: '云朵白',
    color: '#F9FAFB',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F4F4F5 100%)',
    description: '纯净包容，像天空中软绵绵的云，接住你所有的情绪。',
  }
];

export const Roles = () => {
  const { currentRole, setCurrentRole } = useAppStore();
  const navigate = useNavigate();

  const handleSelect = (role: Role) => {
    setCurrentRole(role);
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  return (
    <div className="min-h-full p-8 pt-16 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-14"
      >
        <h1 className="text-3xl font-semibold text-zinc-800 mb-3 tracking-tight">选择陪伴者</h1>
        <p className="text-sm text-zinc-500 max-w-[240px] mx-auto leading-relaxed">
          选一个让你感到放松的伙伴
        </p>
      </motion.div>

      <div className="w-full max-w-sm flex flex-col gap-5">
        {ROLES.map((role, idx) => {
          const isSelected = currentRole?.id === role.id;
          const isWhite = role.id === 'role_white';
          
          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => handleSelect(role)}
              className={`relative overflow-hidden rounded-[2rem] p-6 cursor-pointer transition-all duration-400 ease-out ${
                isSelected 
                  ? 'scale-[1.02] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] ring-1 ring-black/5' 
                  : 'hover:scale-[1.01] glass-panel'
              }`}
              style={{ 
                background: isSelected ? role.gradient : 'rgba(255,255,255,0.7)',
                color: isSelected && !isWhite ? 'white' : '#27272a',
              }}
            >
              {/* iOS 风格的毛玻璃光晕背景 */}
              {!isSelected && (
                <div 
                  className="absolute -right-12 -top-12 w-40 h-40 rounded-full opacity-30 blur-3xl mix-blend-multiply"
                  style={{ background: role.gradient }}
                />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                  <div 
                    className={`w-12 h-12 rounded-full shadow-inner flex items-center justify-center ${isWhite && !isSelected ? 'border border-zinc-100' : ''}`}
                    style={{ background: role.gradient }}
                  >
                    {/* 小的高光点 */}
                    <div className="w-4 h-4 bg-white/40 rounded-full blur-[2px] -translate-y-2 -translate-x-2" />
                  </div>
                  <h2 className="text-[22px] font-semibold tracking-tight">{role.name}</h2>
                </div>
                <p className={`text-[15px] leading-relaxed ${isSelected && !isWhite ? 'text-white/90' : 'text-zinc-500'}`}>
                  {role.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
