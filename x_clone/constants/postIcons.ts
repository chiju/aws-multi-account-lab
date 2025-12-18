export const POST_ICONS = {
  comment: { src: '/svg/comment.svg', name: 'Comment' },
  repost: { src: '/svg/repost.svg', name: 'Repost' },
  share: { src: '/svg/share.svg', name: 'Share' },
  bookmark: { src: '/icons/bookmark.svg', name: 'Bookmark' },
  like: { src: '/svg/like.svg', name: 'Like' },
  save: { src: '/svg/save.svg', name: 'Save' }
} as const;

export type PostIconType = keyof typeof POST_ICONS;
