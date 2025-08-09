<template>
    <div class="default-layout">
        <aside class="sidebar">
            <div class="sidebar-header">
                <img src="../assets//Images/logoName.png" alt="MyBlock Logo" class="logo">
            </div>
            <nav class="sidebar-nav">
                <router-link to="/dashboard" class="nav-item">
                    <span>Dashboard</span>
                </router-link>
                <router-link to="/properties" class="nav-item">
                    <span>Propriedades</span>
                </router-link>
                <router-link to="/contracts" class="nav-item">
                    <span>Contratos</span>
                </router-link>
            </nav>
        </aside>

        <main class="content-area">
            <slot></slot>
        </main>
    </div>
</template>

<style scoped>
.default-layout {
  display: flex;
  background-color: #f7fafc;
}

.sidebar {
  width: 260px;
  min-height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem;
  flex-shrink: 0;
}

.sidebar-header {
  margin-bottom: 2rem;
}

.logo {
  height: 35px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: #f1f5f9;
}

/* Estilo para a rota ativa */
.router-link-exact-active {
  background-color: #e2e8f0;
  color: #1a202c;
}

.content-area {
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto; /* Adiciona scroll se o conteúdo for grande */
}
</style>