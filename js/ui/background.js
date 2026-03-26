// Motor de Background Canvas com Física e Parallax
export function setupBackgroundCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'animated-bg-canvas';
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '-1',
        transition: 'filter 0.1s ease-out'
    });
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    
    let width, height;
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    const numShapes = isMobile ? 10 : 30; // Reduzido drasticamente para mobile
    
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let mouseX = -1000;
    let mouseY = -1000;

    if (!isMobile) {
        document.addEventListener('mousemove', (e) => {
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;
        });
        
        document.addEventListener('mouseleave', () => {
            targetMouseX = -1000;
            targetMouseY = -1000;
        });
    }

    class Shape {
        constructor() {
            this.type = ['square', 'circle', 'triangle'][Math.floor(Math.random() * 3)];
            this.baseX = Math.random() * width;
            this.baseY = Math.random() * height;
            
            this.z = 0.2 + Math.random() * 0.8; 
            
            this.floatPhase = Math.random() * Math.PI * 2;
            
            // Fator de suavização para mobile (Movimento mais lento)
            const speedFactor = isMobile ? 0.5 : 1;
            
            this.floatSpeed = (0.01 + Math.random() * 0.02) * speedFactor;
            this.floatRadius = 10 + Math.random() * 20;
            
            this.angle = Math.random() * Math.PI * 2;
            this.rotSpeed = ((Math.random() - 0.5) * 0.02) * speedFactor;
            
            this.x = this.baseX;
            this.y = this.baseY;
            this.vx = 0;
            this.vy = 0;
            
            this.size = (15 + Math.random() * 25) * this.z;
        }
        
        update(parallaxX) {
            // Parallax Contínuo (Infinito)
            // Se movermos a tela inteira pra esquerda (swipe direita), parallaxX cai.
            const margin = 50;
            const wrapW = width + margin * 2;
            
            // baseX virtual
            let effectiveX = this.baseX + (parallaxX * this.z * 0.2); // Fator de parallax
            
            // Loop Infinito
            if (effectiveX < -margin) {
                this.baseX += wrapW;
                this.x += wrapW; 
                effectiveX += wrapW;
            } else if (effectiveX > width + margin) {
                this.baseX -= wrapW;
                this.x -= wrapW;
                effectiveX -= wrapW;
            }

            // Flutuabilidade
            this.floatPhase += this.floatSpeed;
            const targetX = effectiveX + Math.cos(this.floatPhase) * this.floatRadius;
            const targetY = this.baseY + Math.sin(this.floatPhase) * this.floatRadius;
            
            this.angle += this.rotSpeed;
            
            // Repulsão (Apenas PC)
            let repelX = 0, repelY = 0;
            if (!isMobile) {
                const dx = targetX - mouseX;
                const dy = targetY - mouseY;
                const distSq = dx*dx + dy*dy;
                const repelRadius = 150;
                
                if (distSq < repelRadius*repelRadius) {
                    const dist = Math.sqrt(distSq);
                    const force = (repelRadius - dist) / repelRadius;
                    repelX = (dx / dist) * force * 60; 
                    repelY = (dy / dist) * force * 60;
                }
            }
            
            // Mola
            const goalX = targetX + repelX;
            const goalY = targetY + repelY;
            
            this.vx += (goalX - this.x) * 0.08;
            this.vy += (goalY - this.y) * 0.08;
            
            // Damping elástico (fricção)
            this.vx *= 0.82;
            this.vy *= 0.82;
            
            this.x += this.vx;
            this.y += this.vy;
        }
        
        draw(ctx, isDark) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            if (isDark) {
                ctx.fillStyle = `rgba(100, 150, 255, ${this.z * 0.2})`;
            } else {
                ctx.fillStyle = `rgba(100, 116, 139, ${this.z * 0.15})`;
            }
            
            if (this.type === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'square') {
                ctx.beginPath();
                const r = 4;
                const s = this.size;
                ctx.moveTo(-s/2 + r, -s/2);
                ctx.lineTo(s/2 - r, -s/2);
                ctx.quadraticCurveTo(s/2, -s/2, s/2, -s/2 + r);
                ctx.lineTo(s/2, s/2 - r);
                ctx.quadraticCurveTo(s/2, s/2, s/2 - r, s/2);
                ctx.lineTo(-s/2 + r, s/2);
                ctx.quadraticCurveTo(-s/2, s/2, -s/2, s/2 - r);
                ctx.lineTo(-s/2, -s/2 + r);
                ctx.quadraticCurveTo(-s/2, -s/2, -s/2 + r, -s/2);
                ctx.fill();
            } else if (this.type === 'triangle') {
                ctx.beginPath();
                ctx.moveTo(0, -this.size/2);
                ctx.lineTo(this.size/2, this.size/2);
                ctx.lineTo(-this.size/2, this.size/2);
                ctx.closePath();
                ctx.fill();
            }
            
            ctx.restore();
        }
    }

    const shapes = [];
    for(let i=0; i<numShapes; i++) shapes.push(new Shape());

    let lastSliderX = 0;
    let currentBlur = 0;
    let sliderRef = null;

    function tick() {
        if(!sliderRef) sliderRef = document.getElementById('calculator-slider');
        
        const isDark = document.body.classList.contains('dark');
        ctx.clearRect(0, 0, width, height);

        // Atualizar Mouse Suave
        mouseX += (targetMouseX - mouseX) * 0.15;
        mouseY += (targetMouseY - mouseY) * 0.15;

        // Blur e Parallax via Slider Real-time
        let parallaxX = 0;
        if (sliderRef) {
            const rect = sliderRef.getBoundingClientRect();
            // Calcula velocidade
            const speed = Math.abs(rect.left - lastSliderX);
            // Salva variação limpa
            parallaxX = rect.left;
            lastSliderX = rect.left;

            // Blur dinâmico reduzido drásticamente em telas menores (limite 2px ou zerado)
            const maxBlur = isMobile ? 1.5 : 8;
            const targetBlur = Math.min(speed * 0.2, maxBlur);
            
            currentBlur += (targetBlur - currentBlur) * 0.15;
            
            if (currentBlur > 0.5) {
                canvas.style.filter = `blur(${currentBlur.toFixed(1)}px)`;
            } else {
                canvas.style.filter = 'none';
            }
        }

        // Draw elements
        shapes.forEach(img => {
            img.update(parallaxX);
            img.draw(ctx, isDark);
        });

        requestAnimationFrame(tick);
    }

    tick();
}
