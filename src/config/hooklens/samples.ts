export type HooklensSample = {
  id: string;
  imageUrl: string;
  appNameEn: string;
  appNameZh: string;
  titleEn: string;
  titleZh: string;
};

/** Sample screenshots for Analyze. Looply is a captured feed UI, not a live app. */
export const HOOKLENS_SAMPLES: HooklensSample[] = [
  {
    id: 'looply',
    imageUrl: '/imgs/hooklens/samples/looply.png',
    appNameEn: 'Looply',
    appNameZh: 'Looply',
    titleEn: 'Feed with autoplay & streaks',
    titleZh: '自动播放与连续浏览',
  },
  {
    id: 'feed',
    imageUrl: '/imgs/hooklens/samples/feed.svg',
    appNameEn: 'Feed App',
    appNameZh: '信息流 App',
    titleEn: 'Infinite feed',
    titleZh: '无限信息流',
  },
  {
    id: 'social',
    imageUrl: '/imgs/hooklens/samples/social.svg',
    appNameEn: 'Social App',
    appNameZh: '社交 App',
    titleEn: 'Badges & alerts',
    titleZh: '红点与提醒',
  },
  {
    id: 'video',
    imageUrl: '/imgs/hooklens/samples/video.svg',
    appNameEn: 'Video App',
    appNameZh: '视频 App',
    titleEn: 'Autoplay video',
    titleZh: '自动播放视频',
  },
];
