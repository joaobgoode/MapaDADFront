<template>
  <div class="admin-container">
    <AdminHeader @logout="handleLogout" @goToMap="goToMap" />
    <div class="content-container">
      <AdminSidebar :userCount="users.value ? users.value.length : 0"
        :spaceCount="spaces.value ? spaces.value.length : 0" :currentView="view" @switchView="switchView" />
      <div class="main-content">
        <AdminUserManagement v-if="view == 'users'" :users="users.value" @showCreateUserModal="showCreateUserModal"
          @deleteUser="showDeleteConfirm('usuário', $event.nome, $event.id)" @blockUser="blockUser($event.id)" />
        <AdminSpaceManagement v-else-if="view == 'spaces'" :spaces="spaces.value"
          @showCreateSpaceModal="showCreateSpaceModal" @deleteSpace="showDeleteConfirm('espaço', $event.nome)"
          @toggleActive="toggleActive($event.nome)" />
      </div>
    </div>
    <DeleteConfirmationModal v-if="showDeleteConfirmOverlay" :itemType="itemToDeleteType" :itemName="itemToDeleteName"
      :adminUsername="currentAdminUsername" @confirm="confirmDelete" @cancel="cancelDelete" />
    <CreateSpaceModal v-if="showCreateSpaceOverlay" :existingSpaces="spaces.value || []" @create="createSpace"
      @cancel="cancelCreateSpace" />
    <CreateUserModal v-if="showCreateUserOverlay" :existingUsers="users.value || []" @create="createUser"
      @cancel="cancelCreateUser" />
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeMount, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api.js'
import WebSocketService from "../../plugins/websocket.js"

// Import the components
import AdminHeader from './AdminHeader.vue'
import AdminSidebar from './AdminSidebar.vue'
import AdminUserManagement from './AdminUserManagement.vue'
import AdminSpaceManagement from './AdminSpaceManagement.vue'
import DeleteConfirmationModal from './modals/DeleteConfirmationModal.vue'
import CreateSpaceModal from './modals/CreateSpaceModal.vue'
import CreateUserModal from './modals/CreateUserModal.vue'

// --- Core State ---
const users = reactive({})
const spaces = reactive({})
const view = ref('users')
const currentAdminUsername = ref('')

// --- State for Modals ---
const showDeleteConfirmOverlay = ref(false)
const itemToDeleteType = ref('')
const itemToDeleteName = ref('')
const itemToDeleteId = ref('')
const showCreateSpaceOverlay = ref(false)
const showCreateUserOverlay = ref(false)
// --- End State for Modals ---


// --- Reusable functions to fetch users/spaces ---
async function fetchUsers() {
  try {
    const users_data = await api.get("/api/users")
    if (users_data && users_data.data) {
      users.value = users_data.data
    } else {
      console.error("Erro ao buscar usuários:", users_data)
      users.value = []
    }
  } catch (error) {
    console.error("Erro na requisição ao buscar usuários:", error)
    users.value = []
  }
}

async function fetchEspacos() {
  try {
    const spaces_data = await api.get("/api/spaces")
    if (spaces_data && spaces_data.data) {
      spaces.value = spaces_data.data
    } else {
      console.error("Erro ao buscar espaços:", spaces_data)
      spaces.value = []
    }
  } catch (error) {
    console.error("Erro na requisição ao buscar espaços:", error)
    spaces.value = []
  }
}

onMounted(() => {
  const wsUrl = import.meta.env.VITE_WS_URL;
  WebSocketService.connect(wsUrl);
  if (WebSocketService.socket) {
    WebSocketService.setMessageHandler(handleWebSocketMessage);
  }
})

onBeforeUnmount(() => {
  WebSocketService.disconnect();
})

function handleWebSocketMessage(message) {
  if (message.type === 'espacoDelete') {
    fetchEspacos()
  }
  else if (message.type === 'espacoUpdate') {
    for (const space of spaces.value) {
      if (space._id === message.data._id) {
        space.active = message.data.active
        break
      }
    }
    return
  }
  else if (message.type === 'espacoCreate') {
    fetchEspacos()
  }
  else if (message.type === 'userBlocked') {
    fetchUsers()
    return
  }
  else if (message.type === 'userDelete') {
    fetchUsers()
    const deletedUserID = message.data.id
    console.log("Usuário deletado:", deletedUserID)
    console.log("Usuario a deletar:", itemToDeleteId.value)
    if (itemToDeleteId.value == deletedUserID) {
      cancelDelete()
    }
  }
  else if (message.type === 'userCreate') {
    users.value.push(message.data)
  }
}

onBeforeMount(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push("/")
    return
  }
  const userData = localStorage.getItem('userData')
  if (!userData) {
    router.push("/")
    return
  }
  try {
    const parsedUserData = JSON.parse(userData)
    if (parsedUserData.role !== 'admin' && parsedUserData.role !== 'superuser') {
      router.push("/map")
      return
    }
    currentAdminUsername.value = parsedUserData.usuario
    await fetchUsers()
    await fetchEspacos()
  } catch (error) {
    console.error("Erro na inicialização:", error)
    router.push("/")
  }
})

