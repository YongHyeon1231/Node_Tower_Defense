import { setLocalStorage } from './LocalStorage.js';

document.getElementById('login').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  /*
      로그인 API 호출 후 로그인 성공 시 index.html로 이동시켜주세요!
      이 때, 엑세스 토큰은 어딘가에 저장을 해놔야겠죠?!
    */
  try {
    // 서버로 로그인 요청을 보내주자
    const response = await fetch('/signIn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      setLocalStorage('token', data.token);
    } else {
      throw new Error(data.errorMessage || '로그인 실패');
    }

    popUpAlert(data.message);
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {}
});

document.getElementById('back').addEventListener('click', () => {
  window.location.href = 'index.html';
});

const modal = document.querySelector('.modal');
const popUpAlert = (message) => {
  const messageElement = document.querySelector('.message');
  messageElement.textContent = message;
  modal.classList.add('show');
  setTimeout(() => {
    modal.classList.remove('show');
  }, 2000);
};
