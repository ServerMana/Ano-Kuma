/**
 * ko.js
 * 한국어 텍스트
 */

const LanguageKO = {
    // 게임 제목
    gameTitle: '그 곰은 인간이 되고 싶어',
    
    // 메인 메뉴
    startGame: '게임 시작',
    settings: '설정',
    
    // 오프닝
    tutorialQuestion: '오프닝을 보시겠습니까?',
    yes: '예',
    no: '아니오',
    
    // 일시정지 메뉴
    paused: '일시정지',
    resume: '계속하기',
    restart: '재시작',
    toMain: '메인 메뉴',
    
    // 설정
    bgmVolume: 'BGM 볼륨',
    seVolume: '효과음 볼륨',
    back: '돌아가기',
    
    // 게임 내
    stage: '스테이지',
    
    // 조작법
    controlMove: '← → : 이동',
    controlJump: 'Space : 점프',
    controlPause: 'ESC : 일시정지',
    controlDebug: 'F3 : 디버그'
};

if (typeof window !== 'undefined') {
    window.LanguageKO = LanguageKO;
}
