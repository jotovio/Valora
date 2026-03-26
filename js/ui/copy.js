import { showToast } from './toast.js';

export async function copyToClipboard(text, successMessage = 'Copiado para a área de transferência!') {
    try {
        await navigator.clipboard.writeText(text);
        showToast(successMessage, 'success');
    } catch (err) {
        showToast('Falha ao copiar texto.', 'error');
        console.error('Erro ao copiar: ', err);
    }
}
