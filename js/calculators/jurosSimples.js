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
            <h2>Juros Simples</h2>
            <p>Calcule o rendimento de um capital a juros simples.</p>
        </div>
        <div class="calc-form">
            <div class="form-group">
                <label for="js-capital">
                    Capital Inicial (<span class="curr-symbol">${sym}</span>)
                    <span class="tooltip-wrapper" tabindex="0">
                        <span class="tooltip-icon">?</span>
                        <span class="tooltip-content">Valor original que rende juros.</span>
                    </span>
                </label>
                <div class="input-wrapper">
                    <span class="input-prefix">${sym}</span>
                    <input type="number" id="js-capital" class="form-control has-prefix" placeholder="0.00" step="0.01" min="0">
                </div>
            </div>
            <div class="form-group">
                <label for="js-taxa">Taxa de Juros (%) - Mensal</label>
                <div class="input-wrapper">
                    <input type="number" id="js-taxa" class="form-control has-suffix" placeholder="0.00" step="0.01" min="0">
                    <span class="input-suffix">%</span>
                </div>
            </div>
            <div class="form-group">
                <label for="js-tempo">
                    Tempo (Meses)
                    <span class="tooltip-wrapper" tabindex="0">
                        <span class="tooltip-icon">?</span>
                        <span class="tooltip-content">Prazo da aplicação na mesma unidade da taxa.</span>
                    </span>
                </label>
                <input type="number" id="js-tempo" class="form-control" placeholder="0" step="1" min="0">
            </div>
            <button id="js-btn" class="btn-calc">Calcular</button>
            <div id="js-result" class="result-area">
                <div class="result-label">
                    Valor Total (Montante)
                    <button class="copy-btn" id="js-copy" title="Copiar">📋</button>
                </div>
                <div id="js-montante" class="result-value">${formatCurrency(0)}</div>
                <div class="result-detail">Juros Rendidos: <strong id="js-juros">${formatCurrency(0)}</strong></div>
                <div class="result-explanation">Resultado baseado em juros simples ao mês.</div>
            </div>
        </div>
    `;

    const btn = document.getElementById('js-btn');
    btn.addEventListener('click', () => {
        const container = btn.closest('.calc-form');
        clearValidationErrors(container);

        const isCapitalValid = validateInput('js-capital', 'Campo obrigatório e numérico');
        const isTaxaValid = validateInput('js-taxa', 'Campo obrigatório e numérico');
        const isTempoValid = validateInput('js-tempo', 'Campo obrigatório e numérico');

        if (!isCapitalValid || !isTaxaValid || !isTempoValid) {
            return;
        }

        const capitalInput = document.getElementById('js-capital').value;
        const taxaInput = document.getElementById('js-taxa').value;
        const tempoInput = document.getElementById('js-tempo').value;

        const capital = parseFloat(capitalInput);
        const taxa = parseFloat(taxaInput);
        const tempo = parseFloat(tempoInput);

        // Fórmula Juros Simples: J = C * i * t
        const juros = capital * (taxa / 100) * tempo;
        const montante = capital + juros;

        const elMontante = document.getElementById('js-montante');
        const elJuros = document.getElementById('js-juros');
        
        elMontante.dataset.raw = montante;
        elJuros.dataset.raw = juros;

        elMontante.textContent = formatCurrency(montante);
        elJuros.textContent = formatCurrency(juros);
        
        document.getElementById('js-result').classList.add('show');
        
        // Save history
        addHistory('jurosSimples', 'Juros Simples', {
            'Capital': formatCurrency(capital),
            'Taxa (%)': taxa,
            'Meses': tempo
        }, formatCurrency(montante));
    });

    document.getElementById('js-copy').addEventListener('click', () => {
        const val = document.getElementById('js-montante').textContent;
        copyToClipboard(val, 'Montante copiado!');
    });

    window.addEventListener('reuseCalculation', (e) => {
        if(e.detail.calcId === 'jurosSimples') {
            // Remove currency symbol keeping only digits and dots/commas
            const rawCap = String(e.detail.inputs['Capital']).replace(/[^0-9,-]+/g,"").replace(',', '.');
            document.getElementById('js-capital').value = parseFloat(rawCap) || 0;
            document.getElementById('js-taxa').value = e.detail.inputs['Taxa (%)'];
            document.getElementById('js-tempo').value = e.detail.inputs['Meses'];
            document.getElementById('js-btn').click();
        }
    });

    setupLocalHistory(container.querySelector('.calc-form'), 'jurosSimples');
}
