import { formatCurrency, getCurrencySymbol } from '../currency.js';
import { showToast } from '../ui/toast.js';
import { addHistory } from '../state.js';
import { copyToClipboard } from '../ui/copy.js';
import { setupLocalHistory } from '../ui/history.js';
import { clearValidationErrors, validateInput } from '../ui/validation.js';

export function render(container) {
    const sym = getCurrencySymbol();
    container.innerHTML = `
        <div class="calc-header">
            <h2>Juros Compostos</h2>
            <p>Calcule o rendimento com juros sobre juros.</p>
        </div>
        <div class="calc-form">
            <div class="form-group">
                <label for="jc-capital">
                    Capital Inicial (<span class="curr-symbol">${sym}</span>)
                    <span class="tooltip-wrapper" tabindex="0">
                        <span class="tooltip-icon">?</span>
                        <span class="tooltip-content">Valor original que renderá juros compostos.</span>
                    </span>
                </label>
                <div class="input-wrapper">
                    <span class="input-prefix">${sym}</span>
                    <input type="number" id="jc-capital" class="form-control has-prefix" placeholder="0.00" step="0.01" min="0">
                </div>
            </div>
            <div class="form-group">
                <label for="jc-taxa">Taxa de Juros (%) - Mensal</label>
                <div class="input-wrapper">
                    <input type="number" id="jc-taxa" class="form-control has-suffix" placeholder="0.00" step="0.01" min="0">
                    <span class="input-suffix">%</span>
                </div>
            </div>
            <div class="form-group">
                <label for="jc-tempo">
                    Tempo (Meses)
                    <span class="tooltip-wrapper" tabindex="0">
                        <span class="tooltip-icon">?</span>
                        <span class="tooltip-content">Prazo da aplicação na mesma unidade da taxa.</span>
                    </span>
                </label>
                <input type="number" id="jc-tempo" class="form-control" placeholder="0" step="1" min="0">
            </div>
            <button id="jc-btn" class="btn-calc">Calcular</button>
            <div id="jc-result" class="result-area">
                <div class="result-label">
                    Valor Total (Montante)
                    <button class="copy-btn" id="jc-copy" title="Copiar">📋</button>
                </div>
                <div id="jc-montante" class="result-value">${formatCurrency(0)}</div>
                <div class="result-detail">Juros Rendidos: <strong id="jc-juros">${formatCurrency(0)}</strong></div>
                <div class="result-explanation">Resultado baseado em juros compostos ao mês.</div>
            </div>
        </div>
    `;

    const btn = document.getElementById('jc-btn');
    btn.addEventListener('click', () => {
        const container = btn.closest('.calc-form');
        clearValidationErrors(container);

        const isCapitalValid = validateInput('jc-capital', 'Campo obrigatório e numérico');
        const isTaxaValid = validateInput('jc-taxa', 'Campo obrigatório e numérico');
        const isTempoValid = validateInput('jc-tempo', 'Campo obrigatório e numérico');

        if (!isCapitalValid || !isTaxaValid || !isTempoValid) {
            return;
        }

        const capitalInput = document.getElementById('jc-capital').value;
        const taxaInput = document.getElementById('jc-taxa').value;
        const tempoInput = document.getElementById('jc-tempo').value;

        const capital = parseFloat(capitalInput);
        const taxa = parseFloat(taxaInput) / 100;
        const tempo = parseFloat(tempoInput);

        // Fórmula Juros Compostos: M = C * (1 + i)^t
        const montante = capital * Math.pow((1 + taxa), tempo);
        const juros = montante - capital;

        const elMontante = document.getElementById('jc-montante');
        const elJuros = document.getElementById('jc-juros');
        
        elMontante.dataset.raw = montante;
        elJuros.dataset.raw = juros;

        elMontante.textContent = formatCurrency(montante);
        elJuros.textContent = formatCurrency(juros);
        
        document.getElementById('jc-result').classList.add('show');
        
        // Save history
        addHistory('jurosCompostos', 'Juros Compostos', {
            'Capital': formatCurrency(capital),
            'Taxa (%)': (taxa * 100).toFixed(2),
            'Meses': tempo
        }, formatCurrency(montante));
    });

    document.getElementById('jc-copy').addEventListener('click', () => {
        const val = document.getElementById('jc-montante').textContent;
        copyToClipboard(val, 'Montante copiado!');
    });

    window.addEventListener('reuseCalculation', (e) => {
        if(e.detail.calcId === 'jurosCompostos') {
            const rawCap = String(e.detail.inputs['Capital']).replace(/[^0-9,-]+/g,"").replace(',', '.');
            document.getElementById('jc-capital').value = parseFloat(rawCap) || 0;
            document.getElementById('jc-taxa').value = e.detail.inputs['Taxa (%)'];
            document.getElementById('jc-tempo').value = e.detail.inputs['Meses'];
            document.getElementById('jc-btn').click();
        }
    });

    setupLocalHistory(container.querySelector('.calc-form'), 'jurosCompostos');
}
