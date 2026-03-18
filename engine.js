// js/engine.js
window.tex = window.tex || {}; 
currentTool = 'finger'; 
scalpelSprite = null; 
loupeSprite = null; 
currentDialogIdx = -1;
dialogTimeout = null;

window.init = async function() {
    if (app && app.view) app.view.style.opacity = "0";
    
    try {
        // 1. Загрузка ассетов
        for (let k in ASSETS_MANIFEST) {
            if (!tex[k]) tex[k] = await PIXI.Assets.load(ASSETS_MANIFEST[k]);
        }

        // Рандом нового персонажа
        const rFaceUrl = FACE_VARIANTS[Math.floor(Math.random() * FACE_VARIANTS.length)];
        const rEyeUrl = EYE_VARIANTS[Math.floor(Math.random() * EYE_VARIANTS.length)];
        tex.currentFace = await PIXI.Assets.load(rFaceUrl);
        tex.currentEyeOpen = await PIXI.Assets.load(rEyeUrl);

        if (tex.pPop) {
            tex.pPop = new PIXI.Texture(tex.pPop.baseTexture, new PIXI.Rectangle(3, 1, tex.pPop.width - 3, tex.pPop.height - 1));
        }

        // 2. ОЧИСТКА ПЕРЕД СБОРКОЙ (Фикс наслоения)
        if (window.faceLayer) faceLayer.removeChildren();
        if (window.pimpleLayer) pimpleLayer.removeChildren();
        if (window.speechLayer) speechLayer.removeChildren();
        if (window.vfxLayer) vfxLayer.removeChildren();
        gsap.killTweensOf("*"); // Останавливаем все старые анимации

        // 3. Сборка сцены
        if (typeof setupFace === 'function') setupFace();
        if (typeof setupVideoAndAudio === 'function') await setupVideoAndAudio(); 
        
        setupTools(); 
        setupUI();
        
        resize();
        window.removeEventListener('resize', resize);
        window.addEventListener('resize', resize);
        
        app.stage.eventMode = 'static';
        app.stage.hitArea = app.screen;
        app.stage.on('pointermove', updateToolPosition);

        app.view.style.opacity = "1";
        
        if (typeof scheduleBlink === 'function') scheduleBlink();
        startIntro();
    } catch (e) {
        console.error("Ошибка инициализации:", e);
    }
};

window.resetGame = function() {
    if (dialogTimeout) clearTimeout(dialogTimeout);
    currentDialogIdx = -1;
    if (typeof poppedCount !== 'undefined') poppedCount = 0;
    updateCounter();
    
    // Запускаем чистый init
    window.init();
};

function setupTools() {
    // Чистим инструменты перед созданием новых
    if (scalpelSprite) { scalpelSprite.destroy(); scalpelSprite = null; }
    if (loupeSprite) { loupeSprite.destroy(); loupeSprite = null; }

    scalpelSprite = new PIXI.Sprite(tex.scalpel);
    scalpelSprite.rotation = (3 * Math.PI) / 4;
    scalpelSprite.scale.x = -0.4; scalpelSprite.scale.y = 0.4; 
    scalpelSprite.anchor.set(0.1, 1.0); scalpelSprite.visible = false; scalpelSprite.eventMode = 'none';
    
    loupeSprite = new PIXI.Sprite(tex.loupe);
    loupeSprite.anchor.set(0.5); 
    loupeSprite.scale.set(0.5); loupeSprite.visible = false; loupeSprite.eventMode = 'none';

    app.stage.addChild(scalpelSprite, loupeSprite);
}

function updateToolPosition(e) {
    const pos = e.global;
    if (scalpelSprite && scalpelSprite.visible) scalpelSprite.position.set(pos.x, pos.y);
    if (loupeSprite && loupeSprite.visible) loupeSprite.position.set(pos.x, pos.y);
}

function setToolCursor(tool) {
    if (scalpelSprite) scalpelSprite.visible = (tool === 'scalpel');
    if (loupeSprite) loupeSprite.visible = (tool === 'loupe');
    app.view.style.cursor = (tool === 'finger') ? 'pointer' : 'none';
}

window.startIntro = function() {
    setToolCursor('finger');
    const ui = document.getElementById('ui-layer');
    if (ui) ui.style.display = 'none';

    const handleNext = () => {
        if (dialogTimeout) clearTimeout(dialogTimeout);
        currentDialogIdx++;
        if (currentDialogIdx < INTRO_DIALOGS.length) {
            showSpeech(INTRO_DIALOGS[currentDialogIdx]);
            dialogTimeout = setTimeout(handleNext, 4500);
        } else {
            finishIntro();
        }
    };

    window.skipIntro = () => {
        if (dialogTimeout) clearTimeout(dialogTimeout);
        finishIntro();
    };

    function finishIntro() {
        app.stage.off('pointerdown', handleNext);
        speechLayer.removeChildren();
        if (ui) { 
            ui.style.display = 'block'; 
            gsap.fromTo(ui, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }); 
        }
        // Очищаем прыщи интро и спавним игровые
        pimpleLayer.removeChildren();
        for(let i=0; i<6; i++) spawn();
    }

    app.stage.on('pointerdown', handleNext);
    handleNext();
};

