/**
 * DeltaTime.js
 * 델타타임 계산 및 프레임 관리
 * 모든 움직임과 애니메이션은 델타타임을 기반으로 작동
 */

const DeltaTime = {
    // 시간 관련 변수
    lastTime: 0,                    // 마지막 프레임 시간
    currentTime: 0,                 // 현재 프레임 시간
    deltaTime: 0,                   // 프레임 간 시간 차이 (초 단위)
    fps: 60,                        // 현재 FPS
    frameCount: 0,                  // 프레임 카운터
    
    // FPS 계산용
    fpsUpdateTime: 0,               // FPS 업데이트 시간
    fpsFrameCount: 0,               // FPS 계산용 프레임 수
    
    // 시간 스케일 (슬로우 모션 등에 사용)
    timeScale: 1.0,
    
    // 최대 델타타임 (프레임 드랍 방지)
    maxDeltaTime: 0.1,              // 100ms = 10 FPS 이하 방지
    
    // 일시정지 상태
    paused: false,
    
    // 게임 시작 시간
    gameStartTime: 0,
    
    // 누적 게임 시간 (일시정지 제외)
    totalGameTime: 0,
    
    /**
     * 델타타임 초기화
     */
    init: function() {
        this.lastTime = performance.now();
        this.currentTime = this.lastTime;
        this.gameStartTime = this.lastTime;
        this.fpsUpdateTime = this.lastTime;
        console.log('[DeltaTime] 초기화 완료');
    },
    
    /**
     * 델타타임 업데이트 (매 프레임마다 호출)
     */
    update: function() {
        this.currentTime = performance.now();
        
        // 델타타임 계산 (밀리초 -> 초)
        let rawDelta = (this.currentTime - this.lastTime) / 1000;
        
        // 최대 델타타임 제한 (프레임 드랍이 심할 때 게임이 튀는 것 방지)
        rawDelta = Math.min(rawDelta, this.maxDeltaTime);
        
        // 일시정지 상태가 아닐 때만 델타타임 적용
        if (!this.paused) {
            this.deltaTime = rawDelta * this.timeScale;
            this.totalGameTime += this.deltaTime;
        } else {
            this.deltaTime = 0;
        }
        
        this.lastTime = this.currentTime;
        this.frameCount++;
        this.fpsFrameCount++;
        
        // FPS 계산 (1초마다 업데이트)
        if (this.currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = Math.round(this.fpsFrameCount * 1000 / (this.currentTime - this.fpsUpdateTime));
            this.fpsFrameCount = 0;
            this.fpsUpdateTime = this.currentTime;
        }
    },
    
    /**
     * 델타타임 가져오기
     * @returns {number} 델타타임 (초 단위)
     */
    get: function() {
        return this.deltaTime;
    },
    
    /**
     * FPS 가져오기
     * @returns {number} 현재 FPS
     */
    getFPS: function() {
        return this.fps;
    },
    
    /**
     * 일시정지 설정
     * @param {boolean} isPaused - 일시정지 여부
     */
    setPaused: function(isPaused) {
        this.paused = isPaused;
        console.log(`[DeltaTime] 일시정지: ${isPaused}`);
    },
    
    /**
     * 시간 스케일 설정 (슬로우 모션 등)
     * @param {number} scale - 시간 배율 (1.0 = 정상, 0.5 = 절반 속도, 2.0 = 2배속)
     */
    setTimeScale: function(scale) {
        this.timeScale = Math.max(0, scale);
        console.log(`[DeltaTime] 시간 스케일: ${this.timeScale}`);
    },
    
    /**
     * 게임 시작 후 경과 시간 (초)
     * @returns {number}
     */
    getElapsedTime: function() {
        return this.totalGameTime;
    },
    
    /**
     * 실제 경과 시간 (일시정지 포함, 초)
     * @returns {number}
     */
    getRealElapsedTime: function() {
        return (this.currentTime - this.gameStartTime) / 1000;
    },
    
    /**
     * 리셋 (게임 재시작 시)
     */
    reset: function() {
        this.totalGameTime = 0;
        this.frameCount = 0;
        this.gameStartTime = performance.now();
        console.log('[DeltaTime] 리셋 완료');
    }
};

// 전역 객체로 노출
if (typeof window !== 'undefined') {
    window.DeltaTime = DeltaTime;
}
