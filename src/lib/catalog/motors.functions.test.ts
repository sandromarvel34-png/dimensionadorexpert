import { beforeEach, expect, test, vi } from "vitest";
import { ORIGINAL_WEG_MOTORS } from "./original-motors";
import { CalculationEngine } from "../engine/CalculationEngine";
const mocks = vi.hoisted(() => ({ from: vi.fn(), range: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: mocks.from } }));
import { getMotorCatalogFilters, getMotorsByFilter } from "./motors.functions";

beforeEach(() => {
  const query = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), range: mocks.range };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  mocks.from.mockReset().mockReturnValue(query);
  mocks.range.mockReset().mockResolvedValue({ data: [], error: null });
});

test("tabela vazia preserva filtros e seleção do catálogo original", async () => {
  const filters = await getMotorCatalogFilters();
  expect(filters).toHaveLength(48);
  expect(new Set(filters.map((f) => f.line))).toEqual(
    new Set(["W22 Plus", "W22 IR3 Premium", "W22 Dahlander", "W22 Dois Enrolamentos"]),
  );
  const rows = await getMotorsByFilter({
    data: { line: "W22 Plus", speed_type: "SINGLE", poles: "4", power_cv: 10, voltage: 380 },
  });
  expect(rows).toHaveLength(1);
  expect(rows[0]!.nominal_current).toBe(15);
  const motor = rows[0]!;
  const result = CalculationEngine.performFullCalculation({
    dataSource: "catalog",
    power: motor.power_cv,
    powerUnit: "cv",
    voltage: motor.voltage,
    phase: "trifasico",
    distance: 20,
    starterType: "direta",
    maxVoltageDrop: 4,
    quantity: 1,
    installationMethod: "B1",
    powerFactor: motor.power_factor,
    efficiency: motor.efficiency,
    motorCatalogData: {
      id: motor.id,
      manufacturer: "WEG",
      line: motor.line,
      speedType: motor.speed_type,
      poles: motor.poles,
      model: motor.model_code!,
      nominalCurrent: motor.nominal_current,
      powerFactor: motor.power_factor,
      efficiency: motor.efficiency,
      power: motor.power_cv,
      powerUnit: "cv",
      voltage: motor.voltage,
    },
  });
  expect(result.nominalCurrent).toBe(15);
  expect(result.finalCableSection).toBeGreaterThanOrEqual(2.5);
});

test.each(["api", "network"])("catálogo permanece selecionável em falha %s", async (kind) => {
  if (kind === "api")
    mocks.range.mockResolvedValue({ data: null, error: { message: "unavailable" } });
  else mocks.range.mockRejectedValue(new Error("offline"));
  expect(await getMotorCatalogFilters()).toHaveLength(48);
  expect(
    await getMotorsByFilter({ data: { line: "W22 IR3 Premium", voltage: 220, power_cv: 50 } }),
  ).toHaveLength(1);
});

test("dados ativos na nuvem têm prioridade e filtros sem correspondência não inventam motor", async () => {
  const row = { ...ORIGINAL_WEG_MOTORS[0]!, line: "Linha da nuvem" };
  mocks.range.mockResolvedValue({ data: [row], error: null });
  expect((await getMotorCatalogFilters()).map((f) => f.line)).toEqual(["Linha da nuvem"]);
  expect(await getMotorsByFilter({ data: { line: "W22 Plus" } })).toEqual([]);
});

test("catálogo recuperado contém dados completos e identificadores distintos", () => {
  expect(new Set(ORIGINAL_WEG_MOTORS.map((m) => m.id)).size).toBe(48);
  for (const motor of ORIGINAL_WEG_MOTORS) {
    expect(motor.nominal_current).toBeGreaterThan(0);
    expect(motor.power_factor).toBeGreaterThan(0);
    expect(motor.power_factor).toBeLessThanOrEqual(1);
    expect(motor.efficiency).toBeGreaterThan(0);
    expect(motor.efficiency).toBeLessThanOrEqual(1);
    expect(motor.catalog_reference).toContain("Base WEG original");
  }
});

test("recusa tipo inválido sem enviar consulta", async () => {
  await expect(
    getMotorsByFilter({ data: { line: "W22 Plus", speed_type: "invalid" } }),
  ).rejects.toThrow("Tipo de motor inválido");
  expect(mocks.range).not.toHaveBeenCalled();
});

test("consulta todas as páginas do catálogo", async () => {
  mocks.range
    .mockResolvedValueOnce({
      data: Array.from({ length: 500 }, () => ORIGINAL_WEG_MOTORS[0]),
      error: null,
    })
    .mockResolvedValueOnce({ data: [ORIGINAL_WEG_MOTORS[1]], error: null });
  expect(await getMotorCatalogFilters()).toHaveLength(501);
  expect(mocks.range).toHaveBeenNthCalledWith(1, 0, 499);
  expect(mocks.range).toHaveBeenNthCalledWith(2, 500, 999);
});

test("formulário original não exige corrente de placa e mantém botão WEG habilitado", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { CalculatorWizard } = await import("@/components/CalculatorWizard");
  const html = renderToStaticMarkup(createElement(CalculatorWizard));
  expect(html).not.toContain('name="plateNominalCurrent"');
  const button = html
    .match(/<button\b[^>]*>[\s\S]*?<\/button>/g)
    ?.find((tag) => tag.includes("Selecionar motor WEG"));
  expect(button).toBeDefined();
  expect(button).not.toMatch(/\bdisabled(?:=|\s|>)/);
});
