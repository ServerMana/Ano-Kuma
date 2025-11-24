/**
 * MapManager.js
 * 맵 데이터 로드 및 관리
 * JSON 파일에서 맵을 불러와 절대 좌표로 변환
 */

const MapManager = {
    // 현재 로드된 맵들
    loadedMaps: {},
    
    // 맵 데이터 캐시
    mapCache: {},
    
    // 현재 활성화된 맵 목록 (스테이지 연결)
    activeMaps: [],
    
    // 맵 오프셋 (스테이지 연결용)
    mapOffsets: {},
    
    /**
     * 맵 JSON 파일 로드
     * @param {string} mapId - 맵 ID (예: "Map001", "Map002")
     * @returns {Promise<Object>} 맵 데이터
     */
    loadMap: async function(mapId) {
        // 캐시 확인
        if (this.mapCache[mapId]) {
            console.log(`[MapManager] 캐시에서 맵 로드: ${mapId}`);
            return this.mapCache[mapId];
        }
        
        try {
            console.log(`[MapManager] 맵 로드 시작: ${mapId}`);
            const response = await fetch(`data/${mapId}.json`);
            
            if (!response.ok) {
                throw new Error(`맵 파일을 찾을 수 없습니다: ${mapId}`);
            }
            
            const mapData = await response.json();
            this.mapCache[mapId] = mapData;
            console.log(`[MapManager] 맵 로드 완료: ${mapId}`, mapData);
            
            return mapData;
        } catch (error) {
            console.error(`[MapManager] 맵 로드 실패: ${mapId}`, error);
            return null;
        }
    },
    
    /**
     * 여러 맵을 연속으로 로드 (스테이지 연결)
     * @param {Array<string>} mapIds - 맵 ID 배열
     * @returns {Promise<void>}
     */
    loadMultipleMaps: async function(mapIds) {
        console.log(`[MapManager] 여러 맵 로드 시작:`, mapIds);
        
        this.activeMaps = [];
        this.mapOffsets = {};
        
        let currentOffsetY = 0;
        
        for (let i = 0; i < mapIds.length; i++) {
            const mapId = mapIds[i];
            const mapData = await this.loadMap(mapId);
            
            if (mapData) {
                // 맵 오프셋 저장 (이전 맵 위에 쌓기)
                this.mapOffsets[mapId] = {
                    x: 0,
                    y: currentOffsetY
                };
                
                this.activeMaps.push({
                    id: mapId,
                    data: mapData,
                    offset: this.mapOffsets[mapId]
                });
                
                // 다음 맵은 현재 맵 위에 배치
                currentOffsetY -= (mapData.height || 3000);
                
                console.log(`[MapManager] 맵 ${mapId} 오프셋: Y=${this.mapOffsets[mapId].y}`);
            }
        }
        
        console.log(`[MapManager] 모든 맵 로드 완료`);
    },
    
    /**
     * 상대 좌표를 절대 좌표로 변환
     * @param {number} relativeX - 맵 내 상대 X 좌표
     * @param {number} relativeY - 맵 내 상대 Y 좌표 (0 = 맵 바닥)
     * @param {string} mapId - 맵 ID
     * @returns {Object} {x, y} 절대 좌표
     */
    relativeToAbsolute: function(relativeX, relativeY, mapId) {
        const offset = this.mapOffsets[mapId] || { x: 0, y: 0 };
        
        return {
            x: relativeX + offset.x,
            y: relativeY + offset.y
        };
    },
    
    /**
     * 절대 좌표를 상대 좌표로 변환
     * @param {number} absoluteX - 절대 X 좌표
     * @param {number} absoluteY - 절대 Y 좌표
     * @param {string} mapId - 맵 ID
     * @returns {Object} {x, y} 상대 좌표
     */
    absoluteToRelative: function(absoluteX, absoluteY, mapId) {
        const offset = this.mapOffsets[mapId] || { x: 0, y: 0 };
        
        return {
            x: absoluteX - offset.x,
            y: absoluteY - offset.y
        };
    },
    
    /**
     * 맵 데이터에서 오브젝트 생성
     * @param {Object} mapData - 맵 데이터
     * @param {string} mapId - 맵 ID
     * @returns {Object} {platforms, obstacles}
     */
    createObjectsFromMap: function(mapData, mapId) {
        const platforms = [];
        const obstacles = [];
        
        if (!mapData) return { platforms, obstacles };
        
        const offset = this.mapOffsets[mapId] || { x: 0, y: 0 };
        
        // 발판 생성
        if (mapData.platforms) {
            mapData.platforms.forEach(platformData => {
                platforms.push({
                    x: platformData.x + offset.x,
                    y: platformData.y + offset.y,
                    width: platformData.width,
                    height: platformData.height,
                    type: platformData.type || 'normal',
                    color: platformData.color,
                    borderColor: platformData.borderColor,
                    friction: platformData.friction,
                    mapId: mapId
                });
            });
        }
        
        // 장애물 생성
        if (mapData.obstacles) {
            mapData.obstacles.forEach(obstacleData => {
                obstacles.push({
                    x: obstacleData.x + offset.x,
                    y: obstacleData.y + offset.y,
                    width: obstacleData.width || 64,
                    height: obstacleData.height || 64,
                    type: obstacleData.type,
                    direction: obstacleData.direction || 0,
                    interval: obstacleData.interval,
                    distance: obstacleData.distance,
                    speed: obstacleData.speed,
                    force: obstacleData.force,
                    properties: obstacleData.properties || {},
                    mapId: mapId
                });
            });
        }
        
        console.log(`[MapManager] 맵 ${mapId}에서 발판 ${platforms.length}개, 장애물 ${obstacles.length}개 생성`);
        
        return { platforms, obstacles };
    },
    
    /**
     * 모든 활성 맵에서 오브젝트 생성
     * @returns {Object} {platforms, obstacles}
     */
    createAllObjects: function() {
        let allPlatforms = [];
        let allObstacles = [];
        
        this.activeMaps.forEach(map => {
            const { platforms, obstacles } = this.createObjectsFromMap(map.data, map.id);
            allPlatforms = allPlatforms.concat(platforms);
            allObstacles = allObstacles.concat(obstacles);
        });
        
        console.log(`[MapManager] 총 발판 ${allPlatforms.length}개, 장애물 ${allObstacles.length}개 생성`);
        
        return {
            platforms: allPlatforms,
            obstacles: allObstacles
        };
    },
    
    /**
     * 특정 스테이지의 시작 위치 가져오기
     * @param {number} stage - 스테이지 번호 (1~5)
     * @returns {Object} {x, y} 시작 위치
     */
    getStageStartPosition: function(stage) {
        const mapId = `Map${String(stage).padStart(3, '0')}`;
        const mapData = this.mapCache[mapId];
        
        if (mapData && mapData.startPosition) {
            return this.relativeToAbsolute(
                mapData.startPosition.x,
                mapData.startPosition.y,
                mapId
            );
        }
        
        // 기본 시작 위치
        const offset = this.mapOffsets[mapId] || { x: 0, y: 0 };
        return {
            x: 100 + offset.x,
            y: 500 + offset.y
        };
    },
    
    /**
     * 맵 캐시 클리어
     */
    clearCache: function() {
        this.mapCache = {};
        this.loadedMaps = {};
        this.activeMaps = [];
        this.mapOffsets = {};
        console.log('[MapManager] 캐시 클리어 완료');
    }
};

// 전역 객체로 노출
if (typeof window !== 'undefined') {
    window.MapManager = MapManager;
}
