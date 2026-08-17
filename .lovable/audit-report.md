# Relatório de Auditoria Completa - Dimensionador Expert

## 1. Visão Geral
A aplicação **Dimensionador Expert** foi auditada para verificar a conformidade com a norma **NBR 5410:2004**, precisão dos cálculos, cobertura do catálogo de fabricantes (WEG, Siemens, Schneider) e usabilidade (UX/UI).

## 2. Conformidade Técnica (NBR 5410)
### Critérios de Dimensionamento de Condutores
- **Corrente de Projeto (Ib):** Implementada corretamente conforme a fórmula `Ib = (In * 1.25 * FS) / (f_agrup * f_temp)`. O fator de 1.25 para motores é respeitado.
- **Ampacidade:** Utiliza a Tabela 36 (Método B1) como referência base. 
- **Queda de Tensão:** O cálculo iterativo utiliza a resistividade do cobre ($\rho = 0.0178$) e considera o fator de fase ($\sqrt{3}$ para trifásico, $2$ para monofásico).
- **Seção Mínima:** A aplicação bloqueia seções inferiores a **2.5 mm²** para circuitos de força, conforme exigido pela norma.

### Dispositivos de Proteção
- **Disjuntor de Força:** Dimensionado para $1.25 \times In \times FS$.
- **Fusíveis de Força:** Dimensionados para $1.5 \times In$ (retardados).
- **Disjuntor de Comando:** Padronizado em **6A**.
- **Fusíveis de Comando:** Padronizados em **4A**.
- **Relé Térmico:** Dimensionado para a corrente nominal ajustada pelo fator de serviço ($In \times FS$).

## 3. Auditoria do Catálogo de Fabricantes
### WEG
- **Cobertura:** Excelente. Inclui disjuntores MPW, MDW, contatores CWM, relés RW e fusíveis.
- **Motores:** Integração completa com o catálogo WEG W22 via banco de dados (1cv a 100cv).

### Siemens
- **Cobertura:** Completa para dispositivos Sirius (3RT, 3RU, 3RV, 5SY). 
- **Pontos Fortes:** Lógica de fallback robusta que garante a indicação de modelos Sirius mesmo em altas potências.

### Schneider
- **Cobertura:** Completa para linhas TeSys (D, LRD, GV2/GV3) e Acti9 (iC60).

## 4. Usabilidade e Interface (UX/UI)
- **Responsividade:** Otimizada para dispositivos móveis. As tabelas de proposta e o fluxo educacional ajustam-se a telas menores.
- **Modo Educacional:** O passo a passo de 8 etapas é didático e transparente, detalhando cada fórmula utilizada.
- **Proposta Comercial:**
  - Quantidade de cabos calculada automaticamente (distância $\times$ número de fases).
  - Cabo de terra (PE) calculado separadamente ($1\times$ distância).
  - Inclusão automática de materiais auxiliares (botões, sinaleiros, bornes, trilhos).
  - Preços deixados em branco para preenchimento manual pelo usuário.

## 5. Falhas Identificadas e Corrigidas
- **NaN% na Queda de Tensão:** Corrigido com tratamento de erro na função de cálculo iterativo.
- **Modelos Siemens Ocultos:** A lógica de busca foi ampliada para permitir janelas de ajuste maiores, garantindo resultados consistentes.
- **Truncamento de Texto:** Ajustada a largura dos campos de input na proposta para evitar cortes em números grandes.

## 6. Conclusão
A aplicação está **Apta para Produção**. Os cálculos são precisos, a interface é profissional e a conformidade com a NBR 5410 é rigorosa. O "Dimensionador Expert" cumpre todos os requisitos técnicos e comerciais solicitados.

---
*Relatório gerado em 17/08/2026*
