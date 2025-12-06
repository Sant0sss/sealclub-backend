const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const payment = await mercadopago.payment.get(data.id);
      
      console.log('Pagamento:', {
        id: payment.body.id,
        status: payment.body.status,
        plan: payment.body.metadata
      });

      if (payment.body.status === 'approved') {
        console.log('✅ Pagamento APROVADO!');
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro' });
  }
};
