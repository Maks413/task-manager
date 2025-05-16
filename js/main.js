let users = JSON.parse(localStorage.getItem('users')) || [
  { login: 'admin', name: 'Админ Иванов', position: 'Администратор', password: 'admin', role: 'admin' },
  { login: 'ivan', name: 'Иван Петров', position: 'Фронтенд разработчик', password: '123', role: 'user' },
  { login: 'maria', name: 'Мария Смирнова', position: 'UI/UX дизайнер', password: '456', role: 'manager' }
];

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

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

function handleLogin(e) {
  e.preventDefault();
  const login = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const user = users.find(u => u.login === login && u.password === password);

  if (!user) {
    alert('Неверный логин или пароль');
    return;
  }

  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  window.location.reload();
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.reload();
}

function updateProfile(e) {
  e.preventDefault();
  const newLogin = document.getElementById('new-login').value.trim();
  const newName = document.getElementById('new-name').value.trim();
  const newPosition = document.getElementById('new-position').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();

  // Обновляем текущего пользователя
  currentUser.login = newLogin;
  currentUser.name = newName;
  currentUser.position = newPosition;
  currentUser.password = newPassword;

  // Обновляем в списке пользователей
  const index = users.findIndex(u => u.login === currentUser.login);
  users[index] = currentUser;
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  alert('Данные обновлены!');
}

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
  localStorage.setItem('tasks', JSON.stringify(tasks));

  renderUserTasks();
  alert('Задача создана!');
  e.target.reset();
}

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
      Срок: ${task.deadline}
    `;
    list.appendChild(li);
  });
}

function renderAllTasksForAdmin() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `${task.title} — кому: ${task.to}, до: ${task.deadline}`;
    list.appendChild(li);
  });
}

function addUser(e) {
  e.preventDefault();
  const login = document.getElementById('user-login').value.trim();
  const name = document.getElementById('user-name').value.trim();
  const position = document.getElementById('user-position').value.trim();
  const password = document.getElementById('user-password').value.trim();
  const role = document.getElementById('user-role').value;

  const exists = users.some(u => u.login === login);
  if (exists) {
    alert('Пользователь с таким логином уже существует');
    return;
  }

  const newUser = { login, name, position, password, role };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  alert('Пользователь добавлен!');
  renderUsersToAssignee();
  renderAllUsers();
}

function renderUsersToAssignee() {
  const datalist = document.getElementById('users');
  datalist.innerHTML = '';
  users.forEach(user => {
    if (user.role !== 'admin' && user.role !== 'manager') return;

    const option = document.createElement('option');
    option.value = user.login;
    datalist.appendChild(option);
  });
}

function renderAllUsers() {
  const list = document.getElementById('user-list');
  list.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${user.name}</strong><br/>
      Логин: ${user.login}<br/>
      Пароль: ${user.password}<br/>
      Должность: ${user.position}<br/>
      Роль: ${user.role}
    `;
    list.appendChild(li);
  });
}