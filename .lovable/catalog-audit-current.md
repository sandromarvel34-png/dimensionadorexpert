# Auditoria atual do catálogo de componentes — Dimensionador Expert

Data: 30/09/2026

## Escopo
Foram revisados os 213 registros existentes no catálogo original de WEG, Siemens e Schneider. Quatro registros duplicados/inconsistentes foram removidos, restando 209 registros internos auditados.

## Resultado
- SKU exato confirmado em fonte oficial: 37
- Família técnica mantida sem expor código comercial exato: 143
- Registros bloqueados: 29
- Duplicidades/inconsistências removidas: 4

### Regra dos status
- `verified-exact`: referência/código conferido em fonte oficial e apto a aparecer como SKU, ainda sujeito à aplicação correta.
- `verified-family`: família/modelo técnico pode ser usado como referência, mas o código comercial é ocultado porque depende de configuração adicional ou não foi confirmado individualmente.
- `blocked`: não pode ser retornado pela busca do aplicativo.

## Correções principais
1. WEG MPW: corrigidos códigos e faixas; removida a falsa extensão MPW150/250/300. A família oficial usada na base vai até MPW100.
2. WEG MDW: corrigidos os códigos dos minidisjuntores monopolares curva C.
3. WEG SSW05: substituídos códigos sintéticos por SKUs oficiais 16/30/45/60 A, 220-460 V.
4. WEG CFW300: removidos registros fictícios 24 A e 33 A; incluídos SKUs oficiais 15,2 A (200-240 V), 10 A e 15 A (380-480 V).
5. Temporizadores estrela-triângulo: WEG RTW17-G02U030SE05, Schneider RE22R2QEMR e Siemens 3RP2576-2NW30.
6. Contatores: mantidos como família de referência quando a tensão da bobina de comando não é conhecida; códigos exatos não são exibidos.
7. Disjuntores caixa moldada: referências genéricas NSX/3VA foram bloqueadas quando não representavam um SKU completo com polos, unidade de disparo e capacidade de interrupção definidos.
8. Schneider iC60N: referências identificadas como phase-out não são sugeridas pelo motor.
9. Fusíveis com códigos placeholder/genéricos foram bloqueados.
10. Duplicidades removidas: weg-mdw-c125-fixed, schneider-acti9-c125-fixed, siemens-5sy-c125-fixed, siemens-3ru-100-fixed.

## Fontes oficiais usadas como base
- WEG catálogo de produtos e catálogo Soluções Integradas: MPW, MDW, SSW05, CFW300, RW, CWM e RTW17.
- Siemens Industry Mall / datasheets: SIRIUS 3RT, 3RV2, 3RU2, 3RP25, SENTRON 5SY e 3VA.
- Schneider Electric páginas oficiais/datasheets: TeSys Deca LC1D/LRD/GV, Harmony RE22 e Acti9 iC60.

