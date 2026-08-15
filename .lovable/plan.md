# Plano de Expansão e Reestruturação do Catálogo de Motores WEG

Este plano detalha a reestruturação da base de dados de motores para suportar o catálogo oficial da WEG, incluindo motores padrão (W22/W50), Dahlander e de dois enrolamentos, garantindo que os dados sejam escaláveis e provenientes de fontes oficiais.

## Mudanças Técnicas

### 1. Banco de Dados (Supabase)
*   Criar a tabela `public.motor_catalog` para armazenar os dados técnicos dos motores.
*   Campos: `id`, `manufacturer`, `line`, `motor_type` (STANDARD, DAHLANDER, DOUBLE_WINDING), `poles`, `power_cv`, `power_kw`, `voltage`, `nominal_current`, `power_factor`, `efficiency`, `service_factor`, `rpm`, `frame`, `enclosure`, `catalog_reference`, etc.
*   Para motores Dahlander e de dois enrolamentos, os dados serão duplicados em registros vinculados ou colunas específicas (como `speed_index`) para permitir a seleção de cada velocidade.
*   Criar índices para otimizar filtros dependentes.

### 2. Frontend & Tipagem
*   Atualizar `src/types/index.ts` para refletir a nova estrutura do catálogo.
*   Criar `src/lib/catalog/motors.server.ts` (ou similar) para buscar dados do Supabase em vez de usar o arquivo estático.
*   Refatorar `src/components/CalculatorWizard.tsx` para implementar a seleção hierárquica (filtros dependentes):
    *   Tipo de Motor -> Polos -> Potência -> Tensão -> Modelo.
*   Adicionar estados para lidar com motores de múltiplas velocidades (Dahlander/2 enrolamentos).

### 3. Engine de Cálculo
*   Ajustar `src/lib/engine/CalculationEngine.ts` para lidar com os novos dados (especialmente múltiplas velocidades).
*   Garantir que o `nominal_current` seja extraído corretamente do catálogo selecionado.

### 4. UI/UX
*   Exibir resumo detalhado do motor selecionado.
*   Incluir nota discreta sobre a origem dos dados (Catálogo WEG).
*   Manter a opção de "Dados da Placa" para outros fabricantes.

## Esquema da Tabela `motor_catalog`

```sql
CREATE TYPE public.motor_speed_type AS ENUM ('SINGLE', 'DAHLANDER', 'DOUBLE_WINDING');

CREATE TABLE public.motor_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer TEXT DEFAULT 'WEG' NOT NULL,
    line TEXT NOT NULL, -- W22, W50, etc.
    speed_type public.motor_speed_type DEFAULT 'SINGLE' NOT NULL,
    poles TEXT NOT NULL, -- '2', '4', '4/2', etc.
    power_cv NUMERIC NOT NULL,
    power_kw NUMERIC NOT NULL,
    voltage NUMERIC NOT NULL,
    frequency NUMERIC DEFAULT 60,
    nominal_current NUMERIC NOT NULL,
    power_factor NUMERIC NOT NULL,
    efficiency NUMERIC NOT NULL,
    service_factor NUMERIC DEFAULT 1.0,
    rpm INTEGER,
    frame TEXT,
    model_code TEXT,
    catalog_reference TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para filtros rápidos
CREATE INDEX idx_motor_catalog_filter ON public.motor_catalog (manufacturer, line, speed_type, poles, power_cv, voltage);
```

## Próximos Passos
1. Executar a migração SQL.
2. Popular o banco com uma amostra significativa de dados oficiais (W22, Dahlander, etc).
3. Atualizar a lógica do Wizard para busca dinâmica.
