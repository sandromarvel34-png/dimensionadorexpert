# Auditoria Técnica e Plano de Correção — Dimensionador Expert

## 1. Problemas Identificados (Auditoria Preliminar)

1.  **Corrente de Projeto (Ib) e Fator 1,25**: O motor aplica `In * 1.25 * FS` para dimensionamento de cabos. Embora a NBR 5410 recomende margem para motores, o fator 1,25 é frequentemente confundido ou aplicado cumulativamente com o Fator de Serviço (FS). É necessário explicitar cada componente na memória.
2.  **Independência de Critérios**: O código atual já realiza cálculos independentes, mas a interface (EducationalFlow) por vezes mistura a explicação. O teste de regressão confirmou a independência lógica, mas a rastreabilidade visual precisa de melhoria.
3.  **Tabelas de Ampacidade**: A tabela interna em `CalculationEngine.ts` é simplificada e limitada a 240mm². Precisa de expansão para suportar motores de grande porte (até 300mm² ou mais) e tratamento de erro explícito se o limite for excedido.
4.  **Tratamento de Erros (Safety)**: O uso de `|| 1.0` ou fallbacks silenciosos em fatores de agrupamento/temperatura pode mascarar seleções de usuário inválidas.
5.  **Memória de Cálculo (LaTeX)**: Há relatos de duplicação ou falha de renderização em passos específicos da UI.

## 2. Plano de Ação

### Fase 1: Refatoração do Motor (Domain Logic)
- [ ] **Estatização de Tabelas**: Mover tabelas de ampacidade para um módulo de dados robusto com suporte a diferentes métodos de instalação (A1, B1, C, D, etc.) conforme NBR 5410.
- [ ] **Explicitação de Ib**: Criar uma interface de resultado que retorne `nominalCurrent`, `designCurrent` (Ib), e os fatores aplicados de forma isolada.
- [ ] **Validação de Limites**: Lançar erros explícitos em vez de retornar o "último cabo da lista" quando a corrente exceder a tabela.

### Fase 2: Interface e Memória de Cálculo
- [ ] **Novo Componente de Resultados**: Implementar a tabela comparativa de critérios (Ampacidade vs Queda vs Mínima).
- [ ] **Refinamento KaTeX**: Garantir que as fórmulas mostrem a substituição numérica dos valores reais informados pelo usuário.
- [ ] **Sincronização PDF**: Unificar o gerador de dados para garantir que o PDF seja um espelho exato da memória de cálculo da tela.

### Fase 3: Validação
- [ ] Executar suíte de testes de regressão expandida.
- [ ] Verificar conformidade visual com a referência técnica.

## 3. Detalhes Técnicos das Fórmulas a Implementar

**Corrente Nominal (Trifásica):**
$$I_n = \frac{P_{kW} \cdot 1000}{\sqrt{3} \cdot V \cdot \cos\phi \cdot \eta}$$

**Seção por Queda de Tensão (S):**
$$S_{req} = \frac{100 \cdot \sqrt{3} \cdot \rho \cdot L \cdot I_n \cdot \cos\phi}{\Delta V_{\%} \cdot V}$$

**Critério de Seleção Final:**
$$S_{final} = \max(S_{ampacidade}, S_{queda}, S_{minima})$$