## Inventário auditado
| Fabricante | Categoria | Modelo/família | Status | Ciclo |
| --- | --- | --- | --- | --- |
| WEG | disjuntorMotor | MPW18-3-U010 | verified-exact | active |
| WEG | disjuntorMotor | MPW18-3-U016 | verified-exact | active |
| WEG | disjuntorMotor | MPW40-3-U020 | verified-exact | active |
| WEG | disjuntorMotor | MPW40-3-U025 | verified-exact | active |
| WEG | disjuntorMotor | MPW40-3-U032 | verified-exact | active |
| WEG | fusivel | F D-16 | blocked | active |
| WEG | fusivel | F D-25 | blocked | active |
| WEG | fusivel | F NH00-63 | blocked | active |
| WEG | fusivel | F NH1-100 | blocked | active |
| WEG | softStarter | SSW050016T2246TPZ | verified-exact | active |
| WEG | softStarter | SSW050030T2246TPZ | verified-exact | active |
| WEG | softStarter | SSW050045T2246TPZ | verified-exact | active |
| WEG | softStarter | SSW050060T2246TPZ | verified-exact | active |
| WEG | inverter | CFW300B15P2T2DB20 | verified-exact | active |
| WEG | inverter | CFW300C10P0T4DB20 | verified-exact | active |
| WEG | inverter | CFW300C15P0T4DB20 | verified-exact | active |
| WEG | disjuntor | MDW-C6 | verified-exact | active |
| WEG | disjuntor | MDW-C10 | verified-exact | active |
| WEG | disjuntor | MDW-C16 | verified-exact | active |
| WEG | disjuntor | MDW-C20 | verified-exact | active |
| WEG | disjuntor | MDW-C25 | verified-exact | active |
| WEG | disjuntor | MDW-C32 | verified-exact | active |
| WEG | disjuntor | MDW-C40 | verified-exact | active |
| WEG | disjuntor | MDW-C50 | verified-exact | active |
| WEG | disjuntor | MDW-C63 | verified-exact | active |
| WEG | disjuntor | MDW-C80 | verified-exact | active |
| WEG | disjuntor | MDW-C100 | verified-exact | active |
| WEG | disjuntor | MDW-C125 | verified-exact | active |
| Schneider | disjuntor | iC60N-C6 | verified-family | phase-out |
| Schneider | disjuntor | iC60N-C10 | verified-family | phase-out |
| Schneider | disjuntor | iC60N-C16 | verified-family | phase-out |
| Schneider | disjuntor | iC60N-C20 | verified-family | phase-out |
| Schneider | disjuntor | iC60N-C25 | verified-family | phase-out |
| Schneider | disjuntor | iC60N-C32 | verified-family | phase-out |
| Schneider | disjuntor | iC60N-C40 | verified-family | phase-out |
| Schneider | disjuntor | iC60N-C50 | verified-family | phase-out |
| Schneider | disjuntor | iC60N-C63 | verified-family | phase-out |
| Schneider | disjuntor | iC60N-C80 | blocked | active |
| Schneider | disjuntor | iC60N-C100 | blocked | active |
| Schneider | disjuntor | iC60N-C125 | blocked | active |
| Siemens | disjuntor | 5SY6106-7 | verified-family | active |
| Siemens | disjuntor | 5SY6110-7 | verified-family | active |
| Siemens | disjuntor | 5SY6116-7 | verified-family | active |
| Siemens | disjuntor | 5SY6120-7 | verified-family | active |
| Siemens | disjuntor | 5SY6125-7 | verified-family | active |
| Siemens | disjuntor | 5SY6132-7 | verified-family | active |
| Siemens | disjuntor | 5SY6140-7 | verified-family | active |
| Siemens | disjuntor | 5SY6150-7 | verified-family | active |
| Siemens | disjuntor | 5SY6163-7 | verified-family | active |
| Siemens | disjuntor | 5SY6180-7 | blocked | active |
| Siemens | disjuntor | 5SY6191-7 | blocked | active |
| Siemens | disjuntor | 5SY6192-7 | blocked | active |
| WEG | contator | CWM9 | verified-family | active |
| WEG | contator | CWM12 | verified-family | active |
| WEG | contator | CWM18 | verified-family | active |
| WEG | contator | CWM25 | verified-family | active |
| WEG | contator | CWM32 | verified-family | active |
| WEG | contator | CWM40 | verified-family | active |
| WEG | contator | CWM50 | verified-family | active |
| WEG | contator | CWM65 | verified-family | active |
| WEG | contator | CWM80 | verified-family | active |
| WEG | contator | CWM105 | verified-family | active |
| WEG | contator | CWM150 | verified-family | active |
| WEG | contator | CWM250 | verified-family | active |
| Schneider | contator | LC1D09 | verified-family | active |
| Schneider | contator | LC1D12 | verified-family | active |
| Schneider | contator | LC1D18 | verified-family | active |
| Schneider | contator | LC1D25 | verified-family | active |
| Schneider | contator | LC1D32 | verified-family | active |
| Schneider | contator | LC1D40 | verified-family | active |
| Schneider | contator | LC1D50 | verified-family | active |
| Schneider | contator | LC1D65 | verified-family | active |
| Schneider | contator | LC1D80 | verified-family | active |
| Schneider | contator | LC1D95 | verified-family | active |
| Schneider | contator | LC1D115 | verified-family | active |
| Schneider | contator | LC1D150 | verified-family | active |
| Siemens | contator | 3RT2016 | verified-family | active |
| Siemens | contator | 3RT2017 | verified-family | active |
| Siemens | contator | 3RT2025 | verified-family | active |
| Siemens | contator | 3RT2026 | verified-family | active |
| Siemens | contator | 3RT2027 | verified-family | active |
| Siemens | contator | 3RT2035 | verified-family | active |
| Siemens | contator | 3RT2036 | verified-family | active |
| Siemens | contator | 3RT2037 | verified-family | active |
| Siemens | contator | 3RT2038 | verified-family | active |
| Siemens | contator | 3RT2046 | verified-family | active |
| Siemens | contator | 3RT2047 | verified-family | active |
| Siemens | contator | 3RT1056 | verified-family | active |
| WEG | releTermico | RW27-1D3-D004 | verified-family | active |
| WEG | releTermico | RW27-1D3-U032 | verified-exact | active |
| WEG | releTermico | RW27-1D3-U040 | verified-family | active |
| WEG | releTermico | RW27-1D3-U050 | verified-family | active |
| WEG | releTermico | RW67-1D3-U080 | verified-family | active |
| WEG | releTermico | RW67-1D3-U112 | verified-family | active |
| WEG | releTermico | RW117-1D3-U150 | verified-family | active |
| WEG | releTermico | RW317-1D3-U215 | verified-exact | active |
| WEG | releTermico | RW317-1D3-U310 | verified-exact | active |
| Schneider | releTermico | LRD04 | verified-family | active |
| Schneider | releTermico | LRD22 | verified-family | active |
| Schneider | releTermico | LRD32 | verified-family | active |
| Schneider | releTermico | LRD3353 | verified-family | active |
| Schneider | releTermico | LRD3355 | verified-family | active |
| Schneider | releTermico | LRD3357 | verified-family | active |
| Schneider | releTermico | LRD3359 | verified-family | active |
| Schneider | releTermico | LRD3361 | verified-family | active |
| Schneider | releTermico | LRD3363 | verified-family | active |
| Schneider | releTermico | LRD3365 | verified-family | active |
| Siemens | releTermico | 3RU2116-0GB0 | verified-family | active |
| Siemens | releTermico | 3RU2116-1JB0 | verified-family | active |
| Siemens | releTermico | 3RU2116-4AB0 | verified-family | active |
| Siemens | releTermico | 3RU2126-4CB0 | verified-family | active |
| Siemens | releTermico | 3RU2126-4DB0 | verified-family | active |
| Siemens | releTermico | 3RU2126-4EB0 | verified-family | active |
| Siemens | releTermico | 3RU2126-4FB0 | verified-family | active |
| Siemens | releTermico | 3RU2136-4HB0 | verified-family | active |
| Siemens | releTermico | 3RU2136-4JB0 | verified-family | active |
| Siemens | releTermico | 3RU2136-4KB0 | verified-family | active |
| Siemens | releTermico | 3RU2146-4LB0 | verified-family | active |
| Siemens | releTermico | 3RU2146-4MB0 | verified-family | active |
| WEG | contator | CWM300 | verified-family | active |
| Schneider | contator | LC1D225 | verified-family | active |
| Siemens | contator | 3RT1064 | verified-family | active |
| WEG | disjuntor | DWB160 | verified-family | active |
| WEG | disjuntor | DWB250 | verified-family | active |
| WEG | disjuntor | DWB250 | verified-family | active |
| WEG | disjuntor | DWB250 | verified-family | active |
| WEG | disjuntor | DWB400 | verified-family | active |
| Schneider | disjuntor | NSX160 | blocked | active |
| Schneider | disjuntor | NSX250 | blocked | active |
| Schneider | disjuntor | NSX250 | blocked | active |
| Schneider | disjuntor | NSX250 | blocked | active |
| Schneider | disjuntor | NSX400 | blocked | active |
| Siemens | disjuntor | 3VA160 | blocked | active |
| Siemens | disjuntor | 3VA250 | blocked | active |
| Siemens | disjuntor | 3VA250 | blocked | active |
| Siemens | disjuntor | 3VA250 | blocked | active |
| Siemens | disjuntor | 3VA400 | blocked | active |
| WEG | releTempo | RTW17-G02U030SE05 | verified-exact | active |
| Schneider | releTempo | RE22R2QEMR | verified-exact | active |
| Siemens | releTempo | 3RP2576-2NW30 | verified-exact | active |
| WEG | auxiliar | CSW-BF1 | verified-family | active |
| WEG | auxiliar | CSW-BF2 | verified-family | active |
| WEG | auxiliar | CSW-SD1 | verified-family | active |
| WEG | auxiliar | CSW-SD2 | verified-family | active |
| WEG | auxiliar | BTWP | verified-family | active |
| Siemens | auxiliar | 3SU1 | verified-family | active |
| Siemens | auxiliar | 3SU1-R | verified-family | active |
| Schneider | auxiliar | XB4 | verified-family | active |
| Schneider | auxiliar | XB4-R | verified-family | active |
| Schneider | auxiliar | XB4-BVB3 | verified-family | active |
| Schneider | auxiliar | XB4-BVB4 | verified-family | active |
| Siemens | auxiliar | 3SU1-PILOT-G | verified-family | active |
| Siemens | auxiliar | 3SU1-PILOT-R | verified-family | active |
| Siemens | disjuntorMotor | 3RV2011-1JA10 | verified-exact | active |
| Siemens | disjuntorMotor | 3RV2011-4AA10 | verified-family | active |
| Siemens | disjuntorMotor | 3RV2011-4BA10 | verified-family | active |
| Siemens | disjuntorMotor | 3RV2021-4DA10 | verified-family | active |
| Schneider | disjuntorMotor | GV2ME14 | verified-exact | active |
| Schneider | disjuntorMotor | GV2ME16 | verified-family | active |
| Schneider | disjuntorMotor | GV2ME20 | verified-family | active |
| Schneider | disjuntorMotor | GV2ME22 | verified-family | active |
| Siemens | fusivel | 5SA251 | verified-family | active |
| Siemens | fusivel | 5SA271 | verified-family | active |
| Siemens | fusivel | 3NA3822 | verified-family | active |
| Siemens | fusivel | 3NA3830 | verified-family | active |
| Schneider | fusivel | DF2CA16 | verified-family | active |
| Schneider | fusivel | DF2CA25 | verified-family | active |
| Schneider | fusivel | NH00-63A | blocked | active |
| Schneider | fusivel | NH00-100A | blocked | active |
| Siemens | disjuntorMotor | 3RV2021-4EA10 | verified-family | active |
| Siemens | disjuntorMotor | 3RV2021-4FA10 | verified-family | active |
| Siemens | disjuntorMotor | 3RV2031-4HB10 | verified-family | active |
| Siemens | disjuntorMotor | 3RV2031-4JB10 | verified-family | active |
| Siemens | disjuntorMotor | 3RV2031-4KB10 | verified-family | active |
| Siemens | disjuntorMotor | 3RV2041-4MA10 | verified-family | active |
| Siemens | disjuntorMotor | 3RV2041-4RA10 | verified-family | active |
| Siemens | disjuntorMotor | 3RV2041-4YA10 | verified-family | active |
| Siemens | disjuntorMotor | 3VA11-300A | blocked | active |
| Schneider | disjuntorMotor | GV2ME32 | verified-family | active |
| Schneider | disjuntorMotor | GV3P40 | verified-family | active |
| Schneider | disjuntorMotor | GV3P50 | verified-family | active |
| Schneider | disjuntorMotor | GV3P65 | verified-family | active |
| Schneider | disjuntorMotor | GV3P73 | verified-family | active |
| Schneider | disjuntorMotor | GV3P80 | verified-family | active |
| Schneider | disjuntorMotor | GV4P115 | verified-family | active |
| Schneider | disjuntorMotor | GV5P150 | verified-family | active |
| Schneider | disjuntorMotor | GV5P220 | verified-family | active |
| Schneider | disjuntorMotor | GV6P320 | verified-family | active |
| WEG | disjuntorMotor | MPW80-3-U050 | verified-exact | active |
| WEG | disjuntorMotor | MPW80-3-U065 | verified-exact | active |
| WEG | disjuntorMotor | MPW80-3-U080 | verified-exact | active |
| WEG | disjuntorMotor | MPW100-3-U090 | verified-exact | active |
| WEG | disjuntorMotor | MPW100-3-U100 | verified-exact | active |
| WEG | fusivel | F NH2-160 | blocked | active |
| WEG | fusivel | F NH2-250 | blocked | active |
| WEG | fusivel | F NH3-400 | blocked | active |
| Siemens | fusivel | 3NA3136 | verified-family | active |
| Siemens | fusivel | 3NA3244 | verified-family | active |
| Siemens | fusivel | 3NA3360 | verified-family | active |
| Schneider | fusivel | NH1-160A | blocked | active |
| Schneider | fusivel | NH2-250A | blocked | active |
| Schneider | fusivel | NH3-400A | blocked | active |
| Schneider | releTermico | LRD4365 | verified-family | active |
| Schneider | releTermico | LR9F5369 | verified-family | active |
| Schneider | releTermico | LR9F5371 | verified-family | active |
| Schneider | releTermico | LR9F7375 | verified-family | active |
| Siemens | releTermico | 3RB3046-1XB0 | verified-family | active |
| Siemens | releTermico | 3RB2056-1FC2 | verified-family | active |
| Siemens | releTermico | 3RB2066-1MC2 | verified-family | active |

## Observação de segurança
A auditoria do catálogo não substitui a seleção de engenharia do dispositivo. Contatores exigem tensão de bobina; disjuntores exigem polos, Icu/Icn e coordenação; soft-starters e inversores exigem faixa de tensão, corrente, regime/sobrecarga e condições da aplicação.
