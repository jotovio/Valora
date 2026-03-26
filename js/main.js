import { render as renderJurosSimples } from './calculators/jurosSimples.js';
import { render as renderJurosCompostos } from './calculators/jurosCompostos.js';
import { render as renderSalarioLiquido } from './calculators/salarioLiquido.js';
import { render as renderPorcentagem } from './calculators/porcentagem.js';
import { render as renderInvestimento } from './calculators/investimento.js';
import { currencyLocaleMap, getCurrencyCode, setCurrencyCode, formatCurrency, getCurrencySymbol } from './currency.js';
import { getFavorites, toggleFavorite, getOrder, saveOrder } from './state.js';
import { setupBackgroundCanvas } from './ui/background.js';

const calculators = {
    jurosSimples: renderJurosSimples,
    jurosCompostos: renderJurosCompostos,
    salarioLiquido: renderSalarioLiquido,
    porcentagem: renderPorcentagem,
    investimento: renderInvestimento
};

const defaultKeys = Object.keys(calculators);
let currentOrder = getOrder(defaultKeys);

document.addEventListener('DOMContentLoaded', () => {
    // ---- CURRENCY SELECTOR ----
    const currencySelect = document.getElementById('currency-select');
    
    // Popular
    Object.keys(currencyLocaleMap).forEach(code => {
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = `${currencyLocaleMap[code].name} (${currencyLocaleMap[code].symbol})`;
        currencySelect.appendChild(opt);
    });
    
    currencySelect.value = getCurrencyCode();
    
    currencySelect.addEventListener('change', (e) => {
        setCurrencyCode(e.target.value);
    });

    window.addEventListener('currencyChange', () => {
        const sym = getCurrencySymbol();
        
        document.querySelectorAll('.input-prefix').forEach(el => el.textContent = sym);
        document.querySelectorAll('.curr-symbol').forEach(el => el.textContent = sym);

        document.querySelectorAll('.result-value, .result-detail strong').forEach(el => {
            if(el.dataset.raw !== undefined) {
                el.textContent = formatCurrency(Number(el.dataset.raw));
            }
        });
    });

    // ---- TEMA (DARK/LIGHT) ----
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        
        if (document.body.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // ---- MOBILE MENU TOGGLE ----
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navbarControls = document.getElementById('navbar-controls');
    
    if (mobileMenuBtn && navbarControls) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            navbarControls.classList.toggle('show');
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (navbarControls.classList.contains('show') && !navbarControls.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navbarControls.classList.remove('show');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Impedir fechamento ao interagir dentro do menu
        navbarControls.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // ---- BACKGROUND ANIMADO GEOMÉTRICO (CANVAS) ----
    setupBackgroundCanvas();

    // Renderiza todas as calculadoras nos slides na ordem original do HTML
    // E injeta o botão de favorito
    defaultKeys.forEach(key => {
        const container = document.getElementById(`container-${key}`);
        if(container && calculators[key]) {
            calculators[key](container);

            window.addEventListener(`historyChanged_${key}`, () => {
                const resultValueEl = container.querySelector('.result-value');
                if (resultValueEl) {
                    resultValueEl.classList.remove('highlight-pulse');
                    void resultValueEl.offsetWidth;
                    resultValueEl.classList.add('highlight-pulse');
                }
            });

            // Injetar Botão de Favorito no Header
            const header = container.querySelector('.calc-header');
            if (header) {
                const favBtn = document.createElement('button');
                favBtn.className = 'btn-fav';
                favBtn.innerHTML = '★';
                favBtn.title = 'Favoritar';
                
                const favs = getFavorites();
                if (favs.includes(key)) favBtn.classList.add('active');
                
                favBtn.addEventListener('click', () => {
                    const newFavs = toggleFavorite(key);
                    favBtn.classList.toggle('active', newFavs.includes(key));
                });
                header.appendChild(favBtn);
            }
        }
    });

    // Otimização Mobile: Forçar teclados numéricos adequados
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.setAttribute('inputmode', 'decimal');
    });

    const slider = document.getElementById('calculator-slider');
    const navButtonsRaw = document.querySelectorAll('.nav-btn');
    const navContainer = document.querySelector('.nav-links');
    const searchInput = document.getElementById('nav-search');
    
    let navButtons = Array.from(navButtonsRaw);
    let currentIndex = 0;

    // Sincroniza Ordem Física do DOM das slides e da listazinha drag
    function syncOrderDOM(orderArray) {
        orderArray.forEach(key => {
            const slide = document.getElementById(`slide-${key}`);
            if (slide) slider.appendChild(slide);
        });
        
        orderArray.forEach(key => {
            const btn = navButtons.find(b => b.getAttribute('data-calc') === key);
            if (btn) navContainer.appendChild(btn);
        });
        
        currentOrder = orderArray;
        saveOrder(currentOrder);
    }
    syncOrderDOM(currentOrder);

    // Navegação entre slides atualizada para o array dinamico currentOrder
    function goToSlide(index) {
        if (index < 0) index = 0;
        if (index >= currentOrder.length) index = currentOrder.length - 1;
        currentIndex = index;

        slider.style.transition = 'transform 0.5s ease-out';
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;

        navButtons.forEach(b => b.classList.remove('active'));
        const activeNav = navButtons.find(btn => btn.getAttribute('data-calc') === currentOrder[currentIndex]);
        
        if (activeNav) {
            activeNav.classList.add('active');
            
            // Centraliza o botão ativo no scroll horizontal (Apenas Mobile/Topbar)
            if (window.innerWidth < 768) {
                activeNav.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }

    // Clique nos botões de navegação
    navButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetCalc = btn.getAttribute('data-calc');
            goToSlide(currentOrder.indexOf(targetCalc));
        });
    });

    // ---- DRAG AND DROP REORDER ----
    let draggedBtn = null;

    navButtons.forEach(btn => {
        btn.draggable = true;

        btn.addEventListener('dragstart', (e) => {
            draggedBtn = btn;
            e.dataTransfer.effectAllowed = 'move';
            // Timeout visual trick
            setTimeout(() => btn.classList.add('dragging'), 0);
        });

        btn.addEventListener('dragend', () => {
            btn.classList.remove('dragging');
            draggedBtn = null;
            
            // Reconstroi array com base na ultima DOM position
            const newOrder = Array.from(navContainer.children)
                .filter(el => el.classList.contains('nav-btn'))
                .map(el => el.getAttribute('data-calc'));
            
            const activeId = currentOrder[currentIndex];
            syncOrderDOM(newOrder); 
            
            slider.style.transition = 'none'; 
            goToSlide(currentOrder.indexOf(activeId));
        });
    });

    navContainer.addEventListener('dragover', e => {
        e.preventDefault();
        if (!draggedBtn) return;
        
        const afterElement = getDragAfterElement(navContainer, e.clientX, e.clientY);
        if (afterElement == null) {
            navContainer.appendChild(draggedBtn);
        } else {
            navContainer.insertBefore(draggedBtn, afterElement);
        }
    });

    function getDragAfterElement(container, x, y) {
        const draggableElements = [...container.querySelectorAll('.nav-btn:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            // Estimativa baseada no eixo X (pois é flex wrap)
            const offset = (x - (box.left + box.width / 2)) + (y - (box.top + Math.max(0, box.height) / 2)) * 0.1;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // ---- SEARCH AND FAVORITES LOGIC ----
    function applySearchFilter() {
        const query = searchInput.value.toLowerCase();
        
        navButtons.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            const matches = text.includes(query);
            btn.style.display = matches ? 'inline-block' : 'none';
        });
    }

    function renderFavoritesIcons() {
        const favs = getFavorites();
        navButtons.forEach(btn => {
            const calcId = btn.getAttribute('data-calc');
            const isFav = favs.includes(calcId);
            let favSpan = btn.querySelector('.fav-icon');
            if (isFav && !favSpan) {
                favSpan = document.createElement('span');
                favSpan.className = 'fav-icon';
                favSpan.innerHTML = '★ ';
                btn.prepend(favSpan);
            } else if (!isFav && favSpan) {
                favSpan.remove();
            }
        });
    }

    searchInput.addEventListener('input', applySearchFilter);
    window.addEventListener('favoritesChanged', renderFavoritesIcons);
    renderFavoritesIcons(); 

    // ---- GLOBAL ENTER KEY SHORTCUT ----
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const activeSlide = document.getElementById(`slide-${currentOrder[currentIndex]}`);
            if (activeSlide) {
                const btn = activeSlide.querySelector('.btn-calc');
                // Nao previnir o default senao reseta os forms se for `<form>`
                if (btn) btn.click();
            }
        }
    });

    // Reuse calculation event listener
    window.addEventListener('reuseCalculation', (e) => {
        const item = e.detail;
        const targetIndex = currentOrder.indexOf(item.calcId);
        if(targetIndex !== -1) goToSlide(targetIndex);
    });

    let isDragging = false;
    let startPosX = 0;
    let startPosY = 0;
    let currentDiff = 0;
    let isVerticalDir = false;

    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }
    
    function getPositionY(e) {
        return e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;
    }

    function touchStart(e) {
        // Ignorar interações de drag se tentar arrastar nos inputs, botões ou select
        if (e.target.closest('input, select, button, label, .history-list')) return;
        
        isDragging = true;
        isVerticalDir = false;
        startPosX = getPositionX(e);
        startPosY = getPositionY(e);
        currentDiff = 0;
        
        // Evita lag ao transacionar o slider com o dedo
        slider.style.transition = 'none';
        slider.style.cursor = 'grabbing';
    }

    function touchMove(e) {
        if (!isDragging) return;
        
        const currentPositionX = getPositionX(e);
        const currentPositionY = getPositionY(e);
        
        const diffX = currentPositionX - startPosX;
        const diffY = currentPositionY - startPosY;
        
        // Determina a direção predominante ao começar o drag
        if (!isVerticalDir && Math.abs(diffY) > 10 && Math.abs(diffY) > Math.abs(diffX)) {
            isVerticalDir = true;
        }

        if (isVerticalDir) {
            // Se for scroll vertical, não aplica swipe horizontal
            return;
        }

        // Previne o "bouncing" nativo ou pull-to-refresh apenas quando estamos de fato no swipe horizontal
        if (e.cancelable) {
            e.preventDefault();
        }
        
        currentDiff = diffX;
        slider.style.transform = `translateX(calc(-${currentIndex * 100}% + ${currentDiff}px))`;
    }

    function touchEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        slider.style.cursor = 'grab';
        
        if (isVerticalDir) {
            // Retorna ao estado inicial sem tentar passar o slide
            goToSlide(currentIndex);
            return;
        }

        // Determinar se trocou com base no movimento total
        const threshold = 50; // pixels
        if (currentDiff < -threshold && currentIndex < currentOrder.length - 1) {
            currentIndex += 1;
        } else if (currentDiff > threshold && currentIndex > 0) {
            currentIndex -= 1;
        }

        // Animacao suave
        slider.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
        goToSlide(currentIndex);
    }

    // Touch
    slider.addEventListener('touchstart', touchStart, { passive: false });
    slider.addEventListener('touchmove', touchMove, { passive: false });
    slider.addEventListener('touchend', touchEnd);
    
    // Mouse Drag
    slider.addEventListener('mousedown', touchStart);
    slider.addEventListener('mousemove', touchMove);
    window.addEventListener('mouseup', touchEnd);
    
    // CSS utilitário para cursor de grab 
    slider.style.cursor = 'grab';

    // Iniciar
    goToSlide(0);
});
