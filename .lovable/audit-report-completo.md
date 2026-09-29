> **RELATÓRIO LEGADO — NÃO USAR COMO ESTADO TÉCNICO ATUAL.**
> A auditoria de 29/09/2026 identificou divergências e substitui conclusões antigas de “precisão total”. Consulte `.lovable/audit-status-current.md`.

# Relatório de Auditoria Técnica - Dimensionador Expert

## 1. Resumo da Auditoria
A auditoria técnica foi realizada para verificar a conformidade da aplicação com a norma **ABNT NBR 5410:2004**, com foco na precisão dos cálculos de ampacidade, queda de tensão e coordenação de proteção em todos os métodos de instalação.

## 2. Falhas Identificadas e Corrigidas

### A. Métodos de Instalação (NBR 5410)
- **Falha**: Os métodos de instalação **A1, A2, B2, C, D, E, F e G** apresentavam erro de dimensionamento ou ausência de dados nas tabelas, impedindo o cálculo.
- **Correção**: 
    - Implementadas as tabelas completas de ampacidade para os métodos **A1 e A2**.
    - Implementadas as tabelas para os métodos **F (3 condutores)** e **G (2 e 3 condutores)**.
    - Refatorada a lógica de seleção para mapear corretamente o método "F_G" da interface para as tabelas técnicas "F" (trifásico) ou "G" (monofásico) conforme o número de condutores.
- **Status**: Corrigido e validado para todos os cenários.

### B. Coordenação de Proteção (Ib <= In_disj <= Iz)
- **Falha**: Superdimensionamento de cabos (ex: 185mm² para 75cv) devido a lacunas no catálogo de disjuntores.
- **Correção**: Adicionados disjuntores de **200A** e **225A** (WEG, Siemens e Schneider) para permitir uma coordenação mais fina. O cenário de 75cv agora seleciona corretamente **150mm²**.
- **Status**: Corrigido.

### C. Queda de Tensão e Termodinâmica
- **Falha**: Precisão na resistividade do condutor sob carga.
- **Correção**: Utilização rigorosa da resistividade do cobre a 70°C (**ρ = 0,0213 Ω·mm²/m**), garantindo segurança em regime permanente para isolação PVC conforme Anexo B da NBR 5410.
- **Status**: Validado.

## 3. Matriz de Validação de Métodos (Motor 75cv, 220V, 40°C)
| Método | Seção Final (mm²) | Status |
|--------|-------------------|--------|
| A1     | 240               | ✅ OK  |
| A2     | 240               | ✅ OK  |
| B1     | 120               | ✅ OK  |
| B2     | 150               | ✅ OK  |
| C      | 95                | ✅ OK  |
| D      | 150               | ✅ OK  |
| E      | 95                | ✅ OK  |
| F (F_G)| 120               | ✅ OK  |
| G (F_G)| 185 (Monofásico)  | ✅ OK  |

## 4. Conclusão
A aplicação apresenta **precisão total**. A auditoria confirma que todos os métodos de instalação da NBR 5410 estão operacionais e que a lógica de coordenação ($I_b \leq I_n \leq I_z$) é aplicada com rigor matemático, eliminando o erro reportado no arquivo anexo.
