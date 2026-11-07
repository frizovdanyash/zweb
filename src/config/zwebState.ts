/**
 * zWeb — состояние фирменных настроек.
 *
 * Всё, что zWeb добавляет к Telegram Web K, живёт одним объектом `settings.zweb`
 * в общем хранилище (`appSettings`). Так настройки переезжают между браузерами
 * синхронно с остальными параметрами аккаунта и не теряются после перезагрузки.
 */

export type ZWebPushService = 'auto' | 'webpush' | 'off';

export type ZWebState = {
  // ── Сеть и загрузка ──────────────────────────────────────────────────────
  downloadSpeed: 'off' | 'fast' | 'ultra';
  uploadBoost: boolean;
  useIPv6: boolean;
  dnsType: 'system' | 'google' | 'cloudflare' | 'custom';
  customDoH: string;
  parallelDownloads: number;
  saveToChatSubfolder: boolean;
  savePath: string;
  autoRetryUploads: boolean;

  // ── Аккаунт для ботов ───────────────────────────────────────────────────
  botPrivacyEnabled: boolean;
  botPrivacyAlwaysAsk: boolean;
  botPrivacyAccount: string;

  // ── Профиль ─────────────────────────────────────────────────────────────
  relativeLastSeen: boolean;
  hidePhone: boolean;
  showIdAndDc: boolean;
  showRegistrationDate: boolean;

  // ── Список чатов и архив ────────────────────────────────────────────────
  sortByUnread: boolean;
  unlimitedPinned: boolean;
  hideArchive: boolean;
  archiveOnPull: boolean;
  disableUnarchiveSwipe: boolean;
  showSenderMiniAvatars: boolean;
  showFolderCounters: boolean;

  // ── Уведомления ─────────────────────────────────────────────────────────
  pushService: ZWebPushService;
  inAppVibration: boolean;
  notificationBubbles: boolean;
  keepNotificationsForDeleted: boolean;

  // ── Внешний вид zWeb ────────────────────────────────────────────────────
  avatarCorners: number;
  sectionRadius: number;
  forceSnow: boolean;
  centerTitle: boolean;
  customTitle: string;
  hideSearchBar: boolean;
  hideStories: boolean;
  hideFloatingButton: boolean;
  m3ListItems: boolean;
  removeMessageTail: boolean;

  // ── Чаты ────────────────────────────────────────────────────────────────
  doubleTapReaction: boolean;
  doubleTapReactionEmoji: string;
  hideReactions: boolean;
  hideReactionsChannels: boolean;
  hideReactionsGroups: boolean;
  hideReactionsPrivate: boolean;
  hideShareButton: boolean;
  hideGiftButton: boolean;
  hideSearchButton: boolean;
  hideCallButton: boolean;
  hideSendAsPeer: boolean;
  keepAttachButton: boolean;
  disableGreetingSticker: boolean;
  adminShortcuts: boolean;
  disableGlobalSearch: boolean;
  tapToSwitchRecord: boolean;
  alwaysSendInHD: boolean;
  rememberLastUsedCamera: boolean;
  preferOriginalQuality: boolean;
  pauseOnMinimize: boolean;
  swipeToPip: boolean;
  unmuteWithVolumeButtons: boolean;
  doubleTapSeekDuration: number;
  stickerSize: number;
  unreadCapsule: boolean;
  replaceEditedWithIcon: boolean;
  showResultsBeforeVoting: boolean;
  quickTransitions: boolean;
  seamlessSwitching: boolean;
  mediaMenuSave: boolean;
  mediaMenuCopyPhoto: boolean;
  mediaMenuRepeat: boolean;
  mediaMenuClear: boolean;
  hideKeyboardOnScroll: boolean;
  hideTimeOnStickers: boolean;
  disableProximityEvents: boolean;

  // ── AyuMoments ──────────────────────────────────────────────────────────
  saveDeletedMessages: boolean;
  saveEditedMessages: boolean;
  ghostMode: boolean;
  ghostExceptions: string;
  messageFilters: string;
  keepDeletedDays: number;

  // ── Плагины ─────────────────────────────────────────────────────────────
  pluginsEnabled: boolean;
  pluginsSafeMode: boolean;
  pluginsUnsafeMode: boolean;
  pluginsDeveloperMode: boolean;
  pluginsCompactView: boolean;
  pluginGrants: {[pluginId: string]: ZWebPluginGrant};

  // ── Навигация ───────────────────────────────────────────────────────────
  bottomNavigation: boolean;
  bottomNavigationMode: 'show' | 'hide';
  tabsInSidebar: boolean;
};

