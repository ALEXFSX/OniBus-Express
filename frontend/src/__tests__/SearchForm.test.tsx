import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import SearchForm from '../components/SearchForm'
import * as api from '../services/api'

vi.mock('../services/api', () => ({
  rotasService: {
    listar: vi.fn(),
  },
  viagensService: {
    listar: vi.fn(),
  },
}))

const mockRotas = [
  { id: '1', origem: 'São Paulo', destino: 'Rio de Janeiro', duracaoEstimadaMinutos: 360 },
  { id: '2', origem: 'São Paulo', destino: 'Curitiba', duracaoEstimadaMinutos: 300 },
  { id: '3', origem: 'Rio de Janeiro', destino: 'São Paulo', duracaoEstimadaMinutos: 360 },
]

describe('SearchForm', () => {
  beforeEach(() => {
    vi.mocked(api.rotasService.listar).mockResolvedValue(mockRotas)
  })

  it('renderiza os campos de origem, destino, data e o botão de buscar', async () => {
    render(<SearchForm onSearch={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Origem')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('Destino')).toBeInTheDocument()
    expect(screen.getByLabelText(/data de ida/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument()
  })

  it('preenche os campos e chama onSearch ao submeter', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()

    render(<SearchForm onSearch={onSearch} />)

    await waitFor(() => {
      expect(screen.getAllByRole('option', { name: 'São Paulo' })).toHaveLength(2)
    })

    await user.selectOptions(screen.getByLabelText('Origem'), 'São Paulo')
    await user.selectOptions(screen.getByLabelText('Destino'), 'Rio de Janeiro')
    await user.type(screen.getByLabelText(/data de ida/i), '2026-12-01')

    await user.click(screen.getByRole('button', { name: /buscar/i }))

    expect(onSearch).toHaveBeenCalledOnce()
    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: 'São Paulo',
        destination: 'Rio de Janeiro',
        departureDate: '2026-12-01',
      }),
    )
  })

  it('exibe erros de validação quando os campos estão vazios', async () => {
    const user = userEvent.setup()

    render(<SearchForm onSearch={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /buscar/i })).not.toBeDisabled()
    })

    await user.click(screen.getByRole('button', { name: /buscar/i }))

    expect(screen.getByText('Selecione uma origem.')).toBeInTheDocument()
    expect(screen.getByText('Selecione um destino.')).toBeInTheDocument()
    expect(screen.getByText('Selecione a data de ida.')).toBeInTheDocument()
  })

  it('exibe erro quando origem e destino são iguais', async () => {
    const user = userEvent.setup()

    render(<SearchForm onSearch={vi.fn()} />)

    // Aguarda as opções carregarem (Rio de Janeiro aparece em ambos os selects)
    await waitFor(() => {
      expect(screen.getAllByRole('option', { name: 'Rio de Janeiro' })).toHaveLength(2)
    })

    await user.selectOptions(screen.getByLabelText('Origem'), 'Rio de Janeiro')
    await user.selectOptions(screen.getByLabelText('Destino'), 'Rio de Janeiro')
    await user.type(screen.getByLabelText(/data de ida/i), '2026-12-01')

    await user.click(screen.getByRole('button', { name: /buscar/i }))

    expect(screen.getByText('Origem e destino devem ser diferentes.')).toBeInTheDocument()
  })
})
