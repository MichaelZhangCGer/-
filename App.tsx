
import React, { useState, useCallback, useEffect } from 'react';
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
  User
} from 'lucide-react';
import { AugmentationMode, AugmentationEffect, GeneratedSample, AppConfig } from './types';
import { SAFE_EFFECTS, GEN_EFFECTS } from './constants';
import { fileToBase64, triggerBatchDownload, downloadImage } from './utils/imageUtils';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  // App State
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [mode, setMode] = useState<AugmentationMode>(AugmentationMode.SAFE_PHYSICAL);
  const [samples, setSamples] = useState<GeneratedSample[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [config, setConfig] = useState<AppConfig>({
    batchSize: 10
  });
  const [progress, setProgress] = useState(0);

  // Keyboard navigation for viewer
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

    try {
      for (let i = 0; i < config.batchSize; i++) {
        const effect = getRandomEffect(mode);
        const resultUrl = await service.augmentImage(sourceImage, effect, mode);
        
        if (resultUrl) {
          newSamples.push({
            id: `sample-${Date.now()}-${i}`,
            url: resultUrl,
            effect: effect.name,
            mode: mode
          });
        }
        setProgress(((i + 1) / config.batchSize) * 100);
      }
      setSamples(newSamples);
    } catch (error) {
      console.error("Batch Augmentation Failed:", error);
      alert("生成失败，请检查 API Key 权限或网络连接。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-cyan-500/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-white/10">
              <Layers className="text-cyan-400" size={28} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500">
                样本数据扩增神器
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                Industrial Grade
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1 uppercase tracking-tighter">
              <Cpu size={10} /> Smart Sample Augmentation Platform v2.2
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors shadow-lg ${
            mode === AugmentationMode.SAFE_PHYSICAL 
            ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/5' 
            : 'border-purple-500/50 text-purple-400 bg-purple-500/5'
          }`}>
            <span className="opacity-50 mr-2 text-slate-500 font-normal">核心引擎:</span>
            {mode === AugmentationMode.SAFE_PHYSICAL ? '物理仿真模式' : '生成式重绘模式'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Step 1: Upload */}
          <section className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Upload size={80} />
            </div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">01</span>
              上传原始样本
            </h2>
            
            <label className="group cursor-pointer block border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-4 transition-all bg-slate-800/30">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              {sourceImage ? (
                <div className="aspect-video rounded-lg overflow-hidden relative">
                  <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <RefreshCcw className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center text-slate-500 gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2">
                    <Upload size={24} />
                  </div>
                  <span className="text-xs font-medium">支持拖拽或点击上传<br/>(推荐 1080P/4K 工业巡检图)</span>
                </div>
              )}
            </label>
          </section>

          {/* Step 2: Mode Selection */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">02</span>
              选择扩增策略
            </h2>
            <div className="space-y-3">
              <button 
                onClick={() => setMode(AugmentationMode.SAFE_PHYSICAL)}
                className={`w-full p-4 rounded-xl border flex items-start gap-4 transition-all ${
                  mode === AugmentationMode.SAFE_PHYSICAL 
                  ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/20' 
                  : 'bg-slate-800/40 border-transparent hover:border-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${mode === AugmentationMode.SAFE_PHYSICAL ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm text-slate-200">物理仿真引擎 (工业级)</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">保证 100% 几何保真度。通过模拟光照、天气、镜头噪声，生成适用于 YOLO 训练的“无损”样本。</p>
                </div>
              </button>

              <button 
                onClick={() => setMode(AugmentationMode.GENERATIVE_AI)}
                className={`w-full p-4 rounded-xl border flex items-start gap-4 transition-all ${
                  mode === AugmentationMode.GENERATIVE_AI 
                  ? 'bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/20' 
                  : 'bg-slate-800/40 border-transparent hover:border-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${mode === AugmentationMode.GENERATIVE_AI ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <Zap size={20} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm text-slate-200">生成式引擎 (实验性)</div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">基于 Gemini 2.5 图像重绘。可生成复杂的背景迁移、极端灾害场景。注：可能改变细微物体的几何结构。</p>
                </div>
              </button>
            </div>
          </section>

          {/* Advanced Settings */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-4 flex items-center justify-between text-slate-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Settings size={16} />
                高级开发者参数
              </div>
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showAdvanced && (
              <div className="p-4 pt-0 border-t border-slate-700/50 space-y-4 bg-slate-900/50">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs text-slate-500 font-medium">批量扩增数量</label>
                    <span className="text-cyan-400 font-mono font-bold text-xs tracking-tighter">{config.batchSize} PCS</span>
                  </div>
                  <input 
                    type="range" min="1" max="20" step="1" 
                    value={config.batchSize}
                    onChange={(e) => setConfig({...config, batchSize: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>1</span>
                    <span>10</span>
                    <span>20</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3">
                  <Info className="text-yellow-500 shrink-0" size={16} />
                  <p className="text-[10px] text-yellow-500/80 leading-relaxed">
                    物理引擎会自动在后台随机混合“强光”、“大雾”、“运动模糊”等工况。核心基于随机化管道，确保每张图的效果均不重复。
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Action Button */}
          <button 
            disabled={!sourceImage || isGenerating}
            onClick={startAugmentation}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all relative overflow-hidden group ${
              !sourceImage || isGenerating 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
              : 'neon-bg-cyan text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" />
                <span className="tracking-tight">正在神经网络变换 ({Math.round(progress)}%)...</span>
              </>
            ) : (
              <>
                <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="tracking-tight">立即启动智能扩增</span>
              </>
            )}
            {isGenerating && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-white/20 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            )}
          </button>
        </div>

        {/* Right Column: Results Gallery */}
        <div className="lg:col-span-8 space-y-6">
          <section className="glass-card rounded-2xl p-6 min-h-[600px] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                扩增结果预览
                {samples.length > 0 && (
                  <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
                    SAMPLES: {samples.length}
                  </span>
                )}
              </h2>
              {samples.length > 0 && (
                <button 
                  onClick={() => triggerBatchDownload(samples)}
                  className="flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-all bg-cyan-400/5 px-4 py-2 rounded-lg border border-cyan-400/20 hover:bg-cyan-400/10 active:scale-95 shadow-sm"
                >
                  <Download size={16} />
                  批量打包导出 (PNG)
                </button>
              )}
            </div>

            {samples.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {samples.map((sample, index) => (
                  <div key={sample.id} className="group relative glass-card rounded-xl overflow-hidden border border-slate-700/50 hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg">
                    <div className="relative aspect-video overflow-hidden" onClick={() => setViewerIndex(index)}>
                      <img src={sample.url} alt={sample.effect} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <div className="bg-cyan-500 p-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-xl">
                          <Maximize2 className="text-white" size={20} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900/95 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-white/90 tracking-tight uppercase">{sample.effect}</div>
                        <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-1 font-mono font-medium">
                          {sample.mode === AugmentationMode.SAFE_PHYSICAL ? <ShieldCheck size={10} className="text-cyan-400" /> : <Zap size={10} className="text-purple-400" />}
                          {sample.mode === AugmentationMode.SAFE_PHYSICAL ? 'PHYSICAL_ENGINE' : 'GENERATIVE_ENGINE'}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(sample.url, `aug_${sample.id}.png`);
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all border border-white/5 active:scale-90"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-6">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-cyan-500/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-cyan-500 rounded-full animate-spin shadow-inner"></div>
                  <Layers className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" size={32} />
                </div>
                <div className="text-center space-y-2">
                  <div className="text-sm font-black text-white tracking-[0.2em] animate-pulse">正在生成神经网络图像...</div>
                  <p className="text-xs text-slate-500 font-mono">正在应用 {mode === AugmentationMode.SAFE_PHYSICAL ? 'SAFE_MODE' : 'GEN_MODE'} 增强算法管道</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4">
                <div className="w-24 h-24 rounded-3xl bg-slate-800/30 border border-slate-700/50 flex items-center justify-center shadow-inner">
                  <Layers size={40} className="opacity-20 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-400 tracking-tight">等待输入源队列</p>
                  <p className="text-xs text-slate-600 mt-2 max-w-xs leading-relaxed">请上传一张原始电力设备图，系统将自动基于 AI 扩增出 {config.batchSize} 张训练样本</p>
                </div>
              </div>
            )}
          </section>

          {/* Educational Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-5 border-t-2 border-cyan-500/50 shadow-lg">
              <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <CheckCircle size={12} /> 几何一致性 (Geometry)
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                物理模式保持了目标的像素坐标绝对不变。这使得您可以使用原始标注（Label）直接匹配扩增图，无需重新拉框。
              </p>
            </div>
            <div className="glass-card rounded-xl p-5 border-t-2 border-purple-500/50 shadow-lg">
              <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap size={12} /> 环境鲁棒性 (Robustness)
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                通过生成极端天气（如冰封、沙漠、夜晚），能显著提高目标检测模型在极端恶劣工况下的识别准确度。
              </p>
            </div>
            <div className="glass-card rounded-xl p-5 border-t-2 border-blue-500/50 shadow-lg">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Code size={12} /> 数据导出 (Format)
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                所有结果均以 24-bit 无损 PNG 格式导出。支持批量下载，可无缝对接到 LabelImg 或 CVAT 等标注工具。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox / Viewer Modal */}
      {viewerIndex !== null && samples[viewerIndex] && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <button 
            onClick={() => setViewerIndex(null)}
            className="absolute top-8 right-8 p-3 text-slate-400 hover:text-white bg-slate-800/50 rounded-full transition-all hover:rotate-90 border border-white/10 shadow-2xl"
          >
            <X size={24} />
          </button>

          {/* Navigation Controls */}
          <button 
            onClick={() => navigateViewer(-1)}
            className="absolute left-8 p-4 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all group active:scale-90"
          >
            <ChevronLeft size={64} className="group-hover:-translate-x-2 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigateViewer(1)}
            className="absolute right-8 p-4 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all group active:scale-90"
          >
            <ChevronRight size={64} className="group-hover:translate-x-2 transition-transform" />
          </button>

          <div className="max-w-6xl w-full px-12 flex flex-col items-center gap-8">
            <div className="relative group w-full flex justify-center">
              <div className="absolute -inset-10 bg-cyan-500/5 blur-[100px] rounded-full opacity-30 pointer-events-none"></div>
              <img 
                src={samples[viewerIndex].url} 
                alt={samples[viewerIndex].effect} 
                className="relative max-w-full max-h-[75vh] object-contain rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10" 
              />
              <div className="absolute top-4 left-4 px-4 py-1 bg-black/80 backdrop-blur-xl rounded-full text-xs font-mono text-cyan-400 border border-cyan-500/30 font-bold shadow-lg">
                SAMPLE: {viewerIndex + 1} / {samples.length}
              </div>
            </div>

            <div className="w-full flex items-center justify-between bg-slate-900/90 p-8 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shadow-lg ${samples[viewerIndex].mode === AugmentationMode.SAFE_PHYSICAL ? 'bg-cyan-500' : 'bg-purple-500'}`}>
                    {samples[viewerIndex].mode === AugmentationMode.SAFE_PHYSICAL ? <ShieldCheck size={20} className="text-white" /> : <Zap size={20} className="text-white" />}
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">{samples[viewerIndex].effect}</h3>
                </div>
                <p className="text-xs text-slate-400 ml-12 font-mono flex items-center gap-2">
                  <span className="opacity-50">算法配置:</span>
                  <span className="text-slate-200 font-bold tracking-tighter">
                    {samples[viewerIndex].mode === AugmentationMode.SAFE_PHYSICAL ? 'STRICT_GEOMETRY_ALGO_V1.0' : 'GENERATIVE_DIFFUSION_REPAINT_V2.5'}
                  </span>
                </p>
              </div>
              <button 
                onClick={() => downloadImage(samples[viewerIndex].url, `augmented_${samples[viewerIndex].id}.png`)}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 border border-white/10 uppercase tracking-tighter"
              >
                <Download size={20} />
                导出该样本 (PNG)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding - 统一样式并增加 zhanght12 信息 */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 px-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 font-mono bg-slate-950/90 backdrop-blur-2xl border-t border-white/5 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-2 mb-2 md:mb-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">系统状态:</span>
            <span className="flex items-center gap-1.5 text-green-500 font-bold">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></div> 引擎就绪
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">核心算法:</span>
            <span className="text-slate-300 font-bold tracking-tight">GEMINI_MULTIMODAL_V2.2</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">开发者:</span>
            <span className="text-indigo-400 font-bold tracking-widest flex items-center gap-1">
              <User size={10} /> zhanght12
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-8 gap-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 shadow-inner">
            <Code size={12} className="text-slate-400" />
            <span className="font-bold tracking-tight">100% AI 开发驱动</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">技术栈:</span>
            <span className="text-slate-300 uppercase tracking-tighter font-bold">React + Tailwind + Gemini 2.5 API</span>
          </div>
          <div className="hidden md:block text-slate-800">|</div>
          <div className="text-slate-500 font-medium tracking-widest">© {new Date().getFullYear()} POWER_AI_SYSTEMS</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
