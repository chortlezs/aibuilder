import { useAppStore } from '../store/appStore';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Report = () => {
  const { records } = useAppStore();

  const successCount = records.filter(r => r.successTransform).length;
  const totalCount = records.length;
  const rate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  // 简单的按天分组展示最近7天的交互次数
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    
    // 找出当天的 record
    const dayRecords = records.filter(r => {
      const rDate = new Date(r.timestamp);
      return rDate.getDate() === d.getDate() && rDate.getMonth() === d.getMonth();
    });

    return {
      name: dateStr,
      value: dayRecords.length,
    };
  });

  return (
    <div className="min-h-full p-8 pt-16 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mb-12 text-center"
      >
        <h1 className="text-3xl font-semibold text-zinc-800 mb-3 tracking-tight">情绪足迹</h1>
        <p className="text-[15px] text-zinc-500 leading-relaxed">每一次互动，都是一次对内心的觉察</p>
      </motion.div>

      <div className="w-full max-w-sm grid grid-cols-2 gap-5 mb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
          className="glass-panel rounded-[2rem] p-7 flex flex-col justify-center items-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl -translate-y-8 translate-x-8" />
          <div className="text-[40px] font-semibold text-[#89C4F4] mb-1 tracking-tight z-10">{totalCount}</div>
          <div className="text-[13px] text-zinc-500 font-medium z-10">总互动次数</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
          className="rounded-[2rem] p-7 shadow-[0_12px_30px_-10px_rgba(137,196,244,0.4)] flex flex-col justify-center items-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #A1C9F1 0%, #89C4F4 100%)' }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -translate-y-8 translate-x-8 mix-blend-overlay" />
          <div className="text-[40px] font-semibold text-white mb-1 tracking-tight z-10">{rate}%</div>
          <div className="text-[13px] text-white/90 font-medium z-10">平复成功率</div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm glass-panel rounded-[2rem] p-7"
      >
        <h3 className="text-[15px] font-semibold text-zinc-800 mb-8 tracking-tight">最近 7 天互动趋势</h3>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#A1A1AA', fontWeight: 500 }}
                dy={12}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.4)', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  fontWeight: 500
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#A1C9F1' : '#F4F4F5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {records.length === 0 && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-zinc-400 text-center"
        >
          还没有记录呢。<br/>连上捏捏乐，我们开始第一次呼吸吧。
        </motion.p>
      )}
    </div>
  );
};
