let users = JSON.parse(localStorage.getItem('users')) || [
  { login: 'admin', name: 'Админ Иванов', password: 'admin', role: 'admin' },
  { login: 'boss', name: 'Алексей Петров', password: 'boss', role: 'chief' },
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

  if (!newName || !newLogin || !newPassword) {
    alert('Заполните все поля');
    return;
  }

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
  e.preventDefault(); // ❗ не даём форме перезагрузиться

  const loginInput = document.getElementById('user-login');
  const nameInput = document.getElementById('user-name');
  const positionInput = document.getElementById('user-position');
  const passwordInput = document.getElementById('user-password');
  const roleSelect = document.getElementById('user-role');

  // Получаем значения с проверкой на null/undefined
  const login = loginInput ? loginInput.value.trim() : '';
  const name = nameInput ? nameInput.value.trim() : '';
  const position = positionInput ? positionInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';
  const role = roleSelect ? roleSelect.value.trim() : '';

  // Проверяем, что все поля заполнены
  if (!login || !name || !password || !role) {
    alert('Заполните все поля формы');
    return;
  }

  // Проверяем, есть ли такой логин уже
  if (users.some(u => u.login === login)) {
    alert('Пользователь с таким логином уже существует');
    return;
  }

  // Создаём нового пользователя
  const newUser = {
    login,
    name,
    position,
    password,
    role
  };

  // Добавляем в список
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // Очищаем форму
  e.target.reset();

  // Обновляем список пользователей
  renderAllUsers();

  alert('✅ Пользователь успешно зарегистрирован!');
}

function renderAllUsers() {
  const list = document.getElementById('user-list');
  if (!list) return;

  list.innerHTML = '';

  users.forEach((user, index) => {
    const li = document.createElement('li');
    li.textContent = `${user.name} (${user.login}) — ${user.role}`;
    list.appendChild(li);
  });
}