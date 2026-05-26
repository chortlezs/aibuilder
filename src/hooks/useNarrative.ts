import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';

const EVALUATION_THRESHOLD = 5; // 监测到 5 次动作后进行结算

export const useNarrative = () => {
  const { 
    mindfulnessState, setMindfulnessState,
    appPhase, setAppPhase,
    behaviorHistory, clearBehaviorHistory,
    narrativeStep, setNarrativeStep,
    narrativePressCount, setNarrativePressCount,
    activeTab, setActiveTab,
    currentPressure,
    addRecord
  } = useAppStore();

  const sessionStartRef = useRef<number>(0);
  const isSessionActiveRef = useRef<boolean>(false);

  // 1. 监测阶段 -> 评估阶段
  useEffect(() => {
    if (activeTab === 'monitor' && appPhase === 'monitoring' && behaviorHistory.length >= EVALUATION_THRESHOLD) {
      let score = 0;
      behaviorHistory.forEach(behavior => {
        if (behavior === 'light_press') score += 1; 
        else if (behavior === 'normal_press') score += 0; 
        else if (behavior === 'hard_press') score -= 1; 
      });

      // 稍微延迟状态更新，避免和 UI 动画冲突导致渲染崩溃
      setTimeout(() => {
        setAppPhase('evaluating');
        setMindfulnessState(score < 0 ? 'negative' : 'positive');
      }, 100);
    }
  }, [appPhase, activeTab, behaviorHistory, clearBehaviorHistory, setAppPhase, setMindfulnessState, setActiveTab]);

  // 2. 处理 Tab 切换：进入 guide 启动叙事，离开则取消
  useEffect(() => {
    if (activeTab === 'guide') {
      if (appPhase !== 'narrative') {
        setAppPhase('narrative');
        setNarrativeStep(1);
        setNarrativePressCount(0);
        sessionStartRef.current = Date.now();
        isSessionActiveRef.current = true;
      }
    } else if (activeTab === 'monitor') {
      if (appPhase === 'narrative') {
        if (isSessionActiveRef.current) finishSession(false);
      }
    }
  }, [activeTab]);

  // 3. 叙事阶段：监听行为 (按一下、按三下)
  const prevHistoryLen = useRef(behaviorHistory.length);
  useEffect(() => {
    if (activeTab !== 'guide') {
      prevHistoryLen.current = behaviorHistory.length;
      return;
    }

    const newPresses = behaviorHistory.length - prevHistoryLen.current;
    prevHistoryLen.current = behaviorHistory.length;

    if (newPresses > 0) {
      const currentStep = Number(narrativeStep);
      
      if (currentStep === 1) {
        setNarrativeStep(2);
      } else if (currentStep === 2) {
        // 只要按了就可以进入下一步，不需要非得长按 3 秒
        setNarrativeStep(3);
        setNarrativePressCount(0);
      } else if (currentStep === 3) {
        const newCount = narrativePressCount + newPresses;
        if (newCount < 3) {
          setNarrativePressCount(newCount);
        } else {
          setNarrativePressCount(3);
          setTimeout(() => setNarrativeStep(4), 500); // 稍微延迟一下进入第四步
        }
      }
    }
  }, [activeTab, narrativeStep, behaviorHistory.length, narrativePressCount, setNarrativeStep, setNarrativePressCount]);

  // 4. 叙事阶段：监听压力 (缓缓松开)
  useEffect(() => {
    if (activeTab !== 'guide') return;

    if (narrativeStep === 4) {
      if (currentPressure === 0) {
        // 松开后稍微延迟进入结束状态，显得自然
        const t = setTimeout(() => {
          setNarrativeStep(5);
          setTimeout(() => {
            finishSession(true);
          }, 2500);
        }, 500);
        return () => clearTimeout(t);
      }
    }
  }, [activeTab, narrativeStep, currentPressure, setNarrativeStep]);

  const finishSession = (success: boolean) => {
    if (!isSessionActiveRef.current) return;
    
    const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    const startState = useAppStore.getState().mindfulnessState;
    
    addRecord({
      id: Date.now().toString(),
      timestamp: Date.now(),
      duration,
      startState: startState,
      endState: success ? 'positive' : 'negative',
      negativeCount: 0,
      successTransform: success
    });
    
    isSessionActiveRef.current = false;
    setNarrativeStep(0);
    setAppPhase('idle');
    setMindfulnessState('idle');
    setActiveTab('monitor'); // 完成后切回监测
    clearBehaviorHistory();
  };

  const cancelSession = () => {
    if (isSessionActiveRef.current) {
      finishSession(false);
    }
  };

  return { cancelSession };
};
