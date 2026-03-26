import { showToast } from '../ui/toast.js';
import { addHistory } from '../state.js';
import { copyToClipboard } from '../ui/copy.js';
import { setupLocalHistory } from '../ui/history.js';
import { clearValidationErrors, validateInput } from '../ui/validation.js';

export function render(container) {
    container.innerHTML = `
        <div class="calc-header">
            <h2>Porcentagem</h2>
            <p>Calcule valores percentuais e variações.</p>
        </div>
        <div class="calc-form">
            <div class="form-group">
                <label for="pct-valor-x">
                    Valor (X)
                    <span class="tooltip-wrapper" tabindex="0">
                        <span class="tooltip-icon">?</span>
                        <span class="tooltip-content">O primeiro valor numérico.</span>
                    </span>
                </label>
                <input type="number" id="pct-valor-x" class="form-control" placeholder="0" step="0.01">
            </div>
            <div class="form-group">
                <label for="pct-valor-y">
                    Valor (Y)
                    <span class="tooltip-wrapper" tabindex="0">
                        <span class="tooltip-icon">?</span>
                        <span class="tooltip-content">O segundo valor de referência.</span>
                    </span>
                </label>
                <input type="number" id="pct-valor-y" class="form-control" placeholder="0" step="0.01">
            </div>
            <div class="form-group">
                <label>O que deseja calcular?</label>
                <select id="pct-operacao" class="form-control">
                    <option value="1">X% de Y</option>
                    <option value="2">X é quantos % de Y?</option>
                    <option value="3">Aumento/redução percentual de X para Y</option>
                </select>
            </div>
            <button id="pct-btn" class="btn-calc">Calcular</button>
            <div id="pct-result" class="result-area">
                <div class="result-label">
                    Resultado
                    <button class="copy-btn" id="pct-copy" title="Copiar">📋</button>
                </div>
                <div id="pct-resultado" class="result-value">0</div>
                <div class="result-explanation">Resultado baseado em proporção matemática exata.</div>
            </div>
        </div>
    `;

    const btn = document.getElementById('pct-btn');
    btn.addEventListener('click', () => {
        const container = btn.closest('.calc-form');
        clearValidationErrors(container);

        const isXValid = validateInput('pct-valor-x', 'Campo obrigatório e numérico');
        const isYValid = validateInput('pct-valor-y', 'Campo obrigatório e numérico');

        if (!isXValid || !isYValid) {
            return;
        }

        const xInput = document.getElementById('pct-valor-x').value;
        const yInput = document.getElementById('pct-valor-y').value;
        const operacao = document.getElementById('pct-operacao').value;

        const x = parseFloat(xInput);
        const y = parseFloat(yInput);
        let resultado = 0;
        let finalStr = '';

        if (operacao === "1") {
            // X% de Y
            resultado = (x / 100) * y;
            const formatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
            finalStr = formatter.format(resultado);
        } else if (operacao === "2") {
            // X é quantos % de Y?
            resultado = (x / y) * 100;
            const formatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
            finalStr = formatter.format(resultado) + '%';
        } else if (operacao === "3") {
            // Aumento/redução de X para Y
            resultado = ((y - x) / Math.abs(x)) * 100;
            const formatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
            const sinal = resultado > 0 ? '+' : '';
            finalStr = sinal + formatter.format(resultado) + '%';
        }
        document.getElementById('pct-resultado').textContent = finalStr;
        document.getElementById('pct-result').classList.add('show');
        
        // Save History
        const select = document.getElementById('pct-operacao');
        const operacaoText = select.options[select.selectedIndex].text;
        
        addHistory('porcentagem', 'Porcentagem', {
            'Valor (X)': x,
            'Valor (Y)': y,
            'Operação': operacaoText
        }, finalStr);
    });

    document.getElementById('pct-copy').addEventListener('click', () => {
        const val = document.getElementById('pct-resultado').textContent;
        copyToClipboard(val, 'Resultado percentual copiado!');
    });

    window.addEventListener('reuseCalculation', (e) => {
        if(e.detail.calcId === 'porcentagem') {
            document.getElementById('pct-valor-x').value = e.detail.inputs['Valor (X)'];
            document.getElementById('pct-valor-y').value = e.detail.inputs['Valor (Y)'];
            
            const select = document.getElementById('pct-operacao');
            for(let i=0; i<select.options.length; i++) {
                if(select.options[i].text === e.detail.inputs['Operação']) {
                    select.selectedIndex = i;
                    break;
                }
            }
            document.getElementById('pct-btn').click();
        }
    });

    setupLocalHistory(container.querySelector('.calc-form'), 'porcentagem');
}
