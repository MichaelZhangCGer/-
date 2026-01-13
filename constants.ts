
import { AugmentationEffect } from './types';

export const SAFE_EFFECTS: AugmentationEffect[] = [
  { id: 'sunny', name: '强光曝晒', description: '模拟夏日强光直射', promptMod: 'bright sunny daylight with high contrast and sharp shadows' },
  { id: 'night', name: '夜间模式', description: '模拟夜间红外/弱光环境', promptMod: 'dark night environment, low lighting, ISO noise, infrared aesthetic' },
  { id: 'fog', name: '大雾天气', description: '增加环境能见度干扰', promptMod: 'heavy fog, low visibility, atmospheric haze' },
  { id: 'rain', name: '连绵阴雨', description: '增加雨滴挂片与地面反光', promptMod: 'rainy weather, water droplets on lens, wet surfaces, grey sky' },
  { id: 'motion', name: '运动模糊', description: '模拟无人机高速拍摄', promptMod: 'motion blur, camera shake, slightly out of focus' },
  { id: 'dirty', name: '镜头污垢', description: '增加镜头遮挡遮挡', promptMod: 'smudged lens, oil stains on sensor, dust particles' },
  { id: 'snow', name: '极端降雪', description: '覆盖积雪细节', promptMod: 'heavy snow, snowflakes falling, white accumulation on equipment' }
];

export const GEN_EFFECTS: AugmentationEffect[] = [
  { id: 'rust', name: '严重锈蚀', description: '模拟长期未维护状态', promptMod: 'heavily rusted metal surfaces, oxidation, corrosion details' },
  { id: 'cyber', name: '赛博朋克', description: '霓虹灯效背景切换', promptMod: 'cyberpunk city background, neon lights reflection, futuristic aesthetic' },
  { id: 'overgrown', name: '植被侵入', description: '模拟荒野基站', promptMod: 'overgrown by vines, forest background, abandoned equipment look' },
  { id: 'sandstorm', name: '沙尘暴', description: '极端戈壁环境', promptMod: 'heavy sandstorm, yellow orange atmosphere, desert dust' },
  { id: 'ice', name: '严重冰封', description: '模拟北方寒冬冰柱', promptMod: 'thick ice coating, frozen icicles hanging from structure' }
];
