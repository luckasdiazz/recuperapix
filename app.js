/**
 * RecuperaPIX — Motor Interativo e Emissor de Dossiês
 */

let currentStep = 1;

function avancarPasso(proximo) {
  // Validacoes basicas
  if (currentStep === 1) {
    const nome = document.getElementById("vitima_nome").value.trim();
    const cpf = document.getElementById("vitima_cpf").value.trim();
    if (!nome || !cpf) {
      alert("Por favor, preencha pelo menos seu Nome Completo e CPF para prosseguir.");
      return;
    }
  } else if (currentStep === 2) {
    const valor = document.getElementById("golpe_valor").value.trim();
    const chave = document.getElementById("golpe_chave_pix").value.trim();
    if (!valor || !chave) {
      alert("Por favor, preencha o Valor e a Chave PIX utilizada pelo golpista.");
      return;
    }
  }

  document.getElementById(`step-${currentStep}`).classList.add("hidden");
  document.getElementById(`step-tab-${currentStep}`).classList.remove("border-brand-500", "bg-brand-950/60", "text-brand-400");
  document.getElementById(`step-tab-${currentStep}`).classList.add("border-slate-800", "bg-slate-900", "text-slate-400");

  currentStep = proximo;

  document.getElementById(`step-${currentStep}`).classList.remove("hidden");
  document.getElementById(`step-tab-${currentStep}`).classList.remove("border-slate-800", "bg-slate-900", "text-slate-400");
  document.getElementById(`step-tab-${currentStep}`).classList.add("border-brand-500", "bg-brand-950/60", "text-brand-400");

  window.scrollTo({ top: document.getElementById("gerador").offsetTop - 80, behavior: "smooth" });
}

function voltarPasso(anterior) {
  document.getElementById(`step-${currentStep}`).classList.add("hidden");
  document.getElementById(`step-tab-${currentStep}`).classList.remove("border-brand-500", "bg-brand-950/60", "text-brand-400");
  document.getElementById(`step-tab-${currentStep}`).classList.add("border-slate-800", "bg-slate-900", "text-slate-400");

  currentStep = anterior;

  document.getElementById(`step-${currentStep}`).classList.remove("hidden");
  document.getElementById(`step-tab-${currentStep}`).classList.remove("border-slate-800", "bg-slate-900", "text-slate-400");
  document.getElementById(`step-tab-${currentStep}`).classList.add("border-brand-500", "bg-brand-950/60", "text-brand-400");

  window.scrollTo({ top: document.getElementById("gerador").offsetTop - 80, behavior: "smooth" });
}

