# 音频文件放置说明

请将你录制好的 4 段叙事引导音频放在这个 `public/audio` 文件夹中。

由于目前 3 个角色共享同一个故事，你需要将音频文件命名为以下格式：

- `step1.mp3`：对应第一段文案（"第一步：请轻轻按一下"）
- `step2.mp3`：对应第二段文案（"第二步：请按住我 3 秒钟"）
- `step3.mp3`：对应第三段文案（"第三步：请连续按三下"）
- `step4.mp3`：对应第四段文案（"第四步：请缓缓松开..."）

放置好文件后，打开 `src/pages/Home.tsx`，找到 `useEffect` 中的这段代码：

```typescript
// TODO: 替换为实际的音频文件路径
// audioRef.current.src = `/audio/step${narrativeStep}.mp3`;
// audioRef.current.play().catch(err => console.log('等待用户交互后才能播放音频', err));
```

把注释去掉（删掉前面的 `//`），App 就会在每次进入对应步骤时自动播放对应的音频了！
