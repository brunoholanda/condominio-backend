export enum ContractType {
  Clt = 'CLT',
  Pj = 'PJ',
  Estagio = 'ESTAGIO',
  Temporario = 'TEMPORARIO',
}

export enum AccountType {
  Corrente = 'CORRENTE',
  Poupanca = 'POUPANCA',
}

export enum PunchType {
  ClockIn = 'CLOCK_IN',
  BreakStart = 'BREAK_START',
  BreakEnd = 'BREAK_END',
  ClockOut = 'CLOCK_OUT',
}

export enum PunchStatus {
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
}

/** Fluxo de aprovação de justificativa de falta. */
export enum AbsenceStatus {
  Pending = 'PENDING',
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
}

/** Motivos comuns de RH para justificar ausência / falta. */
export enum AbsenceReason {
  AtestadoMedico = 'ATESTADO_MEDICO',
  AtestadoOdontologico = 'ATESTADO_ODONTOLOGICO',
  ConsultaMedica = 'CONSULTA_MEDICA',
  LicencaMaternidade = 'LICENCA_MATERNIDADE',
  LicencaPaternidade = 'LICENCA_PATERNIDADE',
  FalecimentoFamiliar = 'FALECIMENTO_FAMILIAR',
  Casamento = 'CASAMENTO',
  DoacaoSangue = 'DOACAO_SANGUE',
  ComparecimentoJudicial = 'COMPARECIMENTO_JUDICIAL',
  ServicoEleitoral = 'SERVICO_ELEITORAL',
  AcidenteTrabalho = 'ACIDENTE_TRABALHO',
  FolgaCompensatoria = 'FOLGA_COMPENSATORIA',
  Ferias = 'FERIAS',
  LicencaPremio = 'LICENCA_PREMIO',
  AfastamentoInss = 'AFASTAMENTO_INSS',
  DeclaracaoEscolar = 'DECLARACAO_ESCOLAR',
  Suspensao = 'SUSPENSAO',
  FaltaJustificadaOutros = 'FALTA_JUSTIFICADA_OUTROS',
  FaltaInjustificada = 'FALTA_INJUSTIFICADA',
}

export const ABSENCE_REASON_LABELS: Record<AbsenceReason, string> = {
  [AbsenceReason.AtestadoMedico]: 'Atestado médico',
  [AbsenceReason.AtestadoOdontologico]: 'Atestado odontológico',
  [AbsenceReason.ConsultaMedica]: 'Consulta médica / exame',
  [AbsenceReason.LicencaMaternidade]: 'Licença-maternidade',
  [AbsenceReason.LicencaPaternidade]: 'Licença-paternidade',
  [AbsenceReason.FalecimentoFamiliar]: 'Falecimento de familiar',
  [AbsenceReason.Casamento]: 'Casamento',
  [AbsenceReason.DoacaoSangue]: 'Doação de sangue',
  [AbsenceReason.ComparecimentoJudicial]: 'Comparecimento judicial',
  [AbsenceReason.ServicoEleitoral]: 'Serviço eleitoral',
  [AbsenceReason.AcidenteTrabalho]: 'Acidente de trabalho',
  [AbsenceReason.FolgaCompensatoria]: 'Folga compensatória',
  [AbsenceReason.Ferias]: 'Férias',
  [AbsenceReason.LicencaPremio]: 'Licença-prêmio',
  [AbsenceReason.AfastamentoInss]: 'Afastamento INSS',
  [AbsenceReason.DeclaracaoEscolar]: 'Declaração escolar / acompanhamento de filho',
  [AbsenceReason.Suspensao]: 'Suspensão disciplinar',
  [AbsenceReason.FaltaJustificadaOutros]: 'Falta justificada (outros)',
  [AbsenceReason.FaltaInjustificada]: 'Falta injustificada',
};

export const PUNCH_SEQUENCE: PunchType[] = [
  PunchType.ClockIn,
  PunchType.BreakStart,
  PunchType.BreakEnd,
  PunchType.ClockOut,
];

export function nextPunchType(lastAccepted: PunchType | null): PunchType {
  if (!lastAccepted) {
    return PunchType.ClockIn;
  }

  const index = PUNCH_SEQUENCE.indexOf(lastAccepted);

  if (index < 0 || index >= PUNCH_SEQUENCE.length - 1) {
    return PunchType.ClockIn;
  }

  return PUNCH_SEQUENCE[index + 1];
}
