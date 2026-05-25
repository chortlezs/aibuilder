import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/appStore';
import { useBluetooth } from '../hooks/useBluetooth';
import { useNarrative } from '../hooks/useNarrative';
import { Bluetooth, BluetoothOff, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();
  const { 
    currentRole, 
    deviceStatus, 
    activeTab,
    setActiveTab,
    appPhase,
    mindfulnessState, 
    narrativeStep,
    narrativePressCount,
    currentBehavior,
    currentPressure,
    setCurrentPressure,
    behaviorHistory
  } = useAppStore();
  const { connect, disconnect, simulateData } = useBluetooth();
  useNarrative(); // Activate narrative hook

  const audioRef = useRef<HTMLAudioElement>(null);

  // 监听 guideStep 变化播放对应的音频
  useEffect(() => {
    if (activeTab === 'guide' && narrativeStep >= 1 && narrativeStep <= 4) {
      if (audioRef.current) {
        audioRef.current.src = `/audio/step${narrativeStep}.mp3`;
        audioRef.current.play().catch(err => console.log('等待用户交互后才能播放音频', err));
        console.log(`[Audio Placeholder] Playing audio for step ${narrativeStep}`);
      }
    }
  }, [narrativeStep, activeTab, currentRole]);

  // 如果没有选择角色，重定向到角色选择页
  useEffect(() => {
    if (!currentRole) {
      navigate('/roles');
    }
  }, [currentRole, navigate]);

  if (!currentRole) return null;

  // 控制圆环扩散动画
  const getRingAnimation = () => {
    if (activeTab === 'guide') {
      const step = Number(narrativeStep);
      if (step === 2) {
        // 吸气/按压：圆环缩小
        return { scale: 0.8, opacity: 0.8, borderWidth: '4px' } as any;
      }
      if (step === 4) {
        // 呼气/松开：圆环扩散
        return { scale: 1.5, opacity: 0, borderWidth: '1px' } as any;
      }
      // 默认微微呼吸
      return { 
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      } as any;
    }
    return { scale: 1, opacity: 0 } as any;
  };
  // 动效配置
  const getBlobAnimation = () => {
    // 监测期和评估期
    if (appPhase === 'evaluating') {
      if (mindfulnessState === 'negative') {
        // 消极：快速抖动
        return { 
          x: [-5, 5, -5, 5, 0],
          transition: { duration: 0.4, repeat: 5 }
        } as any;
      } else {
        // 积极：轻快弹跳
        return {
          y: [-10, 0, -10, 0],
          transition: { duration: 0.6, repeat: 2 }
        } as any;
      }
    }

    // 默认微微呼吸
    return {
      scale: [1, 1.02, 1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
    } as any;
  };

  // 获取表情
  const getFaceExpression = () => {
    if (appPhase === 'evaluating') {
      return mindfulnessState === 'negative' ? '( º A º )' : '( ˘ ▽ ˘ )';
    }
    
    if (activeTab === 'guide') {
      switch (Number(narrativeStep)) {
        case 1: return '(・_・)';
        case 2: return '( > _ < )'; // 憋气/按压
        case 3: return '( O _ O )'; 
        case 4: return '( ˘ ▽ ˘ )'; // 放松
        case 5: return '( ◡ ‿ ◡ )';
        default: return '( • _ • )';
      }
    }

    if (currentBehavior === 'hard_press') return '( > o < )';
    if (currentBehavior === 'normal_press') return '( = _ = )';
    if (currentBehavior === 'light_press') return '( ^ _ ^ )';
    
    return '( • _ • )';
  };

  // 叙事文案
  const getNarrativeText = () => {
    if (activeTab === 'guide') {
      switch (Number(narrativeStep)) {
        case 1: return "第一步：请轻轻按一下";
        case 2: return "第二步：请按住我 3 秒钟";
        case 3: return `第三步：请连续按三下 (${narrativePressCount}/3)`;
        case 4: return "第四步：请缓缓松开...";
        case 5: return "感受到了吗？一次完整的呼吸完成了。";
        default: return "准备中...";
      }
    }
    
    if (appPhase === 'evaluating') {
      return mindfulnessState === 'negative' 
        ? "似乎有点烦躁..." 
        : "感受到你的平静了~";
    }

    if (appPhase === 'monitoring') {
      return `正在感受你的情绪... (${behaviorHistory.length}/5)`;
    }

    if (deviceStatus === 'connected') return "我在陪着你，随时可以捏捏我。";
    return "点击下方按钮连接捏捏乐";
  };

  // 动态背景颜色，在叙事期稍微压暗，增强沉浸感，整体更明亮治愈
  const isNarrative = appPhase === 'narrative';

  return (
    <motion.div 
      className="relative min-h-full flex flex-col items-center justify-center p-6 overflow-hidden"
      animate={{ backgroundColor: isNarrative ? '#F2F5F7' : '#F5F5F7' }}
      transition={{ duration: 1.5 }}
    >
      <audio ref={audioRef} className="hidden" />
      {/* 顶部状态切换开关 */}
      <div className="absolute top-10 glass-panel p-1 rounded-full flex gap-1 z-10 shadow-sm">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-5 py-1.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ${
            activeTab === 'monitor' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-zinc-800' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          行为监测
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-5 py-1.5 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ${
            activeTab === 'guide' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-zinc-800' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          舒缓引导
        </button>
      </div>

      {/* 叙事文案区 */}
      <div className="absolute top-24 w-full px-8 text-center h-20 flex items-center justify-center">
        <motion.p
          key={String(narrativeStep) + deviceStatus + appPhase}
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[17px] font-medium text-zinc-700 tracking-tight leading-relaxed"
        >
          {getNarrativeText()}
        </motion.p>
      </div>

      {/* 角色中心动画区 */}
      <div className="relative w-64 h-64 flex items-center justify-center mt-10">
        {/* 呼吸光晕背景 (仅在引导时显示) */}
        <motion.div
          animate={getRingAnimation()}
          className="absolute w-56 h-56 rounded-[40%] border-zinc-200"
          style={{ 
            borderColor: currentRole.color,
            borderRadius: '45% 55% 40% 60% / 55% 45% 60% 40%'
          }}
        />

        {/* 角色本体 (Blob) */}
          <motion.div
            animate={getBlobAnimation()}
            className="relative w-44 h-44 rounded-[40%] flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-sm"
            style={{ 
              background: currentRole.gradient,
              borderRadius: '45% 55% 40% 60% / 55% 45% 60% 40%',
              border: currentRole.id === 'role_white' ? '1px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.4)'
            }}
          >
          {/* 高光 */}
          <div className="absolute top-4 left-6 w-16 h-12 bg-white/30 rounded-full blur-[8px] transform -rotate-12 mix-blend-overlay" />

          {/* 角色表情 */}
          <motion.div 
            className={`text-3xl font-semibold tracking-widest opacity-80 ${
              currentRole.id === 'role_white' ? 'text-zinc-600' : 'text-white'
            }`}
            animate={{ opacity: [0.7, 0.95, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {getFaceExpression()}
          </motion.div>
        </motion.div>

        {/* 辅助文本提示（如果在舒缓引导的步骤3，展示进度） */}
        <div className="absolute -bottom-8 w-full flex justify-center h-6">
          <motion.div 
            animate={{ 
              opacity: activeTab === 'guide' && Number(narrativeStep) === 3 ? 1 : 0,
              y: activeTab === 'guide' && Number(narrativeStep) === 3 ? 0 : 10 
            }}
            transition={{ duration: 0.3 }}
            className="text-zinc-400 text-sm font-medium tracking-wide"
          >
            已按压 {narrativePressCount} / 3 次
          </motion.div>
        </div>
      </div>

      {/* 当前状态小标签 */}
      <div className="mt-14 h-8 flex justify-center w-full">
        <motion.div
          animate={{ 
            opacity: currentBehavior !== 'idle' ? 1 : 0,
            scale: currentBehavior !== 'idle' ? 1 : 0.8,
            filter: currentBehavior !== 'idle' ? 'blur(0px)' : 'blur(4px)'
          }}
          transition={{ duration: 0.3 }}
          className="px-4 py-1.5 rounded-full glass-panel text-zinc-500 text-[11px] font-semibold tracking-wide"
        >
          检测到: {
            currentBehavior === 'hard_press' ? '重按 (3)' : 
            currentBehavior === 'normal_press' ? '正常按 (2)' : 
            '轻按 (1)'
          }
          {currentPressure > 0 && ` (压力: ${Math.round(currentPressure * 100)}%)`}
        </motion.div>
      </div>

      {/* 蓝牙连接控制与调试面板 */}
      <div className="absolute bottom-32 w-full px-8 flex flex-col items-center gap-6">
        <button
          onClick={deviceStatus === 'connected' ? disconnect : connect}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-full text-[15px] font-semibold tracking-tight transition-all duration-300 ${
            deviceStatus === 'connected' 
              ? 'glass-button text-zinc-600' 
              : 'bg-zinc-800 text-white hover:bg-zinc-700 shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.18)] hover:-translate-y-0.5'
          }`}
        >
          {deviceStatus === 'connected' ? (
            <><BluetoothOff size={18} /> 断开连接</>
          ) : deviceStatus === 'connecting' ? (
            <><Settings2 size={18} className="animate-spin" /> 连接中...</>
          ) : (
            <><Bluetooth size={18} /> 连接捏捏乐</>
          )}
        </button>

        {/* 调试用：模拟硬件发送数据 */}
        {deviceStatus === 'disconnected' && (
          <div className="flex flex-col gap-3 opacity-40 hover:opacity-100 transition-all duration-300 items-center bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm">
            <div className="flex gap-2">
              <button 
                onClick={() => simulateData('hard_press', 0.8)}
                className="text-[11px] font-medium px-3 py-1.5 bg-red-50/80 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
              >
                模拟重按(3)
              </button>
              <button 
                onClick={() => simulateData('normal_press', 0.5)}
                className="text-[11px] font-medium px-3 py-1.5 bg-zinc-100/80 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors"
              >
                模拟正常按(2)
              </button>
              <button 
                onClick={() => simulateData('light_press', 0.2)}
                className="text-[11px] font-medium px-3 py-1.5 bg-blue-50/80 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
              >
                模拟轻按(1)
              </button>
            </div>
            <div className="text-[10px] text-zinc-400 font-medium">
              点击按钮模拟蓝牙接收 1、2、3 数值
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
