<template>
  <div class="not-found">
    <h1>404</h1>
    <p>未找到页面</p>
    <button @click="back">返回</button>
  </div>
</template>

<script setup>
const back = () => {
  history.length > 1 ? history.back() : location.href = '#'
}
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background: #f8f8f8;
  text-align: center;
  box-sizing: border-box;
}

h1 {
  font-size: 6rem;
  margin: 0;
  color: #ff4d4f;
}

p {
  font-size: 1.5rem;
  margin: 1.5rem 0;
  color: #666;
}

button {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  background-color: #409eff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #66b1ff;
}

@media (max-width: 600px) {
  h1 {
    font-size: 4rem;
  }
  p {
    font-size: 1.2rem;
  }
  button {
    font-size: 0.9rem;
    padding: 0.6rem 1.5rem;
  }
}
</style>
