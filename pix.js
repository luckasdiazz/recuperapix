/**
 * RecuperaPIX - Módulo Oficial de Geração de PIX (Padrão BACEN / EMV QRCPS-MPM)
 * Gera payload estático ou dinâmico com valor, chave, recebedor e TxID.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RecuperaPix = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  
  function semAcento(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function tlv(id, valor) {
    const texto = String(valor);
    if (texto.length > 99) throw new Error("Campo Pix excede 99 caracteres: " + id);
    return id + String(texto.length).padStart(2, "0") + texto;
  }

  function crc16(texto) {
    let crc = 0xffff;
    for (let i = 0; i < texto.length; i++) {
      crc ^= texto.charCodeAt(i) << 8;
      for (let bit = 0; bit < 8; bit++) {
        if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xffff;
        else crc = (crc << 1) & 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  function limparTexto(texto, max) {
    const limpo = semAcento(String(texto || ""))
      .toUpperCase()
      .replace(/[^A-Z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return limpo.slice(0, max);
  }

  function normalizarChave(chave) {
    const texto = String(chave || "").trim();
    if (!texto || texto.length < 5 || texto.length > 77) {
      throw new Error("Chave Pix inválida ou vazia");
    }
    if (texto.includes("@")) return texto.toLowerCase();
    if (/^\+?\d+$/.test(texto)) return texto;
    if (/^[0-9a-f-]{32,36}$/i.test(texto) && texto.includes("-")) return texto.toLowerCase();
    if (/^\d{11}$/.test(texto) || /^\d{14}$/.test(texto)) return texto;
    return texto;
  }

  function gerarPayload(opcoes) {
    const chave = normalizarChave(opcoes.chave);
    const nome = limparTexto(opcoes.nome, 25);
    const cidade = limparTexto(opcoes.cidade, 15);
    
    if (nome.length < 2 || cidade.length < 2) {
      throw new Error("Nome ou cidade do recebedor PIX incompletos");
    }

    const contaMerchant = tlv("00", "br.gov.bcb.pix") + tlv("01", chave);

    let corpo =
      tlv("00", "01") + // Payload Format Indicator
      tlv("01", "12") + // Ponto de Iniciação: 12 = Dinâmico / Estático c/ valor
      tlv("26", contaMerchant) + // Merchant Account Info
      tlv("52", "0000") + // Merchant Category Code
      tlv("53", "986"); // Currency: BRL (986)

    if (opcoes.valor != null && opcoes.valor !== "") {
      const valor = Number(opcoes.valor).toFixed(2);
      if (!/^\d+\.\d{2}$/.test(valor) || Number(valor) <= 0) {
        throw new Error("Valor do Pix deve ser maior que zero");
      }
      corpo += tlv("54", valor);
    }

    const txidLimpo = limparTexto(opcoes.txid || "RECUPERAPIX", 25).replace(/ /g, "") || "RECUPERAPIX";

    corpo +=
      tlv("58", "BR") + // Country Code
      tlv("59", nome) + // Merchant Name
      tlv("60", cidade) + // Merchant City
      tlv("62", tlv("05", txidLimpo)) + // Reference Label / TxID
      "6304"; // Checksum prefix

    return corpo + crc16(corpo);
  }

  return {
    gerarPayload: gerarPayload,
    crc16: crc16,
    normalizarChave: normalizarChave
  };
});
