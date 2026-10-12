import { useConfig } from './states';

export const languageSettings = ['auto', 'ko', 'en', 'ja'] as const;
export type LanguageSetting = (typeof languageSettings)[number];
export type Language = Exclude<LanguageSetting, 'auto'>;

const en = {
  nav: { home: 'Home', settings: 'Settings', about: 'About' },
  loading: 'Loading...',
  update: {
    available: (version: string) => `Version ${version} is available`,
    download: 'Download',
    dismiss: 'Dismiss update notice',
  },
  home: {
    connected: 'Connected',
    disconnected: 'Disconnected',
    restartServer: 'Restart server',
    reconnect: 'Reconnect',
  },
  failures: {
    noWidgetId: 'No widget ID set',
    noWebSocketUrl: 'Failed to get WebSocket URL',
  },
  settings: {
    tabs: { source: 'Source', osc: 'OSC', parameters: 'Params', general: 'General' },
    titles: { source: 'Heart rate source', osc: 'OSC output', parameters: 'Parameters', general: 'General' },
    source: 'Source',
    httpPort: 'HTTP server port',
    httpHint: (url: string) => `POST bpm as text to ${url}`,
    widgetId: 'Widget ID',
    widgetHint: (host: string) => `Find your widget ID at ${host}`,
    timeout: 'Connected timeout (seconds)',
    timeoutHint: 'Disconnected after this long without data',
    host: 'Host',
    port: 'Port',
    defaultValue: (value: string | number) => `Default: ${value}`,
    connectedParameter: 'Connected parameter',
    percentParameter: 'Percent parameter',
    maxHeartRate: 'Max heart rate',
    maxHeartRateHint: 'Percent = bpm / max heart rate',
    language: 'Language',
    auto: 'Auto',
    saving: 'Saving...',
    saved: 'Saved',
  },
  errors: {
    port: 'Enter a port from 1 to 65535',
    positive: 'Enter a number greater than 0',
    seconds: 'Enter a whole number of seconds (1 or more)',
    required: 'Required',
    save: 'Could not save',
  },
  about: { support: 'Support the developer' },
};

export type Strings = typeof en;

const ko: Strings = {
  nav: { home: '홈', settings: '설정', about: '정보' },
  loading: '불러오는 중...',
  update: {
    available: (version: string) => `새 버전 ${version} 출시`,
    download: '다운로드',
    dismiss: '업데이트 알림 닫기',
  },
  home: {
    connected: '연결됨',
    disconnected: '연결 끊김',
    restartServer: '서버 재시작',
    reconnect: '다시 연결',
  },
  failures: {
    noWidgetId: '위젯 ID가 설정되지 않음',
    noWebSocketUrl: 'WebSocket URL을 가져오지 못함',
  },
  settings: {
    tabs: { source: '소스', osc: 'OSC', parameters: '파라미터', general: '일반' },
    titles: { source: '심박수 소스', osc: 'OSC 출력', parameters: '파라미터', general: '일반' },
    source: '소스',
    httpPort: 'HTTP 서버 포트',
    httpHint: (url: string) => `${url}에 bpm 텍스트를 POST`,
    widgetId: '위젯 ID',
    widgetHint: (host: string) => `${host}에서 위젯 ID 확인`,
    timeout: '연결 제한 시간(초)',
    timeoutHint: '이 시간 동안 데이터가 없으면 연결 끊김',
    host: '호스트',
    port: '포트',
    defaultValue: (value: string | number) => `기본값: ${value}`,
    connectedParameter: '연결 파라미터',
    percentParameter: '퍼센트 파라미터',
    maxHeartRate: '최대 심박수',
    maxHeartRateHint: '퍼센트 = bpm / 최대 심박수',
    language: '언어',
    auto: '자동',
    saving: '저장 중...',
    saved: '저장됨',
  },
  errors: {
    port: '1~65535 사이의 포트를 입력하세요',
    positive: '0보다 큰 숫자를 입력하세요',
    seconds: '1 이상의 정수(초)를 입력하세요',
    required: '필수 항목입니다',
    save: '저장하지 못했습니다',
  },
  about: { support: '개발자 후원하기' },
};

const ja: Strings = {
  nav: { home: 'ホーム', settings: '設定', about: '情報' },
  loading: '読み込み中...',
  update: {
    available: (version: string) => `新しいバージョン ${version} があります`,
    download: 'ダウンロード',
    dismiss: '更新のお知らせを閉じる',
  },
  home: {
    connected: '接続中',
    disconnected: '未接続',
    restartServer: 'サーバー再起動',
    reconnect: '再接続',
  },
  failures: {
    noWidgetId: 'ウィジェットIDが未設定です',
    noWebSocketUrl: 'WebSocket URLを取得できません',
  },
  settings: {
    tabs: { source: 'ソース', osc: 'OSC', parameters: 'パラメータ', general: '一般' },
    titles: { source: '心拍数ソース', osc: 'OSC出力', parameters: 'パラメータ', general: '一般' },
    source: 'ソース',
    httpPort: 'HTTPサーバーポート',
    httpHint: (url: string) => `${url} にbpmをテキストでPOST`,
    widgetId: 'ウィジェットID',
    widgetHint: (host: string) => `${host} でウィジェットIDを確認`,
    timeout: '接続タイムアウト(秒)',
    timeoutHint: 'この時間データがなければ未接続',
    host: 'ホスト',
    port: 'ポート',
    defaultValue: (value: string | number) => `既定値: ${value}`,
    connectedParameter: '接続パラメータ',
    percentParameter: '割合パラメータ',
    maxHeartRate: '最大心拍数',
    maxHeartRateHint: '割合 = bpm / 最大心拍数',
    language: '言語',
    auto: '自動',
    saving: '保存中...',
    saved: '保存済み',
  },
  errors: {
    port: '1〜65535のポートを入力してください',
    positive: '0より大きい数値を入力してください',
    seconds: '1以上の整数(秒)を入力してください',
    required: '必須項目です',
    save: '保存できませんでした',
  },
  about: { support: '開発者を支援する' },
};

const strings: Record<Language, Strings> = { en, ko, ja };

const osLanguage = (): Language => {
  const tag = navigator.language.toLowerCase();
  return tag.startsWith('ko') ? 'ko' : tag.startsWith('ja') ? 'ja' : 'en';
};

const resolveLanguage = (setting: LanguageSetting): Language => (setting === 'auto' ? osLanguage() : setting);

export const useLanguage = () => resolveLanguage(useConfig((state) => state.config?.language ?? 'auto'));

export const useStrings = () => strings[useLanguage()];
