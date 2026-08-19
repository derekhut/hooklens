import type { HookPatternId } from './hooks';

export type DemoBadgeTone = 'orange' | 'purple' | 'blue';

export type DemoHotspotId =
  | 'hero'
  | 'autoplay'
  | 'cards'
  | 'streak'
  | 'trending'
  | 'readlater'
  | 'notify'
  | 'bookmark'
  | 'infinite';

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
  n: number;
  tone: DemoBadgeTone;
  hookId: HookPatternId;
  titleZh: string;
  titleEn: string;
  blurbZh: string;
  blurbEn: string;
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

/** Scripted markers — no model calls. Numbers match the mock report. */
export const DEMO_HOTSPOTS: DemoHotspot[] = [
  {
    id: 'hero',
    n: 1,
    tone: 'orange',
    hookId: 'E2',
    titleZh: '大幅动态内容',
    titleEn: 'Large motion hero',
    blurbZh: '全屏画面抢占第一视觉焦点，还没选择就开始看。',
    blurbEn: 'Full-bleed motion seizes the first glance before you choose.',
  },
  {
    id: 'autoplay',
    n: 2,
    tone: 'orange',
    hookId: 'A1',
    titleZh: '5秒自动切换',
    titleEn: '5s auto-advance',
    blurbZh: '倒计时默认连播，削弱「看完这一条就停」的决策。',
    blurbEn: 'A countdown auto-plays the next item, weakening the choice to stop.',
  },
  {
    id: 'cards',
    n: 3,
    tone: 'orange',
    hookId: 'B1',
    titleZh: '图文卡片 + 阅读时长',
    titleEn: 'Cards + read time',
    blurbZh: '缩略图、摘要与分钟数组成可变奖励，诱使点开下一张。',
    blurbEn: 'Thumbnails, blurbs and minute counts form a variable-reward loop.',
  },
  {
    id: 'streak',
    n: 4,
    tone: 'purple',
    hookId: 'C1',
    titleZh: '连续浏览 7 天',
    titleEn: '7-day streak',
    blurbZh: '用连胜压力把回访包装成必须完成的任务。',
    blurbEn: 'A streak frames coming back as a task you must not break.',
  },
  {
    id: 'trending',
    n: 5,
    tone: 'purple',
    hookId: 'C2',
    titleZh: '正在热门',
    titleEn: 'Trending now',
    blurbZh: '排行制造错失恐惧，暗示「别人都在看」。',
    blurbEn: 'Ranked lists invent FOMO — everyone else is already watching.',
  },
  {
    id: 'readlater',
    n: 6,
    tone: 'purple',
    hookId: 'D1',
    titleZh: '稍后阅读',
    titleEn: 'Read later',
    blurbZh: '未读清单变成沉没成本，让人觉得必须回来清空。',
    blurbEn: 'A unread pile becomes sunk cost you feel obliged to clear.',
  },
  {
    id: 'notify',
    n: 7,
    tone: 'blue',
    hookId: 'B2',
    titleZh: '未读红点',
    titleEn: 'Unread badge',
    blurbZh: '角标只给悬念不给内容，迫使点开消除不确定。',
    blurbEn: 'A badge teases without content, forcing a tap to resolve it.',
  },
  {
    id: 'bookmark',
    n: 8,
    tone: 'blue',
    hookId: 'A2',
    titleZh: '一键收藏',
    titleEn: 'One-tap save',
    blurbZh: '几乎零阻力的收藏，把「以后再看」变成无尽待办。',
    blurbEn: 'Near-zero-friction save turns “later” into an endless backlog.',
  },
  {
    id: 'infinite',
    n: 9,
    tone: 'purple',
    hookId: 'A1',
    titleZh: '持续加载更多',
    titleEn: 'Keep loading',
    blurbZh: '没有停顿点，会话感觉永远不会结束。',
    blurbEn: 'No stopping cue — the session never feels finished.',
  },
];

export const DEMO_STRONG_HOOKS = [1, 2, 4] as const;
