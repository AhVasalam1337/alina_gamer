// js/face.js
window.setupFace = function() {
    const createSpr = (t, x, y, s = 0.6) => {
        const sptr = new PIXI.Sprite(t);
        sptr.anchor.set(0.5); 
        sptr.position.set(x, y); 
        sptr.scale.set(s);
        return sptr;
    };

    // Тело с твоим офсетом +25
    spr.body = new PIXI.Sprite(tex.body);
    spr.body.anchor.set(0.5, 0); 
    spr.body.position.set(25, CONFIG.BODY_Y_FIXED); 
    spr.body.scale.set(CONFIG.BODY_SCALE_H, CONFIG.BODY_SCALE_V);

    gsap.to(spr.body.scale, { y: CONFIG.BODY_SCALE_V + 0.03, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(spr.body, { y: CONFIG.BODY_Y_FIXED - 1, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut" });

    spr.base = createSpr(tex.currentFace, 0, 0, 1);
    
    // Глаза симметрично (левый -135, правый +135+30 твоим офсетом)
    spr.eyeL = createSpr(tex.currentEyeOpen, -CONFIG.EYE_X, CONFIG.EYE_Y);
    spr.eyeR = createSpr(tex.currentEyeOpen, CONFIG.EYE_X + 30, CONFIG.EYE_Y);
    spr.eyeR.scale.x *= -1; 

    // Рот с твоим офсетом +20
    spr.mouth = createSpr(tex.mClose, 20, CONFIG.MOUTH_Y, 0.6);

    faceLayer.addChild(spr.body, spr.base, spr.eyeL, spr.eyeR, spr.mouth, pimpleLayer);
};

window.setFaceState = function(isPopping) {
    if (!spr.eyeL || !spr.eyeR || !spr.mouth) return;
    const eyeTex = isPopping ? tex.eClose : tex.currentEyeOpen;
    spr.eyeL.texture = spr.eyeR.texture = eyeTex;
    spr.mouth.texture = isPopping ? tex.mOpen : tex.mClose;
};

window.scheduleBlink = function() {
    const nextBlink = 2000 + Math.random() * 3000;
    setTimeout(() => {
        if (spr.eyeL && spr.eyeL.texture === tex.currentEyeOpen && !gsap.isTweening(faceLayer)) {
            setFaceState(true);
            setTimeout(() => setFaceState(false), 150);
        }
        scheduleBlink();
    }, nextBlink);
};