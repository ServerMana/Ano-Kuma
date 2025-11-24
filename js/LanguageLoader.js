/**
 * LanguageLoader.js
 * 언어 관리 및 텍스트 가져오기
 */

const LanguageManager = {
    currentLanguage: 'ko',
    languages: {},
    
    /**
     * 초기화
     */
    init: function() {
        this.languages = {
            ko: window.LanguageKO || {},
            en: window.LanguageEN || {},
            ja: window.LanguageJA || {}
        };
        
        console.log('[LanguageManager] 초기화 완료');
    },
    
    /**
     * 언어 설정
     * @param {string} lang - 언어 코드 (ko, en, ja)
     */
    setLanguage: function(lang) {
        if (this.languages[lang]) {
            this.currentLanguage = lang;
            console.log(`[LanguageManager] 언어 변경: ${lang}`);
        } else {
            console.warn(`[LanguageManager] 지원하지 않는 언어: ${lang}`);
        }
    },
    
    /**
     * 텍스트 가져오기
     * @param {string} key - 텍스트 키
     * @returns {string} 해당 언어의 텍스트
     */
    getText: function(key) {
        const langData = this.languages[this.currentLanguage];
        return langData[key] || key;
    }
};

if (typeof window !== 'undefined') {
    window.LanguageManager = LanguageManager;
}
