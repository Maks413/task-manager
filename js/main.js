let users = JSON.parse(localStorage.getItem('users')) || [
  { login: 'admin', name: 'Администратор', password: 'admin', role: 'admin' },
  { login: 'boss', name: 'Босс Боссов', password: 'boss', role: 'chief' },
  { login: 'ivan', name: 'Иван Иванов', password: '123', role: 'employee' }
];

let currentUser = null;

window.onload = () => {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showPanel();
  }
};

function handleLogin(e) {
  e.preventDefault();
  const login = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();

  const user = users.find(u => u.login === login && u.password === pass);

  if (!user) {
    alert('Неверный логин или пароль');
    return;
  }

  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  showPanel();
}

function showPanel() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('user-panel').classList.remove('hidden');

  document.getElementById('user-name').textContent = currentUser.name;
  document.getElementById('new-name').value = currentUser.name;
  document.getElementById('new-position').value = currentUser.position || '';
  document.getElementById('new-login').value = currentUser.login;
  document.getElementById('new-password').value = currentUser.password;

  if (currentUser.role === 'admin') {
    document.getElementById('admin-panel').classList.remove('hidden');
    renderAllUsers();
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.reload();
}

function updateProfile(e) {
  e.preventDefault();
  const newName = document.getElementById('new-name').value.trim();
  const newPosition = document.getElementById('new-position').value.trim();
  const newLogin = document.getElementById('new-login').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();

  // Обновляем текущего пользователя
  currentUser.name = newName;
  currentUser.position = newPosition;
  currentUser.login = newLogin;
  currentUser.password = newPassword;

  // Обновляем в массиве
  const index = users.findIndex(u => u.login === currentUser.login);
  users[index] = currentUser;
  localStorage.setItem('users', JSON.stringify(users));

  alert('Профиль обновлён!');
}

function addUser(e) {
  e.preventDefault();
  const login = document.getElementById('user-login').value.trim();
  const name = document.getElementById('user-name').value.trim();
  const position = document.getElementById('user-position').value.trim();
  const password = document.getElementById('user-password').value.trim();
  const role = document.getElementById('user-role').value.trim();

  if (!login || !name || !password || !role) {
    alert('Заполните все поля');
    return;
  }

  // Проверка на уникальность логина
  if (users.some(u => u.login === login)) {
    alert('Пользователь с таким логином уже существует');
    return;
  }

  // Добавляем нового пользователя
  const newUser = { login, name, position, password, role };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  e.target.reset();
  alert('✅ Новый пользователь добавлен');
  renderAllUsers();
}

function renderAllUsers() {
  const list = document.getElementById('user-list');
  list.innerHTML = '';

  users.forEach((user, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${user.name}</strong><br/>
      Логин: ${user.login}<br/>
      Пароль: ${user.password}<br/>
      Роль: ${user.role}<br/>
      <hr/>
    `;
    list.appendChild(li);
  });
}