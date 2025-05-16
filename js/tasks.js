// Пользователи
let users = [
  { login: 'admin', name: 'Админ Иванов', position: 'Администратор', password: 'admin', role: 'admin' },
  { login: 'ivan', name: 'Иван Петров', position: 'Фронтенд разработчик', password: '123', role: 'user' },
  { login: 'maria', name: 'Мария Смирнова', position: 'UI/UX дизайнер', password: '456', role: 'manager' }
];

// Задачи
let tasks = [
  { id: 1, title: 'Сделать макет сайта', from: 'maria', to: 'ivan', deadline: '2025-05-20' },
  { id: 2, title: 'Сверстать главную страницу', from: 'maria', to: 'ivan', deadline: '2025-05-25' },
  { id: 3, title: 'Обновить дизайн', from: 'admin', to: 'maria', deadline: '2025-05-22' }
];

// Текущий пользователь
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// При загрузке страницы
window.onload = () => {
  renderUsersToAssignee();

  if (currentUser) {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('user-panel').classList.remove('hidden');

    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('new-login').value = currentUser.login;
    document.getElementById('new-name').value = currentUser.name;
    document.getElementById('new-password').value = currentUser.password;
    document.getElementById('new-position').value = currentUser.position;

    if (currentUser.role === 'manager') {
      document.getElementById('add-task').classList.remove('hidden');
    }

    if (currentUser.role === 'admin') {
      document.getElementById('admin-panel').classList.remove('hidden');
      renderAllUsers();
      renderAllTasksForAdmin();
    }

    renderUserTasks();
  }
};

// Вход
function handleLogin(e) {
  e.preventDefault();
  const login = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const user = users.find(u => u.login === login && u.password === password);

  if (!user) {
    alert('Неверный логин или пароль');
    return;
  }

  localStorage.setItem('currentUser', JSON.stringify(user));
  window.location.reload();
}

// Выход
function logout() {
  localStorage.removeItem('currentUser');
  window.location.reload();
}

// Обновление профиля
function updateProfile(e) {
  e.preventDefault();
  const newLogin = document.getElementById('new-login').value.trim();
  const newName = document.getElementById('new-name').value.trim();
  const newPosition = document.getElementById('new-position').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();

  currentUser.login = newLogin;
  currentUser.name = newName;
  currentUser.position = newPosition;
  currentUser.password = newPassword;

  const userIndex = users.findIndex(u => u.login === currentUser.login);
  users[userIndex] = currentUser;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  alert('Данные обновлены!');
}

// Добавление задачи
function createTask(e) {
  e.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  const assignee = document.getElementById('assignee').value.trim();
  const deadline = document.getElementById('deadline').value;

  const task = {
    id: Date.now(),
    title,
    from: currentUser.name,
    to: assignee,
    deadline
  };

  tasks.push(task);
  renderUserTasks();
  alert('Задача назначена!');
}

// Отображение своих задач
function renderUserTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  const filtered = tasks.filter(t => t.to === currentUser.name);

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Нет активных задач';
    list.appendChild(li);
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${task.title}</strong><br/>
      От: ${task.from}<br/>
      Срок: ${task.deadline}<br/>
    `;
    list.appendChild(li);
  });
}

// Для админа: отобразить всех пользователей
function renderAllUsers() {
  const list = document.getElementById('user-list');
  list.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${user.name} — ${user.position} (<em>${user.role}</em>)<br/>
      Логин: ${user.login}, Пароль: ${user.password}
    `;
    list.appendChild(li);
  });
}

// Для админа: все задачи
function renderAllTasksForAdmin() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `${task.title} — кому: ${task.to}, до: ${task.deadline}`;
    list.appendChild(li);
  });
}

// Для формы: список доступных исполнителей
function renderUsersToAssignee() {
  const datalist = document.getElementById('users');
  datalist.innerHTML = '';
  users.forEach(user => {
    if (user.role !== 'manager') return;

    const option = document.createElement('option');
    option.value = user.login;
    datalist.appendChild(option);
  });
}