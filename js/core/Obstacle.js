/**
 * Obstacle.js
 * 모든 장애물 및 탄막 정의
 */

/**
 * 기본 장애물 클래스
 */
class Obstacle {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.active = true;
    }
    
    update(deltaTime) {
        // 기본 업데이트 (하위 클래스에서 오버라이드)
    }
    
    draw(ctx, camera) {
        // 기본 그리기 (하위 클래스에서 오버라이드)
    }
    
    collidesWith(obj) {
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y
        );
    }
    
    onCollision(player) {
        // 충돌 처리 (하위 클래스에서 오버라이드)
    }
}

/**
 * 붉은 장판 - 밟으면 날아감
 */
class RedPlatform extends Obstacle {
    constructor(x, y, width, height) {
        super(x, y, width, height, 'redPlatform');
        this.color = '#ff4444';
    }
    
    draw(ctx, camera) {
        const screenPos = Game.worldToScreen(this.x, this.y);
        ctx.fillStyle = this.color;
        ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
        
        // 경고 패턴
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenPos.x, screenPos.y, this.width, this.height);
    }
    
    onCollision(player) {
        const config = Game.config.obstacles.redPlatform;
        const angle = config.knockbackAngle * Math.PI / 180;
        
        player.velocityX = Math.cos(angle) * config.knockbackForce * (player.x < this.x + this.width / 2 ? -1 : 1);
        player.velocityY = Math.sin(angle) * config.knockbackForce;
        player.state = 'hit';
        
        console.log('[RedPlatform] 플레이어 날림!');
    }
}

/**
 * 대포 - 탄막 발사
 */
class Cannon extends Obstacle {
    constructor(x, y, direction = 0) {
        super(x, y, 64, 64, 'cannon');
        this.direction = direction; // 0: 오른쪽, 90: 위, 180: 왼쪽, 270: 아래
        this.fireTimer = 0;
        this.fireInterval = Game.config.obstacles.cannon.fireInterval;
    }
    
    update(deltaTime) {
        this.fireTimer += deltaTime;
        
        if (this.fireTimer >= this.fireInterval) {
            this.fire();
            this.fireTimer = 0;
        }
    }
    
    fire() {
        const angle = this.direction * Math.PI / 180;
        const speed = Game.config.obstacles.cannon.bulletSpeed;
        
        const bullet = new Bullet(
            this.x + this.width / 2,
            this.y + this.height / 2,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        Game.objects.projectiles.push(bullet);
        console.log('[Cannon] 탄막 발사!');
    }
    
    draw(ctx, camera) {
        const screenPos = Game.worldToScreen(this.x, this.y);
        
        // 대포 몸체
        ctx.fillStyle = '#666666';
        ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
        
        // 대포 방향 표시
        ctx.save();
        ctx.translate(screenPos.x + this.width / 2, screenPos.y + this.height / 2);
        ctx.rotate(this.direction * Math.PI / 180);
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, -8, 30, 16);
        ctx.restore();
    }
}

/**
 * 탄막
 */
class Bullet {
    constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.width = 16;
        this.height = 16;
        this.active = true;
    }
    
    update(deltaTime) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        // 화면 밖으로 나가면 제거
        if (this.x < Game.camera.x - 200 || this.x > Game.camera.x + Game.width + 200 ||
            this.y < Game.camera.y - 200 || this.y > Game.camera.y + Game.height + 200) {
            this.active = false;
        }
    }
    
    draw(ctx, camera) {
        const screenPos = Game.worldToScreen(this.x, this.y);
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    collidesWith(obj) {
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.height > obj.y
        );
    }
    
    onCollision(player) {
        player.velocityX = this.velocityX * 0.5;
        player.velocityY = this.velocityY * 0.5;
        player.state = 'hit';
        this.active = false;
    }
}

/**
 * 스프링 - 방향별로 튕김
 */
class Spring extends Obstacle {
    constructor(x, y, direction = 1) {
        super(x, y, 80, 10, 'spring');
        this.direction = direction; // 1: 오른쪽, -1: 왼쪽, 2: 위, -2: 아래
        this.force = 800; // 기본 힘
        
        // 방향에 따라 크기 조정
        if (direction === 2 || direction === -2) {
            this.width = 10;
            this.height = 80;
        }
    }
    
    draw(ctx, camera) {
        const screenPos = Game.worldToScreen(this.x, this.y);
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
        
        // 스프링 표시
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        
        if (this.direction === 2 || this.direction === -2) {
            // 수직 스프링
            for (let i = 0; i < 5; i++) {
                const y = screenPos.y + (this.height / 5) * i;
                ctx.beginPath();
                ctx.moveTo(screenPos.x, y);
                ctx.lineTo(screenPos.x + this.width, y);
                ctx.stroke();
            }
        } else {
            // 수평 스프링
            for (let i = 0; i < 5; i++) {
                const x = screenPos.x + (this.width / 5) * i;
                ctx.beginPath();
                ctx.moveTo(x, screenPos.y);
                ctx.lineTo(x, screenPos.y + this.height);
                ctx.stroke();
            }
        }
    }
    
