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
            <h2>Investimento</h2>
            <p>Simulação de crescimento do patrimônio.</p>
        </div>
        <div class="calc-form">
            <div class="form-group">
                <label for="inv-inicial">
                    Valor Inicial (<span class="curr-symbol">${sym}</span>)
                    <span class="tooltip-wrapper" tabindex="0">
                        <span class="tooltip-icon">?</span>
                        <span class="tooltip-content">Montante aplicado no início.</span>
                    </span>
                </label>
                <div class="input-wrapper">
                    <span class="input-prefix">${sym}</span>
                    <input type="number" id="inv-inicial" class="form-control has-prefix" placeholder="0.00" step="0.01" min="0">
                </div>
            </div>
            <div class="form-group">
                <label for="inv-mensal">Aporte Mensal (<span class="curr-symbol">${sym}</span>) <span style="font-weight: normal; font-size: 0.85em; opacity: 0.8">(Opcional)</span></label>
                <div class="input-wrapper">
                    <span class="input-prefix">${sym}</span>
                    <input type="number" id="inv-mensal" class="form-control has-prefix" placeholder="0.00" step="0.01" min="0">
                </div>
            </div>
            <div class="form-group">
                <label for="inv-taxa">
                    Taxa de Juros (%) - Mensal
                    <span class="tooltip-wrapper" tabindex="0">
                        <span class="tooltip-icon">?</span>
                        <span class="tooltip-content">Taxa de rentabilidade por mês.</span>
                    </span>
                </label>
                <div class="input-wrapper">
                    <input type="number" id="inv-taxa" class="form-control has-suffix" placeholder="0.00" step="0.01" min="0">
                    <span class="input-suffix">%</span>
                </div>
            </div>
            <div class="form-group">
                <label for="inv-tempo">Prazo (Meses)</label>
                <input type="number" id="inv-tempo" class="form-control" placeholder="0" step="1" min="0">
            </div>
            <button id="inv-btn" class="btn-calc">Simular</button>
            <div id="inv-result" class="result-area">
                <div class="result-label">
                    Valor Final Estimado
                    <button class="copy-btn" id="inv-copy" title="Copiar">📋</button>
                </div>
                <div id="inv-total" class="result-value">${formatCurrency(0)}</div>
                <div class="result-detail">Total Investido: <strong id="inv-investido">${formatCurrency(0)}</strong></div>
                <div class="result-detail">Total em Juros: <strong id="inv-juros">${formatCurrency(0)}</strong></div>
                <div class="result-explanation">Projeção considerando juros compostos e aportes constantes ao mês.</div>
            </div>
        </div>
    `;

    const btn = document.getElementById('inv-btn');
    btn.addEventListener('click', () => {
        const container = btn.closest('.calc-form');
        clearValidationErrors(container);

        const isInicialValid = validateInput('inv-inicial', 'Campo obrigatório e numérico');
        const isMensalValid = validateInput('inv-mensal', 'Valor numérico inválido', true);
        const isTaxaValid = validateInput('inv-taxa', 'Campo obrigatório e numérico');
        const isTempoValid = validateInput('inv-tempo', 'Campo obrigatório e numérico');

        if (!isInicialValid || !isMensalValid || !isTaxaValid || !isTempoValid) {
            return;
        }

        const inicialInput = document.getElementById('inv-inicial').value;
        const mensalInput = document.getElementById('inv-mensal').value;
        const taxaInput = document.getElementById('inv-taxa').value;
        const tempoInput = document.getElementById('inv-tempo').value;

        const inicial = parseFloat(inicialInput);
        const mensal = parseFloat(mensalInput) || 0;
        const taxa = parseFloat(taxaInput) / 100;
        const tempo = parseFloat(tempoInput);

        let montante = inicial;
        let totalInvestido = inicial;

        for (let i = 0; i < tempo; i++) {
            montante = montante * (1 + taxa) + mensal;
            totalInvestido += mensal;
        }

        const juros = montante - totalInvestido;

        const elTotal = document.getElementById('inv-total');
        const elInvestido = document.getElementById('inv-investido');
        const elJuros = document.getElementById('inv-juros');
        
        elTotal.dataset.raw = montante;
        elInvestido.dataset.raw = totalInvestido;
        elJuros.dataset.raw = juros;

        elTotal.textContent = formatCurrency(montante);
        elInvestido.textContent = formatCurrency(totalInvestido);
        elJuros.textContent = formatCurrency(juros);
        
        document.getElementById('inv-result').classList.add('show');

        addHistory('investimento', 'Investimento', {
            'Inicial': formatCurrency(inicial),
            'Aporte Mensal': formatCurrency(mensal),
            'Taxa (%)': (taxa * 100).toFixed(2),
            'Meses': tempo
        }, formatCurrency(montante));
    });

    document.getElementById('inv-copy').addEventListener('click', () => {
        const val = document.getElementById('inv-total').textContent;
        copyToClipboard(val, 'Valor final copiado!');
    });

    window.addEventListener('reuseCalculation', (e) => {
        if(e.detail.calcId === 'investimento') {
            const rawInic = String(e.detail.inputs['Inicial']).replace(/[^0-9,-]+/g,"").replace(',', '.');
            const rawMensal = String(e.detail.inputs['Aporte Mensal']).replace(/[^0-9,-]+/g,"").replace(',', '.');
            document.getElementById('inv-inicial').value = parseFloat(rawInic) || 0;
            document.getElementById('inv-mensal').value = parseFloat(rawMensal) || 0;
            document.getElementById('inv-taxa').value = e.detail.inputs['Taxa (%)'];
            document.getElementById('inv-tempo').value = e.detail.inputs['Meses'];
            document.getElementById('inv-btn').click();
        }
    });

    setupLocalHistory(container.querySelector('.calc-form'), 'investimento');
}
