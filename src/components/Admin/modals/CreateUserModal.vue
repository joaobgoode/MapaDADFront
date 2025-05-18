<template>
  <div class="overlay-background">
    <div class="create-modal card">
      <div class="card-header bg-primary text-white">
        Criar Novo Usuário
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label for="newUserNome" class="form-label">Nome:</label>
          <input type="text" id="newUserNome" class="form-control"
            :class="{ 'is-invalid': errors.nome || errors.nomeExists }" v-model="form.nome" @input="clearError('nome')"
            placeholder="Nome completo">
          <div v-if="errors.nome" class="invalid-feedback">Nome é obrigatório.</div>
          <div v-if="errors.nomeExists" class="invalid-feedback">Este nome já está em uso.</div>
        </div>
        <div class="mb-3">
          <label for="newUserUsername" class="form-label">Usuário:</label>
          <input type="text" id="newUserUsername" class="form-control"
            :class="{ 'is-invalid': errors.usuario || errors.usuarioExists }" v-model="form.usuario"
            @input="clearError('usuario')" placeholder="Nome de usuário único">
          <div v-if="errors.usuario" class="invalid-feedback">Usuário é obrigatório.</div>
          <div v-if="errors.usuarioExists" class="invalid-feedback">Este usuário já está em uso.</div>
          <div v-if="errors.usuarioShort" class="invalid-feedback">Usuário deve ter pelo menos 8 caracteres.</div>
          <div v-if="errors.usuarioInvalido" class="invalid-feedback">Usuário inválido.</div>
        </div>
        <div class="mb-3">
          <label for="newUserEmail" class="form-label">Email:</label>
          <input type="email" id="newUserEmail" class="form-control" v-model="form.email"
            placeholder="Endereço de email (opcional)">
        </div>
        <div class="mb-3">
          <label for="newUserTelefone" class="form-label">Telefone:</label>
          <input type="text" id="newUserTelefone" class="form-control" v-model="form.telefone"
            placeholder="Número de telefone (opcional)">
        </div>

        <div class="mb-3">
          <label for="newUserRole" class="form-label">Tipo de Usuário (Role):</label>
          <select id="newUserRole" class="form-select" v-model="form.role">
            <option value="funcionario">Funcionário</option>
            <!-- <option value="user">Usuário</option> -->
            <option v-if="userIsSuperuser()" value="admin">Admin</option>
            <option v-if="userIsSuperuser()" value="superuser">Superuser</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label d-block">Senha:</label>
          <div class="input-group">
            <input type="text" class="form-control" :value="generatedPassword" readonly
              :class="{ 'is-invalid': errors.passwordCopied }" placeholder="Clique em Gerar Senha">
            <button class="btn btn-secondary" type="button" @click="generatePassword">Gerar Senha</button>
            <button class="btn btn-outline-secondary" type="button" @click="copyPassword"
              :disabled="!generatedPassword">
              <i class="bi bi-clipboard"></i> Copiar
            </button>
          </div>
          <div v-if="errors.passwordCopied" class="invalid-feedback">Você deve gerar e copiar a senha antes de
            enviar.</div>
          <div v-if="passwordCopied && !errors.passwordCopied" class="form-text text-success">
            Senha copiada para a área de transferência!
          </div>
        </div>

        <div class="d-flex justify-content-end">
          <button class="btn btn-secondary me-2" @click="$emit('cancel')">Cancelar</button>
          <button class="btn btn-primary" @click="handleCreateUser">Criar Usuário</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits } from 'vue';

const props = defineProps({
  existingUsers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['create', 'cancel']);

const form = reactive({
  nome: '',
  usuario: '',
  email: '',
  telefone: '',
  role: 'funcionario',
});

const errors = reactive({
  nome: false,
  usuario: false,
  nomeExists: false,
  usuarioExists: false,
  passwordCopied: false,
});

const generatedPassword = ref('');
const passwordCopied = ref(false);

function clearError(field) {
  if (field === 'nome') {
    errors.nome = false;
    errors.nomeExists = false;
  } else if (field === 'usuario') {
    errors.usuario = false;
    errors.usuarioExists = false;
    errors.usuarioShort = false;
    errors.usuarioInvalido = false;
  }
}

function generatePassword() {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  generatedPassword.value = password;
  passwordCopied.value = false;
  errors.passwordCopied = false;
}

function userIsSuperuser() {
  const userData = localStorage.getItem('userData');
  const userRole = JSON.parse(userData).role;
  return userRole === 'superuser';
}

async function copyPassword() {
  if (!generatedPassword.value) {
    console.warn("Nenhuma senha gerada para copiar.");
    return;
  }
  try {
    await navigator.clipboard.writeText(generatedPassword.value);
    passwordCopied.value = true;
    console.log("Senha copiada.");
  } catch (err) {
    console.error("Erro ao copiar senha: ", err);
  }
}

function handleCreateUser() {
  errors.nome = false;
  errors.usuario = false;
  errors.nomeExists = false;
  errors.usuarioExists = false;
  errors.passwordCopied = false;
  errors.usuarioShort = false;
  errors.usuarioInvalido = false;

  let formIsValid = true;

  const nome = form.nome.trim();
  const usuario = form.usuario.trim();

  if (!nome) {
    errors.nome = true;
    formIsValid = false;
  } else {
    const nomeExists = props.existingUsers.some(user => user.nome === nome);
    if (nomeExists) {
      errors.nomeExists = true;
      formIsValid = false;
    }
  }

  if (!usuario) {
    errors.usuario = true;
    formIsValid = false;
  } else {
    const usuarioExists = props.existingUsers.some(user => user.usuario === usuario);
    if (usuarioExists) {
      errors.usuarioExists = true;
      formIsValid = false;
    }
    if (usuario.length < 8) {
      errors.usuarioShort = true;
      formIsValid = false;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(usuario)) {
      errors.usuarioInvalido = true;
      formIsValid = false;
    }
  }

  if (!generatedPassword.value || !passwordCopied.value) {
    errors.passwordCopied = true;
    formIsValid = false;
  }

  if (formIsValid) {
    emit('create', {
      nome: nome,
      usuario: usuario,
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      senha: generatedPassword.value,
      role: form.role,
      bloqueado: false,
    });
  } else {
    console.log("Validação do usuário falhou no modal.");
  }
}

</script>

<style scoped>
.overlay-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.create-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  z-index: 1051;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.create-modal .card-header {
  background-color: #0d6efd !important;
  color: white;
  font-weight: bold;
  border-bottom: none;
  padding: 15px;
}

.create-modal .card-body {
  padding-top: 20px;
  padding: 15px;
  flex-grow: 1;
  overflow-y: auto;
}

.form-control.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linecap='round' d='M3 6l2 2 4-4'/%3e%3c/svg%3e") !important;
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}
</style>
