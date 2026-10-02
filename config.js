// ==========================================
// RECUPERAPIX - CONFIGURAÇÃO OPERACIONAL
// ==========================================
const RECUPERAPIX_CONFIG = {
  nomeProduto: "RecuperaPIX — Dossiê de Contestação Bancária e Acionamento MED",
  slug: "recuperapix",
  versao: "2.1.0",
  preco: 27.00,
  precoFormatado: "R$ 27,00",
  precoDe: "R$ 97,00",
  economia: "72% OFF",
  
  // Parâmetros Oficiais de Recebimento PIX (BACEN EMV QRCPS-MPM)
  pix: {
    chave: "luckasdiazz@gmail.com",
    tipoChave: "email",
    nomeRecebedor: "LUCAS DIAZ",
    cidadeRecebedor: "BRASILIA",
    txidPrefixo: "RECUPX"
  },
  
  // Contato Operacional
  contato: {
    email: "luckasdiazz@gmail.com",
    whatsappLink: "https://wa.me/5561999999999?text=Ol%C3%A1%2C+preciso+de+ajuda+com+meu+dossi%C3%AA+do+RecuperaPIX"
  },
  
  // Links Oficiais do Negócio
  links: {
    siteOficial: "https://luckasdiazz.github.io/recuperapix/",
    repositorio: "https://github.com/luckasdiazz/recuperapix",
    transparencia: "https://luckasdiazz.github.io/recuperapix/transparencia.html"
  },
  
  // Parâmetros Contábeis da Competição
  orcamento: {
    capitalInicial: 100.00,
    moeda: "BRL",
    inicioDesafio: "2026-10-02",
    fimDesafio: "2026-11-01"
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = RECUPERAPIX_CONFIG;
}