    onCollision(player) {
        const force = this.force;
        
        if (this.direction === 1) {
            // 오른쪽으로 튕김
            player.velocityX = force;
            player.velocityY = -force * 0.5;
        } else if (this.direction === -1) {
            // 왼쪽으로 튕김
            player.velocityX = -force;
            player.velocityY = -force * 0.5;
        } else if (this.direction === 2) {
            // 위로 튕김
            player.velocityY = -force;
            player.velocityX *= 0.5;
        } else if (this.direction === -2) {
            // 아래로 튕김
            player.velocityY = force;
            player.velocityX *= 0.5;
        }
        
        console.log('[Spring] 플레이어 튕김! direction:', this.direction);
    }
}

/**
 * 얼음 장판 - 마찰 감소
 */
class IcePlatform extends Obstacle {
    constructor(x, y, width, height) {
        super(x, y, width, height, 'icePlatform');
        this.friction = Game.config.obstacles.icePlatform.friction;
    }
    
    draw(ctx, camera) {
        const screenPos = Game.worldToScreen(this.x, this.y);
        
        // 얼음 효과
        const gradient = ctx.createLinearGradient(
            screenPos.x, screenPos.y,
            screenPos.x + this.width, screenPos.y + this.height
        );
        gradient.addColorStop(0, '#aaddff');
        gradient.addColorStop(1, '#6699cc');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
        
        // 얼음 패턴
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenPos.x, screenPos.y, this.width, this.height);
    }
}

/**
 * 미사일 - 플레이어 추적
 */
class Missile {
    constructor(x, y, target) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 12;
        this.target = target;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = Game.config.obstacles.missile.speed;
        this.turnSpeed = Game.config.obstacles.missile.turnSpeed;
        this.active = true;
        this.angle = 0;
    }
    
    update(deltaTime) {
        if (!this.target) {
            this.active = false;
            return;
        }
        
        // 타겟 방향 계산
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const targetAngle = Math.atan2(dy, dx);
        
        // 부드러운 회전
        let angleDiff = targetAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        this.angle += angleDiff * this.turnSpeed * deltaTime * Math.PI / 180;
        
        // 이동
        this.velocityX = Math.cos(this.angle) * this.speed;
        this.velocityY = Math.sin(this.angle) * this.speed;
        
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
    }
    
    draw(ctx, camera) {
        const screenPos = Game.worldToScreen(this.x, this.y);
        
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        ctx.rotate(this.angle);
        
        // 미사일 몸체
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-this.height / 2, -this.width / 2, this.height, this.width);
        
        // 미사일 끝
        ctx.beginPath();
        ctx.moveTo(this.height / 2, 0);
        ctx.lineTo(this.height / 2 + 10, -this.width / 2);
        ctx.lineTo(this.height / 2 + 10, this.width / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    collidesWith(obj) {
        const distance = Math.sqrt(
            Math.pow(this.x - (obj.x + obj.width / 2), 2) +
            Math.pow(this.y - (obj.y + obj.height / 2), 2)
        );
        return distance < Game.config.obstacles.missile.explosionRadius;
    }
    
    onCollision(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const force = 1000;
            player.velocityX = (dx / distance) * force;
            player.velocityY = (dy / distance) * force;
        }
        
        player.state = 'hit';
        this.active = false;
        console.log('[Missile] 폭발!');
    }
}

/**
 * 미사일 발사 대포
 */
class MissileCannon extends Obstacle {
    constructor(x, y) {
        super(x, y, 64, 64, 'missileCannon');
        this.fireTimer = 0;
        this.fireInterval = 3.0;
    }
    
    update(deltaTime) {
        this.fireTimer += deltaTime;
        
        if (this.fireTimer >= this.fireInterval && Game.player) {
            this.fire();
            this.fireTimer = 0;
        }
    }
    
    fire() {
        const missile = new Missile(
            this.x + this.width / 2,
            this.y + this.height / 2,
            Game.player
        );
        
        Game.objects.projectiles.push(missile);
        console.log('[MissileCannon] 미사일 발사!');
    }
    
    draw(ctx, camera) {
        const screenPos = Game.worldToScreen(this.x, this.y);
        ctx.fillStyle = '#990000';
        ctx.fillRect(screenPos.x, screenPos.y, this.width, this.height);
        
        // 미사일 포트
        ctx.fillStyle = '#660000';
        ctx.fillRect(screenPos.x + 10, screenPos.y + 10, this.width - 20, this.height - 20);
    }
}

/**
 * 스위치 - 밟으면 연결된 문을 열거나 닫음
 */
class Switch extends Obstacle {
    constructor(x, y, doorId, timeout = null) {
        super(x, y, 80, 30, 'switch'); // 크기 증가: 80x30
        this.doorId = doorId; // 연결된 문의 ID
        this.isPressed = false;
        this.timeout = timeout; // null이면 영구, 숫자면 초 단위 타임아웃
        this.pressTimer = 0;
    }
    
