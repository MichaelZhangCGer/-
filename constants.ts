
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
  { id: 'rust_normal', name: '正常锈蚀', description: '模拟设备自然老化过程', promptMod: 'mild surface rust, light oxidation spots, realistic industrial weathering on metal parts' },
  { id: 'pollution', name: '表面污秽', description: '模拟绝缘子或金属件盐雾污秽', promptMod: 'industrial pollution buildup, grey salt mist coating, grimy surfaces, environmental residue' },
  { id: 'aging_discoloration', name: '老旧变色', description: '长期户外曝晒导致褪色', promptMod: 'faded and sun-bleached paint, yellowish or greyish surface discoloration, long-term outdoor exposure patina' },
  { id: 'surface_cracks', name: '表面裂纹', description: '结构疲劳裂痕', promptMod: 'visible surface cracks, structural fatigue fissures on components, hairline fractures' },
  { id: 'paint_cracking', name: '变色皲裂', description: '表面涂层老化及微小裂纹', promptMod: 'discolored and sun-damaged surfaces, fine network of cracks in paint, peeling coating, industrial aging' }
];
