export type DimensionId = 'A' | 'B' | 'C' | 'D' | 'E';

export type HookPatternId =
  | 'A1'
  | 'A2'
  | 'B1'
  | 'B2'
  | 'C1'
  | 'C2'
  | 'C3'
  | 'D1'
  | 'D2'
  | 'E1'
  | 'E2';

export type HookDimension = {
  id: DimensionId;
  nameEn: string;
  nameZh: string;
  blurbEn: string;
  blurbZh: string;
};

export type HookPattern = {
  id: HookPatternId;
  dimensionId: DimensionId;
  nameEn: string;
  nameZh: string;
  blurbEn: string;
  blurbZh: string;
  mechanismEn: string;
  mechanismZh: string;
  detectHintEn: string;
  detectHintZh: string;
};

/** 5 core strategies (CHI / dark-pattern research informed). */
export const HOOK_DIMENSIONS: HookDimension[] = [
  {
    id: 'A',
    nameEn: 'Boundary elimination & endless engagement',
    nameZh: '边界消除与无尽卷入',
    blurbEn: 'Remove natural stopping cues so sessions never feel finished.',
    blurbZh: '消除自然停顿点，让使用会话感觉永远没结束。',
  },
  {
    id: 'B',
    nameEn: 'Uncertainty & variable rewards',
    nameZh: '不确定性强化',
    blurbEn: 'Intermittent rewards and curiosity gaps keep checking compulsive.',
    blurbZh: '间歇性酬赏与信息差让人忍不住反复查看。',
  },
  {
    id: 'C',
    nameEn: 'Social & identity traps',
    nameZh: '社交强化与身份捆绑',
    blurbEn: 'Reciprocity, FOMO, and quantified approval bind identity to the product.',
    blurbZh: '互惠、错失恐惧与量化认可把自我价值绑在产品上。',
  },
  {
    id: 'D',
    nameEn: 'Investment & sunk-cost binding',
    nameZh: '沉没成本与承诺绑定',
    blurbEn: 'Accumulated progress and guilt make leaving feel expensive.',
    blurbZh: '累积进度与内疚感让离开显得代价很高。',
  },
  {
    id: 'E',
    nameEn: 'Attention hijacking',
    nameZh: '注意力劫持与突袭',
    blurbEn: 'Fake urgency and intrusive pings yank attention back.',
    blurbZh: '假性紧迫与侵入式提醒把注意力强行拉回。',
  },
];

