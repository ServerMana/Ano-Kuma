/**
 * GameController.js
 * 게임 메인 컨트롤러 - 모든 시스템 통합 및 게임 루프
 */

const GameController = {
    // 플레이어 객체
    player: null,
    
    // 애니메이션 프레임 ID
    animationFrameId: null,
    
    // 튜토리얼 모드
    isTutorial: false,
    
    // 현재 스테이지
    currentStage: 1,
    
    /**
     * 게임 초기화
     */
    init: function() {
        console.log('[GameController] 게임 초기화 시작');
        
        // Game 객체 초기화
        if (!Game.init()) {
            console.error('[GameController] Game 초기화 실패!');
            return false;
        }
        
        // 언어 매니저 초기화
        LanguageManager.init();
        
        // UI 매니저 초기화
        UIManager.init();
        
        // 오디오 매니저 초기화
        AudioManager.init();
        
        // 설정 불러오기
        this.loadSettings();
        
        // 메인 메뉴 BGM 재생
        AudioManager.playBGM('mainMenu', true);
        
        console.log('[GameController] 게임 초기화 완료');
        return true;
    },
    
    /**
     * 설정 불러오기
     */
    loadSettings: function() {
        const settings = DataManager.loadSettings();
        
        // 언어 설정
        if (settings.language) {
            UIManager.setLanguage(settings.language);
        }
        
        // 볼륨 설정
        if (settings.bgmVolume !== undefined) {
            AudioManager.setBGMVolume(settings.bgmVolume / 100);
            const bgmSlider = document.getElementById('bgm-volume');
            const bgmValue = document.getElementById('bgm-value');
            if (bgmSlider) bgmSlider.value = settings.bgmVolume;
            if (bgmValue) bgmValue.textContent = settings.bgmVolume;
        }
        
        if (settings.seVolume !== undefined) {
            AudioManager.setSEVolume(settings.seVolume / 100);
            const seSlider = document.getElementById('se-volume');
            const seValue = document.getElementById('se-value');
            if (seSlider) seSlider.value = settings.seVolume;
            if (seValue) seValue.textContent = settings.seVolume;
        }
    },
    
    /**
     * 설정 저장
     */
    saveSettings: function() {
        const settings = {
            bgmVolume: Math.round(AudioManager.bgmVolume * 100),
            seVolume: Math.round(AudioManager.seVolume * 100),
            language: UIManager.currentLanguage
        };
        
        DataManager.saveSettings(settings);
    },
    
    /**
     * 게임 시작
     * @param {boolean} tutorial - 튜토리얼 모드 여부
     */
    startGame: async function(tutorial = false) {
        console.log(`[GameController] 게임 시작 (튜토리얼: ${tutorial})`);
        
        this.isTutorial = tutorial;
        this.currentStage = tutorial ? 0 : 1;
        
        // 맵 로드
        await this.loadStage(this.currentStage);
        
        // 맵 데이터에서 시작 위치 가져오기
        const mapData = MapManager.mapCache['Map001'];
        
        const startPos = mapData ? 
            { x: mapData.startX, y: mapData.startY - 23 } : 
            { x: 960, y: 477 };
        
        this.player = new Player(startPos.x, startPos.y);
        this.player.loadSprite('img/pictures/Stand.png');
        Game.player = this.player;
        
        // 카메라 초기화
        Game.camera.x = this.player.x - Game.width / 2;
        Game.camera.y = this.player.y - Game.height / 2;
        Game.camera.targetX = Game.camera.x;
        Game.camera.targetY = Game.camera.y;
        
        // BGM 변경
        const bgmName = AudioManager.getStageBGM(this.currentStage);
        AudioManager.playBGM(bgmName, true);
        
        // 게임 상태 변경
        GameState.setState(GameState.PLAYING);
        DeltaTime.setPaused(false);
        DeltaTime.reset();
        
        // 게임 루프 시작
        this.startGameLoop();
    },
    
    /**
     * 디버그 맵 시작
     */
    startDebugMap: async function() {
        console.log('[GameController] 디버그 맵 시작');
        
        this.isTutorial = false;
        this.currentStage = -1;
        
        // 디버그 맵 로드
        await this.loadStage(-1);
        
        // 맵 데이터에서 시작 위치 가져오기
        const mapData = MapManager.mapCache['MapDebug'];
        const offset = MapManager.mapOffsets['MapDebug'] || { x: 0, y: 0 };
        
        const startPos = mapData ? 
            { x: mapData.startX + offset.x, y: mapData.startY + offset.y - 23 } : 
            { x: 150, y: 2227 };
        
        this.player = new Player(startPos.x, startPos.y);
        this.player.loadSprite('img/pictures/player_spritesheet.png');
        Game.player = this.player;
        
        // 카메라 초기화
        Game.camera.x = this.player.x - Game.width / 2;
        Game.camera.y = this.player.y - Game.height / 2;
        Game.camera.targetX = Game.camera.x;
        Game.camera.targetY = Game.camera.y;
        
        // BGM 변경
        const bgmName = AudioManager.getStageBGM(0);
        AudioManager.playBGM(bgmName, true);
        
        // 게임 상태 변경
        GameState.setState(GameState.PLAYING);
        DeltaTime.setPaused(false);
        DeltaTime.reset();
        
        // 게임 루프 시작
        this.startGameLoop();
    },
    
    /**
     * 스테이지 로드
     * @param {number} stage - 스테이지 번호 (0: 튜토리얼, 1~5: 스테이지, -1: 디버그)
     */
    loadStage: async function(stage) {
        console.log(`[GameController] 스테이지 ${stage} 로드 중...`);
        
        let mapIds;
        
        // 디버그 맵 모드
        if (stage === -1) {
            mapIds = ['MapDebug'];
        } else {
            // 모든 스테이지가 Map001에 통합됨
            mapIds = ['Map001'];
        }
        
        // 맵 로드 (loadMultipleMaps 사용하여 activeMaps에 추가)
        await MapManager.loadMultipleMaps(mapIds);
        
        // 오브젝트 생성
        const { platforms, obstacles } = MapManager.createAllObjects();
        
        // Game 객체 초기화
        Game.objects.platforms = platforms;
        Game.objects.projectiles = [];
        Game.objects.effects = [];
        Game.objects.doors = [];
        Game.objects.switches = [];
        
        // 장애물 생성 (doors와 switches는 내부에서 처리)
        Game.objects.obstacles = this.createObstacleObjects(obstacles);
        
        console.log(`[GameController] 총 플랫폼 ${platforms.length}개, 장애물 ${obstacles.length}개 로드됨`);
        console.log(`[GameController] 문 ${Game.objects.doors.length}개, 스위치 ${Game.objects.switches.length}개 생성됨`);
        
        // HUD 업데이트
        UIManager.updateHUD({ stage: stage === -1 ? 'Debug Map' : (stage === 0 ? 'Tutorial' : stage) });
        
        console.log(`[GameController] 스테이지 ${stage} 로드 완료`);
    },
    
    /**
     * 장애물 데이터를 객체로 변환
     * @param {Array} obstaclesData - 장애물 데이터 배열
     * @returns {Array} 장애물 객체 배열
     */
    createObstacleObjects: function(obstaclesData) {
        const obstacles = [];
        
        obstaclesData.forEach(data => {
            console.log('[GameController] 장애물 데이터:', data);
            let obstacle = null;
            const type = data.type.toLowerCase();
            
            switch (type) {
                case 'redplatform':
                    obstacle = new RedPlatform(data.x, data.y, data.width, data.height);
                    break;
                    
                case 'cannon':
                    // direction을 각도로 변환 (left=180, right=0, up=270, down=90)
                    let angle = 0;
                    if (data.direction === 'left') angle = 180;
                    else if (data.direction === 'right') angle = 0;
                    else if (data.direction === 'up') angle = 270;
                    else if (data.direction === 'down') angle = 90;
                    else if (typeof data.direction === 'number') angle = data.direction;
                    
                    obstacle = new Cannon(data.x, data.y, angle);
                    if (data.interval) obstacle.fireInterval = data.interval / 1000; // ms를 초로 변환
                    break;
                    
                case 'spring':
                    // direction을 방향으로 변환 (left=-1, right=1, up=2, down=-2)
                    let direction = 1;
                    if (data.direction === 'left') direction = -1;
                    else if (data.direction === 'right') direction = 1;
                    else if (data.direction === 'up') direction = 2;
                    else if (data.direction === 'down') direction = -2;
                    
                    obstacle = new Spring(data.x, data.y, direction);
                    if (data.force) obstacle.force = data.force;
                    break;
                    
                case 'iceplatform':
                    obstacle = new IcePlatform(data.x, data.y, data.width, data.height);
                    // IcePlatform은 플랫폼으로도 추가되어야 함 (friction 값을 반드시 포함)
                    Game.objects.platforms.push({
                        x: data.x,
                        y: data.y,
                        width: data.width,
                        height: data.height,
                        type: 'icePlatform',
                        friction: Game.config.obstacles.icePlatform.friction // 0.99
                    });
                    break;
                    
                case 'movingplatform':
                    const moveDirection = data.direction || 'horizontal';
                    const moveDistance = data.distance || Game.config.obstacles.movingPlatform.distance;
                    const moveSpeed = data.speed || Game.config.obstacles.movingPlatform.speed;
                    obstacle = new MovingPlatform(data.x, data.y, data.width, data.height, moveDirection, moveDistance, moveSpeed);
                    break;
                    
                case 'missilecannon':
                    obstacle = new MissileCannon(data.x, data.y);
                    if (data.interval) obstacle.fireInterval = data.interval / 1000; // ms를 초로 변환
                    break;
                    
                case 'switch':
                case 'button':
                    obstacle = new Switch(data.x, data.y, data.doorId, data.timeout !== undefined ? data.timeout : null);
                    Game.objects.switches.push(obstacle);
                    console.log('[GameController] Switch 생성:', obstacle);
                    obstacle = null; // obstacles 배열에 추가하지 않도록
                    break;
                    
                case 'door':
                    obstacle = new Door(data.x, data.y, data.width, data.height, data.id, data.initiallyOpen || false);
                    Game.objects.doors.push(obstacle);
                    console.log('[GameController] Door 생성:', obstacle);
                    obstacle = null; // obstacles 배열에 추가하지 않도록
                    break;
                    
                case 'goal':
                    // Goal은 특수 플랫폼으로 처리 (나중에 구현)
                    console.log('[GameController] Goal 발견:', data.x, data.y);
                    break;
                    
                default:
                    console.warn('[GameController] 알 수 없는 장애물 타입:', data.type);
            }
            
            if (obstacle) {
                obstacles.push(obstacle);
            }
        });
        
        return obstacles;
    },
    
    /**
     * 게임 루프 시작
     */
    startGameLoop: function() {
        console.log('[GameController] 게임 루프 시작');
        
        const gameLoop = () => {
            this.update();
            this.render();
            this.animationFrameId = requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    },
    
    /**
     * 게임 루프 정지
     */
    stopGameLoop: function() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            console.log('[GameController] 게임 루프 정지');
        }
    },
    
    /**
     * 업데이트
     */
    update: function() {
        // 델타타임 업데이트
        DeltaTime.update();
        const deltaTime = DeltaTime.get();
        
        // 게임이 실행 중일 때만 업데이트
        if (!GameState.needsUpdate()) {
            return;
        }
        
        // 플레이어 업데이트
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // 장애물 업데이트
        Game.objects.obstacles.forEach(obstacle => {
            obstacle.update(deltaTime);
            
            // MovingPlatform이면 플레이어가 위에 있는지 확인
            if (obstacle instanceof MovingPlatform && this.player && obstacle.isPlayerOn(this.player)) {
                obstacle.movePlayer(this.player);
            }
        });
        
        // 문 업데이트
        Game.objects.doors.forEach(door => {
            door.update(deltaTime);
        });
        
        // 스위치 업데이트
        Game.objects.switches.forEach(switchObj => {
            switchObj.update(deltaTime);
        });
        
        // 투사체 업데이트 및 제거
        Game.objects.projectiles = Game.objects.projectiles.filter(projectile => {
            projectile.update(deltaTime);
            return projectile.active;
        });
        
        // 카메라 업데이트
        this.updateCamera(deltaTime);
        
        // 현재 스테이지 감지 (플레이어 Y 위치 기반)
        const currentStage = this.detectCurrentStage();
        
        // HUD 업데이트
        UIManager.updateHUD({
            fps: DeltaTime.getFPS(),
            position: this.player ? { x: this.player.x, y: this.player.y } : null,
            stage: currentStage
        });
    },
    
    /**
     * 플레이어 위치로 현재 스테이지 감지
     * @returns {string} 스테이지 이름
     */
    detectCurrentStage: function() {
        //if (!this.player) return 'Tutorial';
        
        //const playerY = this.player.y;
        
        // MapManager의 mapOffsets를 사용하여 각 맵의 Y 범위 확인
        // Map001: Y 0 ~ 3000
        // Map002: Y -3000 ~ 0
        // Map003: Y -8000 ~ -3000
        // // 등등...
        
        // if (playerY >= 0) return 'Tutorial';
        // else if (playerY >= -5000) return 'Stage 1';
        // else if (playerY >= -11000) return 'Stage 2';
        // else if (playerY >= -18000) return 'Stage 3';
        // else if (playerY >= -26000) return 'Stage 4';
        // else return 'Stage 5';
    },
    
    /**
     * 카메라 업데이트
     * @param {number} deltaTime
     */
    updateCamera: function(deltaTime) {
        if (!this.player) return;
        
        const config = Game.config.camera;
        
        // 목표 위치 계산
        Game.camera.targetX = this.player.x - Game.width / 2;
        Game.camera.targetY = this.player.y - Game.height / 2 + config.offsetY;
        
        // 부드럽게 따라가기
        const speed = config.followSpeed;
        Game.camera.x += (Game.camera.targetX - Game.camera.x) * speed * deltaTime;
        Game.camera.y += (Game.camera.targetY - Game.camera.y) * speed * deltaTime;
    },
    
    /**
     * 렌더링
     */
    render: function() {
        const ctx = Game.ctx;
        
        // 화면 클리어 및 배경 그리기
        if (Game.backgroundImage && Game.backgroundImage.complete) {
            // 배경 이미지를 타일링하여 그리기
            const bgWidth = Game.backgroundImage.width;
            const bgHeight = Game.backgroundImage.height;
            
            // 카메라 위치에 따른 배경 오프셋 계산
            const offsetX = -(Game.camera.x * 0.5) % bgWidth;
            const offsetY = -(Game.camera.y * 0.5) % bgHeight;
            
            // 화면을 채우기 위해 필요한 만큼 반복
            for (let x = offsetX - bgWidth; x < Game.width; x += bgWidth) {
                for (let y = offsetY - bgHeight; y < Game.height; y += bgHeight) {
                    ctx.drawImage(Game.backgroundImage, x, y);
                }
            }
        } else {
            // 배경 이미지가 로드되지 않았을 때 기본 배경
            ctx.fillStyle = '#87ceeb';
            ctx.fillRect(0, 0, Game.width, Game.height);
        }
        
        // 경계 영역 하늘색 배경 (절대 좌표 기준)
        // 월드 좌표 x <= 0 영역
        const leftBoundary = Game.worldToScreen(0, 0);
        if (leftBoundary.x > 0) {
            ctx.fillStyle = '#87ceeb';
            ctx.fillRect(0, 0, leftBoundary.x, Game.height);
        }
        
        // 월드 좌표 x >= 1900 영역
        const rightBoundary = Game.worldToScreen(1900, 0);
        if (rightBoundary.x < Game.width) {
            ctx.fillStyle = '#87ceeb';
            ctx.fillRect(rightBoundary.x, 0, Game.width - rightBoundary.x, Game.height);
        }
        
        // 발판 그리기
        if (Game.objects.platforms && Game.objects.platforms.length > 0) {
            // 맵 데이터에서 기본 색상 가져오기
            const defaultPlatformColor = Game.currentMap?.platformColor || '#808080';
            const defaultBorderColor = Game.currentMap?.platformBorderColor || '#505050';
            
            Game.objects.platforms.forEach(platform => {
                const screenPos = Game.worldToScreen(platform.x, platform.y);
                
                // 각 플랫폼의 개별 색상 사용 (없으면 기본값)
                ctx.fillStyle = platform.color || defaultPlatformColor;
                ctx.fillRect(screenPos.x, screenPos.y, platform.width, platform.height);
                
                // 테두리
                ctx.strokeStyle = platform.borderColor || defaultBorderColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(screenPos.x, screenPos.y, platform.width, platform.height);
            });
        } else {
            // 디버그: 플랫폼이 없을 때 경고
            ctx.fillStyle = '#ff0000';
            ctx.font = '20px Arial';
            ctx.fillText('플랫폼 없음!', 50, 50);
        }
        
        // 장애물 그리기
        Game.objects.obstacles.forEach(obstacle => {
            if (obstacle.active) {
                // MovingPlatform은 자체 render 메서드 사용
                if (obstacle instanceof MovingPlatform) {
                    obstacle.render(ctx, Game.camera);
                } else {
                    obstacle.draw(ctx, Game.camera);
                }
            }
        });
        
        // 문 그리기
        Game.objects.doors.forEach(door => {
            door.draw(ctx, Game.camera);
        });
        
        // 스위치 그리기
        Game.objects.switches.forEach(switchObj => {
            switchObj.draw(ctx, Game.camera);
        });
        
        // 투사체 그리기
        Game.objects.projectiles.forEach(projectile => {
            if (projectile.active) {
                projectile.draw(ctx, Game.camera);
            }
        });
        
        // 플레이어 그리기
        if (this.player) {
            this.player.draw(ctx);
            
            // 경계 경고 메시지 표시
            if (this.player.x < -500) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(Game.width / 2 - 200, 100, 400, 80);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('타워로 돌아가자!', Game.width / 2, 140);
                ctx.textAlign = 'left';
            }
        }
    },
    
    /**
     * 재시작
     */
    restart: function() {
        console.log('[GameController] 게임 재시작');
        
        // 현재 스테이지 다시 시작
        this.startGame(this.isTutorial);
    },
    
    /**
     * 리셋 (메인 메뉴로)
     */
    reset: function() {
        console.log('[GameController] 게임 리셋');
        
        // 게임 루프 정지
        this.stopGameLoop();
        
        // 플레이어 제거
        this.player = null;
        Game.player = null;
        
        // 오브젝트 제거
        Game.objects.platforms = [];
        Game.objects.obstacles = [];
        Game.objects.projectiles = [];
        Game.objects.effects = [];
        Game.objects.doors = [];
        Game.objects.switches = [];
        
        // 델타타임 리셋
        DeltaTime.reset();
        DeltaTime.setPaused(true);
        
        // 맵 캐시 클리어
        MapManager.clearCache();
        
        // 메인 메뉴 BGM
        AudioManager.playBGM('mainMenu', true);
        
        // 설정 저장
        this.saveSettings();
    }
};

// 페이지 로드 시 게임 초기화
window.addEventListener('load', () => {
    console.log('[GameController] 페이지 로드 완료');
    GameController.init();
});

// 전역 객체로 노출
if (typeof window !== 'undefined') {
    window.GameController = GameController;
}
