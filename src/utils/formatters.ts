function paraIso(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

export function dataHojeIso(): string {
  return paraIso(new Date())
}

export function adicionarDias(dataIso: string, dias: number): string {
  const [ano, mes, dia] = dataIso.slice(0, 10).split('-').map(Number)
  return paraIso(new Date(ano!, mes! - 1, dia! + dias))
}

export function formatarData(data: string): string {
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarDataHora(valor: string): string {
  const data = new Date(valor)

  if (Number.isNaN(data.getTime())) {
    return valor
  }

  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarNumero(valor: number, casas = 2): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: casas,
  })
}
