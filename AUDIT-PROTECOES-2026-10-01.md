# Auditoria das proteções e dos relés WEG

Escopo: requisitos de proteção, referências WEG, seleção por corrente/polos/tensão, apresentação na tela, materiais da proposta e PDF. Esta auditoria não certifica a coordenação de uma instalação real nem declara concluída a implantação no site.

## Falhas confirmadas

- O motor de cálculo gerava somente o disjuntor auxiliar e mantinha `protections.breaker` e `protections.motorBreaker` sempre nulos.
- O catálogo térmico WEG saltava de 0,4 A para 22 A. Isso explica o relé ausente no exemplo de 5 cv, 220 V e corrente calculada de aproximadamente 12,6 A.
- Havia faixas/modelos térmicos antigos inconsistentes com o catálogo RW conferido.
- O filtro de disjuntores não distinguia os polos do circuito principal e do circuito auxiliar.
- A seção por ampacidade não considerava a corrente nominal comercial da proteção principal.
- A proposta descartava o nome da família técnica quando não havia SKU exato.

## Correções

- Requisito de disjuntor principal: três polos para motor trifásico e dois para monofásico.
- Pré-seleção de corrente comercial igual ou superior à corrente de projeto. O cálculo da seção considera também essa corrente com os fatores de correção. As referências retornadas respeitam a capacidade corrigida do cabo.
- Disjuntor-motor para partidas trifásicas eletromecânicas apresentado como alternativa à proteção de sobrecarga por relé térmico. A proposta padrão conserva o esquema com relé térmico e não soma a alternativa automaticamente.
- Inclusão de 11 faixas MPW ausentes, sem inventar MPW acima de 100 A.
- Substituição dos relés WEG antigos por 35 modelos/faixas e códigos transcritos da tabela oficial RW, incluindo montagem direta e separada.
- Inclusão de referências MDWH de dois/três polos e famílias DWB para correntes maiores. Referências DWB permanecem sem código comercial quando a variante completa não foi especificada.
- Ajuste térmico calculado pela corrente nominal do motor. O fator de serviço continua no dimensionamento de cabo e contatores. Em estrela-triângulo, a referência de relé corresponde à posição dentro do triângulo, com ajuste In/√3; a tela explica a diferença para instalação na linha.
- Relé externo/disjuntor-motor não são adicionados automaticamente às saídas de inversor ou soft-starter.
- A capacidade de interrupção conhecida dos MDWH é conferida na tensão de uso quando Icc é fornecida. Referência com capacidade inferior à Icc não é retornada. Ausência de referência continua explícita, sem selecionar um dispositivo incompatível.
- Tela, explicação do cálculo, materiais e PDF usam os requisitos corrigidos. A proposta conserva o modelo da família técnica e informa quando o código final ainda precisa ser confirmado.

## Caso reproduzido da imagem

Entrada manual: 5 cv, 220 V, trifásico, 5 m, partida direta, FP 0,85, rendimento 0,9 e método B1.

| Componente | Referência obtida |
|---|---|
| Proteção principal | MDWH-D16-3, código 14110099 |
| Disjuntor-motor, alternativa | MPW18-3-U016, código 12429373 |
| Relé térmico | RW27-1D3-U015, código 10452384 |

O relé cobre 10–15 A, incluindo a corrente calculada de aproximadamente 12,6 A. Estas são referências de pré-seleção; sua presença não confirma curva de partida nem coordenação do conjunto.

No caso existente de 75 cv/220 V, FS 1,1, B1, a corrente de projeto é aproximadamente 208,15 A e a proteção de referência é 250 A. A seção passa de 120 mm² (239 A) para 150 mm² (275 A), atendendo à corrente dessa proteção.

## Verificação executada

- 218 testes em 11 arquivos passaram localmente.
- Matriz dos 48 registros de motores: partidas direta, reversora e estrela-triângulo, verificando presença das referências, polos, corrente/capacidade do cabo e queda de tensão. Esta matriz valida execução e consistência do software; não atesta a precisão independente dos dados históricos nem todos os esquemas possíveis de ligação.
- Testes de limites das faixas RW/MPW, polos monofásicos/trifásicos, correções de temperatura/agrupamento, fator de serviço e Icc por tensão.
- Renderização do componente real de resultados, confirmando os modelos e códigos do exemplo da imagem.
- Geração do PDF com materiais reais do exemplo; códigos verificados no texto e ambas as páginas renderizadas e inspecionadas.
- TypeScript completo e build passaram. Lint: zero erros e os sete avisos de Fast Refresh já existentes.

## Fontes oficiais consultadas

- WEG RW 50042397, tabela da página 9: https://static.weg.net/medias/downloadcenter/h3f/h86/WEG-reles-de-sobrecarga-termico-linha-rw-50042397-catalogo-portugues-br-dc.pdf
- WEG MPW 50009822, tabelas MPW18/40: https://static.weg.net/medias/downloadcenter/h1b/h43/WEG-disjuntores-motores-linha-mpw-50009822-catalogo-portugues-br-dc.pdf
- WEG MDW 50163783, códigos da página 20 e características da página 17: https://static.weg.net/medias/downloadcenter/hcd/h22/WEG-MDW-brochure-50163783-en.pdf
- WEG DW 50009825: https://static.weg.net/medias/downloadcenter/h83/hd0/WEG-disjuntores-em-caixa-moldada-dw-50009825-catalogo-pt.pdf

## Limites da conclusão

A seleção final do dispositivo ainda exige verificar corrente de partida, curva, montagem, tensão de comando e coordenação no esquema real. Referências de outros fabricantes sem os parâmetros exigidos continuam explicitamente ausentes. Históricos e propostas já salvos preservam seus resultados anteriores; os critérios corrigidos são aplicados ao executar um novo cálculo. A publicação e a interação no site hospedado não foram verificadas nesta execução.
