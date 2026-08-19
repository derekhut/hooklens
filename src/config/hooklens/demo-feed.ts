import type { HookPatternId } from './hooks';

export type DemoMode = 'standard' | 'audit' | 'calm';

export type DemoSeverity = 'high' | 'medium';

export type DemoHotspotId = 'autoplay' | 'infinite' | 'streak';

export type DemoArticle = {
  id: string;
  image: string;
  titleZh: string;
  titleEn: string;
  excerptZh: string;
  excerptEn: string;
  authorZh: string;
  authorEn: string;
  minutes: number;
};

export type DemoHotspot = {
  id: DemoHotspotId;
  hookId: HookPatternId;
  severity: DemoSeverity;
  titleZh: string;
  titleEn: string;
  evidenceZh: string;
  evidenceEn: string;
  impactZh: string;
  impactEn: string;
  suggestionZh: string;
  suggestionEn: string;
};

export const DEMO_NAV = [
  { id: 'home', labelZh: '首页', labelEn: 'Home', icon: 'home' },
  { id: 'discover', labelZh: '发现', labelEn: 'Discover', icon: 'compass' },
  { id: 'saved', labelZh: '收藏', labelEn: 'Saved', icon: 'bookmark' },
  { id: 'history', labelZh: '历史记录', labelEn: 'History', icon: 'clock' },
  { id: 'settings', labelZh: '设置', labelEn: 'Settings', icon: 'settings' },
] as const;

export const DEMO_TRENDING = [
  { zh: '城市慢行地图', en: 'City slow-walk map' },
  { zh: '校园创造周', en: 'Campus creation week' },
  { zh: '旧物新技术', en: 'New tech for old things' },
] as const;

export const DEMO_VIDEO = {
  image:
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80',
  captionZh: '城市漫步：留下步行的尺度',
  captionEn: 'City walk: keeping a walkable scale',
};

export const DEMO_ARTICLES: DemoArticle[] = [
  {
    id: 'a1',
    image:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80',
    titleZh: '一座城市如何留下步行的尺度',
    titleEn: 'How a city keeps a walkable scale',
    excerptZh: '当街道被重新分配给人，日常节奏会如何改变。',
    excerptEn: 'When streets are given back to people, daily rhythm shifts.',
    authorZh: '城市观察者',
    authorEn: 'City Observer',
    minutes: 6,
  },
  {
    id: 'a2',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    titleZh: '校园里的小型创意实验',
    titleEn: 'Small creative experiments on campus',
    excerptZh: '低成本材料也能做出可复用的原型。',
    excerptEn: 'Low-cost materials can still yield reusable prototypes.',
    authorZh: '校园创意站',
    authorEn: 'Campus Maker Desk',
    minutes: 8,
  },
  {
    id: 'a3',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    titleZh: '让旧设备重新进入日常生活',
    titleEn: 'Bringing old gear back into daily life',
    excerptZh: '修复与再设计，让器物继续服务日常。',
    excerptEn: 'Repair and redesign keep objects useful every day.',
    authorZh: '技术生活志',
    authorEn: 'Tech Living Journal',
    minutes: 7,
  },
];

export const DEMO_READ_LATER = {
  image:
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80',
  titleZh: '城市建筑中的光与空间',
  titleEn: 'Light and space in urban architecture',
  excerptZh: '光线如何塑造空间体验与停留意愿。',
  excerptEn: 'How light shapes spatial experience and dwell time.',
  minutes: 5,
};

/** Scripted attention hotspots for the 2-minute Demo Day path. */
export const DEMO_HOTSPOTS: DemoHotspot[] = [
  {
    id: 'autoplay',
    hookId: 'A1',
    severity: 'high',
    titleZh: '自动连续播放',
    titleEn: 'Auto-play next',
    evidenceZh: '视频区显示「5秒后自动播放下一条」，默认连播。',
    evidenceEn:
      'Player shows “auto-play next in 5s” — continuous playback by default.',
    impactZh: '削弱「这一条看完就停」的主动决策，延长会话。',
    impactEn:
      'Weakens the conscious choice to stop after one item and extends sessions.',
    suggestionZh: '默认关闭自动连播；需要时由用户主动开启。',
    suggestionEn: 'Default autoplay off; let users opt in intentionally.',
  },
  {
    id: 'infinite',
    hookId: 'A1',
    severity: 'high',
    titleZh: '自动加载内容',
    titleEn: 'Auto-load content',
    evidenceZh: '信息流底部「正在加载更多内容…」，没有停顿点。',
    evidenceEn:
      'Feed footer says “Loading more…” with no explicit stopping cue.',
    impactZh: '消除自然边界，让人难以感知「已经看够了」。',
    impactEn:
      'Removes natural boundaries so “enough for now” is hard to feel.',
    suggestionZh: '改为「加载更多」按钮，让继续浏览需要一次主动点击。',
    suggestionEn: 'Replace with a Load more button that requires an intentional tap.',
  },
  {
    id: 'streak',
    hookId: 'C1',
    severity: 'medium',
    titleZh: '持续召回提示',
    titleEn: 'Persistent recall prompts',
    evidenceZh: '右侧「连续浏览 7 天」与通知角标制造回访压力。',
    evidenceEn:
      '“7-day streak” widget and notification badge pressure return visits.',
    impactZh: '用社交/承诺压力把注意力拉回产品。',
    impactEn: 'Uses social/commitment pressure to pull attention back.',
    suggestionZh: '降低角标视觉强度；去掉惩罚式连胜文案。',
    suggestionEn: 'Lower badge intensity; drop guilt-framed streak copy.',
  },
];

export const DEMO_REDUCTIONS = [
  {
    zh: '已关闭自动连续播放',
    en: 'Autoplay next turned off',
  },
  {
    zh: '已增加内容停止点',
    en: 'Added a content stopping point',
  },
  {
    zh: '已降低通知视觉强度',
    en: 'Reduced notification visual intensity',
  },
] as const;
