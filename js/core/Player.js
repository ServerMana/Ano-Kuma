/**
 * Player.js
 * 플레이어 캐릭터 정의 및 제어
 */

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = Game.config.player.width;
        this.height = Game.config.player.height;
        
        // 물리
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.currentPlatform = null;
        
        // 점프 차징
        this.isCharging = false;
        this.chargeTime = 0;
        this.maxChargeTime = Game.config.player.jumpChargeTime;
        
        // 애니메이션
        this.state = 'idle'; // idle, run, rise, fall, hit
        this.currentFrame = 0;
        this.animationTime = 0;
        this.direction = 1; // 1: 오른쪽, -1: 왼쪽
        
        // 스프라이트
        this.spriteSheet = null;
        this.spriteWidth = 64;
        this.spriteHeight = 64;
        
        // 히트 상태
        this.hitTime = 0;
        this.hitDuration = 1.0; // 히트 모션 지속 시간
    }
    
    /**
     * 스프라이트 시트 로드
     * @param {string} imagePath - 이미지 경로
     */
    loadSprite(imagePath) {
        this.spriteSheet = new Image();
        this.spriteSheet.src = imagePath;
        this.spriteSheet.onload = () => {
            console.log('[Player] 스프라이트 로드 완료');
        };
        this.spriteSheet.onerror = () => {
            console.warn('[Player] 스프라이트 로드 실패, 기본 렌더링 사용');
        };
    }
    
    /**
     * 업데이트
     * @param {number} deltaTime - 델타타임
     */
    update(deltaTime) {
        // 히트 상태 처리
        if (this.state === 'hit') {
            this.hitTime += deltaTime;
            if (this.hitTime >= this.hitDuration) {
                this.state = 'idle';
                this.hitTime = 0;
            }
        }
        
        // 입력 처리 (히트 중이 아닐 때만)
        if (this.state !== 'hit') {
            this.handleInput(deltaTime);
        }
        
        // 물리 적용
        this.applyPhysics(deltaTime);
        
        // 충돌 체크
        this.checkCollisions();
        
        // 애니메이션 업데이트
        this.updateAnimation(deltaTime);
    }
    
    /**
     * 입력 처리
     * @param {number} deltaTime
     */
    handleInput(deltaTime) {
        const config = Game.config.player;
        let speed = this.onGround ? config.speed : config.airSpeed;
        
        // 차징 중에는 이동 속도 10%로 감소
        if (this.isCharging) {
            speed *= 0.1;
        }
        
        // 좌우 이동
        if (Game.isKeyPressed('ArrowLeft') || Game.isKeyPressed('a')) {
            this.velocityX -= speed * deltaTime*30;
            // this.direction = -1;  // 좌우 반전 비활성화
            if (this.onGround && this.state !== 'charging') {
                this.state = 'run';
            }
        }
        if (Game.isKeyPressed('ArrowRight') || Game.isKeyPressed('d')) {
            this.velocityX += speed * deltaTime*30;
            // this.direction = 1;  // 좌우 반전 비활성화
            if (this.onGround && this.state !== 'charging') {
                this.state = 'run';
            }
        }
        
        // 차징 중 최대 속도 제한
        if (this.isCharging) {
            const maxChargingSpeed = config.speed * 0.1;
            if (Math.abs(this.velocityX) > maxChargingSpeed) {
                this.velocityX *= 0.9; // 빠르게 감속
            }
        }
        
        // 공중에서 최대 속도 제한
        if (!this.onGround) {
            const maxAirSpeed = config.speed * 1.6; // 지상 속도의 1.6배까지만 허용
            if (Math.abs(this.velocityX) > maxAirSpeed) {
                this.velocityX = Math.sign(this.velocityX) * maxAirSpeed;
            }
        }
        
        // 점프 차징
        const spacePressed = Game.isKeyPressed(' ');
        
        // 땅에 있고 스페이스바를 누르는 중 → 차징
        if (spacePressed && this.onGround) {
            if (!this.isCharging) {
                this.isCharging = true;
                this.chargeTime = 0;
                this.state = 'charging';
                console.log('[Player] 차징 시작!');
            }
            // 차징 시간 증가
            this.chargeTime = Math.min(this.chargeTime + deltaTime, this.maxChargeTime);
        } 
        // 차징 중이었는데 스페이스바를 뗌 → 점프!
        else if (this.isCharging && !spacePressed) {
            this.jump();
            this.isCharging = false;
        }
        
        // 가만히 있을 때
        if (!Game.isKeyPressed('ArrowLeft') && !Game.isKeyPressed('ArrowRight') &&
            !Game.isKeyPressed('a') && !Game.isKeyPressed('d') &&
            this.onGround && !this.isCharging) {
            this.state = 'idle';
        }
    }
    
    /**
     * 점프 실행
     */
    jump() {
        const config = Game.config.player;
        const chargeRatio = this.chargeTime / this.maxChargeTime;
        const jumpPower = config.minJumpPower + (config.maxJumpPower - config.minJumpPower) * chargeRatio;
        
        this.velocityY = -jumpPower;
        this.onGround = false;
        this.currentPlatform = null;
        this.state = 'rise';
        
        console.log(`[Player] 점프! 파워: ${jumpPower.toFixed(0)} (차징: ${(chargeRatio * 100).toFixed(0)}%)`);
    }
    
    /**
     * 물리 적용
     * @param {number} deltaTime
     */
    applyPhysics(deltaTime) {
        // 중력
        if (!this.onGround) {
            this.velocityY += Game.config.gravity * deltaTime;
            this.velocityY = Math.min(this.velocityY, Game.config.maxFallSpeed);
        }
        
        // 마찰
        const friction = this.onGround ? 
            (this.currentPlatform && this.currentPlatform.type === 'icePlatform' ? 
                this.currentPlatform.friction : Game.config.player.friction) :
            Game.config.player.airFriction;
        
        this.velocityX *= friction;
        
        // 매우 작은 속도는 0으로
        if (Math.abs(this.velocityX) < 0.1) {
            this.velocityX = 0;
        }
        
        // 위치 업데이트
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }
    
    /**
     * 충돌 체크
     */
    checkCollisions() {
        this.onGround = false;
        this.currentPlatform = null;
        
        // 발판 충돌
        Game.objects.platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                // 플레이어의 이전 위치 계산
                const prevBottom = this.y + this.height - this.velocityY * DeltaTime.get();
                const prevRight = this.x + this.width - this.velocityX * DeltaTime.get();
                const prevLeft = this.x - this.velocityX * DeltaTime.get();
                
                // 벽인지 확인 (폭이 좁고 높이가 높은 플랫폼)
                const isWall = platform.width <= 20 && platform.height > 1000;
                
                if (isWall) {
                    // 벽의 경우 좌우 충돌만 처리
                    if (this.velocityX > 0 && prevRight <= platform.x) {
                        // 왼쪽 벽에 충돌 (오른쪽으로 이동 중)
                        this.x = platform.x - this.width;
                        this.velocityX = 0;
                    } else if (this.velocityX < 0 && prevLeft >= platform.x + platform.width) {
                        // 오른쪽 벽에 충돌 (왼쪽으로 이동 중)
                        this.x = platform.x + platform.width;
                        this.velocityX = 0;
                    }
                } else {
                    // 일반 플랫폼의 경우 위에서 떨어지는 충돌만 처리
                    if (this.velocityY >= 0 && prevBottom <= platform.y + 5) {
                        this.y = platform.y - this.height;
                        this.velocityY = 0;
                        this.onGround = true;
                        this.currentPlatform = platform;
                        
                        // 얼음 장판 체크
                        if (platform.type === 'icePlatform') {
                            // 마찰 감소는 applyPhysics에서 처리
                        }
                    }
                }
            }
        });
        
        // MovingPlatform 충돌 (발판처럼 처리)
        Game.objects.obstacles.forEach(obstacle => {
            if (obstacle instanceof MovingPlatform && obstacle.active) {
                if (this.collidesWith(obstacle)) {
                    // 플레이어의 이전 위치 계산
                    const prevBottom = this.y + this.height - this.velocityY * DeltaTime.get();
                    
                    // 위에서 떨어지는 충돌만 처리
                    if (this.velocityY >= 0 && prevBottom <= obstacle.y + 5) {
                        this.y = obstacle.y - this.height;
                        this.velocityY = 0;
                        this.onGround = true;
                        this.currentPlatform = obstacle;
                    }
                }
            }
        });
        
        // 일반 장애물 충돌
        Game.objects.obstacles.forEach(obstacle => {
            if (!(obstacle instanceof MovingPlatform) && obstacle.active && this.collidesWith(obstacle)) {
                obstacle.onCollision(this);
            }
        });
        
        // 문 충돌
        Game.objects.doors.forEach(door => {
            // Door의 collidesWith가 openProgress를 체크하므로 그대로 사용
            if (door.collidesWith(this)) {
                door.onCollision(this);
            }
        });
        
        // 스위치 충돌
        Game.objects.switches.forEach(switchObj => {
            if (this.collidesWith(switchObj)) {
                switchObj.onCollision(this);
            }
        });
        
        // 투사체 충돌
        Game.objects.projectiles.forEach(projectile => {
            if (projectile.active && projectile.collidesWith(this)) {
                projectile.onCollision(this);
            }
        });
    }
    
    /**
     * 충돌 체크
     * @param {Object} obj - 충돌 대상
     * @returns {boolean}
     */
    collidesWith(obj) {
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y
        );
    }
    
    /**
     * 애니메이션 업데이트
     * @param {number} deltaTime
     */
    updateAnimation(deltaTime) {
        const config = Game.config.animation;
        
        // 현재 상태에 따른 애니메이션
        let animConfig = config.idle;
        
        switch (this.state) {
            case 'idle':
                animConfig = config.idle;
                break;
            case 'run':
                animConfig = config.run;
                break;
            case 'rise':
                animConfig = config.rise;
                break;
            case 'fall':
                animConfig = config.fall;
                break;
            case 'hit':
                animConfig = config.hit;
                break;
            case 'charging':
                animConfig = config.idle;
                break;
        }
        
        // 공중 상태 업데이트
        if (!this.onGround && this.state !== 'hit') {
            if (this.velocityY < 0) {
                this.state = 'rise';
            } else if (this.velocityY > 0) {
                this.state = 'fall';
            }
        }
        
        // 프레임 업데이트
        this.animationTime += deltaTime;
        
        const frameSpeed = animConfig.speed * (1 + Math.abs(this.velocityX) / 500);
        
        if (this.animationTime >= frameSpeed) {
            this.animationTime = 0;
            this.currentFrame++;
            
            if (this.currentFrame > animConfig.end) {
                this.currentFrame = animConfig.start;
            }
        }
    }
    
    /**
     * 그리기
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        const screenPos = Game.worldToScreen(this.x, this.y);
        
        // 스프라이트가 정상적으로 로드되었는지 확인 (complete && naturalWidth > 0)
        if (this.spriteSheet && this.spriteSheet.complete && this.spriteSheet.naturalWidth > 0) {
            // 스프라이트 그리기
            ctx.save();
            
            // 좌우 반전
            if (this.direction === -1) {
                ctx.scale(-1, 1);
                ctx.drawImage(
                    this.spriteSheet,
                    0, 0,  // 단일 이미지이므로 0, 0에서 시작
                    this.spriteSheet.naturalWidth, this.spriteSheet.naturalHeight,  // 원본 이미지 전체 크기
                    -(screenPos.x + this.width), screenPos.y,
                    this.width, this.height
                );
            } else {
                ctx.drawImage(
                    this.spriteSheet,
                    0, 0,  // 단일 이미지이므로 0, 0에서 시작
                    this.spriteSheet.naturalWidth, this.spriteSheet.naturalHeight,  // 원본 이미지 전체 크기
                    screenPos.x, screenPos.y,
                    this.width, this.height
                );
            }
            
            ctx.restore();
        } else {
            // 기본 렌더링 (스프라이트 없을 때)
            ctx.fillStyle = this.state === 'hit' ? '#ff0000' : '#4488ff';
            ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
            
            // 방향 표시
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
                screenPos.x + (this.direction === 1 ? this.width - 10 : 0),
                screenPos.y + this.height / 2 - 5,
                10, 10
            );
        }
        
        // 점프 차징 표시
        if (this.isCharging) {
            const chargeRatio = this.chargeTime / this.maxChargeTime;
            const barWidth = this.width;
            const barHeight = 6;
            
            ctx.fillStyle = '#333333';
            ctx.fillRect(screenPos.x, screenPos.y - 15, barWidth, barHeight);
            
            ctx.fillStyle = `hsl(${120 * chargeRatio}, 100%, 50%)`;
            ctx.fillRect(screenPos.x, screenPos.y - 15, barWidth * chargeRatio, barHeight);
        }
        
        // 디버그 정보
        if (Game.debug) {
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(screenPos.x, screenPos.y, this.width, this.height);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px monospace';
            ctx.fillText(`State: ${this.state}`, screenPos.x, screenPos.y - 20);
            ctx.fillText(`Vel: ${this.velocityX.toFixed(0)}, ${this.velocityY.toFixed(0)}`, screenPos.x, screenPos.y - 35);
            ctx.fillText(`Ground: ${this.onGround}`, screenPos.x, screenPos.y - 50);
            ctx.fillText(`Charging: ${this.isCharging}`, screenPos.x, screenPos.y - 65);
        }
    }
    
    /**
     * 위치 리셋 (체크포인트)
     * @param {number} x
     * @param {number} y
     */
    resetPosition(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.state = 'idle';
        this.hitTime = 0;
        this.isCharging = false;
        this.chargeTime = 0;
        console.log(`[Player] 위치 리셋: (${x}, ${y})`);
    }
}

// 전역 노출
if (typeof window !== 'undefined') {
    window.Player = Player;
}
