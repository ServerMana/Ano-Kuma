/**
 * en.js
 * English Text
 */

const LanguageEN = {
    // Game Title
    gameTitle: 'The Bear Who Wanted to Become Human',
    
    // Main Menu
    startGame: 'Start Game',
    settings: 'Settings',
    
    // Opening
    tutorialQuestion: 'Would you like to watch the opening?',
    yes: 'Yes',
    no: 'No',
    
    // Pause Menu
    paused: 'Paused',
    resume: 'Resume',
    restart: 'Restart',
    toMain: 'Main Menu',
    
    // Settings
    bgmVolume: 'BGM Volume',
    seVolume: 'SE Volume',
    back: 'Back',
    
    // In-Game
    stage: 'Stage',
    
    // Controls
    controlMove: '← → : Move',
    controlJump: 'Space : Jump',
    controlPause: 'ESC : Pause',
    controlDebug: 'F3 : Debug'
};

if (typeof window !== 'undefined') {
    window.LanguageEN = LanguageEN;
}
