# Auditoria da seleção de fabricantes — 05/10/2026

## Problema reproduzido
15 cv, 220 V, trifásico, partida direta, 50 m, fator de potência 0,85 e rendimento 0,90: corrente de 37,85 A, cabo de 10 mm² e disjuntor principal de 40 A. Siemens e Schneider não apareciam nas proteções por lacunas de polos, faixas e referências descontinuadas.

## Correções
- Catálogo auditado separado com fontes oficiais por grupo e distinção entre SKU completo e família a configurar.
- Disjuntores modulares com versões de 1/2/3 polos; Schneider iC60H substitui as referências iC60N retiradas de linha. Siemens 5SY4 e 5SP4; caixa moldada 3VA/ComPacT com ajuste Ir explicitamente separado da corrente da carcaça.
- Disjuntores-motor Siemens 3RV2 e Schneider GV2/GV3/GV4 com polos e faixas corretos; removidos registros Siemens que atribuíam 150/200 A a modelos reais de 84/93 A.
- Relés Siemens 3RU/3RB e Schneider LRD/LR9G com faixas oficiais contínuas. Preservado o catálogo WEG RW/MPW já conferido.
- Contatores CWM, SIRIUS e TeSys com corrente AC-3 até 440 V. Bobina e coordenação continuam necessárias para fechar a referência comercial.
- Soft-starters dos três fabricantes e inversores com tensão, alimentação trifásica e corrente contínua de saída. Famílias eletrônicas só participam da seleção quando têm dados elétricos auditados explícitos; não se habilita indiscriminadamente o catálogo legado.
- Correntes ND/LO e HD/HO são descritas separadamente. G120 exige módulo PM240-2 mais unidade de controle CU; o módulo não é apresentado como inversor completo.
- Referências de dimensionamentos salvos são consultadas novamente ao abrir histórico/proposta; números e itens comerciais previamente editados não são recalculados nem sobrescritos.
- Icc conhecida exige capacidade de interrupção cadastrada. Dados ausentes não equivalem a capacidade infinita. Mantidos polos, faixa de ajuste, tensão e proteção do cabo.
- Quando a opção de disjuntor-motor não existe na faixa auditada, a tela apresenta os modelos da alternativa com disjuntor principal e relé de sobrecarga, quando disponíveis na mesma marca.

## Verificação
- Caso da imagem: todos os requisitos exibem referências das três marcas; a proposta também possui as referências obrigatórias. Renderização da tela verificada por teste.
- Matriz de 180 dimensionamentos: 12 potências entre 1 e 50 cv × 3 tensões (220/380/440 V) × 5 partidas. Referências obrigatórias das três marcas presentes e invariantes elétricas verificadas. Opções de disjuntor-motor respeitam seu limite físico.
- Todos os motores existentes no catálogo foram exercitados nas cinco partidas, com exceções de cobertura registradas explicitamente no teste.
- Testes específicos para histórico, proteção alternativa, sobretensão, corrente acima do catálogo e Icc informada.
- Testes, TypeScript, lint e build de produção executados. O lint mantém sete avisos anteriores de Fast Refresh; nenhuma falha de compilação foi introduzida.

## Limites que não podem ser mascarados
Não é correto prometer um dispositivo compatível para qualquer número digitado. A aplicação aceita potência livre e não recebe todos os dados de coordenação, carga e comando.

- WEG MPW e Siemens 3RV2 auditados: até 100 A. Schneider GV4 auditado: até 115 A. Para correntes maiores, usar proteção de força + relé de sobrecarga ou uma solução específica do fabricante.
- Siemens em 220 V: seleção auditada de inversores até 192 A em regime LO (G120X); em HO, a cobertura PM240-2 consultada vai até 154 A. Alguns motores de 100 cv/220 V do catálogo excedem essa cobertura. A ausência nesses casos permanece explícita; não são sugeridos inversores de 380 V em alimentação de 220 V nem modelos G180 em retirada de linha para forçar preenchimento.
- WEG CFW11 em 220 V até 370 A ND e Schneider ATV930 até 282 A ND; esses limites não são correntes HD. As notas dos dispositivos explicam o regime selecionado.
- Icc acima da capacidade cadastrada, tensão fora das faixas e combinações de polos sem configuração auditada podem exigir outra solução. A mensagem agora identifica o critério/limite conhecido.

Esta entrega corrige as falhas reproduzidas e amplia substancialmente a cobertura. A exigência absoluta de três dispositivos compatíveis para qualquer dimensionamento permanece tecnicamente inexequível sem restringir entradas ou validar novas configurações específicas. Não foi criado um fallback fictício.

## Publicação
As alterações precisam ser implantadas no serviço `enge-ia / dimensionador` do Easypanel depois do merge. Verificação local e CI não comprovam, por si só, a atualização do domínio público.
