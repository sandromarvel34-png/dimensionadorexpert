# Plano de Refatoração da Proposta Comercial

## Mudanças Necessárias
1.  **Novos Campos de Estado (Zustand/Componente local):**
    *   `serviceDescription`: Descrição do serviço (textarea).
    *   `technicianName`: Nome do técnico responsável (obrigatório).
    *   `executingCompany`: Empresa executora (opcional).
2.  **Interface do Usuário (UI):**
    *   Adicionar textarea "Descrição do Serviço" abaixo de "Dados do Cliente".
    *   Adicionar inputs "Técnico Responsável" e "Empresa Executora" em "Configurações Comerciais".
3.  **Layout de Impressão (@media print):**
    *   Forçar quebra de página (`break-before: page`) no início da "Lista de Materiais".
    *   Página 1: Cabeçalho, Dados Cliente, Descrição Serviço, Dados Técnicos.
    *   Página 2: Lista Materiais, Mão de Obra, Observações, Totais, Assinatura.
    *   Lógica condicional para exibir "[Empresa] - Técnico" ou apenas "Técnico".
4.  **Estilização:**
    *   `break-inside: avoid` nas linhas da tabela.
    *   Ajustes de margens para garantir 2 páginas.

