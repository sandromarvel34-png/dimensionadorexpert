# Auditoria da Aplicação: Dimensionador de Comandos Elétricos

## 1. Divergências Visuais vs. Referências

### Resultados (ResultsView)
- **Cabeçalho de Resultados:** Nas imagens, a seção de "Condutor Recomendado" e "Resumo Elétrico" tem um design mais limpo com ícones de escudo e cores contrastantes. A implementação atual segue a estrutura, mas pode precisar de ajustes finos em paddings e tipografia para igualar a densidade da imagem.
- **Grades de Fabricantes:** A imagem mostra 3 cards horizontais para cada categoria (WEG, Siemens, Schneider). A implementação atual faz isso, mas alguns itens como "Disjuntor Motor" e "Fusíveis" estão aparecendo como "Nenhum produto compatível" para Siemens/Schneider, indicando falta de dados no catálogo local para certas faixas de potência.

### Proposta Comercial (ProposalFlow)
- **Botões de Fabricante:** Na imagem, os botões de troca de marca (WEG, Siemens, Schneider) estão no topo do documento. A implementação atual tem isso, mas a transição de itens ao trocar de marca precisa ser 100% fluida, garantindo que o modelo mude instantaneamente na lista.
- **Cabo de Comando 1.0mm²:** O requisito de ocultar a quantidade e manter valor fixo 15 foi implementado no código, mas precisa ser validado visualmente na impressão.
- **Formulário de Configurações:** A barra lateral direita (Validade, Valor Hora, etc.) está presente, mas a estilização dos inputs e o botão "Imprimir Documento" precisam de maior fidelidade com o azul vibrante da referência.

---

## 2. Falhas Técnicas e Erros Identificados

### Catálogo de Produtos
- **Falta de Modelos:** Para motores de alta potência (>50cv), as linhas Schneider TeSys GV e Siemens Sirius 3RV/3RT precisam de mais entradas para evitar a mensagem de "Nenhum produto compatível".
- **Disjuntor Motor vs Proteção Principal:** Em partidas de grande porte, o software deve sugerir Disjuntores de Caixa Moldada (ex: WEG DWB) em vez de apenas mini-disjuntores (MDW).

### Cálculo e Lógica (Engine)
- **Queda de Tensão:** O loop iterativo no `CalculationEngine` está correto, mas a exibição do "Critério Limitante" precisa ser mais clara: "Dimensionado por Ampacidade" ou "Dimensionado por Queda de Tensão".
- **Quantidade de Cabos:** O multiplicador (3x para trifásico, 2x para monofásico) foi corrigido, mas o arredondamento em grandes metragens (ex: 240m) deve ser verificado para garantir que o input de quantidade suporte 3+ dígitos sem truncar visualmente.

### Usabilidade (UX)
- **Persistência de Dados:** Ao clicar em "Voltar", alguns campos do formulário manual podem resetar se o `useAppStore` não capturar o `onChange` imediatamente.
- **Impressão A4:** O layout de 1-2 páginas é crítico. A tabela de materiais precisa de `page-break-inside: avoid` para não separar a descrição da quantidade em páginas diferentes.

---

## 3. Plano de Ação

1.  **Enriquecimento do Catálogo:** Adicionar faixas de 50cv a 100cv para Siemens e Schneider no `src/lib/catalog/index.ts`.
2.  **Refinamento do ProposalFlow:** Ajustar o CSS para garantir que o número "240" (ou maiores) apareça sem cortes no input de quantidade.
3.  **Ajuste de Auxiliares:** Garantir que o Cabo de Comando 1.0mm² tenha a QTD fixa e o campo de input desabilitado/oculto na proposta.
4.  **Sincronização de Marcas:** Refinar o `useEffect` que reconstrói a lista de itens ao trocar o `selectedManufacturer` na Proposta.
