# Plano de Refatoração da Proposta Comercial

Ajuste da página de orçamento para inclusão de novos campos comerciais e técnicos, além de organização do layout de impressão em duas páginas.

## Mudanças Técnicas

### 1. Estado da Aplicação (Frontend)
- Adição dos seguintes estados no componente `ProposalFlow.tsx`:
    - `serviceDescription` (string): Descrição detalhada do serviço.
    - `technicianName` (string): Nome do técnico (obrigatório).
    - `executingCompany` (string): Nome da empresa (opcional).
- Salvar esses campos no `localStorage` via função `handleSave` existente.

### 2. Interface do Usuário (UI)
- **Formulário Principal:** Adição de `Textarea` para "Descrição do Serviço" logo abaixo de "Dados do Cliente".
- **Sidebar Comercial:** Adição de campos para "Nome do Técnico Responsável" e "Empresa Executora".
- **Visualização da Proposta:** Inclusão da "Descrição do Serviço" no memorial.

### 3. Layout de Impressão (@media print)
- **Divisão de Páginas:**
    - Uso de `break-before: page` para garantir que a "Lista de Materiais e Equipamentos" inicie sempre na **Página 2**.
    - Configuração de `break-inside: avoid` para linhas de tabela.
- **Cabeçalho (Página 1):** Exibição condicional da empresa e técnico abaixo da data.
- **Rodapé (Página 2):** Repetição dos dados do técnico/empresa acima da linha de assinatura.
- **Lógica Condicional:** Se "Empresa Executora" estiver em branco, exibir apenas o nome do técnico sem hífen ou espaços extras.

### 4. Estilos (CSS)
- Inclusão de utilitário de quebra de página no `src/styles.css`.
- Ajustes de densidade para garantir que os dados técnicos caibam na página 1.

## Verificação
- Teste de preenchimento parcial (sem empresa).
- Teste de impressão com listas curtas e longas.
