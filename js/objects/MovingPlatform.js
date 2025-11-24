/**
 * MovingPlatform.js
 * 좌우 또는 상하로 움직이는 발판
 */

class MovingPlatform {
    /**
     * @param {number} x - 시작 X 좌표
     * @param {number} y - 시작 Y 좌표
     * @param {number} width - 발판 너비
     * @param {number} height - 발판 높이
     * @param {string} direction - 이동 방향 ('horizontal' 또는 'vertical')
     * @param {number} distance - 이동 거리 (픽셀)
     * @param {number} speed - 이동 속도 (픽셀/초)
     */
    constructor(x, y, width, height, direction = 'horizontal', distance = 200, speed = 100) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.direction = direction; // 'horizontal' or 'vertical'
        this.distance = distance;   // 이동 거리
        this.speed = speed;         // 이동 속도 (픽셀/초)
        
        // 활성화 상태
        this.active = true;
        
        // 이동 상태
        this.moving = true;
        this.progress = 0;          // 0 ~ 1 사이의 진행도
        this.forward = true;        // true: 정방향, false: 역방향
        
        // 이전 위치 (플레이어 이동 계산용)
        this.prevX = x;
        this.prevY = y;
        
        // 색상
        this.color = '#000000';     // 검은색
        this.borderColor = '#333333'; // 진한 회색 테두리
    }
    
    /**
     * 업데이트
     * @param {number} deltaTime - 프레임 시간 (초)
     */
    update(deltaTime) {
        if (!this.moving) return;
        
        // 이전 위치 저장
        this.prevX = this.x;
        this.prevY = this.y;
        
        // 진행도 업데이트
        const progressDelta = (this.speed / this.distance) * deltaTime;
        
        if (this.forward) {
            this.progress += progressDelta;
            if (this.progress >= 1) {
                this.progress = 1;
                this.forward = false;
            }
        } else {
            this.progress -= progressDelta;
            if (this.progress <= 0) {
                this.progress = 0;
                this.forward = true;
            }
        }
        
        // 위치 계산 (부드러운 움직임을 위해 easeInOut 적용)
        const eased = this.easeInOutSine(this.progress);
        
        if (this.direction === 'horizontal') {
            this.x = this.startX + (this.distance * eased);
            this.y = this.startY;
        } else { // vertical
            this.x = this.startX;
            this.y = this.startY + (this.distance * eased);
        }
    }
    
    /**
     * Ease In Out Sine 함수
     * @param {number} t - 0 ~ 1 사이의 값
     * @returns {number} eased 값
     */
    easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }
    
    /**
     * 플레이어가 발판 위에 있는지 확인
     * @param {Object} player - 플레이어 객체
     * @returns {boolean}
     */
    isPlayerOn(player) {
        // 플레이어가 발판 위에 서 있는지 확인
        const onTop = player.y + player.height >= this.y - 2 && 
                      player.y + player.height <= this.y + this.height + 2;
        const horizontalOverlap = player.x + player.width > this.x && 
                                  player.x < this.x + this.width;
        
        return onTop && horizontalOverlap && player.onGround;
    }
    
    /**
     * 플레이어를 발판과 함께 이동
     * @param {Object} player - 플레이어 객체
     */
    movePlayer(player) {
        const dx = this.x - this.prevX;
        const dy = this.y - this.prevY;
        
        player.x += dx;
        player.y += dy;
    }
    
    /**
     * 충돌 처리 (빈 함수 - MovingPlatform은 특별한 충돌 처리 없음)
     * @param {Object} player - 플레이어 객체
     */
    onCollision(player) {
        // MovingPlatform은 update에서 movePlayer로 처리
    }
    
    /**
     * 렌더링
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {Object} camera - 카메라 객체
     */
    render(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // 발판 그리기
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, screenY, this.width, this.height);
        
        // 테두리
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX, screenY, this.width, this.height);
        
        // 화살표 표시 (이동 방향)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const arrow = this.direction === 'horizontal' ? '↔' : '↕';
        ctx.fillText(arrow, screenX + this.width / 2, screenY + this.height / 2);
        
        // 디버그: 시작점과 끝점 표시
        if (Game.debug) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            if (this.direction === 'horizontal') {
                // 좌우 이동 경로
                const startScreenX = this.startX - camera.x;
                const endScreenX = this.startX + this.distance - camera.x;
                const pathY = this.startY + this.height / 2 - camera.y;
                
                ctx.beginPath();
                ctx.moveTo(startScreenX, pathY);
                ctx.lineTo(endScreenX, pathY);
                ctx.stroke();
            } else {
                // 상하 이동 경로
                const pathX = this.startX + this.width / 2 - camera.x;
                const startScreenY = this.startY - camera.y;
                const endScreenY = this.startY + this.distance - camera.y;
                
                ctx.beginPath();
                ctx.moveTo(pathX, startScreenY);
                ctx.lineTo(pathX, endScreenY);
                ctx.stroke();
            }
            
            ctx.setLineDash([]);
        }
    }
}
