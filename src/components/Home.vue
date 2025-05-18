<template>
  <div class="fullscreen-background">
    <div class="form-wrapper">
      <div class="form-left">
        <form @submit.prevent="login" class="form-box">
          <h1 class="h3 mb-3 fw-normal">Entrar</h1>
          <div v-if="erro" class="alert alert-danger mb-3">
            {{ erro }}
          </div>
          <div class="form-floating mb-3">
            <input type="text" class="form-control" id="floatingInput" placeholder="Seu nome de usuário"
              v-model="usuario" required>
            <label for="floatingInput">Usuário</label>
          </div>
          <div class="form-floating mb-3">
            <input type="password" class="form-control" id="floatingPassword" placeholder="Password" v-model="senha"
              required>
            <label for="floatingPassword">Senha</label>
          </div>

          <button class="w-100 btn btn-lg btn-primary" type="submit">Entrar</button>
        </form>
      </div>
      <div class="form-right">
        <img src="../../LOGO_UNIFOR_3_page-0001-removebg-preview.png" alt="Logo Unifor" class="logo-img" />
      </div>
    </div>

    <div v-if="showChangePasswordOverlay" class="overlay-background">
      <div class="change-password-modal card">
        <div class="card-header bg-primary text-white">
          Mudar Senha (Primeiro Login)
        </div>
        <div class="card-body">
          <p>É seu primeiro login. Por favor, mude sua senha para continuar.</p>

          <div v-if="passwordChangeErrors.apiError" class="alert alert-danger mb-3">
            {{ passwordChangeErrors.apiError }}
          </div>

          <div class="mb-3">
            <label for="currentPassword" class="form-label">Senha Atual:</label>
            <input type="password" id="currentPassword" class="form-control"
              :class="{ 'is-invalid': passwordChangeErrors.currentPassword }"
              v-model="passwordChangeForm.currentPassword" @input="clearPasswordError('currentPassword')" required>
            <div v-if="passwordChangeErrors.currentPassword" class="invalid-feedback">Senha atual é obrigatória.</div>
          </div>

          <div class="mb-3">
            <label for="newPassword" class="form-label">Nova Senha:</label>
            <input type="password" id="newPassword" class="form-control"
              :class="{ 'is-invalid': passwordChangeErrors.newPassword || passwordChangeErrors.passwordFormat || passwordChangeErrors.passwordMatch }"
              v-model="passwordChangeForm.newPassword" @input="clearPasswordError('newPassword')" required>
            <div v-if="passwordChangeErrors.newPassword" class="invalid-feedback">Nova senha é obrigatória.</div>
            <div v-else-if="passwordChangeErrors.passwordFormat" class="invalid-feedback">A senha deve ter pelo menos 8
              caracteres, incluindo letra maiúscula, minúscula e número.</div>
            <div v-else-if="passwordChangeErrors.passwordMatch" class="invalid-feedback">Nova senha e confirmação não
              coincidem.</div>
          </div>

          <div class="mb-3">
            <label for="confirmNewPassword" class="form-label">Confirmar Nova Senha:</label>
            <input type="password" id="confirmNewPassword" class="form-control"
              :class="{ 'is-invalid': passwordChangeErrors.confirmNewPassword || passwordChangeErrors.passwordMatch }"
              v-model="passwordChangeForm.confirmNewPassword" @input="clearPasswordError('confirmNewPassword')"
              required>
            <div v-if="passwordChangeErrors.confirmNewPassword" class="invalid-feedback">Confirmação da nova senha é
              obrigatória.</div>
            <div v-else-if="passwordChangeErrors.passwordMatch" class="invalid-feedback">Nova senha e confirmação não
              coincidem.</div>
          </div>

          <div class="d-flex justify-content-end">
            <button class="btn btn-secondary me-2" type="button" @click="cancelPasswordChange">Cancelar</button>
            <button class="btn btn-primary" type="button" @click="changePassword">Salvar Nova Senha</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import api from '../services/api'
import { authLogin } from '../services/authService'

const router = useRouter()
const usuario = ref('')
const senha = ref('')
const erro = ref('')

const showChangePasswordOverlay = ref(false)
const passwordChangeForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})
const passwordChangeErrors = reactive({
  currentPassword: false,
  newPassword: false,
  confirmNewPassword: false,
  passwordFormat: false,
  passwordMatch: false,
  apiError: null,
})

function isPasswordComplex(password) {
  if (password.length < 8) return false
  if (!/[A-Z]/.test(password)) return false
  if (!/[a-z]/.test(password)) return false
  if (!/[0-9]/.test(password)) return false
  return true
}

