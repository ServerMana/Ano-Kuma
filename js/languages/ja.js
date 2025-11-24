/**
 * ja.js
 * 日本語テキスト
 */

const LanguageJA = {
    // ゲームタイトル
    gameTitle: 'あのクマは人間になりたい',
    
    // メインメニュー
    startGame: 'ゲーム開始',
    settings: '設定',
    
    // オープニング
    tutorialQuestion: 'オープニングを見ますか？',
    yes: 'はい',
    no: 'いいえ',
    
    // ポーズメニュー
    paused: '一時停止',
    resume: '続ける',
    restart: '再スタート',
    toMain: 'メインメニュー',
    
    // 設定
    bgmVolume: 'BGM音量',
    seVolume: 'SE音量',
    back: '戻る',
    
    // ゲーム内
    stage: 'ステージ',
    
    // 操作方法
    controlMove: '← → : 移動',
    controlJump: 'Space : ジャンプ',
    controlPause: 'ESC : 一時停止',
    controlDebug: 'F3 : デバッグ'
};

if (typeof window !== 'undefined') {
    window.LanguageJA = LanguageJA;
}
