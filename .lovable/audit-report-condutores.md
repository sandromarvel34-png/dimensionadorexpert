# Relatório de Auditoria Técnica: Dimensionamento de Condutores (NBR 5410)

## 1. Metodologia de Cálculo
A auditoria verificou os dois critérios fundamentais exigidos pela NBR 5410 para circuitos de motores.

### A. Critério da Capacidade de Condução de Corrente (Ampacidade)
- **Fórmula de Projeto ($I_b$):** $I_b = \frac{I_n \cdot 1,25 \cdot FS}{f_{agrup} \cdot f_{temp}}$
- **Status:** ✅ **CONFORME**. 
  - O multiplicador de 1,25 (fator de partida/segurança para motores) está sendo aplicado corretamente.
  - O Fator de Serviço (FS) é integrado à corrente de projeto, garantindo que o cabo suporte a sobrecarga permitida pelo motor.
  - Os fatores de correção de temperatura e agrupamento seguem as tabelas da norma para o Método B1.

### B. Critério da Queda de Tensão Admissível ($\Delta V$)
- **Fórmula de Dimensionamento ($S$):** $S = \frac{100 \cdot k \cdot \rho \cdot L \cdot I_n \cdot \cos \varphi}{\Delta V_{\%} \cdot V}$
- **Status:** ✅ **CONFORME**.
  - O sistema isola a seção $S$ para encontrar a bitola mínima necessária antes de selecionar a bitola comercial.
  - Constante $k$ diferencia corretamente sistemas Trifásicos ($\sqrt{3}$) de Monofásicos ($2$).
  - Resistividade ($\rho$) do cobre adotada: $0,0178 \, \Omega\cdot\text{mm}^2/\text{m}$.

## 2. Seleção e Indicação do Condutor Final
- **Lógica de Seleção:** $S_{final} = \max(S_{ampacidade}, S_{queda\_tensão}, 2,5\,\text{mm}^2)$
- **Status:** ✅ **CONFORME**. 
  - O sistema respeita a seção mínima de $2,5\,\text{mm}^2$ para circuitos de força.
  - A interface indica claramente qual critério foi o "limitante", oferecendo transparência técnica.

## 3. Verificações de Usabilidade e Interface
- **Passo a Passo Educacional:** As fórmulas em LaTeX estão renderizando corretamente com KaTeX, apresentando a substituição dos valores em tempo real.
- **Relatório de Resultados:** A bitola final é destacada, mas a memória de cálculo preserva os valores individuais de cada critério para conferência do projetista.

## 4. Conclusão da Auditoria
A aplicação demonstra maturidade técnica elevada, tratando a queda de tensão como uma **restrição de projeto** e não apenas uma verificação passiva. Os cálculos são precisos e as margens de segurança aplicadas estão em estrita conformidade com as recomendações da NBR 5410.

**Auditado por:** Lovable AI Engine
**Data:** 18 de Agosto de 2026