    update(deltaTime) {
        // 타임아웃이 있고 눌린 상태면 타이머 감소
        if (this.timeout !== null && this.isPressed) {
            this.pressTimer -= deltaTime;
            if (this.pressTimer <= 0) {
                this.isPressed = false;
                // 연결된 문 닫기
                const door = Game.objects.doors.find(d => d.id === this.doorId);
                if (door) {
                    door.close();
                    console.log(`[Switch] 문 ${this.doorId} 타임아웃으로 닫힘!`);
                }
            }
        }
    }
    
    draw(ctx, camera) {
        const screenPos = Game.worldToScreen(this.x, this.y);
        
        // 스위치 베이스
        ctx.fillStyle = '#555555';
        ctx.fillRect(screenPos.x, screenPos.y + (this.isPressed ? 5 : 0), this.width, this.height - (this.isPressed ? 5 : 0));
        
        // 스위치 버튼
        ctx.fillStyle = this.isPressed ? '#00ff00' : '#ff0000';
        ctx.fillRect(screenPos.x + 10, screenPos.y + (this.isPressed ? 5 : 0), this.width - 20, 10);
        
        // 테두리
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenPos.x, screenPos.y + (this.isPressed ? 5 : 0), this.width, this.height - (this.isPressed ? 5 : 0));
        
        // 타임아웃이 있고 눌린 상태면 타이머 표시
        if (this.timeout !== null && this.isPressed && this.pressTimer > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px monospace';
            ctx.fillText(this.pressTimer.toFixed(1) + 's', screenPos.x, screenPos.y - 5);
        }
    }
    
    onCollision(player) {
        console.log('[Switch] onCollision 호출! this.doorId:', this.doorId, 'this.timeout:', this.timeout);
        
        if (!this.isPressed) {
            this.isPressed = true;
            
            // 타임아웃이 있으면 타이머 설정
            if (this.timeout !== null) {
                this.pressTimer = this.timeout;
                console.log(`[Switch] 타이머 시작: ${this.timeout}초`);
            }
            
            // 연결된 문 찾아서 열기
            const door = Game.objects.doors.find(d => d.id === this.doorId);
            
            if (door) {
                door.open();
                console.log(`[Switch] 문 ${this.doorId} 열림! ${this.timeout !== null ? `(${this.timeout}초 후 닫힘)` : '(영구)'}`);
            } else {
                console.error('[Switch] 문을 찾을 수 없음! doorId:', this.doorId);
            }
        }
        // 타임아웃 스위치는 위에 있어도 타이머 리셋하지 않음 (한 번만 작동)
    }
}

/**
 * 문 - 스위치로 열고 닫을 수 있는 장애물
 */
class Door extends Obstacle {
    constructor(x, y, width, height, id, initiallyOpen = false) {
        super(x, y, width, height, 'door');
        this.id = id; // 문 ID
        this.isOpen = initiallyOpen ? 1 : 0; // 0: 닫힘, 1: 열림
        this.originalHeight = height;
    }
    
    update(deltaTime) {
        // 업데이트 없음 - 0과 1만 사용
    }
    
    draw(ctx, camera) {
        // 문이 열려있으면(1) 그리지 않음
        if (this.isOpen === 1) {
            return;
        }
        
        const screenPos = Game.worldToScreen(this.x, this.y);
        
        // 문 그리기
        ctx.fillStyle = '#ff8888';
        ctx.fillRect(screenPos.x, screenPos.y, this.width, this.originalHeight);
        
        // 문 패턴
        ctx.strokeStyle = '#aa4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(screenPos.x, screenPos.y, this.width, this.originalHeight);
        
        // 가로 선
        for (let i = 1; i < 5; i++) {
            const lineY = screenPos.y + (this.originalHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(screenPos.x, lineY);
            ctx.lineTo(screenPos.x + this.width, lineY);
            ctx.stroke();
        }
    }
    
    toggle() {
        this.isOpen = this.isOpen === 0 ? 1 : 0;
    }
    
    open() {
        this.isOpen = 1;
    }
    
    close() {
        this.isOpen = 0;
    }
    
    collidesWith(obj) {
        // 문이 열려있으면(1) 충돌하지 않음
        if (this.isOpen === 1) {
            return false;
        }
        
        return (
            this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.y + this.originalHeight > obj.y
        );
    }
    
    onCollision(player) {
        // 문이 닫혀있을 때만 충돌 처리
        if (this.isOpen === 0) {
            // 왼쪽에서 충돌
            if (player.velocityX > 0) {
                player.x = this.x - player.width;
                player.velocityX = 0;
            }
            // 오른쪽에서 충돌
            else if (player.velocityX < 0) {
                player.x = this.x + this.width;
                player.velocityX = 0;
            }
        }
    }
}

// 전역 노출
if (typeof window !== 'undefined') {
    window.Obstacle = Obstacle;
    window.RedPlatform = RedPlatform;
    window.Cannon = Cannon;
    window.Bullet = Bullet;
    window.Spring = Spring;
    window.IcePlatform = IcePlatform;
    window.Missile = Missile;
    window.MissileCannon = MissileCannon;
    window.Switch = Switch;
    window.Door = Door;
}
