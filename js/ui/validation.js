export function clearValidationErrors(container) {
    const existingErrors = container.querySelectorAll('.input-error-msg');
    existingErrors.forEach(el => el.remove());
    
    // Remove error class from inputs if any
    const errorInputs = container.querySelectorAll('.input-error-border');
    errorInputs.forEach(el => el.classList.remove('input-error-border'));
}

export function validateInput(inputId, customMessage = 'Campo inválido', isOptional = false) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return false;

    const value = inputEl.value.trim();
    if (isOptional && value === '') return true;

    // Verifica se está vazio ou não é um número válido
    if (value === '' || isNaN(Number(value))) {
        showError(inputEl, customMessage);
        return false;
    }
    return true;
}

function showError(inputEl, message) {
    // Add red border if we can, but instruction says avoid changing layout, so we just add a class or style inline
    inputEl.classList.add('input-error-border');
    // Ensure we don't apply an exact same error twice
    if (inputEl.parentElement.nextElementSibling && inputEl.parentElement.nextElementSibling.classList.contains('input-error-msg')) {
        return;
    }
    
    const errorEl = document.createElement('div');
    errorEl.className = 'input-error-msg';
    errorEl.textContent = message;
    
    // If inside an input-wrapper, place it after the wrapper
    if (inputEl.parentElement && inputEl.parentElement.classList.contains('input-wrapper')) {
        inputEl.parentElement.insertAdjacentElement('afterend', errorEl);
    } else {
        inputEl.insertAdjacentElement('afterend', errorEl);
    }
}
