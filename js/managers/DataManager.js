/**
 * DataManager.js
 * 간단한 설정 저장 (LocalStorage 사용)
 */

const DataManager = {
    // 저장 키
    STORAGE_KEY: 'bearGame_settings',
    
    // 기본 설정
    defaultSettings: {
        bgmVolume: 70,
        seVolume: 70,
        language: 'ko'
    },
    
    /**
     * 설정 저장
     * @param {Object} settings - 저장할 설정
     */
    saveSettings: function(settings) {
        try {
            const data = JSON.stringify(settings);
            localStorage.setItem(this.STORAGE_KEY, data);
            console.log('[DataManager] 설정 저장 완료');
        } catch (error) {
            console.error('[DataManager] 설정 저장 실패:', error);
        }
    },
    
    /**
     * 설정 불러오기
     * @returns {Object} 저장된 설정
     */
    loadSettings: function() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const settings = JSON.parse(data);
                console.log('[DataManager] 설정 불러오기 완료');
                return settings;
            }
        } catch (error) {
            console.error('[DataManager] 설정 불러오기 실패:', error);
        }
        
        console.log('[DataManager] 기본 설정 사용');
        return { ...this.defaultSettings };
    },
    
    /**
     * 설정 초기화
     */
    resetSettings: function() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('[DataManager] 설정 초기화 완료');
        } catch (error) {
            console.error('[DataManager] 설정 초기화 실패:', error);
        }
    }
};

// 전역 객체로 노출
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}
