export type HooklensSample = {
  id: string;
  imageUrl: string;
  appNameEn: string;
  appNameZh: string;
  titleEn: string;
  titleZh: string;
};

/** Wireframe placeholders only — not real app UI. */
export const HOOKLENS_SAMPLES: HooklensSample[] = [
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