const router = useRouter()

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userData')
  router.push("/")
}

function goToMap() {
  router.push("/map")
}

// --- View Switching ---
function switchView(newview) {
  view.value = newview
}
// --- End View Switching ---

// --- Methods for Delete Overlay (Called by DeleteConfirmationModal) ---
function showDeleteConfirm(type, name, id) {
  itemToDeleteType.value = type
  itemToDeleteName.value = name
  itemToDeleteId.value = id
  showDeleteConfirmOverlay.value = true
}

async function confirmDelete(confirmationUsernameInput) {
  if (confirmationUsernameInput !== currentAdminUsername.value) {
    return;
  }
  if (itemToDeleteType.value === 'usuário') {
    try {
      const id = itemToDeleteId.value
      const deleteUrl = `/api/users/${id}`;
      const response = await api.delete(deleteUrl);
      if (response.status >= 200 && response.status < 300) {
        console.log("Usuário deletado com sucesso:", itemToDeleteName.value);
        //await fetchUsers();
        cancelDelete();
      } else {
        console.error("Erro ao deletar usuário (Status:", response.status, ")", response.data);
      }
    } catch (error) {
      console.error("Erro na requisição de exclusão:", error);
    }
  } else if (itemToDeleteType.value === 'espaço') {
    try {
      const deleteUrl = `/api/spaces/${encodeURIComponent(itemToDeleteName.value)}`;
      const response = await api.delete(deleteUrl);
      if (response.status >= 200 && response.status < 300) {
        await fetchEspacos();
        cancelDelete();
      } else {
        console.error("Erro ao deletar espaço (Status:", response.status, ")", response.data);
      }
    } catch (error) {
      console.error("Erro na requisição de exclusão:", error);
    }
  }
}

function cancelDelete() {
  showDeleteConfirmOverlay.value = false
  itemToDeleteType.value = ''
  itemToDeleteName.value = ''
}
// --- End Methods for Delete Overlay ---


// --- Methods for Create Space Overlay (Called by CreateSpaceModal) ---
function showCreateSpaceModal() {
  showCreateSpaceOverlay.value = true
}

function cancelCreateSpace() {
  showCreateSpaceOverlay.value = false
}

async function createSpace(newSpaceName) {
  const nameToCreate = newSpaceName.trim()
  if (!nameToCreate) {
    return;
  }
  const isDuplicate = spaces.value.some(space => space.name === nameToCreate)
  if (!isDuplicate) {
    try {
      const response = await api.post("/api/spaces", { name: nameToCreate });
      if (response.status === 201) {
        cancelCreateSpace();
      } else {
        console.error("Erro ao criar espaço:", response.data);
      }
    } catch (apiError) {
      console.error("Erro na requisição de criação de espaço:", apiError);
    }
  }
}

// --- Methods for Space Management (Called by AdminSpaceManagement) ---
async function toggleActive(nome) {
  console.log("Tentando alterar status do espaço:", nome)
  const url = `/api/spaces/toggle/`
  const toChange = { name: nome }
  try {
    const changed = await api.put(url, toChange)
    if (changed && changed.data) {
      fetchEspacos()
    } else {
      console.error("Erro ao alterar status do espaço:", changed)
    }
  } catch (apiError) {
    console.error("Erro na requisição de alteração de status:", apiError);
  }
}
// --- End Methods for Space Management ---

// --- Methods for Create User Overlay (Called by CreateUserModal) ---
function showCreateUserModal() {
  showCreateUserOverlay.value = true
}


function cancelCreateUser() {
  showCreateUserOverlay.value = false
}


async function createUser(userData) {
  try {
    const response = await api.post("/api/users", userData);
    if (response.status === 201) {
      console.log("Usuário criado com sucesso:", response.data);
      await fetchUsers();
      cancelCreateUser();
    } else {
      console.error("Erro ao criar usuário:", response.data);
      cancelCreateUser();
    }
  } catch (apiError) {
    console.error("Erro na requisição de criação de usuário:", apiError);
    cancelCreateUser();
  }
}


// --- Methods for User Management (Called by AdminUserManagement) ---

async function blockUser(id) {
  console.log("Tentando bloquear/desbloquear usuário:", id)
  const url = `/api/users/block/${id}`
  try {
    const blocked = await api.put(url)
    if (blocked && blocked.data) {
      fetchUsers()
    } else {
      console.error("Erro ao bloquear/desbloquear usuário:", blocked)
    }
  } catch (apiError) {
    console.error("Erro na requisição de bloqueio:", apiError);
  }
}
</script>


<style scoped>
.admin-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  overflow: hidden;
}

.content-container {
  display: flex;
  flex: 1;
  padding: 20px;
  margin-top: 70px;
}

.sidebar {
  width: 20%;
  padding-right: 15px;
  flex-shrink: 0;
}

.main-content {
  width: 80%;
  padding-left: 15px;
  overflow-y: auto;
}

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

@media (max-width: 992px) {
  .content-container {
    flex-direction: column;
  }

  .sidebar,
  .main-content {
    width: 100%;
    padding: 0;
    margin-bottom: 20px;
  }
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-body {
  flex-grow: 1;
  overflow-y: auto;
}
</style>
