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
            <h2>Salário Líquido (Simplificado)</h2>
            <p>Estime seu salário líquido a partir do salário bruto base mensal.</p>
        </div>
        <div class="calc-form">
            <div class="form-group">
                <label for="sl-bruto">
                    Salário Bruto Mensal (<span class="curr-symbol">${sym}</span>)
                    <span class="tooltip-wrapper" tabindex="0">
                        <span class="tooltip-icon">?</span>
                        <span class="tooltip-content">Remuneração total antes dos descontos.</span>
                    </span>
                </label>
                <div class="input-wrapper">
                    <span class="input-prefix">${sym}</span>
                    <input type="number" id="sl-bruto" class="form-control has-prefix" placeholder="0.00" step="0.01" min="0">
                </div>
            </div>
            <div class="form-group">
                <label for="sl-descontos">
                    Outros Descontos em <span class="curr-symbol">${sym}</span> (Opcional)
                    <span class="tooltip-wrapper" tabindex="0">
                        <span class="tooltip-icon">?</span>
                        <span class="tooltip-content">Vale transporte, plano de saúde, etc.</span>
                    </span>
                </label>
                <div class="input-wrapper">
                    <span class="input-prefix">${sym}</span>
                    <input type="number" id="sl-descontos" class="form-control has-prefix" placeholder="0.00" step="0.01" min="0">
                </div>
            </div>
            <button id="sl-btn" class="btn-calc">Calcular</button>
            <div id="sl-result" class="result-area">
                <div class="result-label">
                    Salário Líquido Estimado
                    <button class="copy-btn" id="sl-copy" title="Copiar">📋</button>
                </div>
                <div id="sl-liquido" class="result-value">${formatCurrency(0)}</div>
                <div class="result-detail">INSS Estimado: <strong id="sl-inss">${formatCurrency(0)}</strong></div>
                <div class="result-detail">IRRF Estimado: <strong id="sl-irrf">${formatCurrency(0)}</strong></div>
                <div class="result-explanation">Estimativa simplificada; pode divergir da tabela oficial exata vigente.</div>
            </div>
        </div>
    `;

    const btn = document.getElementById('sl-btn');
    btn.addEventListener('click', () => {
        const container = btn.closest('.calc-form');
        clearValidationErrors(container);

        const isBrutoValid = validateInput('sl-bruto', 'Campo obrigatório e numérico');
        const isDescontosValid = validateInput('sl-descontos', 'Valor numérico inválido', true);

        if (!isBrutoValid || !isDescontosValid) {
            return;
        }

        const brutoInput = document.getElementById('sl-bruto').value;
        const outrosDescontosInput = document.getElementById('sl-descontos').value;

        const bruto = parseFloat(brutoInput);
        const outrosDescontos = outrosDescontosInput ? parseFloat(outrosDescontosInput) : 0;

        // Cálculos simplificados baseados em faixas genéricas de INSS e IRRF (para fins didáticos)
        let inss = 0;
        if (bruto <= 1412) inss = bruto * 0.075;
        else if (bruto <= 2666.68) inss = bruto * 0.09;
        else if (bruto <= 4000.03) inss = bruto * 0.12;
        else if (bruto <= 7786.02) inss = bruto * 0.14;
        else inss = 908.85; // teto simplificado

        const baseIrrf = bruto - inss;
        let irrf = 0;
        if (baseIrrf > 2259.20 && baseIrrf <= 2826.65) irrf = (baseIrrf * 0.075) - 169.44;
        else if (baseIrrf > 2826.65 && baseIrrf <= 3751.05) irrf = (baseIrrf * 0.15) - 381.44;
        else if (baseIrrf > 3751.05 && baseIrrf <= 4664.68) irrf = (baseIrrf * 0.225) - 662.77;
        else if (baseIrrf > 4664.68) irrf = (baseIrrf * 0.275) - 896.00;

        irrf = irrf < 0 ? 0 : irrf; // se der negativo, não cobra IRRF

        const liquido = bruto - inss - irrf - outrosDescontos;

        const elLiquido = document.getElementById('sl-liquido');
        const elInss = document.getElementById('sl-inss');
        const elIrrf = document.getElementById('sl-irrf');
        
        elLiquido.dataset.raw = liquido;
        elInss.dataset.raw = inss;
        elIrrf.dataset.raw = irrf;

        elLiquido.textContent = formatCurrency(liquido);
        elInss.textContent = formatCurrency(inss);
        elIrrf.textContent = formatCurrency(irrf);
        
        document.getElementById('sl-result').classList.add('show');
        
        addHistory('salarioLiquido', 'Salário Líquido', {
            'Salário Bruto': formatCurrency(bruto),
            'Outros Descontos': formatCurrency(outrosDescontos)
        }, formatCurrency(liquido));
    });

    document.getElementById('sl-copy').addEventListener('click', () => {
        const val = document.getElementById('sl-liquido').textContent;
        copyToClipboard(val, 'Salário Líquido copiado!');
    });

    window.addEventListener('reuseCalculation', (e) => {
        if(e.detail.calcId === 'salarioLiquido') {
            const rawBruto = String(e.detail.inputs['Salário Bruto']).replace(/[^0-9,-]+/g,"").replace(',', '.');
            const rawDesc = String(e.detail.inputs['Outros Descontos']).replace(/[^0-9,-]+/g,"").replace(',', '.');
            
            document.getElementById('sl-bruto').value = parseFloat(rawBruto) || 0;
            document.getElementById('sl-descontos').value = parseFloat(rawDesc) || 0;
            document.getElementById('sl-btn').click();
        }
    });

    setupLocalHistory(container.querySelector('.calc-form'), 'salarioLiquido');
}
