# Plano de Auditoria e Correção - Dimensionador de Comandos Elétricos

Este plano detalha a auditoria técnica da aplicação, identificando falhas de conformidade com a NBR 5410, erros de lógica no motor de cálculo, problemas de catálogo de dispositivos e usabilidade, seguidos pelas correções necessárias.

## Auditoria Técnica (Falhas Identificadas)

1.  **Lógica de Queda de Tensão**: O cálculo de queda de tensão estava retornando valores abaixo do limite sem otimização clara (ex: solicitando 2% e entregando 1.36% quando uma bitola menor ainda atenderia).
2.  **Catálogo de Dispositivos (Siemens/Schneider)**: Falta de componentes específicos ou falha na filtragem ao selecionar marcas não-WEG (especialmente relés térmicos e contatores de alta potência).
3.  **Dimensionamento de Dispositivos**: A lógica de dimensionamento do disjuntor (1.25 * In) e contatores (AC-3) precisa considerar rigorosamente o Fator de Serviço (FS) e o regime de partida.
4.  **UX do Wizard**: Campos de agrupamento e método de instalação estavam confundindo os termos "feixe" e "camada" (já solicitada correção, mas requer verificação de persistência).
5.  **Persistência de Dados**: O botão "Voltar ao formulário" deve garantir que TODOS os campos (incluindo filtros de catálogo) sejam restaurados exatamente como estavam.

## Implementação das Correções

### 1. Refinamento do Motor de Cálculo (NBR 5410)
-   Ajustar `CalculationEngine.ts` para garantir que a escolha da seção por queda de tensão seja a MENOR bitola que satisfaça `actualDrop <= maxDropPercent`.
-   Garantir que o Fator de Serviço (FS) seja aplicado em todos os critérios de dimensionamento (Cabos, Disjuntores, Contatores e Relés).

### 2. Expansão do Catálogo e Busca Inteligente
-   Adicionar itens faltantes ao `MANUFACTURER_CATALOG` para Siemens e Schneider (Relés térmicos e Disjuntores de Caixa Moldada).
-   Melhorar `findCompatibleProduct` para usar faixas de ajuste (`adjustmentRange`) de forma mais robusta e garantir que fallback de fabricante funcione corretamente.

### 3. Melhoria da Usabilidade e Wizard
-   Consolidar a correção dos termos "feixe/camada" por "Circuitos agrupados" e "Instalados sobre parede/no piso".
-   Ajustar os valores padrão no `CalculatorWizard.tsx` (5cv, 5m, 0.85 fp, 0.9 η, 2% drop).
-   Garantir que o estado do catálogo (linha, polos, potência) seja persistido no Zustand ao navegar entre telas.

### 4. Layout de Proposta e Impressão
-   Ajustar `ProposalFlow.tsx` para garantir que, ao imprimir, os dados técnicos e a lista de materiais caibam preferencialmente em uma única página A4, reduzindo espaçamentos excessivos.

## Detalhes Técnicos
-   **Arquivos afetados**:
    -   `src/lib/engine/CalculationEngine.ts`: Lógica de cálculo e fatores.
    -   `src/lib/catalog/index.ts`: Dados de produtos e algoritmos de busca.
    -   `src/components/CalculatorWizard.tsx`: Interface de entrada e persistência.
    -   `src/lib/store.ts`: Definição do estado global.
    -   `src/components/ProposalFlow.tsx`: Interface de orçamento e impressão.

---
**Comando do Usuário**: Auditoria da aplicação e listagem de falhas/erros potenciais.
