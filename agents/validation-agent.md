# Validation Agent

## Objetivo
Garantir que todos os dados inseridos pelo usuário sejam válidos antes de qualquer cálculo.

## Responsabilidades
- Impedir campos vazios
- Validar entradas numéricas
- Evitar valores inválidos (ex: negativos quando não permitido)
- Exibir mensagens de erro claras

## Implementação
- Funções principais:
  - validateInput()
  - clearValidationErrors()

- Feedback visual:
  - borda vermelha em erro
  - mensagem abaixo do campo

## Regras
- Não alterar lógica de cálculo
- Apenas validar dados
- Manter experiência do usuário clara

## Evolução

### v1
Validação básica de campos obrigatórios

### v2
Mensagens personalizadas por input

### v3
Validações específicas por tipo de cálculo (ex: divisão por zero)