export type ZWebPluginGrant = {
  enabled: boolean;
  network: boolean;
  files: boolean;
  messagesRead: boolean;
  messagesSend: boolean;
  intents: boolean;
  settings: boolean;
};

export const DEFAULT_ZWEB_STATE: ZWebState = {
  downloadSpeed: 'fast', uploadBoost: false, useIPv6: true, dnsType: 'system',
  customDoH: '', parallelDownloads: 3, saveToChatSubfolder: false, savePath: 'zWeb',
  autoRetryUploads: true,
  botPrivacyEnabled: false, botPrivacyAlwaysAsk: true, botPrivacyAccount: '',
  relativeLastSeen: false, hidePhone: false, showIdAndDc: false, showRegistrationDate: false,
  sortByUnread: false, unlimitedPinned: false, hideArchive: false, archiveOnPull: true,
  disableUnarchiveSwipe: false, showSenderMiniAvatars: true, showFolderCounters: true,
  pushService: 'auto', inAppVibration: true, notificationBubbles: true, keepNotificationsForDeleted: false,
  avatarCorners: 100, sectionRadius: 50, forceSnow: false, centerTitle: false, customTitle: '',
  hideSearchBar: false, hideStories: false, hideFloatingButton: false, m3ListItems: false,
  removeMessageTail: false,
  doubleTapReaction: false, doubleTapReactionEmoji: '❤', hideReactions: false,
  hideReactionsChannels: false, hideReactionsGroups: false, hideReactionsPrivate: false,
  hideShareButton: false, hideGiftButton: false, hideSearchButton: false, hideCallButton: false,
  hideSendAsPeer: false, keepAttachButton: true, disableGreetingSticker: false, adminShortcuts: false,
  disableGlobalSearch: false, tapToSwitchRecord: false, alwaysSendInHD: true,
  rememberLastUsedCamera: false, preferOriginalQuality: false, pauseOnMinimize: true,
  swipeToPip: true, unmuteWithVolumeButtons: true, doubleTapSeekDuration: 5, stickerSize: 14,
  unreadCapsule: false, replaceEditedWithIcon: false, showResultsBeforeVoting: false,
  quickTransitions: true, seamlessSwitching: true, mediaMenuSave: true, mediaMenuCopyPhoto: true,
  mediaMenuRepeat: true, mediaMenuClear: true, hideKeyboardOnScroll: false, hideTimeOnStickers: false,
  disableProximityEvents: false,
  saveDeletedMessages: false, saveEditedMessages: false, ghostMode: false, ghostExceptions: '',
  messageFilters: '', keepDeletedDays: 30,
  pluginsEnabled: true, pluginsSafeMode: false, pluginsUnsafeMode: false,
  pluginsDeveloperMode: false, pluginsCompactView: false, pluginGrants: {},
  bottomNavigation: false, bottomNavigationMode: 'show', tabsInSidebar: false
};

export const DEFAULT_PLUGIN_GRANT: ZWebPluginGrant = {
  enabled: true, network: false, files: false, messagesRead: false,
  messagesSend: false, intents: false, settings: false
};

export const ZWEB_NAME = 'zWeb';
export const ZWEB_AUTHOR_USERNAME = 'frizovdanya';
export const ZWEB_AUTHOR_URL = 'https://t.me/' + ZWEB_AUTHOR_USERNAME;
export const ZWEB_REPO_URL = 'https://github.com/frizovdanyash/zweb';
export const ZWEB_DOCS_URL = 'https://github.com/frizovdanyash/zweb/blob/main/docs/PLUGINS.md';
