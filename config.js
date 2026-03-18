// js/config.js
window.CONFIG = {
    // Геометрия лица (с твоими офсетами)
    EYE_X: 135, EYE_Y: 80, MOUTH_Y: 230,
    BODY_Y_FIXED: 200, BODY_SCALE_V: 0.95, BODY_SCALE_H: 1.05,
    LIMIT_Y_TOP: 20, LIMIT_Y_BOT: 270, ZONE_A: 180, ZONE_B: 225,
    VIDEO_URL: 'https://raw.githubusercontent.com/AhVasalam1337/tvar_blyat/main/main.webm',

    // --- ПАРАМЕТРЫ МАКРО-СЦЕНЫ (Мясной мешок) ---
    // Убрали время и количество, теперь тут один прыщ в центре
    FAIL_PENALTY_TIME: 5        // Шраф времени, если прыщ лопнул на 5 стадии (оставим, если пригодится шрам)
};

window.PIMPLE_TYPES = {
    NORMAL: { hp: 1, chance: 0.7, baseScale: 0.45, tint: 0xFFFFFF, needsScalpel: false, needsLoupe: false },
    FAT: { hp: 4, chance: 0.2, baseScale: 0.7, tint: 0xFF8888, needsScalpel: false, needsLoupe: false },
    // CYST теперь требует Лупу, а не Скальпель
    CYST: { hp: 1, chance: 0.1, baseScale: 0.9, tint: 0xFFFFFF, needsScalpel: false, needsLoupe: true }
};

window.EYE_VARIANTS = [
    'https://i.imgur.com/5QYqNfP.png',
    'https://i.imgur.com/n1btnwX.png',
    'https://i.imgur.com/c6NTen4.png'
];

window.FACE_VARIANTS = [
    'https://i.imgur.com/Q4kAiIp.png', 'https://i.imgur.com/sNjUa1z.png',
    'https://i.imgur.com/q71l9Ch.png', 'https://i.imgur.com/O8kyIO7.png',
    'https://i.imgur.com/SzvyMEd.png', 'https://i.imgur.com/o24qR2O.png'
];

// Твои 5 стадий творожных прыщей
window.MICRO_PIMPLE_STAGES = [
    'https://i.imgur.com/E5a6lqH.png', // 1 стадия
    'https://i.imgur.com/82lAnjD.png', // 2 стадия
    'https://i.imgur.com/VVKyAuy.png', // 3 стадия
    'https://i.imgur.com/Ztlj2yZ.png', // 4 стадия
    'https://i.imgur.com/BdPadcO.png'  // 5 стадия (BdPadcO.png)
];

window.ASSETS_MANIFEST = {
    // Лицо
    body: 'https://i.imgur.com/zr0nAvr.png',
    mOpen: 'https://i.imgur.com/dQMJxii.png', mClose: 'https://i.imgur.com/V2fI7rT.png',
    eClose: 'https://i.imgur.com/5JoI7cd.png',
    pimple: 'https://i.imgur.com/VX0GzMe.png', pPop: 'https://i.imgur.com/AN04txu.png',
    
    // Инструменты
    scalpel: 'https://i.imgur.com/DqpFZtX.png',
    loupe: 'https://i.imgur.com/E0U6y6N.png', // Ссылка на лупу (теперь не заглушка)

    // Микро-сцена
    microMeat: 'https://i.imgur.com/ZoPx34R.png' // Твой фотореалистичный срез кожи (мясо)
};

window.INTRO_DIALOGS = [
    "Ой, что это за белая опухоль?!",
    "Кажется, тут обычными руками не справиться... Неси Лупу!"
];