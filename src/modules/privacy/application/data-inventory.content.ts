export const DATA_INVENTORY_VERSION = '1.0 · agosto de 2026';

export interface DataInventorySection {
  title: string;
  text: string;
}

export interface DataInventoryDocument {
  version: string;
  title: string;
  intro: string;
  sections: DataInventorySection[];
}

const PLATFORM_NAME = 'CondoApp (plataforma SaaS de gestão condominial)';

function sharedProcessingSections(controllerLabel: string): DataInventorySection[] {
  return [
    {
      title: 'Controlador e operador',
      text:
        `${controllerLabel}. A plataforma atua como operadora tecnológica (hospedagem, autenticação e processamento ` +
        'sob instrução do controlador do condomínio), nos termos da LGPD.',
    },
    {
      title: 'Cadastro de moradores (fichas de unidade)',
      text:
        'Titulares: moradores e demais pessoas informadas na ficha (familiares, funcionários da unidade, contatos). ' +
        'Categorias: identificação (nome, RG, CPF, e-mail, telefones), unidade, vínculo, data de mudança, emergência, ' +
        'locador quando houver, veículos, animais, consentimento e assinatura. Finalidade: controle e organização do ' +
        'condomínio. Base legal: consentimento (art. 7º, I) e, no indispensável, obrigação legal / legítimo interesse ' +
        '(art. 7º, II e IX). Retenção: enquanto o vínculo ativo durar; após troca do titular (outro CPF) ou exclusão, ' +
        'arquivo histórico por 5 anos (acesso OWNER/MANAGER) e eliminação automática ao fim do prazo. Correções no ' +
        'mesmo titular não geram arquivo.',
    },
    {
      title: 'Contas de acesso (síndico, gestores, operadores)',
      text:
        'Titulares: usuários da plataforma. Categorias: nome, e-mail, CPF do operador (accountability), papéis de ' +
        'membership, dados de assinatura/plano. Finalidade: autenticação, autorização e cobrança do serviço. ' +
        'Base: execução de contrato e legítimo interesse. Retenção: enquanto a conta existir e pelos prazos fiscais/contratuais aplicáveis.',
    },
    {
      title: 'Portal do funcionário (ponto, visitantes, encomendas)',
      text:
        'Titulares: funcionários do condomínio e, conforme o módulo, visitantes e destinatários de encomendas. ' +
        'Categorias: CPF, PIN (hash), dados cadastrais de RH, selfies e geolocalização de ponto (retenção configurável), ' +
        'passes de visitante, pacotes e assinaturas de entrega. Finalidade: operação da portaria e controle de jornada. ' +
        'Base: execução de contrato / legítimo interesse / obrigação legal trabalhista quando couber.',
    },
    {
      title: 'Áreas comuns e reservas',
      text:
        'Titulares: moradores com conta vinculada à unidade. Categorias: identificação da reserva, unidade, período, ' +
        'observações. Finalidade: gestão de espaços comuns. Base: execução de contrato / legítimo interesse.',
    },
    {
      title: 'Documentos, sugestões, contatos e chamados',
      text:
        'Titulares: moradores e usuários autenticados. Categorias: textos publicados, sugestões anônimas ou identificadas, ' +
        'contatos úteis, tickets de suporte. Finalidade: comunicação e atendimento. Base: legítimo interesse / execução de contrato.',
    },
    {
      title: 'Financeiro e cobranças',
      text:
        'Titulares: responsáveis financeiros quando houver dados pessoais em contas a pagar/receber ou Pix. ' +
        'Categorias: valores, status, comprovantes, dados de cobrança via gateway. Finalidade: transparência e arrecadação. ' +
        'Base: execução de contrato / obrigação legal. Compartilhamento: processadores de pagamento quando contratados.',
    },
    {
      title: 'Trilha de auditoria de acesso',
      text:
        'Registros de quem consultou, alterou, exportou ou excluiu dados pessoais (e-mail do ator, ação, alvo, IP, data). ' +
        'Finalidade: accountability LGPD e segurança. Base: legítimo interesse / obrigação legal. Retenção: prazo necessário à defesa e auditoria.',
    },
    {
      title: 'Compartilhamentos e transferência internacional',
      text:
        'Acesso interno por função (síndico, gestão, operação, portaria/funcionário). Autoridades quando a lei exigir. ' +
        'Infraestrutura de nuvem/e-mail/pagamento conforme contratos. Sem venda de dados. Transferência internacional apenas ' +
        'se a infraestrutura do operador assim o exigir, com salvaguardas contratuais adequadas.',
    },
    {
      title: 'Segurança e direitos do titular',
      text:
        'Contas individuais, autenticação, controles de papel, HTTPS, registros de acesso. Direitos do art. 18 da LGPD ' +
        'exercidos junto ao controlador (administração do condomínio / canal do aviso de privacidade), sem prejuízo à unidade.',
    },
  ];
}

/** Inventário SaaS (visão da plataforma). */
export function buildPlatformDataInventory(): DataInventoryDocument {
  return {
    version: DATA_INVENTORY_VERSION,
    title: 'Inventário de dados pessoais da plataforma',
    intro:
      `Documento interno de registro das atividades de tratamento realizadas por ${PLATFORM_NAME}, ` +
      'para fins de conformidade com a Lei 13.709/2018 (LGPD). Não substitui o RIPD quando este for exigido.',
    sections: sharedProcessingSections(
      `Controlador das fichas condominiais: cada condomínio cliente. Operador tecnológico: ${PLATFORM_NAME}`,
    ),
  };
}

/** Corpo textual do inventário privado do condomínio (documento interno). */
export function buildCondoDataInventoryBody(condoName: string): string {
  const inventory: DataInventoryDocument = {
    version: DATA_INVENTORY_VERSION,
    title: 'Inventário de dados pessoais (LGPD)',
    intro:
      `Inventário interno do condomínio "${condoName}" como controlador dos cadastros e operações locais, ` +
      `com apoio tecnológico de ${PLATFORM_NAME}. Versão ${DATA_INVENTORY_VERSION}.`,
    sections: sharedProcessingSections(
      `Controlador: condomínio "${condoName}". Operador tecnológico: ${PLATFORM_NAME}`,
    ),
  };

  const lines = [
    inventory.title,
    '',
    inventory.intro,
    '',
    ...inventory.sections.flatMap((section) => [section.title, section.text, '']),
    `Gerado automaticamente. Não publicar no hub público.`,
  ];

  return lines.join('\n').slice(0, 20000);
}

export const CONDO_DATA_INVENTORY_TITLE = 'Inventário de dados pessoais (LGPD)';
