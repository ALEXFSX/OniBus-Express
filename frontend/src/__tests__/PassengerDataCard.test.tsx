import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import PassengerDataCard, {
  type PassengerFormData,
  type PassengerErrors,
} from '../components/PassengerDataCard'

const defaultPassenger: PassengerFormData = {
  fullName: '',
  cpf: '',
  email: '',
}

const noErrors: PassengerErrors = {}

describe('PassengerDataCard', () => {
  it('renderiza os campos nome, CPF e e-mail', () => {
    render(
      <PassengerDataCard
        formId="test-form"
        passenger={defaultPassenger}
        errors={noErrors}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
  })

  it('exibe mensagem de erro de nome quando errors.fullName está preenchido', () => {
    render(
      <PassengerDataCard
        formId="test-form"
        passenger={defaultPassenger}
        errors={{ fullName: 'Informe o nome completo.' }}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Informe o nome completo.')).toBeInTheDocument()
  })

  it('exibe mensagem de erro de CPF quando errors.cpf está preenchido', () => {
    render(
      <PassengerDataCard
        formId="test-form"
        passenger={defaultPassenger}
        errors={{ cpf: 'Informe um CPF valido.' }}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Informe um CPF valido.')).toBeInTheDocument()
  })

  it('exibe mensagem de erro de e-mail quando errors.email está preenchido', () => {
    render(
      <PassengerDataCard
        formId="test-form"
        passenger={defaultPassenger}
        errors={{ email: 'Informe um e-mail valido.' }}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Informe um e-mail valido.')).toBeInTheDocument()
  })

  it('chama onChange ao digitar no campo nome', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <PassengerDataCard
        formId="test-form"
        passenger={defaultPassenger}
        errors={noErrors}
        onChange={onChange}
        onSubmit={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText(/nome completo/i), 'A')

    expect(onChange).toHaveBeenCalledWith('fullName', 'A')
  })

  it('chama onSubmit ao submeter o formulário', () => {
    const onSubmit = vi.fn((e) => e.preventDefault())

    const { container } = render(
      <PassengerDataCard
        formId="test-form"
        passenger={defaultPassenger}
        errors={noErrors}
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.submit(container.querySelector('form')!)

    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('aria-invalid é verdadeiro nos campos com erro', () => {
    render(
      <PassengerDataCard
        formId="test-form"
        passenger={defaultPassenger}
        errors={{
          fullName: 'Informe o nome completo.',
          cpf: 'Informe o CPF.',
          email: 'Informe o e-mail.',
        }}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByLabelText(/nome completo/i)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/cpf/i)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/e-mail/i)).toHaveAttribute('aria-invalid', 'true')
  })
})
