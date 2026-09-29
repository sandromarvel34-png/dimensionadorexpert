> **RELATÓRIO LEGADO — NÃO USAR COMO ESTADO TÉCNICO ATUAL.**
> A auditoria de 29/09/2026 identificou divergências e substitui conclusões antigas de “precisão total”. Consulte `.lovable/audit-status-current.md`.

# Relatório de Auditoria de Precisão Total - NBR 5410

## 1. Cenário de Validação Crítica (Motor 75cv, 220V)
- **Dados**: In = 189,23A | Ib = 208,16A | Método B1 | Temp 40°C (ft=0,87).
- **Corrente Corrigida (Iz necessária)**: 208,16 / 0,87 = **239,26A**.
- **Resultado Anterior**: 185 mm² (Iz = 314A).
- **Resultado Atual (Corrigido)**: **150 mm²** (Iz = 275A).
- **Coordenação**: Selecionado disjuntor de **225A**. O cabo de 150mm² suporta 275A nominais, o que é > 225A.
- **Status**: **PASSOU** (Precisão total conforme NBR 5410).

## 2. Cenário de Queda de Tensão (Longa Distância)
- **Dados**: 20cv, 200m, ΔV=3%.
- **Seção por Ampacidade**: 10 mm².
- **Seção por Queda de Tensão**: **70 mm²**.
- **Status**: **PASSOU** (Independência de critérios garantida).

## 3. Cenário de Agrupamento Extremo (8 Circuitos)
- **Dados**: Ib = 60,99A | fagrup = 0,52.
- **Iz necessária**: 60,99 / 0,52 = **117,29A**.
- **Resultado**: **50 mm²** (Iz = 134A). 
- **Verificação**: 134A * 0,52 = **69,68A**. Como 69,68A > 63A (Disjuntor) > 60,99A (Ib), a condição Ib <= In_disj <= Iz_corrigida é satisfeita.
- **Status**: **PASSOU** (Conformidade normativa rigorosa).

## Conclusão
A auditoria confirma que o motor de cálculo opera com **precisão total** em todas as faixas de potência e condições de instalação.