function gerarPreviaDossie() {
  const dados = coletarDadosFormulario();

  // Atualiza a previa visual
  document.getElementById("prev_banco_origem").innerText = dados.bancoOrigem || "INSTITUIÇÃO FINANCEIRA";
  document.getElementById("prev_vitima_nome").innerText = dados.vitimaNome || "CONSUMIDOR(A)";
  document.getElementById("prev_vitima_cpf").innerText = dados.vitimaCpf || "000.000.000-00";
  document.getElementById("prev_vitima_cidade").innerText = dados.vitimaCidade || "BRASIL";
  document.getElementById("prev_golpe_data").innerText = dados.golpeData || "DATA RECENTE";
  document.getElementById("prev_golpe_tipo").innerText = dados.golpeTipo || "GOLPE DIGITAL";
  document.getElementById("prev_golpe_valor").innerText = dados.golpeValor || "0,00";
  document.getElementById("prev_banco_destino").innerText = dados.bancoDestino || "CONTA DESTINATÁRIA";
  document.getElementById("prev_golpe_favorecido").innerText = dados.golpeFavorecido || "FAVORECIDO FRAUDULENTO";
  document.getElementById("prev_golpe_chave").innerText = dados.golpeChave || "NÃO INFORMADA";

  // Gera Payload PIX Real
  try {
    const txidRand = "RECUPX" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const payloadPix = RecuperaPix.gerarPayload({
      chave: RECUPERAPIX_CONFIG.pix.chave,
      nome: RECUPERAPIX_CONFIG.pix.nomeRecebedor,
      cidade: RECUPERAPIX_CONFIG.pix.cidadeRecebedor,
      valor: RECUPERAPIX_CONFIG.preco,
      txid: txidRand
    });

    document.getElementById("pix_copia_cola").value = payloadPix;

    // Renderiza QR Code
    const qrcodeContainer = document.getElementById("qrcode");
    qrcodeContainer.innerHTML = "";
    new QRCode(qrcodeContainer, {
      text: payloadPix,
      width: 150,
      height: 150,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (err) {
    console.error("Erro ao gerar payload PIX:", err);
  }

  avancarPasso(4);
}

function coletarDadosFormulario() {
  return {
    vitimaNome: document.getElementById("vitima_nome").value.trim(),
    vitimaCpf: document.getElementById("vitima_cpf").value.trim(),
    vitimaEmail: document.getElementById("vitima_email").value.trim(),
    vitimaTelefone: document.getElementById("vitima_telefone").value.trim(),
    vitimaCidade: document.getElementById("vitima_cidade").value.trim(),
    golpeTipo: document.getElementById("golpe_tipo").value,
    golpeValor: document.getElementById("golpe_valor").value.trim(),
    golpeData: document.getElementById("golpe_data").value.trim(),
    golpeChave: document.getElementById("golpe_chave_pix").value.trim(),
    golpeFavorecido: document.getElementById("golpe_favorecido").value.trim(),
    golpeId: document.getElementById("golpe_id_transacao").value.trim(),
    bancoOrigem: document.getElementById("banco_origem").value,
    bancoDestino: document.getElementById("banco_destino").value.trim(),
    bancoProtocolo: document.getElementById("banco_protocolo").value.trim(),
    bancoRecusa: document.getElementById("banco_recusa").value.trim(),
    boStatus: document.getElementById("bo_status").value
  };
}

function copiarPix() {
  const inputPix = document.getElementById("pix_copia_cola");
  inputPix.select();
  inputPix.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(inputPix.value).then(() => {
    const msg = document.getElementById("msg_copiado");
    msg.classList.remove("hidden");
    setTimeout(() => { msg.classList.add("hidden"); }, 4000);
  });
}

function confirmarPagamentoEBaixar() {
  const dados = coletarDadosFormulario();
  if (!dados.vitimaNome || !dados.golpeValor) {
    alert("Por favor, preencha os dados no formulário antes de baixar o dossiê.");
    avancarPasso(1);
    return;
  }

  // Gera o PDF Oficial em 4 Páginas usando jsPDF
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const margemEsquerda = 20;
    const larguraUtil = 170;

    // --- PÁGINA 1: NOTIFICAÇÃO EXTRAJUDICIAL FORMAL ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("NOTIFICAÇÃO EXTRAJUDICIAL E REQUERIMENTO ADMINISTRATIVO URGENTE", 105, 20, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("MECANISMO ESPECIAL DE DEVOLUÇÃO (RES. BCB Nº 103/2021) E SÚMULA 479 DO STJ", 105, 25, { align: "center" });
    doc.line(margemEsquerda, 28, margemEsquerda + larguraUtil, 28);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("DESTINATÁRIO:", margemEsquerda, 35);
    doc.setFont("helvetica", "normal");
    doc.text(`À DIRETORIA DE COMPLIANCE, GESTÃO DE RISCOS E OUVIDORIA GERAL`, margemEsquerda, 40);
    doc.text(`INSTITUIÇÃO FINANCEIRA: ${dados.bancoOrigem.toUpperCase()}`, margemEsquerda, 45);

    doc.setFont("helvetica", "bold");
    doc.text("NOTIFICANTE (CONSUMIDOR LESADO):", margemEsquerda, 53);
    doc.setFont("helvetica", "normal");
    doc.text(`${dados.vitimaNome.toUpperCase()}, inscrito(a) no CPF/MF sob nº ${dados.vitimaCpf}`, margemEsquerda, 58);
    doc.text(`Residente e domiciliado(a) em: ${dados.vitimaCidade.toUpperCase()}`, margemEsquerda, 63);
    doc.text(`Contato: ${dados.vitimaTelefone} | E-mail: ${dados.vitimaEmail}`, margemEsquerda, 68);

    doc.setFont("helvetica", "bold");
    doc.text("I - DO OBJETO E DA TRANSAÇÃO FRAUDULENTA", margemEsquerda, 76);
    doc.setFont("helvetica", "normal");
    const textoFatos = `O(A) Notificante vem, por meio deste instrumento formal, NOTIFICAR V. Sa. a proceder com o RESSARCIMENTO INTEGRAL E IMEDIATO da quantia de R$ ${dados.golpeValor}, transferida indevidamente via arranjo de pagamentos instantâneos (PIX) na data de ${dados.golpeData}, decorrente de fraude cibernética comissiva da modalidade "${dados.golpeTipo}". Os valores foram creditados na instituição ${dados.bancoDestino.toUpperCase()}, sob favorecimento de ${dados.golpeFavorecido.toUpperCase()} (Chave PIX: ${dados.golpeChave}). Protocolo de atendimento prévio: ${dados.bancoProtocolo || 'Registrado via SAC'}.`;
    doc.text(doc.splitTextToSize(textoFatos, larguraUtil), margemEsquerda, 81);

    doc.setFont("helvetica", "bold");
    doc.text("II - DA RESPONSABILIDADE CIVIL OBJETIVA (SÚMULA 479 DO STJ)", margemEsquerda, 115);
    doc.setFont("helvetica", "normal");
    const textoStj = `Conforme assentado pelo Superior Tribunal de Justiça na Súmula nº 479: 'As instituições financeiras respondem objetivamente pelos danos gerados por fortuito interno relativo a fraudes e delitos praticados por terceiros no âmbito de operações bancárias'. O dever de segurança dos arranjos de pagamento incumbe integralmente à instituição financeira, que assume os riscos inerentes à sua atividade econômica lucrativa, sendo vedada a transferência de riscos operacionais ao consumidor vulnerável (Artigo 14 da Lei 8.078/1990 - CDC).`;
    doc.text(doc.splitTextToSize(textoStj, larguraUtil), margemEsquerda, 120);

    doc.setFont("helvetica", "bold");
    doc.text("III - DA OBRIGAÇÃO DE ACIONAMENTO DO MED (RESOLUÇÃO BCB Nº 103/2021)", margemEsquerda, 150);
    doc.setFont("helvetica", "normal");
    const textoBacen = `A Resolução BCB nº 103/2021 e nº 147/2021 do Banco Central do Brasil instituem compulsoriamente o Mecanismo Especial de Devolução (MED) e o Bloqueio Cautelar em hipóteses de fundada suspeita de fraude. A negativa sumária fundada na alegação de 'transação confirmada por senha' afronta a regulamentação do BACEN, caracterizando falha grave na prestação do serviço e inércia lesiva na contenção do dano.`;
    doc.text(doc.splitTextToSize(textoBacen, larguraUtil), margemEsquerda, 155);

    doc.setFont("helvetica", "bold");
    doc.text("IV - DOS REQUERIMENTOS FORMAIS", margemEsquerda, 185);
    doc.setFont("helvetica", "normal");
    const textoRequer = `Diante do exposto, requer-se: 1) O IMEDIATO acionamento do protocolo MED junto à instituição receptadora com rastreamento integral da cadeia de contas; 2) A RESTITUIÇÃO INTEGRAL do valor de R$ ${dados.golpeValor} no prazo improrrogável de até 10 (dez) dias úteis; 3) O fornecimento de laudo técnico circunstanciado sobre os parâmetros de segurança adotados.`;
    doc.text(doc.splitTextToSize(textoRequer, larguraUtil), margemEsquerda, 190);

    doc.text("O não atendimento no prazo assinalado ensejará o ajuizamento de AÇÃO DE REPARAÇÃO DE DANOS MATERIAIS E MORAIS perante o Juizado Especial Cível competente, com pleito de inversão do ônus da prova e comunicação formal ao Banco Central do Brasil.", margemEsquerda, 220, { maxWidth: larguraUtil });

    doc.text(`${dados.vitimaCidade || 'Local'}, ${new Date().toLocaleDateString('pt-BR')}.`, margemEsquerda, 245);
    doc.line(margemEsquerda, 265, margemEsquerda + 80, 265);
    doc.text(`${dados.vitimaNome.toUpperCase()}`, margemEsquerda, 270);
    doc.text(`CPF/MF: ${dados.vitimaCpf}`, margemEsquerda, 274);

    // --- PÁGINA 2: DENÚNCIA BACEN (REGISTRATO) ---
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PETIÇÃO DE DENÚNCIA / RECLAMAÇÃO NO BANCO CENTRAL DO BRASIL", 105, 20, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("CANAL OFICIAL DE RECLAMAÇÕES (registrato.bcb.gov.br / bcb.gov.br)", 105, 25, { align: "center" });
    doc.line(margemEsquerda, 28, margemEsquerda + larguraUtil, 28);

    doc.setFont("helvetica", "bold");
    doc.text("INSTRUÇÃO DE USO:", margemEsquerda, 35);
    doc.setFont("helvetica", "normal");
    doc.text("Acesse 'bcb.gov.br/meubacen' ou 'registrato.bcb.gov.br', clique em 'Reclamação contra Instituição Financeira', selecione seu banco e cole o texto formatado abaixo. O Banco Central obriga a diretoria do banco a responder em até 10 dias úteis sob pena de processo administrativo sancionador.", margemEsquerda, 40, { maxWidth: larguraUtil });

    doc.setFont("helvetica", "bold");
    doc.text("TEXTO DA RECLAMAÇÃO PARA COPIAR E COLAR NO BACEN:", margemEsquerda, 60);
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    const textoCopiaBacen = `RECLAMAÇÃO FORMAL CONTRA ${dados.bancoOrigem.toUpperCase()}
ASSUNTO: INOBSERVÂNCIA DAS DIRETRIZES DO MED (RES. BCB 103/2021) E FALHA DE SEGURANÇA PIX

Venho perante esta Autarquia Federal registrar reclamação contra a instituição ${dados.bancoOrigem}, em virtude de falha na prestação de serviços e descumprimento dos deveres regulatórios do arranjo de pagamentos PIX.

Na data de ${dados.golpeData}, fui vítima de fraude cibernética (${dados.golpeTipo}), resultando na transferência forçada/induzida no valor de R$ ${dados.golpeValor} para a conta de ${dados.golpeFavorecido} no banco ${dados.bancoDestino}.

Imediatamente após a constatação da fraude, contatei a referida instituição (Protocolo: ${dados.bancoProtocolo || 'Atendimento Eletrônico'}), solicitando a abertura urgente do Mecanismo Especial de Devolução (MED) e o bloqueio cautelar das quantias, conforme preconizam os arts. 41-B e 41-C da Resolução BCB nº 103/2021.

Ocorre que a instituição financeira se recusou a atuar diligentemente, desrespeitando as normas expedidas pelo Banco Central do Brasil e a pacífica jurisprudência do Superior Tribunal de Justiça (Súmula 479/STJ).

Diante do exposto, solicito a intervenção do Banco Central para:
1) Fiscalizar a atuação e o cumprimento estrito do MED pelo banco reclamado;
2) Determinar o ressarcimento da quantia de R$ ${dados.golpeValor};
3) Apurar a responsabilidade administrativa da instituição na autorização de transação nitidamente destoante do meu perfil financeiro usual.

Consumidor: ${dados.vitimaNome} | CPF: ${dados.vitimaCpf}`;
    doc.text(doc.splitTextToSize(textoCopiaBacen, larguraUtil), margemEsquerda, 67);

    // --- PÁGINA 3: MODELO PROCON & GUIA DE B.O. ---
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("ROTEIRO DE RECLAMAÇÃO PROCON & BOLETIM DE OCORRÊNCIA", 105, 20, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("CANAL CONSUMIDOR.GOV.BR E DELEGACIA ELETRÔNICA", 105, 25, { align: "center" });
    doc.line(margemEsquerda, 28, margemEsquerda + larguraUtil, 28);

    doc.setFont("helvetica", "bold");
    doc.text("1. PROCEDIMENTO NO CONSUMIDOR.GOV.BR / PROCON", margemEsquerda, 35);
    doc.setFont("helvetica", "normal");
    doc.text("O Consumidor.gov.br é monitorado pela Secretaria Nacional do Consumidor (SENACON). Os bancos possuem índice de resolução superior a 80% nessa plataforma para evitar ações coletivas.", margemEsquerda, 40, { maxWidth: larguraUtil });
    
    doc.setFont("helvetica", "bold");
    doc.text("Enquadramento Legal no PROCON:", margemEsquerda, 53);
    doc.setFont("helvetica", "normal");
    doc.text("- Artigo 14 do CDC: Responsabilidade objetiva pela falha na segurança do sistema bancário;
- Artigo 39, V e VIII do CDC: Prática abusiva ao se omitir em conter danos decorrentes de engenharia social e contas laranjas abertas sem validação documental rigorosa.", margemEsquerda, 58);

    doc.setFont("helvetica", "bold");
    doc.text("2. ROTEIRO PARA O BOLETIM DE OCORRÊNCIA (B.O. ELETRÔNICO)", margemEsquerda, 78);
    doc.setFont("helvetica", "normal");
    doc.text("Acesse o portal da Delegacia Eletrônica da Polícia Civil do seu Estado e selecione 'Estelionato / Fraude Virtual'. No campo do histórico dos fatos, inclua:", margemEsquerda, 83, { maxWidth: larguraUtil });
    
    const textoBo = `- Tipificação: Estelionato Eletrônico (Artigo 171, § 2º-B do Código Penal Brasileiro);
- Dados do Golpista: Nome: ${dados.golpeFavorecido} | Chave PIX: ${dados.golpeChave} | Banco Destino: ${dados.bancoDestino};
- Valor do Dano: R$ ${dados.golpeValor} em ${dados.golpeData};
- Salve o comprovante do PIX e todos os prints de conversas para anexar ao B.O.`;
    doc.text(doc.splitTextToSize(textoBo, larguraUtil), margemEsquerda, 98);

    // --- PÁGINA 4: DIRETÓRIO DE OUVIDORIAS DOS BANCOS ---
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DIRETÓRIO OFICIAL DE OUVIDORIAS BANCÁRIAS DO BRASIL", 105, 20, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("CANAIS DE 2ª INSTÂNCIA PARA PROTOCOLO DA NOTIFICAÇÃO EXTRAJUDICIAL", 105, 25, { align: "center" });
    doc.line(margemEsquerda, 28, margemEsquerda + larguraUtil, 28);

    doc.setFont("helvetica", "bold");
    doc.text("Envie a Notificação (Página 1 deste documento) para a Ouvidoria do seu banco:", margemEsquerda, 35);

    const contatos = [
      "1. NUBANK: 0800 887 0463 | ouvidoria@nubank.com.br",
      "2. ITAÚ UNIBANCO: 0800 570 0011 | ouvidoria@itau.com.br",
      "3. BRADESCO: 0800 727 9933 | ouvidoria@bradesco.com.br",
      "4. SANTANDER: 0800 726 0322 | ouvidoria@santander.com.br",
      "5. BANCO DO BRASIL: 0800 729 5678 | ouvidoriabb@bb.com.br",
      "6. CAIXA ECONÔMICA: 0800 725 7474 | ouvidoria.caixa.gov.br",
      "7. BANCO INTER: 0800 940 7772 | ouvidoria@bancointer.com.br",
      "8. C6 BANK: 0800 660 6116 | ouvidoria@c6bank.com.br",
      "9. MERCADO PAGO: 0800 637 7246 | sac.mercadopago.com.br",
      "10. PICPAY: 0800 025 2000 | ouvidoria@picpay.com",
      "11. PAGBANK: 0800 728 2174 | ouvidoria@pagseguro.com.br"
    ];

    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    let yContatos = 45;
    contatos.forEach(c => {
      doc.text(c, margemEsquerda, yContatos);
      yContatos += 8;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("AUTENTICIDADE DO DOSSIÊ RECUPERAPIX:", margemEsquerda, 145);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Documento gerado em ${new Date().toLocaleString('pt-BR')} via RecuperaPIX.
Código de Validação: RECUPX-${Math.random().toString(36).substring(2, 10).toUpperCase()}
Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).`, margemEsquerda, 152);

    // Salva o PDF
    const nomeLimpo = (dados.vitimaNome || "Consumidor").replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Dossie_RecuperaPIX_${nomeLimpo}.pdf`);

    // Registra pedido local
    const pedidos = JSON.parse(localStorage.getItem("recuperapix_pedidos") || "[]");
    pedidos.push({
      data: new Date().toISOString(),
      vitima: dados.vitimaNome,
      cpf: dados.vitimaCpf,
      valorGolpe: dados.golpeValor,
      valorPago: RECUPERAPIX_CONFIG.preco,
      status: "DOWNLOAD_CONCLUIDO"
    });
    localStorage.setItem("recuperapix_pedidos", JSON.stringify(pedidos));

    alert("✅ Dossiê Oficial em PDF Gerado com Sucesso! O arquivo foi baixado no seu dispositivo. Abra o PDF para seguir o passo a passo de protocolo nas Ouvidorias e BACEN.");
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    alert("Ocorreu um erro ao gerar o arquivo PDF. Por favor tente novamente.");
  }
}
