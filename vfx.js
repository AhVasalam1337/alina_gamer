// js/vfx.js
window.setupVideoAndAudio = async function() {
    // ГАРАНТИРУЕМ существование глобального объекта tex
    if (!window.tex) window.tex = {};

    const res = await fetch(CONFIG.VIDEO_URL);
    const buf = await res.arrayBuffer();
    const url = URL.createObjectURL(new Blob([buf], { type: 'video/webm' }));
    
    audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    audio.buffer = await audio.ctx.decodeAudioData(buf);

    const colorMatrix = new PIXI.ColorMatrixFilter();
    colorMatrix.brightness(1.3, false); 
    
    const filtersToApply = [colorMatrix];
    const ConvFilter = PIXI.filters.ConvolutionFilter || (window.PIXI && window.PIXI.filters && window.PIXI.filters.ConvolutionFilter);
    if (ConvFilter) {
        filtersToApply.push(new ConvFilter([0, -1, 0, -1, 7, -1, 0, -1, 0]));
    }
    
    // Проверка на существование слоя перед наложением фильтров
    if (window.vfxLayer) {
        vfxLayer.filters = filtersToApply;
    }

    // Создаем фильтр размытия для перехода
    window.tex.blurFilter = new PIXI.filters.BlurFilter();
    window.tex.blurFilter.blur = 0; 
    
    if (window.faceLayer) {
        faceLayer.filters = [window.tex.blurFilter];
    }

    const maskTex = PIXI.Texture.from(createGradientCanvas());

    for (let i = 0; i < 12; i++) {
        const v = document.createElement('video');
        v.src = url; v.muted = true; v.playsInline = true;
        const s = new PIXI.Sprite(new PIXI.Texture(PIXI.BaseTexture.from(v)));
        s.anchor.set(0.5, 0); s.scale.set(0.12); s.visible = false;
        const m = new PIXI.Sprite(maskTex); m.anchor.set(0.5, 0); s.mask = m;
        
        if (window.vfxLayer) {
            vfxLayer.addChild(s, m);
        }
        videoPool.push({ v, s, m });
    }
};

window.createGradientCanvas = function() {
    const c = document.createElement('canvas');
    c.width = 100; c.height = 200;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 200);
    g.addColorStop(0, 'transparent'); 
    g.addColorStop(0.4, 'white'); 
    g.addColorStop(0.6, 'white'); 
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 100, 200);
    return c;
};

window.playPop = function(x, y, isMicro = false) {
    const itm = videoPool[poolIdx];
    poolIdx = (poolIdx + 1) % videoPool.length;
    
    itm.s.position.set(x, y); 
    itm.m.position.set(itm.s.x, itm.s.y);
    itm.m.width = itm.s.width; itm.m.height = itm.s.height;
    
    itm.s.visible = true; itm.v.currentTime = 0; itm.v.play();
    itm.v.onended = () => itm.s.visible = false;

    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    if (audio.source) try { audio.source.stop(); } catch(e){}
    
    audio.source = audio.ctx.createBufferSource();
    audio.source.buffer = audio.buffer;
    audio.source.connect(audio.ctx.destination);
    
    if (isMicro) {
        audio.source.playbackRate.value = 0.6 + Math.random()*0.2; 
    }

    audio.source.start(0);
};