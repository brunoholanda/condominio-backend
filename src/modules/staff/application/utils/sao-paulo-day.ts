/** Início e fim do dia civil em America/Sao_Paulo, em Date UTC. */
export function saoPauloDayBounds(now: Date): { dayStart: Date; dayEnd: Date } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const day = formatter.format(now); // YYYY-MM-DD
  // Meia-noite SP = 03:00 UTC (sem DST desde 2019)
  const dayStart = new Date(`${day}T03:00:00.000Z`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

  return { dayStart, dayEnd };
}
