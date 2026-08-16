# Reestruturação: Dimensionador de Comandos Elétricos Pro

Este plano detalha a evolução da aplicação para um sistema completo de dimensionamento, seleção de produtos e geração de propostas comerciais profissionais.

## Alterações Propostas

### 1. Reestruturação do Mecanismo de Dimensionamento
- **Camada de Requisitos Técnicos:** Criar uma etapa intermediária onde o cálculo elétrico gera "Requisitos Técnicos" (corrente, polos, tensão, categoria AC-3) em vez de selecionar produtos diretamente.
- **Independência de Fabricantes:** O algoritmo consultará separadamente as bases da WEG, Siemens e Schneider, garantindo que não haja equivalências forçadas.

### 2. Fluxo de Seleção e Revisão
- **Interface de Comparação:** Exibir opções compatíveis de cada fabricante lado a lado para que o usuário escolha qual deseja incluir na proposta.
- **Matriz de Composição de Materiais:** Implementar uma lógica (starter_components) que adiciona automaticamente itens auxiliares (botoeiras, sinaleiros, bornes, trilhos) baseados no tipo de partida e modo de comando.
- **Tabela de Revisão:** Interface editável para ajustar quantidades e preços antes de finalizar a proposta.

### 3. Módulo de Proposta Comercial Profissional
- **Dados do Cliente e Profissional:** Inclusão de campos para informações cadastrais completas.
- **Cálculo de Mão de Obra:** Novo campo para estimativa de horas, profissionais e valor/hora ou valor fechado.
- **Layout de Impressão Otimizado:** Garantir que o PDF da proposta comercial seja denso, profissional e organizado em 1-2 páginas.

### 4. Integração com Backend (Supabase)
- **Migração de Dados:** Criar tabelas para `starter_types`, `starter_components`, `technical_products`, e `proposals`.
- **Persistência:** Garantir que as propostas salvas guardem um "snapshot" dos preços e modelos daquele momento.

## Detalhes Técnicos

### Esquema de Banco de Dados (Novas Entidades)
```text
starter_types: id, name (Partida Direta, etc), default_labor_hours
starter_components: id, starter_type_id, component_category, quantity_rule, is_required
technical_products: id, manufacturer, category, model, specs (jsonb), price
proposals: id, user_id, client_data (jsonb), items (jsonb), labor_info (jsonb), total_value
```

### Componentes React
- `CalculationResults`: Atualizado para mostrar o comparativo entre fabricantes.
- `MaterialReview`: Nova tabela editável para revisão final da lista de materiais.
- `ProposalView`: Layout final para visualização e impressão da proposta comercial.

## Critérios de Aceite
- [ ] WEG não é mais usada como referência para outros fabricantes.
- [ ] O usuário pode escolher entre marcas compatíveis por componente.
- [ ] Itens auxiliares (bornes, sinaleiros) são incluídos automaticamente.
- [ ] Preços e quantidades são editáveis na revisão.
- [ ] A proposta final inclui seção de mão de obra e total consolidado.
