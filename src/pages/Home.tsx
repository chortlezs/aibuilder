import { useEffect, useRef } from 'react';
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
  const bgmRef = useRef<HTMLAudioElement>(null);

  // 控制背景音乐
  useEffect(() => {
    if (activeTab === 'guide') {
      bgmRef.current?.play().catch(err => console.log('BGM播放失败(需用户交互)', err));
    } else {
      bgmRef.current?.pause();
      if (bgmRef.current) bgmRef.current.currentTime = 0;
    }
  }, [activeTab]);

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
        case 4: return "第四步：慢慢放开，让云飘走";
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
    <div 
      className="relative min-h-full flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: isNarrative ? '#F2F5F7' : '#F5F5F7' }}
    >
      <audio ref={audioRef} className="hidden" />
      <audio ref={bgmRef} src="/audio/bgm-soothing.mp3" loop className="hidden" />
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
      <div className="absolute top-24 w-full px-8 text-center h-28 flex flex-col items-center justify-center">
        <div
          key={String(narrativeStep) + deviceStatus + appPhase}
          className="text-[17px] font-medium text-zinc-700 tracking-tight leading-relaxed animate-fade-in-up"
        >
          {getNarrativeText()}
        </div>
        {appPhase === 'evaluating' && (
          <button
            onClick={() => setActiveTab('guide')}
            className="mt-4 px-6 py-2 bg-zinc-800 text-white text-[14px] font-medium rounded-full shadow hover:bg-zinc-700 hover:shadow-lg transition-all animate-fade-in-up"
          >
            开始舒缓引导
          </button>
        )}
      </div>

      {/* 角色中心动画区 */}
      <div className="relative w-64 h-64 flex items-center justify-center mt-10">
        {/* 呼吸光晕背景 (仅在引导时显示) */}
        <div
          className={`absolute w-56 h-56 rounded-[40%] border-zinc-200 transition-all duration-1000 ${
            activeTab === 'guide' ? (
              Number(narrativeStep) === 2 ? 'scale-80 opacity-80 border-4' :
              Number(narrativeStep) === 4 ? 'scale-150 opacity-0 border' :
              'animate-breath-ring border'
            ) : 'scale-100 opacity-0 border'
          }`}
          style={{ 
            borderColor: currentRole.color,
            borderRadius: '45% 55% 40% 60% / 55% 45% 60% 40%'
          }}
        />

        {/* 角色本体 (Blob) */}
          <div
            className={`relative w-44 h-44 rounded-[40%] flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-all duration-500 ${
              appPhase === 'evaluating' ? (
                mindfulnessState === 'negative' ? 'animate-shake' : 'animate-bounce-slight'
              ) : 'animate-breath-blob'
            }`}
            style={{ 
              background: currentRole.gradient,
              borderRadius: '45% 55% 40% 60% / 55% 45% 60% 40%',
              border: currentRole.id === 'role_white' ? '1px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.4)'
            }}
          >
          {/* 高光 */}
          <div className="absolute top-4 left-6 w-16 h-12 bg-white/30 rounded-full blur-[8px] transform -rotate-12 mix-blend-overlay" />

          {/* 角色表情 */}
          <div 
            className={`text-3xl font-semibold tracking-widest opacity-80 animate-pulse-slow ${
              currentRole.id === 'role_white' ? 'text-zinc-600' : 'text-white'
            }`}
          >
            {getFaceExpression()}
          </div>
        </div>

        {/* 辅助文本提示（如果在舒缓引导的步骤3，展示进度） */}
        <div className="absolute -bottom-8 w-full flex justify-center h-6">
          <div 
            className="text-zinc-400 text-sm font-medium tracking-wide transition-all duration-300"
            style={{ 
              opacity: activeTab === 'guide' && Number(narrativeStep) === 3 ? 1 : 0,
              transform: `translateY(${activeTab === 'guide' && Number(narrativeStep) === 3 ? 0 : 10}px)`
            }}
          >
            已按压 {narrativePressCount} / 3 次
          </div>
        </div>
      </div>

      {/* 当前状态小标签 */}
      <div className="mt-14 h-8 flex justify-center w-full">
        <div
          className="px-4 py-1.5 rounded-full glass-panel text-zinc-500 text-[11px] font-semibold tracking-wide transition-all duration-300"
          style={{
            opacity: currentBehavior !== 'idle' ? 1 : 0,
            transform: currentBehavior !== 'idle' ? 'scale(1)' : 'scale(0.8)',
            filter: currentBehavior !== 'idle' ? 'blur(0px)' : 'blur(4px)'
          }}
        >
          检测到: {
            currentBehavior === 'hard_press' ? '重按 (3)' : 
            currentBehavior === 'normal_press' ? '正常按 (2)' : 
            '轻按 (1)'
          }
          {currentPressure > 0 && ` (压力: ${Math.round(currentPressure * 100)}%)`}
        </div>
      </div>

      {/* 蓝牙连接控制与调试面板 */}
      <div className="absolute bottom-32 w-full px-8 flex flex-col items-center gap-6">
        <button
          onClick={deviceStatus === 'connected' ? disconnect : connect}
          className={`flex items-center justify-center gap-2 w-40 py-3.5 rounded-full text-[15px] font-semibold tracking-tight transition-all duration-300 ${
            deviceStatus === 'connected' 
              ? 'glass-button text-zinc-600' 
              : 'bg-zinc-800 text-white hover:bg-zinc-700 shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.18)] hover:-translate-y-0.5'
          }`}
        >
          {deviceStatus === 'connected' && (
            <span className="flex items-center gap-2"><BluetoothOff size={18} /> 断开连接</span>
          )}
          {deviceStatus === 'connecting' && (
            <span className="flex items-center gap-2"><Settings2 size={18} className="animate-spin" /> 连接中...</span>
          )}
          {deviceStatus === 'disconnected' && (
            <span className="flex items-center gap-2"><Bluetooth size={18} /> 连接捏捏乐</span>
          )}
        </button>

        {/* 调试用：模拟硬件发送数据 */}
        <div 
          className="flex flex-col gap-3 opacity-40 hover:opacity-100 transition-all duration-300 items-center bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm"
          style={{ 
            display: deviceStatus === 'disconnected' ? 'flex' : 'none' 
          }}
        >
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
      </div>
    </div>
  );
};
