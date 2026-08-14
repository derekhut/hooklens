export type HookPatternId =
  | 'infinite'
  | 'badge'
  | 'related'
  | 'autoplay';

export type HookPattern = {
  id: HookPatternId;
  nameEn: string;
  nameZh: string;
  blurbEn: string;
  blurbZh: string;
};

/** Shared dictionary for /patterns and /analyze annotation picker. */
export const HOOK_PATTERNS: HookPattern[] = [
  {
    id: 'infinite',
    nameEn: 'Infinite scroll',
    nameZh: '无限滚动',
    blurbEn: 'No landing, no done — the feed keeps growing.',
    blurbZh: '没有终点，信息流不断加载。',
  },
  {
    id: 'badge',
    nameEn: 'Unread / inbox badge',
    nameZh: '未读 / 红点提醒',
    blurbEn: 'Red counts and unread chrome that pull you back open.',
    blurbZh: '红点与未读数字把你拉回去打开。',
  },
  {
    id: 'related',
    nameEn: 'Related / continue chrome',
    nameZh: '相关推荐 / 继续看',
    blurbEn: 'Similar posts and continue modules that start another rabbit hole.',
    blurbZh: '相似内容与「继续看」模块开启下一条兔洞。',
  },
  {
    id: 'autoplay',
    nameEn: 'Autoplay / inline video',
    nameZh: '自动播放 / 内嵌视频',
    blurbEn: 'Zero decision to continue watching.',
    blurbZh: '无需决定就继续看下去。',
  },
];

export function getHookPattern(id: string): HookPattern | undefined {
  return HOOK_PATTERNS.find((h) => h.id === id);
}
