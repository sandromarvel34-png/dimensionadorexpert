# Plano de Reestruturação — Calculadora Elétrica Pro

Este plano detalha a reestruturação da aplicação para transformar a ferramenta atual em um produto profissional de dimensionamento e geração de propostas comerciais, seguindo rigorosos critérios técnicos e normas (NBR 5410).

## 1. Arquitetura do Sistema
- **Camada de Dados (Supabase)**: Estrutura para persistência de dimensionamentos, catálogos reais e propostas.
- **Motor de Cálculo (CalculationEngine)**: Lógica isolada da UI, baseada em referências técnicas rastreáveis.
- **Catálogo de Fabricantes**: Base estruturada para WEG, Siemens e Schneider (sem dados fictícios).
- **Interface Premium**: Fluxo em etapas (Wizard) e Dashboard orientado à ação.

## 2. Implementação do Backend (Supabase)
- Criar tabelas: `profiles`, `technical_references`, `technical_tables`, `manufacturer_products`, `motor_calculations`, `proposals`.
- Configurar RLS (Row Level Security) para garantir privacidade dos dados dos usuários.

## 3. Desenvolvimento do Motor de Cálculo
- Isolar cálculos de corrente, queda de tensão, ampacidade e seleção de componentes em `src/lib/engine/`.
- Implementar suporte a métodos de instalação e fatores de correção da NBR 5410.
- Adicionar rastreabilidade técnica (cada cálculo cita a norma/seção).

## 4. Fluxo de Usuário e UI/UX
- **Dashboard**: Histórico de dimensionamentos e atalho para novo cálculo.
- **Wizard de Dimensionamento**: 4 etapas (Carga → Circuito → Proteção → Resultado).
- **Gerador de Propostas**: Fluxo para coletar dados do cliente, ajustar preços de materiais e mão de obra.
- **Exportação**: Geração de PDF profissional da proposta comercial.

## 5. Detalhes Técnicos
- **Tecnologias**: React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Start/Router.
- **Segurança**: Validação rigorosa no frontend e backend; proteção de chaves e dados sensíveis.
- **Qualidade**: Testes unitários para o motor de cálculo.

## Próximos Passos
1. Definir e aplicar as migrações do banco de dados.
2. Migrar a lógica técnica do `src/routes/index.tsx` para `src/lib/engine/`.
3. Criar os componentes de UI para o fluxo de proposta.
4. Integrar com Supabase para persistência real.
