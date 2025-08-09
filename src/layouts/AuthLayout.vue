<template>
  <div class="auth-wrapper">
    <div class="auth-panel">
        <div class="auth-inner">
            <slot></slot>
        </div>
    </div>
    <div class="background-area">
      <img src="../assets/Images/background.png" alt="Background" />
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.auth-panel {
  width: 550px;
  flex-shrink: 0;
  background-color: #1a202c;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.auth-inner {
  width: 100%;
  max-width: 360px;
}

.background-area {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
}

.background-area img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

@media (max-width: 768px) {
  .auth-wrapper {
    flex-direction: column;
  }
  
  .auth-panel {
    width: 100%;
    height: 100vh;
  }
  
  .background-area {
    display: none;
  }
}
</style>