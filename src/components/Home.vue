<template>
  <div class="fullscreen-background">
    <div class="form-wrapper">
      <div class="form-left">
        <form @submit.prevent="login" class="form-box">
          <h1 class="h3 mb-3 fw-normal">Entrar</h1>

          <div class="form-floating mb-3">
            <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
            <label for="floatingInput">Usuário</label>
          </div>
          <div class="form-floating mb-3">
            <input type="password" class="form-control" id="floatingPassword" placeholder="Password">
            <label for="floatingPassword">Senha</label>
          </div>

          <button class="w-100 btn btn-lg btn-primary" type="submit">Entrar</button>
        </form>
      </div>

      <div class="form-right">
        <img src="../assets/imagens/LOGO_UNIFOR_3_page-0001-removebg-preview.png" alt="Logo Unifor" class="logo-img" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter();

function login() {
  router.push('/map')
}
</script>

<style>
.fullscreen-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../assets/imagens/parque desportivo unifor 800 ares soares.png');
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
</style>
