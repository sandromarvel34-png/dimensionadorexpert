# Relatório de Auditoria — Fase 0: Proteção do Módulo de Motores

## 1. Mapeamento de Arquivos e Funções

| Funcionalidade | Arquivos Principais | Função/Lógica |
| :--- | :--- | :--- |
| **Entrada de Dados** | `src/components/CalculatorWizard.tsx` | Captura `CalculationInputs` via formulário e estado Zustand. |
| **Cálculo de Corrente** | `src/lib/engine/CalculationEngine.ts` | `calculateNominalCurrent` e lógica $I_b = I_n \times FS$. |
| **Ampacidade** | `src/lib/engine/CalculationEngine.ts`, `src/lib/engine/ampacity-tables.ts` | `getSectionByAmpacity` usando tabelas NBR 5410 para métodos A1-G. |
| **Queda de Tensão** | `src/lib/engine/CalculationEngine.ts` | `getSectionByVoltageDrop` com $\rho = 0,0213 \Omega\cdot\text{mm}^2/\text{m}$. |
| **Proteções** | `src/lib/catalog/index.ts`, `src/lib/engine/CalculationEngine.ts` | Coordenação $I_b \le I_{disj} \le I_z$. |
| **Interface/Memória** | `src/components/ResultsView.tsx`, `src/components/educational/EducationalFlow.tsx` | Exibição de fórmulas via KaTeX e resultados comparativos. |

## 2. Fórmulas e Regras de Negócio (Status Quo)

- **$I_n$ (Trifásico):** $P / (\sqrt{3} \cdot V \cdot \cos \varphi \cdot \eta)$
- **$I_b$:** $I_n \cdot FS$
- **$I_{corr\_tabela}$:** $I_b / (f_{agrup} \cdot f_{temp})$
- **Queda de Tensão ($S$):** $(100 \cdot k \cdot \rho \cdot L \cdot I_b \cdot \cos \varphi) / (\Delta V_{\%} \cdot V)$
- **Coordenação:** O disjuntor é selecionado primeiro ($I_{disj} \ge I_b$), depois o cabo por ampacidade deve suportar pelo menos $I_{disj}$.
- **Seção Mínima:** 2,5 mm² para circuitos de força.

## 3. Testes de Regressão Implementados

Os testes em `src/lib/engine/CalculationEngine.test.ts` foram validados e expandidos para cobrir:
1. Validação de tensão (rejeição de 0 ou NaN).
2. Consistência de $I_b$ entre motor de cálculo e dispositivos.
3. Independência do critério de queda de tensão (escala correta com distância e limite %).
4. Seleção do maior valor entre Ampacidade e Queda de Tensão.
5. Influência correta dos fatores de temperatura.
6. Coordenação de disjuntores (Força vs Comando).

## 4. Conclusão da Auditoria

O módulo de motores está **tecnicamente isolado** e protegido. A estrutura de dados `CalculationInputs` e `CalculationResults` serve como o contrato estável. Qualquer implementação residencial futura deve utilizar novos tipos de entrada ou estender os existentes sem alterar as fórmulas de motor já validadas.
