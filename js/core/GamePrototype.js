/**
 * GamePrototype.js
 * 게임 전역 객체 및 프로토타입 정의
 * 모든 게임 데이터와 설정을 관리
 */

const Game = {
    // 게임 기본 정보
    title: '그 곰은 인간이 되고 싶어',
    version: '1.0.0',
    
    // Canvas 관련
    canvas: null,
    ctx: null,
    width: 1920,                    // 기본 해상도
    height: 1080,
    
    // 게임 설정
    config: {
        // 물리 설정
        gravity: 2500,               // 중력 (픽셀/초²)
        maxFallSpeed: 1500,          // 최대 낙하 속도
        
        // 플레이어 설정
        player: {
            width: 48,
            height: 73,
            speed: 300,              // 지상 이동 속도 (픽셀/초)
            airSpeed: 40,           // 공중 이동 속도 (픽셀/초)
            jumpChargeTime: 1.5,     // 최대 점프 차징 시간 (초)
            minJumpPower: 500,       // 최소 점프력
            maxJumpPower: 1400,      // 최대 점프력
            friction: 0.7,           // 마찰 계수 (0~1, 낮을수록 빠르게 멈춤)
            airFriction: 0.99,       // 공중 마찰 계수
        },
        
        // 장애물 설정
        obstacles: {
            redPlatform: {           // 붉은 장판
                knockbackForce: 800,
                knockbackAngle: -60  // 도 (위로 날림)
            },
            cannon: {                // 대포
                bulletSpeed: 600,
                fireInterval: 2.0    // 초
            },
            spring: {                // 스프링
                bounceForce: 1000
            },
            icePlatform: {           // 회색 장판 (얼음)
                friction: 0.99       // 매우 미끄러움 (일반: 0.7, 높을수록 미끄러움)
            },
            movingPlatform: {        // 움직이는 발판
                speed: 100,          // 이동 속도 (픽셀/초)
                distance: 200        // 이동 거리 (픽셀)
            },
            missile: {               // 미사일
                speed: 400,
                turnSpeed: 180,      // 도/초
                explosionRadius: 80
            }
        },
        
        // 카메라 설정
        camera: {
            followSpeed: 5.0,        // 카메라 따라가기 속도
            offsetY: -200,           // 플레이어 기준 Y 오프셋
            deadzone: {
                x: 100,
                y: 50
            }
        },
        
        // 애니메이션 설정
        animation: {
            idle: { start: 0, end: 5, speed: 0.1 },
            rise: { start: 6, end: 8, speed: 0.05 },
            fall: { start: 9, end: 11, speed: 0.05 },
            run: { start: 12, end: 24, speed: 0.2 },
            hit: { start: 25, end: 29, speed: 0.15 }
        }
    },
    
    // 현재 스테이지 정보
    stage: {
        current: 1,
        maxStage: 5,
        mapData: null,              // 현재 맵 데이터
        checkpointStage: 1,         // 체크포인트 스테이지
        checkpointPosition: null    // 체크포인트 위치
    },
    
    // 입력 상태
    input: {
        keys: {},                   // 키 입력 상태
        mouse: {
            x: 0,
            y: 0,
            pressed: false
        }
    },
    
    // 카메라 위치 (상대 좌표)
    camera: {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
    },
    
    // 게임 오브젝트 배열
    objects: {
        platforms: [],              // 발판 목록
        obstacles: [],              // 장애물 목록
        projectiles: [],            // 투사체 목록 (탄막, 미사일 등)
        effects: [],                // 이펙트 목록
        doors: [],                  // 문 목록
        switches: []                // 스위치 목록
    },
    
    // 배경 이미지
    backgroundImage: null,
    
    // 디버그 모드
    debug: true,
    
    /**
     * 게임 초기화
     */
    init: function() {
        console.log(`[Game] ${this.title} v${this.version} 초기화 시작`);
        
        // Canvas 초기화
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('[Game] Canvas를 찾을 수 없습니다!');
            return false;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // 리사이즈 이벤트
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 델타타임 초기화
        DeltaTime.init();
        
        // 배경 이미지 로드
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/pictures/BackGround.png';
        this.backgroundImage.onload = () => {
            console.log('[Game] 배경 이미지 로드 성공');
        };
        this.backgroundImage.onerror = () => {
            console.warn('[Game] 배경 이미지 로드 실패, 기본 배경 사용');
        };
        
        console.log('[Game] 초기화 완료');
        return true;
    },
    
    /**
     * Canvas 크기 조정
     */
    resizeCanvas: function() {
        // 게임 내부 해상도는 고정 (1920x1080)
        this.canvas.width = 1920;
        this.canvas.height = 1080;
        
        // width와 height는 항상 고정 해상도 사용
        this.width = 1920;
        this.height = 1080;
        
        console.log(`[Game] Canvas 크기: ${this.width}x${this.height} (고정)`);
    },
    
    /**
     * 화면 좌표를 게임 월드 좌표로 변환
     * @param {number} screenX - 화면 X 좌표
     * @param {number} screenY - 화면 Y 좌표
     * @returns {Object} {x, y} 월드 좌표
     */
    screenToWorld: function(screenX, screenY) {
        return {
            x: screenX + this.camera.x,
            y: screenY + this.camera.y
        };
    },
    
    /**
     * 게임 월드 좌표를 화면 좌표로 변환
     * @param {number} worldX - 월드 X 좌표
     * @param {number} worldY - 월드 Y 좌표
     * @returns {Object} {x, y} 화면 좌표
     */
    worldToScreen: function(worldX, worldY) {
        return {
            x: worldX - this.camera.x,
            y: worldY - this.camera.y
        };
    },
    
    /**
     * 키 입력 설정
     * @param {string} key - 키 이름
     * @param {boolean} pressed - 눌림 여부
     */
    setKey: function(key, pressed) {
        this.input.keys[key] = pressed;
    },
    
    /**
     * 키 입력 확인
     * @param {string} key - 키 이름
     * @returns {boolean}
     */
    isKeyPressed: function(key) {
        return this.input.keys[key] || false;
    },
    
    /**
     * 디버그 모드 토글
     */
    toggleDebug: function() {
        this.debug = !this.debug;
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
            debugInfo.classList.toggle('hidden', !this.debug);
        }
        console.log(`[Game] 디버그 모드: ${this.debug}`);
    }
};

// 전역 객체로 노출
if (typeof window !== 'undefined') {
    window.Game = Game;
}
