# Relatório de Auditoria e Correção Técnica — Dimensionador Expert

## 1. Problemas Encontrados (Causa Raiz)

1.  **Indefinição de Ib**: A corrente de projeto (Ib) era calculada "inline" em múltiplos lugares, dificultando a rastreabilidade e causando discrepâncias visuais na memória de cálculo.
2.  **Limite de Tabela Fictício**: O catálogo de cabos terminava em 240mm² e, se excedido, retornava o último valor sem avisar o usuário, o que é perigoso em dimensionamentos de alta potência.
3.  **Mistura de Critérios na UI**: A interface educacional e o PDF por vezes mostravam a corrente nominal (In) onde deveriam mostrar a corrente de projeto corrigida (Ib), gerando confusão sobre qual valor estava sendo usado para selecionar o cabo.
4.  **LaTeX Frágil**: O uso de spans com `dangerouslySetInnerHTML` para LaTeX em locais com strings complexas causava falhas de renderização ou caracteres de escape visíveis.

## 2. Ações Realizadas

### Arquitetura do Motor de Cálculo (`CalculationEngine.ts`)
- **Unificação de Ib**: Implementada uma única fórmula centralizada: $I_b = \frac{I_n \cdot 1,25 \cdot FS}{f_{agrup} \cdot f_{temp}}$.
- **Independência Real**: Refatorado o método de Queda de Tensão para isolar a seção teórica $S$ antes da seleção comercial, garantindo que o limite do usuário seja a restrição de projeto.
- **Tabelas Normativas (`ampacity-tables.ts`)**: Criado módulo dedicado com dados da NBR 5410, expandindo a capacidade até 500mm² e implementando erros explícitos para sobrecarga.

### Interface e Rastreabilidade
- **ResultView e EducationalFlow**: Atualizados para mostrar explicitamente a comparação entre os 3 critérios (Ampacidade, Queda de Tensão, Seção Mínima).
- **Consistência PDF**: O PDF agora exibe a Corrente de Projeto ($I_b$) como o valor de referência principal para o dimensionamento do condutor.

## 3. Fórmulas Implementadas

1.  **Corrente Nominal (Motor Trifásico)**:
    $$I_n = \frac{P_{kW} \cdot 1000}{\sqrt{3} \cdot V \cdot \cos\phi \cdot \eta}$$
2.  **Corrente de Projeto Corrigida (Cabo)**:
    $$I_b = \frac{I_n \cdot 1,25 \cdot FS}{f_{agrup} \cdot f_{temp}}$$
3.  **Seção por Queda de Tensão (Design Constraint)**:
    $$S_{teorica} = \frac{100 \cdot \sqrt{3} \cdot \rho \cdot L \cdot I_n \cdot \cos\phi}{\Delta V_{\%} \cdot V}$$

## 4. Testes de Regressão

Foram criados testes automatizados em `src/lib/engine/RegressionTests.ts` que validam:
- **Independência**: Alterar a queda admissível (1% -> 4%) altera a seção por ΔV mas mantém a seção por ampacidade.
- **Escalabilidade**: Aumentar a distância ou a temperatura resulta em bitolas maiores de forma coerente.
- **Precisão**: A corrente nominal calculada para um motor de 75CV 220V trifásico é exatamente 189.23A.

## 5. Verificações NBR 5410 Implementadas

- [x] Dimensionamento por Ampacidade (Tabelas 36-39).
- [x] Fatores de Correção de Temperatura (Tabela 40).
- [x] Fatores de Correção de Agrupamento (Tabela 42).
- [x] Limite de Queda de Tensão Admissível (Item 6.2.7).
- [x] Seção Mínima de Força: 2,5mm² (Tabela 47).
- [x] Sobrecarga de Motores: Fator 1,25 (Margem normativa).

*Nota: A verificação de curto-circuito e coordenação de proteção requer dados de impedância da rede que devem ser fornecidos por um profissional no local.*
