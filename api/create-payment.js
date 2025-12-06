const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { token, issuer_id, payment_method_id, transaction_amount, installments, payer, plan } = req.body;

    const payment = await mercadopago.payment.create({
      transaction_amount: parseFloat(transaction_amount),
      token: token,
      description: `SealClub - Plano ${plan.name}`,
      installments: parseInt(installments),
      payment_method_id: payment_method_id,
      issuer_id: issuer_id,
      payer: {
        email: payer.email,
        identification: {
          type: payer.identification?.type || 'CPF',
          number: payer.identification?.number || ''
        }
      },
      statement_descriptor: 'SEALCLUB',
      external_reference: `SEALCLUB-${plan.id}-${Date.now()}`,
      notification_url: `${process.env.WEBHOOK_URL}/api/webhook`,
      metadata: {
        plan_id: plan.id,
        plan_name: plan.name,
        plan_price: plan.price
      }
    });

    return res.status(200).json({
      status: payment.body.status,
      status_detail: payment.body.status_detail,
      id: payment.body.id
    });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({
      error: 'Erro ao processar pagamento',
      message: error.message
    });
  }
};