function clearPasswordError(field) {
  passwordChangeErrors[field] = false
  if (field === 'newPassword' || field === 'confirmNewPassword') {
    passwordChangeErrors.passwordFormat = false
    passwordChangeErrors.passwordMatch = false
  }
  passwordChangeErrors.apiError = null
}

async function login() {
  erro.value = ''

  if (!usuario.value || !senha.value) {
    erro.value = 'Por favor, preencha todos os campos'
    return
  }

  try {
    const res = await authLogin(usuario.value, senha.value)

    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token)

      if (res.data.user) {
        localStorage.setItem('userData', JSON.stringify(res.data.user))

        if (res.data.user.firstLogin === true) {
          passwordChangeForm.currentPassword = senha.value
          showChangePasswordModal()
        } else {
          router.push('/map')
        }
      } else {
        erro.value = 'Resposta inválida do servidor: dados do usuário faltando.'
      }
    } else {
      erro.value = 'Resposta inválida do servidor: token faltando.'
    }
  } catch (err) {
    erro.value = err.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.'
  }
}

function showChangePasswordModal() {
  passwordChangeForm.newPassword = ''
  passwordChangeForm.confirmNewPassword = ''
  passwordChangeErrors.currentPassword = false
  passwordChangeErrors.newPassword = false
  passwordChangeErrors.confirmNewPassword = false
  passwordChangeErrors.passwordFormat = false
  passwordChangeErrors.passwordMatch = false
  passwordChangeErrors.apiError = null
  showChangePasswordOverlay.value = true
}

function cancelPasswordChange() {
  showChangePasswordOverlay.value = false
}

async function changePassword() {
  passwordChangeErrors.currentPassword = false
  passwordChangeErrors.newPassword = false
  passwordChangeErrors.confirmNewPassword = false
  passwordChangeErrors.passwordFormat = false
  passwordChangeErrors.passwordMatch = false
  passwordChangeErrors.apiError = null

  let formIsValid = true

  if (!passwordChangeForm.currentPassword) {
    passwordChangeErrors.currentPassword = true
    formIsValid = false
  }
  if (!passwordChangeForm.newPassword) {
    passwordChangeErrors.newPassword = true
    formIsValid = false
  }
  if (!passwordChangeForm.confirmNewPassword) {
    passwordChangeErrors.confirmNewPassword = true
    formIsValid = false
  }

  if (passwordChangeForm.newPassword && passwordChangeForm.confirmNewPassword) {
    if (passwordChangeForm.newPassword !== passwordChangeForm.confirmNewPassword) {
      passwordChangeErrors.passwordMatch = true
      formIsValid = false
    }
    if (!isPasswordComplex(passwordChangeForm.newPassword)) {
      passwordChangeErrors.passwordFormat = true
      formIsValid = false
    }
    if (passwordChangeForm.newPassword === passwordChangeForm.currentPassword) {
      passwordChangeErrors.newPassword = true
      passwordChangeErrors.passwordFormat = true
      formIsValid = false
    }
  }

  if (!formIsValid) return

  try {
    const res = await api.post('/api/users/change-password', {
      oldPassword: passwordChangeForm.currentPassword,
      newPassword: passwordChangeForm.newPassword,
    })

    console.log(res.data)

    if (res.data && res.data.success) {
      showChangePasswordOverlay.value = false
      senha.value = passwordChangeForm.newPassword
      passwordChangeForm.currentPassword = ''
      login()
    } else {
      passwordChangeErrors.apiError = res.data?.error || 'Erro ao mudar a senha.'
    }
  } catch (err) {
    console.log(err)
    passwordChangeErrors.apiError = err.response?.data?.error || 'Erro ao mudar a senha.'
  }
}
</script>
<style>
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

.change-password-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 450px;
  width: 90%;
  z-index: 1051;
  overflow: hidden;
}

.change-password-modal .card-header {
  background-color: #0d6efd;
  color: white;
  font-weight: bold;
  border-bottom: none;
}

.change-password-modal .card-body {
  padding: 20px;
  overflow-y: auto;
  max-height: 80vh;
}


.fullscreen-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../../imagem-aeria.png');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-wrapper {
  background-color: rgba(245, 245, 245, 0.95);
  display: flex;
  flex-direction: row;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 90%;
  overflow: hidden;
}

.form-left {
  flex: 1;
  padding: 2rem;
  text-align: center;
}

.form-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 2px solid #ccc;
  padding: 2rem;
}

.logo-img {
  width: 350px;
  height: auto;
  object-fit: contain;
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
