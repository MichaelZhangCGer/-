
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Upload, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Loader2, 
  Layers,
  Info,
  AlertTriangle,
  RefreshCcw,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Cpu,
  Code,
  User,
  Activity,
  Box,
  Terminal,
  Server,
  Clock,
  LayoutGrid,
  FileJson
} from 'lucide-react';
import { AugmentationMode, AugmentationEffect, GeneratedSample, AppConfig } from './types';
import { SAFE_EFFECTS, GEN_EFFECTS } from './constants';
import { fileToBase64, triggerBatchDownload, downloadImage } from './utils/imageUtils';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [mode, setMode] = useState<AugmentationMode>(AugmentationMode.SAFE_PHYSICAL);
  const [samples, setSamples] = useState<GeneratedSample[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [config, setConfig] = useState<AppConfig>({
    batchSize: 10,
    physicalStrength: 50,
    generativeStrength: 40 // 默认强度下调，保持与原图更高的一致性
  });
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');

  const TASK_MESSAGES = [
    '正在分析原始样本结构...',
    '构建神经像素映射管道...',
    '应用物理仿真变换算子...',
    '模拟大气散射与光照衰减...',
    '校验几何一致性约束...',
    '导出高保真数据样本...'
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewerIndex === null) return;
      if (e.key === 'ArrowRight') navigateViewer(1);
      if (e.key === 'ArrowLeft') navigateViewer(-1);
      if (e.key === 'Escape') setViewerIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerIndex, samples.length]);

  // 任务消息轮播逻辑
  useEffect(() => {
    let interval: number;
    if (isGenerating) {
      let idx = 0;
      setCurrentTask(TASK_MESSAGES[0]);
      interval = window.setInterval(() => {
        idx = (idx + 1) % TASK_MESSAGES.length;
        setCurrentTask(TASK_MESSAGES[idx]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const navigateViewer = (direction: number) => {
    if (viewerIndex === null) return;
    const nextIndex = (viewerIndex + direction + samples.length) % samples.length;
    setViewerIndex(nextIndex);
  };

  const getRandomEffect = (currentMode: AugmentationMode) => {
    const pool = currentMode === AugmentationMode.SAFE_PHYSICAL ? SAFE_EFFECTS : GEN_EFFECTS;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const b64 = await fileToBase64(file);
      setSourceImage(b64);
      setSamples([]);
    }
  };

  const startAugmentation = async () => {
    if (!sourceImage) return;

    setIsGenerating(true);
    setSamples([]);
    setProgress(0);

    const service = new GeminiService();
    const newSamples: GeneratedSample[] = [];
    const strength = mode === AugmentationMode.SAFE_PHYSICAL ? config.physicalStrength : config.generativeStrength;

    try {
      for (let i = 0; i < config.batchSize; i++) {
        const effect = getRandomEffect(mode);
        const resultUrl = await service.augmentImage(sourceImage, effect, mode, strength);
        
        if (resultUrl) {
          newSamples.push({
            id: `sample-${Date.now()}-${i}`,
            url: resultUrl,
            effect: effect.name,
            mode: mode
          });
        }
        const newProgress = ((i + 1) / config.batchSize) * 100;
        setProgress(newProgress);
      }
      setSamples(newSamples);
    } catch (error) {
      console.error("Batch Augmentation Failed:", error);
      alert("生成失败，请检查网络连接或 API 配额。");
    } finally {
      setIsGenerating(false);
    }
  };

  // 进度条常量计算 - 统一使用 r=64
  const ringRadius = 64;
  const ringCircumference = 2 * Math.PI * ringRadius;

  return (
    <div className="min-h-screen pb-24 relative selection:bg-cyan-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-cyan-500/30 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-white/10">
              <Layers className="text-cyan-400" size={24} />
            </div>
          </div>
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
              <h1 className="text-lg md:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 leading-tight">
                样本数据扩增神器
              </h1>
              <span className="w-fit px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[8px] md:text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                Professional
              </span>
            </div>
            <p className="hidden md:flex text-[10px] text-slate-500 font-mono mt-0.5 items-center gap-1 uppercase tracking-tighter">
              <Cpu size={10} /> Smart Sample Augmentation Platform v2.3
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className={`px-2 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold border transition-all shadow-lg ${
            mode === AugmentationMode.SAFE_PHYSICAL 
            ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/5' 
            : 'border-purple-500/50 text-purple-400 bg-purple-500/5'
          }`}>
            <span className="hidden sm:inline opacity-50 mr-2 text-slate-500 font-normal">Active Engine:</span>
            {mode === AugmentationMode.SAFE_PHYSICAL ? '物理模式' : 'AI模式'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column - Controls */}
        <div className="lg:col-span-4 space-y-6">
          <section className="glass-card rounded-2xl p-4 md:p-6 relative overflow-hidden shadow-xl border border-white/5">
            <h2 className="text-md md:text-lg font-semibold mb-4 flex items-center gap-2 text-slate-100">
              <span className="w-5 h-5 md:w-6 md:h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] md:text-xs">01</span>
              上传原始样本
            </h2>
            <label className="group cursor-pointer block border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-3 md:p-4 transition-all bg-slate-800/30">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              {sourceImage ? (
                <div className="aspect-video rounded-lg overflow-hidden relative">
                  <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                    <RefreshCcw className="text-white animate-spin-slow" />
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center text-slate-500 gap-2 text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800 flex items-center justify-center mb-1 md:mb-2 border border-white/5">
                    <Upload size={20} />
                  </div>
                  <span className="text-[10px] md:text-xs font-medium">支持拖拽或点击上传</span>
                </div>
              )}
            </label>
          </section>

          <section className="glass-card rounded-2xl p-4 md:p-6 shadow-xl border border-white/5">
            <h2 className="text-md md:text-lg font-semibold mb-4 flex items-center gap-2 text-slate-100">
              <span className="w-5 h-5 md:w-6 md:h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] md:text-xs">02</span>
              选择扩增策略
            </h2>
            <div className="space-y-3">
              <button 
                onClick={() => setMode(AugmentationMode.SAFE_PHYSICAL)}
                className={`w-full p-3 md:p-4 rounded-xl border flex items-start gap-3 md:gap-4 transition-all ${
                  mode === AugmentationMode.SAFE_PHYSICAL 
                  ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/20' 
                  : 'bg-slate-800/40 border-transparent hover:border-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${mode === AugmentationMode.SAFE_PHYSICAL ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-700 text-slate-400'}`}>
                  <ShieldCheck size={18} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs md:text-sm text-slate-100">物理仿真引擎</div>
                  <p className="text-[10px] md:text-[11px] text-slate-400 mt-1 leading-relaxed italic">100% 几何保真，鲁棒性增强</p>
                </div>
              </button>

              <button 
                onClick={() => setMode(AugmentationMode.GENERATIVE_AI)}
                className={`w-full p-3 md:p-4 rounded-xl border flex items-start gap-3 md:gap-4 transition-all ${
                  mode === AugmentationMode.GENERATIVE_AI 
                  ? 'bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/20' 
                  : 'bg-slate-800/40 border-transparent hover:border-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${mode === AugmentationMode.GENERATIVE_AI ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-700 text-slate-400'}`}>
                  <Zap size={18} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs md:text-sm text-slate-100">生成式重绘引擎</div>
                  <p className="text-[10px] md:text-[11px] text-slate-400 mt-1 leading-relaxed italic">风格迁移，极端工况模拟</p>
                </div>
              </button>
            </div>
          </section>

          <section className="glass-card rounded-2xl overflow-hidden shadow-xl border border-white/5">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-4 flex items-center justify-between text-slate-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
                <Settings size={16} />
                高级开发者参数
              </div>
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showAdvanced && (
              <div className="p-4 pt-0 border-t border-slate-700/50 space-y-5 bg-slate-900/50">
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] md:text-xs text-slate-400 font-medium">批量扩增数量</label>
                    <span className="text-cyan-400 font-mono font-bold text-[10px] bg-cyan-400/10 px-1.5 py-0.5 rounded">{config.batchSize} PCS</span>
                  </div>
                  <input 
                    type="range" min="1" max="20" step="1" 
                    value={config.batchSize}
                    onChange={(e) => setConfig({...config, batchSize: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] md:text-xs text-slate-400 font-medium">仿真干预强度</label>
                    <span className="text-cyan-400 font-mono font-bold text-[10px] bg-cyan-400/10 px-1.5 py-0.5 rounded">{config.physicalStrength}%</span>
                  </div>
                  <input 
                    type="range" min="5" max="100" step="5" 
                    value={config.physicalStrength}
                    onChange={(e) => setConfig({...config, physicalStrength: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] md:text-xs text-slate-400 font-medium">模型重绘幅度</label>
                    <span className="text-purple-400 font-mono font-bold text-[10px] bg-purple-400/10 px-1.5 py-0.5 rounded">{config.generativeStrength}%</span>
                  </div>
                  <input 
                    type="range" min="5" max="100" step="5" 
                    value={config.generativeStrength}
                    onChange={(e) => setConfig({...config, generativeStrength: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>
            )}
          </section>

          <button 
            disabled={!sourceImage || isGenerating}
            onClick={startAugmentation}
            className={`w-full py-3 md:py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all relative overflow-hidden group shadow-2xl ${
              !sourceImage || isGenerating 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
              : 'neon-bg-cyan text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-95'
            }`}
          >
            {isGenerating ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" size={18} />
                  <span className="tracking-tight uppercase text-xs md:text-sm">Neural Processing...</span>
                </div>
              </div>
            ) : (
              <>
                <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                <span className="tracking-tight text-xs md:text-sm">一键扩增</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-8 space-y-6">
          <section className="glass-card rounded-2xl p-4 md:p-6 min-h-[400px] md:min-h-[600px] flex flex-col shadow-2xl border border-white/5 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
              <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                  扩增结果预览库
                  <span className="text-[9px] md:text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-400 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full border border-cyan-500/20">
                    SAMPLES: {samples.length}
                  </span>
                </h2>
              </div>
              {samples.length > 0 && (
                <button 
                  onClick={() => triggerBatchDownload(samples)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] md:text-xs font-black text-cyan-400 hover:text-cyan-300 transition-all bg-white/5 px-4 md:px-5 py-2 md:py-2.5 rounded-xl border border-white/10 hover:border-cyan-400/40"
                >
                  <Download size={14} />
                  打包导出样本 (PNG)
                </button>
              )}
            </div>

            {samples.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 overflow-y-auto max-h-[500px] md:max-h-[700px] pr-2 custom-scrollbar">
                {samples.map((sample, index) => (
                  <div key={sample.id} className="group relative glass-card rounded-2xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg animate-in zoom-in-95 duration-300">
                    <div className="relative aspect-video overflow-hidden" onClick={() => setViewerIndex(index)}>
                      <img src={sample.url} alt={sample.effect} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[1px]">
                        <Maximize2 className="text-white scale-75 group-hover:scale-100 transition-transform duration-300" size={28} />
                      </div>
                    </div>
                    <div className="p-3 md:p-4 bg-slate-900/90 flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-500 uppercase">Aug_Sample_{index + 1}</span>
                        <div className="text-[11px] md:text-xs font-bold text-white tracking-tight flex items-center gap-2">
                          {sample.effect}
                          <span className={`w-1.5 h-1.5 rounded-full ${sample.mode === AugmentationMode.SAFE_PHYSICAL ? 'bg-cyan-500 shadow-[0_0_5px_#06b6d4]' : 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,1)]'}`}></span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); downloadImage(sample.url, `aug_${sample.id}.png`); }}
                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-slate-800 rounded-lg md:rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-white/5"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-6 md:gap-8">
                <div className="relative">
                  {/* 使用单个 SVG 统一管理背景和进度，确保像素级对齐 */}
                  <svg className="w-32 h-32 md:w-40 md:h-40 overflow-visible" viewBox="0 0 160 160">
                    {/* 背景环 */}
                    <circle 
                      cx="80" cy="80" r={ringRadius} 
                      fill="transparent" 
                      stroke="rgba(255,255,255,0.05)" 
                      strokeWidth="8"
                    />
                    {/* 阴影效果使用 filter 定义 */}
                    <defs>
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    {/* 进度环 */}
                    <circle 
                      cx="80" cy="80" r={ringRadius} 
                      fill="transparent" 
                      stroke="#06b6d4" 
                      strokeWidth="8" 
                      strokeDasharray={ringCircumference} 
                      strokeDashoffset={ringCircumference - (ringCircumference * progress / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
                      className="transition-all duration-700 ease-out"
                      style={{ filter: 'url(#glow)' }}
                    />
                  </svg>
                  {/* 中心信息 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-2xl md:text-3xl font-black text-white font-mono tracking-tighter">
                      {Math.round(progress)}<span className="text-[10px] md:text-sm opacity-50">%</span>
                    </div>
                    <div className="text-[7px] md:text-[8px] text-cyan-500 uppercase font-black tracking-[0.2em] mt-0.5">Transforming</div>
                  </div>
                </div>
                
                <div className="text-center w-full max-w-xs md:max-w-sm px-4 md:px-8">
                  <div className="flex items-center justify-center gap-2 md:gap-3 text-cyan-400 font-bold mb-3 animate-pulse">
                    <Terminal size={14} />
                    <span className="text-[10px] md:text-sm uppercase tracking-widest truncate">{currentTask}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-2 border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[9px] md:text-[10px] text-slate-500 font-mono tracking-tighter uppercase">
                    Progress: {Math.floor(progress / 100 * config.batchSize)} / {config.batchSize} Units
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4 opacity-40">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-800/30 border border-slate-700/50 flex items-center justify-center">
                  <Layers size={40} className="text-slate-500" />
                </div>
                <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest">Awaiting Command Input</p>
              </div>
            )}
          </section>

          {/* Educational Guidelines - 核心特点说明卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-4 md:p-5 border-t-2 border-cyan-500/50 shadow-lg hover:bg-white/5 transition-colors group">
              <h3 className="text-[9px] md:text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <LayoutGrid size={12} className="group-hover:rotate-45 transition-transform" /> 几何一致性
              </h3>
              <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed font-medium">
                物理模式保持了目标的像素坐标绝对不变。这使得您可以使用原始标注直接匹配扩增图，无需重新拉框。
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 md:p-5 border-t-2 border-purple-500/50 shadow-lg hover:bg-white/5 transition-colors group">
              <h3 className="text-[9px] md:text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap size={12} className="group-hover:scale-125 transition-transform" /> 环境鲁棒性
              </h3>
              <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed font-medium">
                通过生成极端天气，能显著提高目标检测模型在极端恶劣工况下的识别准确度。
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 md:p-5 border-t-2 border-blue-500/50 shadow-lg hover:bg-white/5 transition-colors group">
              <h3 className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <FileJson size={12} className="group-hover:translate-x-1 transition-transform" /> 数据导出
              </h3>
              <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed font-medium">
                结果均以无损 PNG 导出。支持批量下载，无缝对接到 LabelImg 或 CVAT 等标注工具。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Viewer Modal */}
      {viewerIndex !== null && samples[viewerIndex] && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 p-4">
          <button onClick={() => setViewerIndex(null)} className="absolute top-4 md:top-8 right-4 md:right-8 p-2 md:p-3 text-white/50 hover:text-white bg-white/5 rounded-full transition-all border border-white/10 shadow-2xl z-20">
            <X size={20} />
          </button>
          
          <div className="hidden md:block">
            <button onClick={() => navigateViewer(-1)} className="absolute left-4 md:left-8 p-4 md:p-6 text-white/20 hover:text-white transition-all active:scale-90 group">
              <ChevronLeft size={60} className="group-hover:-translate-x-2 transition-transform" />
            </button>
            <button onClick={() => navigateViewer(1)} className="absolute right-4 md:right-8 p-4 md:p-6 text-white/20 hover:text-white transition-all active:scale-90 group">
              <ChevronRight size={60} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="w-full max-w-5xl flex flex-col items-center gap-4 md:gap-8">
            <div className="relative w-full max-h-[60vh] md:max-h-[75vh] flex justify-center group/img">
              <img src={samples[viewerIndex].url} alt={samples[viewerIndex].effect} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10 shadow-cyan-500/10" />
              
              {/* Mobile Arrows */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:hidden">
                <button onClick={() => navigateViewer(-1)} className="p-3 bg-black/50 rounded-full text-white backdrop-blur-sm"><ChevronLeft size={24} /></button>
                <button onClick={() => navigateViewer(1)} className="p-3 bg-black/50 rounded-full text-white backdrop-blur-sm"><ChevronRight size={24} /></button>
              </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center justify-between bg-slate-900/90 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl gap-4">
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase flex flex-wrap items-center justify-center sm:justify-start gap-2 md:gap-3">
                  {samples[viewerIndex].effect}
                  <span className={`text-[8px] md:text-[10px] px-2 py-0.5 rounded-full ${samples[viewerIndex].mode === AugmentationMode.SAFE_PHYSICAL ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {samples[viewerIndex].mode === AugmentationMode.SAFE_PHYSICAL ? 'GEOMETRY_SAFE' : 'EXPERIMENTAL_GEN'}
                  </span>
                </h3>
                <p className="text-[9px] md:text-xs text-slate-500 font-mono truncate max-w-[200px] md:max-w-none">HASH: {samples[viewerIndex].id}</p>
              </div>
              <button onClick={() => downloadImage(samples[viewerIndex].url, `augmented_${samples[viewerIndex].id}.png`)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-black font-black rounded-xl md:rounded-2xl transition-all hover:bg-cyan-500 hover:text-white active:scale-95 border-none shadow-xl uppercase tracking-tighter text-[11px] md:text-sm">
                <Download size={18} />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding - 移动端自适应显示 */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5 text-[9px] md:text-[10px] font-mono tracking-tight text-slate-500">
          
          <div className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 group overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-green-500/5 border border-green-500/20 group-hover:bg-green-500/10 transition-colors">
              <Activity className="text-green-500 animate-pulse" size={14} />
            </div>
            <div className="truncate">
              <div className="text-slate-600 uppercase font-black tracking-widest text-[7px] md:text-[8px] mb-0.5">System Status</div>
              <div className="text-slate-200 font-bold flex items-center gap-2 truncate text-[10px]">
                ONLINE <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 group overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-cyan-500/5 border border-cyan-500/20 group-hover:bg-cyan-500/10 transition-colors">
              <Server className="text-cyan-400" size={14} />
            </div>
            <div className="truncate">
              <div className="text-slate-600 uppercase font-black tracking-widest text-[7px] md:text-[8px] mb-0.5">Intelligence</div>
              <div className="text-slate-200 font-bold truncate text-[10px]">GEMINI_NATIVE_2.5</div>
            </div>
          </div>

          <div className="hidden md:flex px-6 py-4 items-center gap-4 group">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/5 border border-indigo-500/20 group-hover:bg-indigo-500/10 transition-colors">
              <User className="text-indigo-400" size={14} />
            </div>
            <div>
              <div className="text-slate-600 uppercase font-black tracking-widest text-[8px] mb-0.5">Lead Developer</div>
              <div className="text-indigo-300 font-bold uppercase tracking-widest">zhanght12</div>
            </div>
          </div>

          <div className="hidden md:flex px-6 py-4 items-center gap-4 group bg-white/[0.02]">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              <Code className="text-slate-300" size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-600 uppercase font-black tracking-widest text-[8px] mb-0.5">AI Architecture</div>
              <div className="text-slate-400 flex items-center gap-3 overflow-hidden">
                <span className="truncate">React + GenAI SDK</span>
              </div>
            </div>
          </div>

        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* 移动端特殊滑块样式 */
        @media (max-width: 640px) {
          input[type=range] { height: 24px; }
          input[type=range]::-webkit-slider-thumb {
            height: 20px;
            width: 20px;
            background: #06b6d4;
            border-radius: 50%;
            cursor: pointer;
            -webkit-appearance: none;
            margin-top: -8px;
            box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
          }
        }
      `}</style>
    </div>
  );
};

export default App;
