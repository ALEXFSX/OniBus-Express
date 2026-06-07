import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import SeatSelectionCard from '../components/SeatSelectionCard'

const defaultTripData = {
  route: 'São Paulo → Rio de Janeiro',
  date: '01/12/2026',
  departureTime: '08:00',
  duration: '6h',
  price: 'R$ 89,90',
}

describe('SeatSelectionCard', () => {
  it('renderiza as informações da viagem', () => {
    render(
      <SeatSelectionCard
        tripData={defaultTripData}
        totalSeats={10}
        occupiedSeats={[]}
        onSeatSelect={vi.fn()}
        selectedSeat={null}
      />,
    )

    expect(screen.getByText('São Paulo → Rio de Janeiro')).toBeInTheDocument()
    expect(screen.getByText('01/12/2026')).toBeInTheDocument()
    expect(screen.getByText(/08:00/)).toBeInTheDocument()
    expect(screen.getByText('R$ 89,90')).toBeInTheDocument()
  })

  it('renderiza assentos livres e chama onSeatSelect ao clicar', async () => {
    const user = userEvent.setup()
    const onSeatSelect = vi.fn()

    render(
      <SeatSelectionCard
        tripData={defaultTripData}
        totalSeats={8}
        occupiedSeats={[]}
        onSeatSelect={onSeatSelect}
        selectedSeat={null}
      />,
    )

    const seat3 = screen.getByRole('button', { name: 'Assento 3' })
    expect(seat3).not.toBeDisabled()

    await user.click(seat3)

    expect(onSeatSelect).toHaveBeenCalledOnce()
    expect(onSeatSelect).toHaveBeenCalledWith(3)
  })

  it('bloqueia assentos ocupados e não chama onSeatSelect ao clicar neles', async () => {
    const user = userEvent.setup()
    const onSeatSelect = vi.fn()

    render(
      <SeatSelectionCard
        tripData={defaultTripData}
        totalSeats={8}
        occupiedSeats={[2, 5]}
        onSeatSelect={onSeatSelect}
        selectedSeat={null}
      />,
    )

    const occupiedSeat = screen.getByRole('button', { name: 'Assento 2' })
    expect(occupiedSeat).toBeDisabled()

    await user.click(occupiedSeat)

    expect(onSeatSelect).not.toHaveBeenCalled()
  })

  it('marca o assento selecionado visualmente', () => {
    render(
      <SeatSelectionCard
        tripData={defaultTripData}
        totalSeats={8}
        occupiedSeats={[]}
        onSeatSelect={vi.fn()}
        selectedSeat={4}
      />,
    )

    const selectedSeat = screen.getByRole('button', { name: 'Assento 4' })
    expect(selectedSeat.className).toContain('bg-primary')
  })

  it('exibe a legenda com Livre, Selecionado e Ocupado', () => {
    render(
      <SeatSelectionCard
        tripData={defaultTripData}
        totalSeats={4}
        occupiedSeats={[]}
        onSeatSelect={vi.fn()}
        selectedSeat={null}
      />,
    )

    expect(screen.getByText('Livre')).toBeInTheDocument()
    expect(screen.getByText('Selecionado')).toBeInTheDocument()
    expect(screen.getByText('Ocupado')).toBeInTheDocument()
  })
})
