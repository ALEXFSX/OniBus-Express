export interface ViagemDetalhe {
  id: string
  origem: string
  destino: string
  dataHoraPartidaUtc: string
  precoBase: number
  totalAssentos: number
  assentosOcupados: number[]
  assentosLivres: number[]
}