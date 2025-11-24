/**
 * AudioManager.js
 * BGM 및 SE 재생 관리
 */

const AudioManager = {
    // BGM 목록
    bgm: {
        main: null  // 모든 스테이지에서 MainBGM.mp3 사용
    },
    
    // SE 목록
    se: {
        jump: null,
        hit: null,
        spring: null,
        missile: null
    },
    
    // 현재 재생 중인 BGM
    currentBGM: null,
    
    // 볼륨 설정
    bgmVolume: 0.7,
    seVolume: 0.7,
    
    // 음소거 상태
    bgmMuted: false,
    seMuted: false,
    
    // 로드 상태
    loaded: false,
    
    /**
     * 초기화 및 오디오 파일 로드
     */
    init: function() {
        console.log('[AudioManager] 초기화 시작');
        
        // BGM 로드
        this.bgm.main = this.createAudio('audio/bgm/MainBGM.mp3', true);
        
        // SE 로드
        this.se.jump = this.createAudio('audio/se/jump.wav', false);
        this.se.hit = this.createAudio('audio/se/hit.wav', false);
        this.se.spring = this.createAudio('audio/se/spring.wav', false);
        this.se.missile = this.createAudio('audio/se/missile.wav', false);
        
        this.loaded = true;
        console.log('[AudioManager] 초기화 완료');
    },
    
    /**
     * 오디오 객체 생성
     * @param {string} src - 오디오 파일 경로
     * @param {boolean} loop - 반복 재생 여부
     * @returns {HTMLAudioElement}
     */
    createAudio: function(src, loop = false) {
        const audio = new Audio();
        audio.src = src;
        audio.loop = loop;
        audio.preload = 'auto';
        
        // 로드 에러 처리
        audio.addEventListener('error', () => {
            console.warn(`[AudioManager] 오디오 파일 로드 실패: ${src}`);
        });
        
        // 로드 완료
        audio.addEventListener('canplaythrough', () => {
            console.log(`[AudioManager] 오디오 로드 완료: ${src}`);
        }, { once: true });
        
        return audio;
    },
    
    /**
     * BGM 재생
     * @param {string} bgmName - BGM 이름 (mainMenu, stage1, stage2, ...)
     * @param {boolean} fadeIn - 페이드 인 여부
     */
    playBGM: function(bgmName, fadeIn = true) {
        if (!this.loaded) {
            console.warn('[AudioManager] 아직 초기화되지 않았습니다.');
            return;
        }
        
        const newBGM = this.bgm[bgmName];
        
        if (!newBGM) {
            console.warn(`[AudioManager] BGM을 찾을 수 없습니다: ${bgmName}`);
            return;
        }
        
        // 같은 BGM이면 무시
        if (this.currentBGM === newBGM && !newBGM.paused) {
            return;
        }
        
        console.log(`[AudioManager] BGM 재생: ${bgmName}`);
        
        // 이전 BGM 페이드 아웃 후 정지
        if (this.currentBGM) {
            this.stopBGM(true);
        }
        
        // 새 BGM 재생
        this.currentBGM = newBGM;
        this.currentBGM.volume = this.bgmMuted ? 0 : (fadeIn ? 0 : this.bgmVolume);
        this.currentBGM.currentTime = 0;
        
        const playPromise = this.currentBGM.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('[AudioManager] BGM 재생 실패:', error);
            });
        }
        
        // 페이드 인
        if (fadeIn && !this.bgmMuted) {
            this.fadeIn(this.currentBGM, this.bgmVolume, 1.0);
        }
    },
    
    /**
     * BGM 정지
     * @param {boolean} fadeOut - 페이드 아웃 여부
     */
    stopBGM: function(fadeOut = true) {
        if (!this.currentBGM) return;
        
        console.log('[AudioManager] BGM 정지');
        
        if (fadeOut) {
            this.fadeOut(this.currentBGM, 0.5, () => {
                this.currentBGM.pause();
                this.currentBGM.currentTime = 0;
            });
        } else {
            this.currentBGM.pause();
            this.currentBGM.currentTime = 0;
        }
        
        this.currentBGM = null;
    },
    
    /**
     * BGM 일시정지
     */
    pauseBGM: function() {
        if (this.currentBGM && !this.currentBGM.paused) {
            console.log('[AudioManager] BGM 일시정지');
            this.currentBGM.pause();
        }
    },
    
    /**
     * BGM 재개
     */
    resumeBGM: function() {
        if (this.currentBGM && this.currentBGM.paused) {
            console.log('[AudioManager] BGM 재개');
            const playPromise = this.currentBGM.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('[AudioManager] BGM 재개 실패:', error);
                });
            }
        }
    },
    
    /**
     * SE 재생
     * @param {string} seName - SE 이름 (jump, hit, spring, missile)
     * @param {number} volume - 볼륨 (0.0 ~ 1.0), 기본값은 설정된 볼륨
     */
    playSE: function(seName, volume = null) {
        if (!this.loaded) return;
        
        const sound = this.se[seName];
        
        if (!sound) {
            console.warn(`[AudioManager] SE를 찾을 수 없습니다: ${seName}`);
            return;
        }
        
        // 볼륨 설정
        sound.volume = this.seMuted ? 0 : (volume !== null ? volume : this.seVolume);
        sound.currentTime = 0;
        
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn(`[AudioManager] SE 재생 실패 (${seName}):`, error);
            });
        }
    },
    
    /**
     * BGM 볼륨 설정
     * @param {number} volume - 볼륨 (0.0 ~ 1.0)
     */
    setBGMVolume: function(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        
        if (this.currentBGM && !this.bgmMuted) {
            this.currentBGM.volume = this.bgmVolume;
        }
        
        console.log(`[AudioManager] BGM 볼륨: ${(this.bgmVolume * 100).toFixed(0)}%`);
    },
    
    /**
     * SE 볼륨 설정
     * @param {number} volume - 볼륨 (0.0 ~ 1.0)
     */
    setSEVolume: function(volume) {
        this.seVolume = Math.max(0, Math.min(1, volume));
        console.log(`[AudioManager] SE 볼륨: ${(this.seVolume * 100).toFixed(0)}%`);
    },
    
    /**
     * BGM 음소거 토글
     */
    toggleBGMMute: function() {
        this.bgmMuted = !this.bgmMuted;
        
        if (this.currentBGM) {
            this.currentBGM.volume = this.bgmMuted ? 0 : this.bgmVolume;
        }
        
        console.log(`[AudioManager] BGM 음소거: ${this.bgmMuted}`);
    },
    
    /**
     * SE 음소거 토글
     */
    toggleSEMute: function() {
        this.seMuted = !this.seMuted;
        console.log(`[AudioManager] SE 음소거: ${this.seMuted}`);
    },
    
    /**
     * 페이드 인
     * @param {HTMLAudioElement} audio - 오디오 객체
     * @param {number} targetVolume - 목표 볼륨
     * @param {number} duration - 지속 시간 (초)
     */
    fadeIn: function(audio, targetVolume, duration) {
        if (!audio) return;
        
        const steps = 20;
        const stepDuration = (duration * 1000) / steps;
        const volumeStep = targetVolume / steps;
        let currentStep = 0;
        
        const interval = setInterval(() => {
            currentStep++;
            audio.volume = Math.min(volumeStep * currentStep, targetVolume);
            
            if (currentStep >= steps) {
                clearInterval(interval);
            }
        }, stepDuration);
    },
    
    /**
     * 페이드 아웃
     * @param {HTMLAudioElement} audio - 오디오 객체
     * @param {number} duration - 지속 시간 (초)
     * @param {Function} callback - 완료 후 콜백
     */
    fadeOut: function(audio, duration, callback) {
        if (!audio) return;
        
        const steps = 20;
        const stepDuration = (duration * 1000) / steps;
        const startVolume = audio.volume;
        const volumeStep = startVolume / steps;
        let currentStep = 0;
        
        const interval = setInterval(() => {
            currentStep++;
            audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
            
            if (currentStep >= steps) {
                clearInterval(interval);
                if (callback) callback();
            }
        }, stepDuration);
    },
    
    /**
     * 스테이지별 BGM 가져오기
     * @param {number} stage - 스테이지 번호
     * @returns {string} BGM 이름
     */
    getStageBGM: function(stage) {
        return 'main';  // 모든 스테이지에서 MainBGM.mp3 사용
    },
    
    /**
     * 모든 사운드 정지
     */
    stopAll: function() {
        console.log('[AudioManager] 모든 사운드 정지');
        
        // BGM 정지
        this.stopBGM(false);
        
        // SE 정지
        Object.values(this.se).forEach(sound => {
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    }
};

// 전역 객체로 노출
if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}