window.showSpeech = function(text) {
    speechLayer.removeChildren();
    const container = new PIXI.Container();
    const bubble = new PIXI.Graphics();
    bubble.beginFill(0xFFFFFF).lineStyle(4, 0x000000, 1)
          .drawRoundedRect(-150, -50, 300, 100, 20)
          .moveTo(0, 50).lineTo(20, 80).lineTo(40, 50).endFill();
    
    const txt = new PIXI.Text(text, { 
        fontFamily: 'Arial', fontSize: 20, fontWeight: 'bold', 
        wordWrap: true, wordWrapWidth: 260, align: 'center' 
    });
    txt.anchor.set(0.5); 
    container.addChild(bubble, txt);
    container.position.set(app.screen.width/2, app.screen.height/2 - 250);
    container.scale.set(0);
    speechLayer.addChild(container);
    gsap.to(container.scale, { x: 1, y: 1, duration: 0.3, ease: "back.out" });
};

window.spawn = function(forcedType = null) {
    let x, y, tries = 0;
    while (tries++ < 1000) {
        x = (Math.random()-0.5)*450; y = (Math.random()-0.5)*500+130;
        if (isValid(x, y)) break;
    }
    if (tries >= 1000) return;

    let typeData = forcedType ? PIMPLE_TYPES[forcedType] : 
                   (Math.random() < PIMPLE_TYPES.FAT.chance ? PIMPLE_TYPES.FAT : PIMPLE_TYPES.NORMAL);
    
    const p = new PIXI.Sprite(tex.pimple);
    p.anchor.set(0.5); p.position.set(x, y); p.hp = typeData.hp; p.pimpleType = typeData;
    p.tint = typeData.tint; p.scale.set(typeData.baseScale + Math.random()*0.1);
    p.eventMode = 'static'; p.cursor = 'pointer'; p.hitArea = new PIXI.Circle(0, 0, 80);

    p.on('pointerdown', (e) => {
        e.stopPropagation();
        p.hp--;
        if (p.hp <= 0) {
            p.eventMode = 'none'; p.texture = tex.pPop; p.tint = 0xFFFFFF; 
            playPop(p.worldTransform.tx, p.worldTransform.ty);
            if (typeof poppedCount !== 'undefined') poppedCount++; updateCounter();
            setFaceState(true); 
            gsap.timeline()
                .fromTo(faceLayer, {x: app.screen.width/2-3}, { x: app.screen.width/2+3, duration:0.04, repeat:3, yoyo:true })
                .add(() => setFaceState(false), "+=0.15")
                .add(() => { gsap.to(p, { alpha: 0, duration: 0.3, onComplete: () => { p.destroy(); spawn(); } }); }, "+=0.2");
        } else {
            gsap.to(p.scale, { x: p.scale.x*1.15, y: p.scale.y*1.15, duration: 0.1, yoyo: true, repeat: 1 });
        }
    });
    pimpleLayer.addChild(p);
    gsap.from(p.scale, {x:0, y:0, duration:0.2, ease:"back.out"});
};

window.isValid = function(x, y) {
    if (y < CONFIG.LIMIT_Y_TOP || y > CONFIG.LIMIT_Y_BOT) return false;
    if (((x*x)/(CONFIG.ZONE_A**2) + ((y-135)**2)/(CONFIG.ZONE_B**2)) > 1) return false;
    const eyeL_X = spr.eyeL ? spr.eyeL.x : -CONFIG.EYE_X;
    const eyeR_X = spr.eyeR ? spr.eyeR.x : (CONFIG.EYE_X + 30);
    if (Math.abs(x - eyeL_X) < 110 || Math.abs(x - eyeR_X) < 110) return false;
    if (Math.abs(x) < 50 && y > 90) return false; 
    return !pimpleLayer.children.some(p => ((x-p.x)**2 + (y-p.y)**2) < 3025);
};

window.resize = function() {
    faceLayer.position.set(app.screen.width/2, app.screen.height/2 - 150);
    faceLayer.baseScale = Math.min(app.screen.width/600, app.screen.height/800)*0.85;
    faceLayer.scale.set(faceLayer.baseScale);
    speechLayer.position.set(0, 0);
};

window.setupUI = function() {
    const ui = document.getElementById('ui-layer');
    if (!ui) return;
    ui.innerHTML = `
        <button id="toolFinger" class="btn active">ПАЛЕЦ</button>
        <button id="btnSkip" class="btn" style="background:#555">СКИП</button>
        <button id="btnReset" class="btn" style="background:#822">NEW FACE</button>
    `;
    document.getElementById('toolFinger').onclick = () => { currentTool = 'finger'; setToolCursor('finger'); };
    document.getElementById('btnSkip').onclick = () => { window.skipIntro(); };
    document.getElementById('btnReset').onclick = () => { window.resetGame(); };
};

window.updateCounter = function() {
    const el = document.getElementById('pimpleCount');
    if (el && typeof poppedCount !== 'undefined') {
        el.textContent = poppedCount;
        gsap.fromTo(el, {scale: 1.5}, {scale: 1, duration: 0.3, ease: "back.out"});
    }
};