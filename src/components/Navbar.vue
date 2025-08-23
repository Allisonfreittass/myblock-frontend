<template>
  <nav class="navbar-container">
    <div class="navbar-header">
      <!--<img src="/src/assets/Images/logoName.png" alt="MyBlock Logo" class="logo" /> -->
      <span class="logo-name">MyBlock</span>
    </div>

    <div class="nav-links">
      <router-link to="/dashboard" class="nav-item">
        <span class="material-symbols-outlined">dashboard</span>
        <span class="link-text">Dashboard</span>
      </router-link>
      <router-link to="/properties" class="nav-item">
        <span class="material-symbols-outlined">apartment</span>
        <span class="link-text">Propriedades</span>
      </router-link>
      <router-link to="/properties/create"class="nav-item">
        <span class="material-symbols-outlined">add_business</span>
        <span class="link-text">Cadastrar Imóvel</span>
      </router-link>
      <router-link to="/contracts/create" class="nav-item">
        <span class="material-symbols-outlined">gavel</span>
        <span class="link-text">Contratos</span>
      </router-link>
            <router-link to="/my-contracts" class="nav-item">
        <span class="material-symbols-outlined">contract</span>
        <span class="link-text">Meus Contratos</span>
      </router-link>
    </div>

    <div class="navbar-footer">
        <router-link to="/profile" class="nav-item">
        <span class="material-symbols-outlined">account_circle</span>
        <span class="link-text">Perfil</span>
        </router-link>
    </div>
  </nav>
</template>

<script setup>
</script>

<style scoped>

.navbar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #141d30;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;


  width: 80px;

  transition: width 0.3s ease-in-out;
}

.navbar-container:hover {
  width: 280px;
}

.navbar-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 1.5rem;
}

.logo {
  height: 35px;
  flex-shrink: 0;
  width: 50px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  overflow: hidden; 
}

.nav-item {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 1.5rem;
  text-decoration: none;
  color: #fdfdfd;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.nav-item .material-symbols-outlined {
  font-size: 24px;
  min-width: 24px;
  transition: color 0.2s;
}

.link-text {
  margin-left: 1.5rem;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

.navbar-container:hover .link-text,
.navbar-container:hover .logo-name {
  opacity: 1;
  transition-delay: 0.1s; 
}
.logo-name {
  margin-left: 0.75rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffff;
  opacity: 0; 
  transition: opacity 0.2s ease-in-out;
  white-space: nowrap;
}

.nav-item:hover {
  background-color: #f1f5f9;
}

.navbar-footer {
  margin-top: auto; 
  
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.router-link-exact-active {
  background-color: #e2e8f0;
  color: #1a202c;
}
</style>