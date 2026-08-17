# Auditoria Completa da Aplicação "Dimensionador de Comandos Elétricos Pro"

## 1. Falhas Técnicas e Erros Encontrados

### A. Motor de Cálculo (NBR 5410)
- **Fator de Agrupamento (FCA):** O `CalculationEngine.ts` define `bundle: 1.00`, mas para circuitos agrupados no mesmo eletroduto/canaleta, a NBR 5410 especifica fatores redutores (ex: 2 circuitos = 0.80). O código aplica o fator, mas o usuário não visualiza claramente qual tabela está sendo usada na seleção.
- **Queda de Tensão:** A fórmula atual no `CalculationEngine.ts` usa uma aproximação resistiva pura (`RHO * dist * In * pf`). Para condutores maiores (> 35mm²), a reatância indutiva torna-se relevante e deve ser considerada para precisão profissional em longas distâncias.
- **Seção Mínima:** O código garante 2.5mm² para força, mas não impõe a seção mínima de 1.5mm² para circuitos de comando (cabo de comando).
- **Proteção de Comando:** O motor adiciona um disjuntor de 6A para comando, mas não há um seletor no catálogo para esse item específico em todas as marcas de forma consistente.

### B. Catálogo de Produtos
- **Falta de Profundidade (Alta Potência):** O catálogo local (`src/lib/catalog/index.ts`) possui dados limitados para motores > 50cv. Disjuntores de caixa moldada (DWB, NSX, 3VA) estão presentes mas com poucos modelos, o que pode causar o erro "Nenhum produto compatível" para potências intermediárias.
- **Disjuntor Motor vs Fusível:** O sistema sugere ambos, mas tecnicamente em muitos projetos se usa um *ou* outro. A interface não permite a escolha da estratégia de proteção.
- **Relés Térmicos Siemens/Schneider:** A lógica de busca por `adjustmentRange` falha se o campo não estiver preenchido exatamente como o motor de cálculo espera (corrente nominal no centro do range).

### C. Interface e UX (Wizard & Resultados)
- **Persistência de Dados:** Ao clicar em "Voltar", alguns estados do formulário (como o motor selecionado no catálogo) podem se perder se não estiverem devidamente sincronizados com o Zustand no `useEffect` inicial do Wizard.
- **Visualização de Quantidades:** O erro de "truncamento" em campos de quantidade (ex: 240 aparecendo como 24) foi mitigado, mas ainda pode ocorrer em telas mobile devido ao padding excessivo dos inputs do Shadcn UI.
- **Tradução:** Termos como "Single", "Dahlander" no banco de dados do motor não estão mapeados para labels amigáveis em português na interface de seleção.

### D. Fluxo de Proposta e Impressão
- **Cálculo de Cabos:** O multiplicador (3x para trifásico) é aplicado apenas ao cabo de força. Cabos de aterramento (PE) e cabos de comando não seguem uma lógica de metragem configurável, sendo fixos ou manuais.
- **Layout A4:** Em propostas com muitos itens, o rodapé de assinatura pode "quebrar" para uma terceira página, violando o requisito de 1-2 páginas.
- **Preços Zerados:** Como os preços no catálogo são estáticos e defasados, o usuário é forçado a preencher item por item. Falta uma função de "Preço Global Estimado" ou integração com índices de mercado.

## 2. Erros Críticos de Código
- **NaN% em Resultados:** O `ResultsView` tenta tratar `NaN`, mas se `currentResults` for carregado de um histórico antigo sem o campo `voltageDropCalculated`, a tela pode quebrar.
- **Fator de Serviço (FS):** O motor de cálculo usa `In * 1.25 * fs`. Em algumas normas, o fator 1.25 já engloba sobrecargas leves, e aplicar FS cumulativamente pode superdimensionar excessivamente (ex: 1.25 * 1.15 = 1.43x a corrente nominal).

## 3. Próximos Passos Recomendados
1.  **Refinar Catálogo:** Inserir curvas completas de disjuntores motor para Siemens (3RV) e Schneider (GV).
2.  **Ajuste de Impressão:** Utilizar `@media print` para forçar a escala do memorial técnico.
3.  **Lógica de Cabos:** Adicionar seletor para inclusão ou não do cabo de aterramento no cálculo de metragem.