/** 11 secondary patterns — shared by /patterns, Analyze picker, Vision detect. */
export const HOOK_PATTERNS: HookPattern[] = [
  {
    id: 'A1',
    dimensionId: 'A',
    nameEn: 'Missing stopping cues',
    nameZh: '停顿线缺失',
    blurbEn: 'No natural boundary — the feed or playlist keeps going.',
    blurbZh: '没有自然边界——信息流或播放列表持续延伸。',
    mechanismEn: 'Cognitive breakpoint deprivation; auto-navigation effect.',
    mechanismZh: '认知断点剥夺；自动导航效应。',
    detectHintEn:
      'Infinite scroll lists, endless card stacks, autoplay / next-episode chrome.',
    detectHintZh: '无限滚动列表、无尽卡片流、自动下一集/连播控件。',
  },
  {
    id: 'A2',
    dimensionId: 'A',
    nameEn: 'Friction removal',
    nameZh: '微交互摩擦消除',
    blurbEn: 'Near-zero effort to keep going or buy — impulses fire easily.',
    blurbZh: '继续刷或购买几乎零阻力，冲动极易被触发。',
    mechanismEn: 'Low cognitive resistance; Fogg Behavior Model triggers.',
    mechanismZh: '极低认知阻力；Fogg 行为模型式冲动触发。',
    detectHintEn:
      'One-tap buy, swipe-with-no-confirm, continuous gesture loops.',
    detectHintZh: '一键购买、无需确认的连滑、连续手势闭环。',
  },
  {
    id: 'B1',
    dimensionId: 'B',
    nameEn: 'Variable ratio rewards',
    nameZh: '随机多变酬赏',
    blurbEn: 'Unpredictable payoff from pull-to-refresh or opaque ranking.',
    blurbZh: '下拉刷新或不明排序带来不可预测的回报。',
    mechanismEn: 'Skinner-box schedules; intermittent dopamine stimulation.',
    mechanismZh: '斯金纳箱式可变比率；多巴胺间歇刺激。',
    detectHintEn:
      'Pull-to-refresh, loot/unbox UI, opaque “For You” recommendation rails.',
    detectHintZh: '下拉刷新、盲盒/开箱、不透明的「推荐/For You」流。',
  },
  {
    id: 'B2',
    dimensionId: 'B',
    nameEn: 'Curiosity gaps',
    nameZh: '悬念式微触发',
    blurbEn: 'Teasers without content force an open to resolve uncertainty.',
    blurbZh: '只给悬念不给内容，迫使点开消除不确定。',
    mechanismEn: 'Information Gap Theory.',
    mechanismZh: '信息差理论（Information Gap）。',
    detectHintEn:
      'Vague unread copy (“someone followed you”), red dots with no preview.',
    detectHintZh: '模糊未读文案（「有人关注了你」）、无预览红点。',
  },
  {
    id: 'C1',
    dimensionId: 'C',
    nameEn: 'Social reciprocity exploitation',
    nameZh: '社交亏欠与互惠',
    blurbEn: 'Read receipts and streaks pressure you to respond now.',
    blurbZh: '已读回执与连续打卡迫使你立刻回应。',
    mechanismEn: 'Norm of reciprocity; social pressure.',
    mechanismZh: '互惠规范；社交压力。',
    detectHintEn: 'Forced read receipts, streak / spark day counters.',
    detectHintZh: '强制已读状态、连续聊天火花/连击天数。',
  },
  {
    id: 'C2',
    dimensionId: 'C',
    nameEn: 'Fabricated FOMO',
    nameZh: '人造错失恐惧',
    blurbEn: 'Ephemeral or social-proof cues invent fear of missing out.',
    blurbZh: '限时或从众提示制造错失恐惧。',
    mechanismEn: 'Loss aversion; bandwagon effects.',
    mechanismZh: '损失厌恶；从众效应。',
    detectHintEn:
      'Stories timers, “X also bought” / live social-proof toasts.',
    detectHintZh: 'Stories 限时、弹幕/「XX 也购买了」社会证明。',
  },
  {
    id: 'C3',
    dimensionId: 'C',
    nameEn: 'Quantified approval',
    nameZh: '社交认可量化',
    blurbEn: 'Public counters turn approval into a scoreboard.',
    blurbZh: '公开计数把认可变成排行榜。',
    mechanismEn: 'Extrinsic motivation crowding out; self-worth projection.',
    mechanismZh: '外部动机替代；自我价值投射。',
    detectHintEn: 'Like/tip leaderboards, large public follower/view counts.',
    detectHintZh: '点赞/打赏排行榜、显眼的公开粉丝/播放数。',
  },
  {
    id: 'D1',
    dimensionId: 'D',
    nameEn: 'Labor & asset accumulation',
    nameZh: '劳力与资产累积',
    blurbEn: 'Levels, medals, farms — progress that is hard to abandon.',
    blurbZh: '等级、勋章、农场——难以放弃的进度资产。',
    mechanismEn: 'IKEA effect; sunk-cost fallacy.',
    mechanismZh: '宜家效应；沉没成本谬误。',
    detectHintEn:
      'Check-in trees, non-portable levels/badges, virtual farm progress.',
    detectHintZh: '签到树、不可迁移等级/勋章、虚拟农场进度。',
  },
  {
    id: 'D2',
    dimensionId: 'D',
    nameEn: 'Exit guilt & loss triggers',
    nameZh: '退出内疚与惩罚',
    blurbEn: 'Leaving or breaking a streak is framed as a personal loss.',
    blurbZh: '离开或中断连击被表述为个人损失。',
    mechanismEn: 'Confirmshaming; guilt-tripping.',
    mechanismZh: '确认羞辱；情绪勒索。',
    detectHintEn:
      'Cancel/delete guilt copy (“you’ll lose privileges”), streak-reset threats.',
    detectHintZh: '注销威胁文案（「放弃特权你将失去…」）、连击中断重置提示。',
  },
  {
    id: 'E1',
    dimensionId: 'E',
    nameEn: 'Artificial urgency',
    nameZh: '假性紧迫感',
    blurbEn: 'Fake timers and scarcity push rushed decisions.',
    blurbZh: '虚假倒计时与稀缺提示推动仓促决策。',
    mechanismEn: 'Scarcity heuristic.',
    mechanismZh: '稀缺性启发式。',
    detectHintEn: 'Countdown timers, baseless low-stock alerts.',
    detectHintZh: '虚假倒计时、无依据的库存告急。',
  },
  {
    id: 'E2',
    dimensionId: 'E',
    nameEn: 'Intrusive ping triggers',
    nameZh: '侵入式嗅探通知',
    blurbEn: 'Non-core pings and night recalls interrupt for re-entry.',
    blurbZh: '非核心推送与夜间召回打断生活以拉回 App。',
    mechanismEn: 'Orienting reflex; habit interruption.',
    mechanismZh: '警戒反应；习惯性打断。',
    detectHintEn:
      'Aggressive push/banner chrome for trivial events, high-frequency recall cues.',
    detectHintZh: '非核心事件的强提醒条、高频召回提示。',
  },
];

const LEGACY_HOOK_MAP: Record<string, HookPatternId> = {
  infinite: 'A1',
  autoplay: 'A1',
  related: 'B1',
  badge: 'B2',
};

export function migrateHookId(id: string): HookPatternId | undefined {
  if (HOOK_PATTERNS.some((h) => h.id === id)) {
    return id as HookPatternId;
  }
  return LEGACY_HOOK_MAP[id];
}

export function getHookPattern(id: string): HookPattern | undefined {
  const migrated = migrateHookId(id);
  if (!migrated) return undefined;
  return HOOK_PATTERNS.find((h) => h.id === migrated);
}

export function getHookDimension(id: DimensionId): HookDimension | undefined {
  return HOOK_DIMENSIONS.find((d) => d.id === id);
}

export function patternsByDimension(dimensionId: DimensionId): HookPattern[] {
  return HOOK_PATTERNS.filter((h) => h.dimensionId === dimensionId);
}

export function formatHookOptionLabel(
  hook: HookPattern,
  locale: string
): string {
  const isZh = locale.startsWith('zh');
  const name = isZh ? hook.nameZh : hook.nameEn;
  return `${hook.id} · ${name}`;
}
