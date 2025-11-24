/**
 * GameState.js
 * 게임의 모든 상태를 정의하고 관리
 */

const GameState = {
    // 게임 상태 열거형
    MENU: 'MENU',                   // 메인 메뉴
    TUTORIAL_DIALOG: 'TUTORIAL_DIALOG', // 튜토리얼 선택 다이얼로그
    PLAYING: 'PLAYING',             // 게임 플레이 중
    PAUSED: 'PAUSED',               // 일시정지
    SETTINGS: 'SETTINGS',           // 설정 메뉴
    GAME_OVER: 'GAME_OVER',         // 게임 오버
    LOADING: 'LOADING',             // 로딩 중
    
    // 현재 상태
    current: 'MENU',
    
    // 이전 상태 (일시정지 후 복귀용)
    previous: null,
    
    /**
     * 상태 변경
     * @param {string} newState - 새로운 상태
     */
    setState: function(newState) {
        if (this.current !== newState) {
            this.previous = this.current;
            this.current = newState;
            console.log(`[GameState] ${this.previous} -> ${this.current}`);
            
            // 상태 변경 이벤트 발생
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('gameStateChanged', {
                    detail: {
                        from: this.previous,
                        to: this.current
                    }
                }));
            }
        }
    },
    
    /**
     * 현재 상태 확인
     * @param {string} state - 확인할 상태
     * @returns {boolean}
     */
    is: function(state) {
        return this.current === state;
    },
    
    /**
     * 게임이 실행 중인지 확인 (일시정지 제외)
     * @returns {boolean}
     */
    isPlaying: function() {
        return this.current === this.PLAYING;
    },
    
    /**
     * 게임이 일시정지 되었는지 확인
     * @returns {boolean}
     */
    isPaused: function() {
        return this.current === this.PAUSED;
    },
    
    /**
     * UI 상호작용이 가능한 상태인지 확인
     * @returns {boolean}
     */
    canInteract: function() {
        return this.current !== this.LOADING;
    },
    
    /**
     * 게임 업데이트가 필요한 상태인지 확인
     * @returns {boolean}
     */
    needsUpdate: function() {
        return this.current === this.PLAYING;
    }
};

// 전역 객체로 노출
if (typeof window !== 'undefined') {
    window.GameState = GameState;
}
