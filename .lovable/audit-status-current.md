# Estado técnico atual — Dimensionador Expert

Data da revisão: 29/09/2026

Este documento substitui, para fins de referência atual, conclusões antigas que afirmavam “precisão total” ou conformidade integral.

## Corrigido nesta revisão
- Tabelas de ampacidade para cobre/PVC 70 °C nos métodos A1, A2, B1, B2, C, D, E, F e G, distinguindo 2/3 condutores e disposições de F/G.
- Fatores de temperatura do ar e do solo.
- Fatores de agrupamento e resistividade térmica do solo para o método D.
- Validações de FP, rendimento, fator de serviço, queda de tensão e combinações incompatíveis.
- Critério limitante de seção mínima.
- Seleção de componentes sem fallback silencioso de fabricante e com filtragem de referências sabidamente não verificadas.
- Remoção da falsa indicação de proteção principal/curto-circuito “validada”.
- Modo educacional e tela de resultados alinhados às limitações reais.
- Regressões automatizadas adicionadas.

## Limitações técnicas explícitas
1. A verificação de curto-circuito (Icc, Icu/Icn e solicitação térmica) não é realizada automaticamente.
2. A proteção principal precisa de coordenação pelo profissional.
3. A queda de tensão ainda usa modelo resistivo simplificado; a reatância do cabo não é considerada.
4. Referências de fabricantes são preliminares e devem ser conferidas no catálogo vigente.
5. O catálogo completo de modelos/códigos comerciais ainda não foi individualmente certificado.

## Uso
O aplicativo deve ser apresentado como ferramenta de apoio ao dimensionamento, não como substituto de projeto, coordenação de proteção ou responsabilidade técnica profissional.
