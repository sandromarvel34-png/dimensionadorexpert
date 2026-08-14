# Transformação Calculadora Elétrica Pro

Este plano detalha a migração da interface atual para um produto digital profissional de alta conversão, mantendo o motor técnico existente e adicionando novas funcionalidades de UX e organização.

## 1. Posicionamento e Identidade
- Renomear para **Calculadora Elétrica Pro**.
- Adicionar slogan: "Dimensione. Confira. Decida."
- Implementar badge "ACESSO VITALÍCIO" e textos de apoio premium.
- Estilizar a UI com uma estética industrial refinada (dark mode, acentos amarelos/cobre).

## 2. Dashboard Orientada à Ação
- Substituir a visualização inicial por um Dashboard focado em novos dimensionamentos.
- Seção "⚡ Novo Dimensionamento" com CTA destacado.
- Lista de benefícios/entrega (Condutor, Proteção, Queda de Tensão, etc.) em cards.
- Histórico de dimensionamentos ("Meus dimensionamentos") com busca, filtros e ações (Abrir, Duplicar, Excluir).

## 3. Fluxo Wizard (Passo a Passo)
- Implementar assistente em 4 etapas:
    1. **Carga**: Potência, Tensão, Motores.
    2. **Circuito**: Distância, Queda Adm.
    3. **Proteção e comando**: Partida, Marca, Padrão Painel.
    4. **Resultado**: Solução final detalhada.
- Validação imediata de campos para evitar erros técnicos (NaN, Infinity, 0mm²).

## 4. Apresentação de Resultados Premium
- Card principal de impacto para o **Condutor Final Dimensionado**.
- Resumo da solução com cards individuais (Condutor, Disjuntor, Contator, Relé) com botão "Ver detalhes".
- Comparador de fabricantes (WEG, Siemens, Schneider) em tabela estruturada.
- Memória de cálculo detalhada com fórmulas e dados passo a passo.

## Detalhes Técnicos
- **Frontend**: Componentização do formulário em etapas usando estado local do React.
- **Validação**: Verificação rigorosa no motor de cálculo para retornar mensagens de erro amigáveis em vez de valores matemáticos inválidos.
- **Persistência**: Utilização do Supabase para o histórico "Meus dimensionamentos" (se configurado) ou localStorage como fallback imediato.
- **Estilos**: Extensão do `src/styles.css` com variáveis para o tema industrial e animações de transição entre etapas.
