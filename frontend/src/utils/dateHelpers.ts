/**
 * Formata uma data no formato "YYYY-MM-DD" (retornado pela API) para "DD/MM/YYYY".
 * Importante: fazemos o parse manual em vez de `new Date(dateString)` porque
 * o JS interpretaria a string como meia-noite UTC, o que causaria um "dia a menos"
 * ao exibir em fusos horários negativos (ex: Brasil, UTC-3).
 */
export function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
}