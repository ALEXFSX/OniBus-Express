export interface Viagem {
  id: string
  origem: string
  destino: string
  dataHoraPartidaUtc: string
  precoBase: number
  assentosDisponiveis: number
}
