import React, { useState } from 'react';

interface OnboardingModalProps {
  onSave: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    cep: '',
    sexo: '',
    dataNascimento: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Adicionar lógica de validação aqui se necessário
    console.log('Dados do perfil:', formData);
    onSave();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Bem-vindo à Democracia Digital</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="nome" className="form-label">Nome Completo</label>
            <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-field">
            <label htmlFor="telefone" className="form-label">Telefone</label>
            <input type="tel" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} className="form-input" placeholder="(XX) XXXXX-XXXX" required />
          </div>
          <div className="form-field">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-field">
            <label htmlFor="cep" className="form-label">CEP</label>
            <input type="text" id="cep" name="cep" value={formData.cep} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-field">
            <label htmlFor="sexo" className="form-label">Sexo</label>
            <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} className="form-input">
              <option value="">Selecione...</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="dataNascimento" className="form-label">Data de Nascimento</label>
            <input type="date" id="dataNascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} className="form-input" />
          </div>
          <button type="submit" className="form-button">Salvar Perfil</button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;