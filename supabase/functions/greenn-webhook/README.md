# Greenn — Dimensionador Expert

Produto 196035. Ofertas: 4Q1tqK = 6 meses / R$ 37; fMqpDz = 12 meses / R$ 67.
Pagamento único. O prazo é definido por offer.hash, nunca pelo preço.

Endpoint: https://dujirggwqffogqgdkbhr.supabase.co/functions/v1/greenn-webhook
Secret: GREENN_WEBHOOK_TOKEN. Não colocar o valor no Git ou no cliente.

## Configuração Greenn
Selecionar Venda Paga, Venda Reembolsada e Chargeback realizado, apenas nas duas ofertas.
Colar o endpoint e criar a liberação. A validação final exige um evento enviado pela Greenn:
o token configurado precisa corresponder ao X-Webhook-Token real.

O comprador deve cadastrar-se na aplicação com o mesmo e-mail do checkout e confirmar o e-mail.
Compras anteriores ao cadastro ficam pendentes e são vinculadas após a confirmação.
Não há envio de senhas nem criação de contas com senha padrão.

## Banco e acesso
Aplicar supabase/fixes/greenn-payments.sql uma única vez no projeto dujirggwqffogqgdkbhr.
As tabelas private.greenn_sales e private.manual_access não são expostas ao cliente;
RLS sem políticas é intencional, pois os dados são acessados apenas pelas funções internas.
A RPC pública é SECURITY INVOKER e tem EXECUTE apenas para service_role.
Funções internas têm search_path vazio e EXECUTE revogado para anon/authenticated/PUBLIC.

Cada venda é processada atomicamente com locks por e-mail e ID. Repetições não prorrogam acesso.
Reembolsos/chargebacks são definitivos; eventos paid atrasados não reativam a venda.
Renovações começam no maior prazo já comprado ou manual (se finito), ou na data do pagamento.
Reembolsar uma venda preserva outras compras e concessões manuais.
Alterações manuais no painel são registradas separadamente; suspensão administrativa tem prioridade.
Administradores não têm o acesso alterado por compras.

## Verificação
29 testes do parser e HTTP handler; 13 cenários no PostgreSQL em BEGIN/ROLLBACK:
prazos, renovação, duplicatas, reordenação, cadastro posterior, confirmação de e-mail,
reembolso, chargeback, bônus, suspensão, identidade imutável e permissões da RPC.
Todos os fixtures são revertidos. Total do projeto: 247 testes.
TypeScript, lint (0 erros; 7 avisos preexistentes) e build aprovados.
Recebimento externo sem token/com token inválido deve responder 401.
Não declarar compra real validada antes de observar um evento autenticado da Greenn.

A revisão de segurança mantém um aviso preexistente de proteção contra senhas vazadas:
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

Documentação do fornecedor: https://apiadm.greenn.com.br/docs/api#/webhooks/saleUpdated
