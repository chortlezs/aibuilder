import { useAppStore } from '../store/appStore';

export const Report = () => {
  const { records } = useAppStore();

  const successCount = records.filter(r => r.successTransform).length;
  const totalCount = records.length;
  const rate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAFAFA] relative overflow-hidden">
      
      {/* Title */}
      <div className="absolute top-8 text-center z-20">
        <h1 className="text-[16px] font-semibold text-zinc-700 tracking-widest">足迹</h1>
      </div>

      <div className="flex flex-col gap-4 w-full px-10 items-center justify-center h-full mt-6">
        
        {/* Total Count Circle */}
        <div className="relative w-[100px] h-[100px] rounded-full shadow-sm flex flex-col items-center justify-center bg-white border border-zinc-100">
          <div className="text-[28px] font-bold text-zinc-800 leading-none">{totalCount}</div>
          <div className="text-[11px] text-zinc-400 font-medium mt-1">互动次数</div>
        </div>

        {/* Rate Circle */}
        <div 
          className="relative w-[100px] h-[100px] rounded-full shadow-sm flex flex-col items-center justify-center bg-zinc-800 text-white"
        >
          <div className="text-[28px] font-bold leading-none">{rate}%</div>
          <div className="text-[11px] text-white/90 font-medium mt-1">平复率</div>
        </div>
      </div>

    </div>
  );
};
