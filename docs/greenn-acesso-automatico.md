# Acesso após compra Greenn

Oferta atual: produto 196443, hash mkimrj, 6 meses. As ofertas anteriores 4Q1tqK e fMqpDz continuam reconhecidas para manter compras existentes.

## Comportamento

Evento saleUpdated/TRANSACTION/paid autenticado pelo X-Webhook-Token: registra a venda, libera compradores já confirmados e envia link de acesso pelo SMTP de Auth. Para um novo e-mail, inviteUserByEmail cria a conta e envia convite para definir senha. O convite confirma o e-mail e o gatilho vincula a venda ao usuário. Usuários confirmados recebem magic link sem alteração de senha.

A tabela privada greenn_access_emails controla envio por venda, com lease de 5 minutos para concorrência e retomada após falha. Falha de Auth retorna HTTP 500; a venda continua registrada e o evento pode ser reenviado sem duplicar prazo. A retomada depende do reenvio do webhook; não há trabalhador periódico instalado. Pode haver um e-mail repetido se o processo interromper depois de SMTP aceitar e antes de registrar sucesso. sent_at significa aceitação por Auth, não confirmação de entrega na caixa de entrada.

Reembolso/chargeback não envia convite e preserva revogação de acesso. Uma suspensão administrativa continua prevalecendo sobre compra. Não se enviam senhas por e-mail nem se confirma automaticamente um endereço sem validação do destinatário.

## Configuração externa ainda necessária

1. Greenn, produto 196443, integração Webhook: evento saleUpdated, URL https://dujirggwqffogqgdkbhr.supabase.co/functions/v1/greenn-webhook. Usar o mesmo Webhook Token configurado no secret GREENN_WEBHOOK_TOKEN. Nunca publicar esse token no repositório. Conferir o cabeçalho X-Webhook-Token no envio real.
2. Supabase Auth URL Configuration: Site URL https://dimensione.comandoseletricosexpert.com.br/ e redirect permitido https://dimensione.comandoseletricosexpert.com.br/**.
3. Supabase Auth SMTP: conferir o provedor externo já usado para recuperação de senha.
4. Auth Email Templates: configurar Invite user e Magic Link com ConfirmationURL; o redirect do convite inclui ?recovery=1, tela existente para definir senha. Não substituir ConfirmationURL apenas pelo domínio.
5. Teste real: compra aprovada usando um e-mail novo, conferir recebimento, clicar convite, definir senha, verificar plano e prazo. Reenvio do mesmo evento não pode aumentar prazo. Testar também comprador com cadastro confirmado.

Nenhuma compra real ou envio a destinatário foi feito durante a validação automatizada. Não declarar entrega completa antes desse teste.

## Convite — assunto: Seu acesso ao Dimensionador Expert

```html
<h2>Bem-vindo ao Dimensionador Expert</h2>
<p>Seu acesso foi disponibilizado pela Academia do Eletricista.</p>
<p><strong>Seu e-mail de acesso:</strong> {{ .Email }}</p>
<p>Para concluir seu primeiro acesso, confirme seu e-mail e crie sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Criar minha senha e acessar</a></p>
<p>Aplicação: https://dimensione.comandoseletricosexpert.com.br/</p>
<p>Academia do Eletricista</p>
```

## Magic Link — assunto: Acesse o Dimensionador Expert

```html
<h2>Seu acesso ao Dimensionador Expert</h2>
<p><strong>E-mail de acesso:</strong> {{ .Email }}</p>
<p><a href="{{ .ConfirmationURL }}">Entrar no Dimensionador Expert</a></p>
<p>Você também pode entrar usando sua senha habitual em https://dimensione.comandoseletricosexpert.com.br/.</p>
<p>Academia do Eletricista</p>
```

## Verificação

37 testes de webhook e envio, typecheck dos módulos puros e lint. Testes SQL em transação com rollback verificam os 13 cenários antigos e os novos: oferta atual, confirmação de convite, renovação, lease concorrente, retomada de erro, duplicata, reembolso e permissões. Advisors: tabelas privadas RLS sem políticas intencionalmente bloqueadas aos clientes; alerta preexistente de proteção contra senhas vazadas desligada.

## Oferta de teste

A oferta `ndY8mn` do produto `196443` também libera 6 meses e usa o mesmo fluxo de e-mail, reembolso e chargeback. Ela precisa estar selecionada na entrega Webhook da Greenn para receber os eventos. Outras ofertas desconhecidas continuam rejeitadas.

## Plano único do produto atual

O produto `196443` libera 6 meses em todas as ofertas. O webhook usa o ID de produto autenticado pela Greenn para selecionar esse plano e registra a referência interna `mkimrj`, independentemente do hash opcional da oferta. Reenvios, renovação e estornos preservam o prazo e a identidade da venda; a referência antiga de teste `ndY8mn` é equivalente no banco.

O produto antigo `196035` tem 6 e 12 meses e continua exigindo uma oferta reconhecida. Outros produtos são ignorados. Token inválido, pagamento não aprovado e dados essenciais inválidos não liberam acesso. Uma referência conhecida de outro produto é rejeitada. Antes de vender outro prazo no produto 196443, a regra de plano único deve ser revista.
