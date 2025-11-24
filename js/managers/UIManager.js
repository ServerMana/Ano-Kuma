/**
 * UIManager.js
 * UI 관리 및 이벤트 처리
 */

const UIManager = {
    // UI 요소들
    elements: {
        // 메뉴
        mainMenu: null,
        pauseMenu: null,
        settingsMenu: null,
        tutorialDialog: null,
        gameHud: null,
        
        // 버튼
        btnStartGame: null,
        btnSettings: null,
        btnResume: null,
        btnRestart: null,
        btnToMain: null,
        btnSettingsBack: null,
        btnTutorialYes: null,
        btnTutorialNo: null,
        
        // 언어 버튼
        btnLangKo: null,
        btnLangEn: null,
        btnLangJa: null,
        
        // 설정 요소
        bgmVolume: null,
        seVolume: null,
        bgmValue: null,
        seValue: null,
        
        // HUD
        stageName: null,
        fpsCounter: null,
        positionInfo: null,
        
        // 기타
        titleBackground: null
    },
    
    // 현재 언어
    currentLanguage: 'ko',
    
    /**
     * 초기화
     */
    init: function() {
        console.log('[UIManager] 초기화 시작');
        
        // 요소 참조
        this.elements.mainMenu = document.getElementById('main-menu');
        this.elements.pauseMenu = document.getElementById('pause-menu');
        this.elements.settingsMenu = document.getElementById('settings-menu');
        this.elements.tutorialDialog = document.getElementById('tutorial-dialog');
        this.elements.gameHud = document.getElementById('game-hud');
        this.elements.titleBackground = document.querySelector('.title-background');
        
        // 버튼
        this.elements.btnStartGame = document.getElementById('btn-start-game');
        this.elements.btnSettings = document.getElementById('btn-settings');
        this.elements.btnDebugMap = document.getElementById('btn-debug-map');
        this.elements.btnResume = document.getElementById('btn-resume');
        this.elements.btnRestart = document.getElementById('btn-restart');
        this.elements.btnToMain = document.getElementById('btn-to-main');
        this.elements.btnSettingsBack = document.getElementById('btn-settings-back');
        this.elements.btnTutorialYes = document.getElementById('btn-tutorial-yes');
        this.elements.btnTutorialNo = document.getElementById('btn-tutorial-no');
        
        // 언어 버튼
        this.elements.btnLangKo = document.getElementById('btn-lang-ko');
        this.elements.btnLangEn = document.getElementById('btn-lang-en');
        this.elements.btnLangJa = document.getElementById('btn-lang-ja');
        
        // 설정
        this.elements.bgmVolume = document.getElementById('bgm-volume');
        this.elements.seVolume = document.getElementById('se-volume');
        this.elements.bgmValue = document.getElementById('bgm-value');
        this.elements.seValue = document.getElementById('se-value');
        
        // HUD
        this.elements.stageName = document.getElementById('stage-name');
        this.elements.fpsCounter = document.getElementById('fps-counter');
        this.elements.positionInfo = document.getElementById('position-info');
        
        // 이벤트 리스너 등록
        this.setupEventListeners();
        
        // 초기 언어 설정
        this.setLanguage('ko');
        
        console.log('[UIManager] 초기화 완료');
    },
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners: function() {
        // 메인 메뉴 버튼
        this.elements.btnStartGame?.addEventListener('click', () => this.onStartGame());
        this.elements.btnSettings?.addEventListener('click', () => this.openSettings());
        this.elements.btnDebugMap?.addEventListener('click', () => this.onDebugMap());
        
        // 일시정지 메뉴 버튼
        this.elements.btnResume?.addEventListener('click', () => this.onResume());
        this.elements.btnRestart?.addEventListener('click', () => this.onRestart());
        this.elements.btnToMain?.addEventListener('click', () => this.onToMain());
        
        // 설정 메뉴
        this.elements.btnSettingsBack?.addEventListener('click', () => this.closeSettings());
        this.elements.bgmVolume?.addEventListener('input', (e) => this.onBGMVolumeChange(e));
        this.elements.seVolume?.addEventListener('input', (e) => this.onSEVolumeChange(e));
        
        // 튜토리얼 다이얼로그
        this.elements.btnTutorialYes?.addEventListener('click', () => this.onTutorialYes());
        this.elements.btnTutorialNo?.addEventListener('click', () => this.onTutorialNo());
        
        // 언어 선택
        this.elements.btnLangKo?.addEventListener('click', () => this.setLanguage('ko'));
        this.elements.btnLangEn?.addEventListener('click', () => this.setLanguage('en'));
        this.elements.btnLangJa?.addEventListener('click', () => this.setLanguage('ja'));
        
        // 키보드 입력
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // 탭 전환 감지 (일시정지)
        document.addEventListener('visibilitychange', () => this.onVisibilityChange());
        
        console.log('[UIManager] 이벤트 리스너 등록 완료');
    },
    
    /**
     * 게임 시작 버튼
     */
    onStartGame: function() {
        console.log('[UIManager] 게임 시작 버튼 클릭');
        
        // 튜토리얼 다이얼로그 표시
        this.showTutorialDialog();
    },
    
    /**
     * 튜토리얼 다이얼로그 표시
     */
    showTutorialDialog: function() {
        const questionText = document.getElementById('tutorial-question');
        
        if (questionText && window.LanguageManager) {
            questionText.textContent = window.LanguageManager.getText('tutorialQuestion');
        }
        
        this.elements.tutorialDialog?.classList.remove('hidden');
        GameState.setState(GameState.TUTORIAL_DIALOG);
    },
    
    /**
     * 튜토리얼 "예" 선택
     */
    onTutorialYes: function() {
        console.log('[UIManager] 오프닝 선택');
        this.elements.tutorialDialog?.classList.add('hidden');
        
        // 오프닝 미구현 알림
        alert('오프닝은 아직 미구현입니다.');
        
        // 다이얼로그 다시 표시
        this.elements.tutorialDialog?.classList.remove('hidden');
    },
    
    /**
     * 튜토리얼 "아니오" 선택
     */
    onTutorialNo: function() {
        console.log('[UIManager] 튜토리얼 건너뛰기');
        this.elements.tutorialDialog?.classList.add('hidden');
        this.hideMenu();
        
        // 바로 스테이지 1 시작
        if (window.GameController) {
            window.GameController.startGame(false); // 일반 모드
        }
    },
    
    /**
     * 디버그 맵 시작
     */
    onDebugMap: function() {
        console.log('[UIManager] 디버그 맵 시작');
        
        // UI 숨기기
        this.hideMenu();
        
        // 게임 시작
        if (window.GameController) {
            window.GameController.startDebugMap();
        }
    },
    
    /**
     * 설정 열기
     */
    openSettings: function() {
        console.log('[UIManager] 설정 열기');
        
        if (GameState.is(GameState.MENU)) {
            this.elements.mainMenu?.classList.add('hidden');
        } else if (GameState.is(GameState.PAUSED)) {
            this.elements.pauseMenu?.classList.add('hidden');
        }
        
        this.elements.settingsMenu?.classList.remove('hidden');
        GameState.setState(GameState.SETTINGS);
    },
    
    /**
     * 설정 닫기
     */
    closeSettings: function() {
        console.log('[UIManager] 설정 닫기');
        
        this.elements.settingsMenu?.classList.add('hidden');
        
        if (GameState.previous === GameState.MENU) {
            this.elements.mainMenu?.classList.remove('hidden');
            GameState.setState(GameState.MENU);
        } else if (GameState.previous === GameState.PAUSED) {
            this.elements.pauseMenu?.classList.remove('hidden');
            GameState.setState(GameState.PAUSED);
        }
    },
    
    /**
     * 계속하기 (일시정지 해제)
     */
    onResume: function() {
        console.log('[UIManager] 게임 재개');
        this.elements.pauseMenu?.classList.add('hidden');
        this.elements.gameHud?.classList.remove('hidden');
        
        GameState.setState(GameState.PLAYING);
        DeltaTime.setPaused(false);
    },
    
    /**
     * 재시작
     */
    onRestart: function() {
        console.log('[UIManager] 게임 재시작');
        this.elements.pauseMenu?.classList.add('hidden');
        
        if (window.GameController) {
            window.GameController.restart();
        }
    },
    
    /**
     * 메인 메뉴로
     */
    onToMain: function() {
        console.log('[UIManager] 메인 메뉴로');
        this.elements.pauseMenu?.classList.add('hidden');
        this.elements.gameHud?.classList.add('hidden');
        this.showMenu();
        
        GameState.setState(GameState.MENU);
        DeltaTime.setPaused(true);
        
        if (window.GameController) {
            window.GameController.reset();
        }
    },
    
    /**
     * BGM 볼륨 변경
     */
    onBGMVolumeChange: function(event) {
        const value = event.target.value;
        if (this.elements.bgmValue) {
            this.elements.bgmValue.textContent = value;
        }
        
        if (window.AudioManager) {
            window.AudioManager.setBGMVolume(value / 100);
        }
    },
    
    /**
     * SE 볼륨 변경
     */
    onSEVolumeChange: function(event) {
        const value = event.target.value;
        if (this.elements.seValue) {
            this.elements.seValue.textContent = value;
        }
        
        if (window.AudioManager) {
            window.AudioManager.setSEVolume(value / 100);
        }
    },
    
    /**
     * 키보드 입력 (누름)
     */
    onKeyDown: function(event) {
        // ESC - 일시정지/메뉴
        if (event.key === 'Escape') {
            if (GameState.is(GameState.PLAYING)) {
                this.pauseGame();
            } else if (GameState.is(GameState.PAUSED)) {
                this.onResume();
            }
            event.preventDefault();
        }
        
        // F3 - 디버그 모드
        if (event.key === 'F3') {
            Game.toggleDebug();
            event.preventDefault();
        }
        
        // 게임 중일 때만 입력 전달
        if (GameState.isPlaying()) {
            Game.setKey(event.key, true);
        }
    },
    
    /**
     * 키보드 입력 (뗌)
     */
    onKeyUp: function(event) {
        if (GameState.isPlaying()) {
            Game.setKey(event.key, false);
        }
    },
    
    /**
     * 탭 전환 감지
     */
    onVisibilityChange: function() {
        if (document.hidden && GameState.is(GameState.PLAYING)) {
            console.log('[UIManager] 탭 전환 감지 - 자동 일시정지');
            this.pauseGame();
        }
    },
    
    /**
     * 게임 일시정지
     */
    pauseGame: function() {
        console.log('[UIManager] 게임 일시정지');
        this.elements.gameHud?.classList.add('hidden');
        this.elements.pauseMenu?.classList.remove('hidden');
        
        GameState.setState(GameState.PAUSED);
        DeltaTime.setPaused(true);
    },
    
    /**
     * 언어 설정
     */
    setLanguage: function(lang) {
        console.log(`[UIManager] 언어 변경: ${lang}`);
        this.currentLanguage = lang;
        
        // 언어 버튼 활성화 상태 변경
        [this.elements.btnLangKo, this.elements.btnLangEn, this.elements.btnLangJa].forEach(btn => {
            btn?.classList.remove('active');
        });
        
        if (lang === 'ko') this.elements.btnLangKo?.classList.add('active');
        else if (lang === 'en') this.elements.btnLangEn?.classList.add('active');
        else if (lang === 'ja') this.elements.btnLangJa?.classList.add('active');
        
        // LanguageManager에 알림
        if (window.LanguageManager) {
            window.LanguageManager.setLanguage(lang);
            this.updateAllTexts();
        }
    },
    
    /**
     * 모든 텍스트 업데이트
     */
    updateAllTexts: function() {
        if (!window.LanguageManager) return;
        
        const LM = window.LanguageManager;
        
        // 게임 타이틀 (두 줄로 분리하여 스타일 적용)
        const gameTitle = document.getElementById('game-title');
        if (gameTitle) {
            const titleText = LM.getText('gameTitle');
            const lang = this.currentLanguage;
            
            if (lang === 'ko') {
                // "그 곰은 인간이 되고 싶어"
                gameTitle.innerHTML = `
                    <span class="title-line1">그 <span class="title-bear">곰</span>은</span>
                    <span class="title-line2"><span class="title-human">인간</span>이 되고 싶어</span>
                `;
            } else if (lang === 'en') {
                // "The Bear Who Wanted to Become Human"
                gameTitle.innerHTML = `
                    <span class="title-line1">The <span class="title-bear">Bear</span> Who Wanted</span>
                    <span class="title-line2">to Become <span class="title-human">Human</span></span>
                `;
            } else if (lang === 'ja') {
                // "あのクマは人間になりたい"
                gameTitle.innerHTML = `
                    <span class="title-line1">あの<span class="title-bear">クマ</span>は</span>
                    <span class="title-line2"><span class="title-human">人間</span>になりたい</span>
                `;
            }
        }
        
        // 메인 메뉴
        const btnStartGame = document.getElementById('btn-start-game');
        const btnSettings = document.getElementById('btn-settings');
        if (btnStartGame) btnStartGame.textContent = LM.getText('startGame');
        if (btnSettings) btnSettings.textContent = LM.getText('settings');
        
        // 일시정지 메뉴
        const pauseTitle = document.getElementById('pause-title');
        const btnResume = document.getElementById('btn-resume');
        const btnRestart = document.getElementById('btn-restart');
        const btnToMain = document.getElementById('btn-to-main');
        if (pauseTitle) pauseTitle.textContent = LM.getText('paused');
        if (btnResume) btnResume.textContent = LM.getText('resume');
        if (btnRestart) btnRestart.textContent = LM.getText('restart');
        if (btnToMain) btnToMain.textContent = LM.getText('toMain');
        
        // 설정 메뉴
        const settingsTitle = document.getElementById('settings-title');
        const labelBGM = document.getElementById('label-bgm-volume');
        const labelSE = document.getElementById('label-se-volume');
        const btnSettingsBack = document.getElementById('btn-settings-back');
        if (settingsTitle) settingsTitle.textContent = LM.getText('settings');
        if (labelBGM) labelBGM.textContent = LM.getText('bgmVolume');
        if (labelSE) labelSE.textContent = LM.getText('seVolume');
        if (btnSettingsBack) btnSettingsBack.textContent = LM.getText('back');
        
        // 튜토리얼 다이얼로그
        const btnTutorialYes = document.getElementById('btn-tutorial-yes');
        const btnTutorialNo = document.getElementById('btn-tutorial-no');
        if (btnTutorialYes) btnTutorialYes.textContent = LM.getText('yes');
        if (btnTutorialNo) btnTutorialNo.textContent = LM.getText('no');
        
        // 조작법
        const controlMove = document.getElementById('control-move');
        const controlJump = document.getElementById('control-jump');
        const controlPause = document.getElementById('control-pause');
        const controlDebug = document.getElementById('control-debug');
        if (controlMove) controlMove.textContent = LM.getText('controlMove');
        if (controlJump) controlJump.textContent = LM.getText('controlJump');
        if (controlPause) controlPause.textContent = LM.getText('controlPause');
        if (controlDebug) controlDebug.textContent = LM.getText('controlDebug');
    },
    
    /**
     * 메뉴 표시
     */
    showMenu: function() {
        this.elements.mainMenu?.classList.remove('hidden');
        this.elements.mainMenu?.classList.add('active');
        this.elements.titleBackground?.classList.remove('hidden');
    },
    
    /**
     * 메뉴 숨기기
     */
    hideMenu: function() {
        this.elements.mainMenu?.classList.remove('active');
        this.elements.mainMenu?.classList.add('hidden');
        this.elements.titleBackground?.classList.add('hidden');
        this.elements.gameHud?.classList.remove('hidden');
        
        // 디버그 모드가 켜져있으면 디버그 정보 표시
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo && Game.debug) {
            debugInfo.classList.remove('hidden');
        }
    },
    
    /**
     * HUD 업데이트
     */
    updateHUD: function(data) {
        // 스테이지 정보
        if (this.elements.stageName && data.stage) {
            if (window.LanguageManager) {
                this.elements.stageName.textContent = 
                    window.LanguageManager.getText('stage') + ' ' + data.stage;
            } else {
                this.elements.stageName.textContent = 'Stage ' + data.stage;
            }
        }
        
        // FPS
        if (this.elements.fpsCounter && data.fps !== undefined) {
            this.elements.fpsCounter.textContent = `FPS: ${data.fps}`;
        }
        
        // 위치 정보 (디버그)
        if (this.elements.positionInfo && data.position) {
            this.elements.positionInfo.textContent = 
                `X: ${Math.round(data.position.x)}, Y: ${Math.round(data.position.y)}`;
        }
    }
};

// 전역 객체로 노출
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
