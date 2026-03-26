import { getHistory, clearHistory } from '../state.js';
import { showToast } from './toast.js';

export function setupLocalHistory(container, calcId) {
    const historyWrapper = document.createElement('div');
    historyWrapper.className = 'local-history-wrapper';
    
    historyWrapper.innerHTML = `
        <button class="history-toggle" type="button">Histórico <span class="toggle-icon">▼</span></button>
        <div class="history-collapse">
            <div class="history-inner">
                <div class="history-list"></div>
                <div class="history-footer">
                    <button class="btn-clear-history btn-small">🧹 Limpar Histórico</button>
                </div>
            </div>
        </div>
    `;
    
    // Add to bottom of the form
    container.appendChild(historyWrapper);
    
    const toggleBtn = historyWrapper.querySelector('.history-toggle');
    const listDiv = historyWrapper.querySelector('.history-list');
    const clearBtn = historyWrapper.querySelector('.btn-clear-history');
    
    toggleBtn.addEventListener('click', () => {
        historyWrapper.classList.toggle('expanded');
    });

    clearBtn.addEventListener('click', () => {
        if(confirm('Limpar histórico desta calculadora?')) {
            clearHistory(calcId);
            showToast('Histórico limpo com sucesso!', 'success');
        }
    });

    function renderList() {
        const hist = getHistory(calcId);
        listDiv.innerHTML = '';
        
        if (hist.length === 0) {
            listDiv.innerHTML = '<div class="empty-history">Nenhum cálculo realizado ainda.</div>';
            clearBtn.style.display = 'none';
            return;
        }
        
        clearBtn.style.display = 'block';

        hist.forEach((item) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'history-item';
            
            // Fade-in effect for fresh items
            if (Date.now() - item.id < 1000) {
                itemEl.classList.add('new-item');
            }

            const inputsHtml = Object.entries(item.inputs)
                .map(([k, v]) => `<div>${k}: <strong>${v}</strong></div>`)
                .join('');
                
            itemEl.innerHTML = `
                <div class="history-item-body">
                    ${inputsHtml}
                    <div class="history-item-result">Resultado: ${item.result}</div>
                </div>
            `;
            
            itemEl.title = "Clique para reutilizar valores";
            itemEl.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('reuseCalculation', { detail: item }));
                showToast('Valores restaurados!', 'info');
                
                itemEl.style.borderColor = 'var(--primary-color)';
                setTimeout(() => itemEl.style.borderColor = '', 300);
            });
            
            listDiv.appendChild(itemEl);
        });
    }

    window.addEventListener(`historyChanged_${calcId}`, renderList);
    renderList();
}
