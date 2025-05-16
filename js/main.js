let users = JSON.parse(localStorage.getItem('users')) || [
  { login: 'admin', name: 'Админ Иванов', position: 'Администратор', password: 'admin', role: 'admin' },
  { login: 'ivan', name: 'Иван Петров', position: 'Фронтенд разработчик', password: '123', role: 'user' },
  { login: 'maria', name: 'Мария Смирнова', position: 'UI/UX дизайнер', password: '456', role: 'manager' }
];

let tasks = JSON.parse(localStorage.getItem('tasks')) || [
  { id: 1, title: 'Сделать макет сайта', from: 'maria', to: ['ivan'], status: 'ожидает', deadline: '2025-05-20' },
  { id: 2, title: 'Обновить дизайн', from: 'admin', to: ['maria'], status: 'в работе', deadline: '2025-05-22' }
];

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

    if (['manager', 'admin'].includes(currentUser.role)) {
      document.getElementById('add-task').classList.remove('hidden');
    }

    if (currentUser.role === 'admin') {
      document.getElementById('admin-panel').classList.remove('hidden');
      renderAllUsers();
      renderAllTasksForAdmin();
    }

    if (currentUser.role === 'manager') {
      document.getElementById('manager-tasks').classList.remove('hidden');
      renderAllTasksForManager();
    }

    renderUserTasks();
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

  currentUser.login = newLogin;
  currentUser.name = newName;
  currentUser.position = newPosition;
  currentUser.password = newPassword;

  const index = users.findIndex(u => u.login === currentUser.login);
  users[index] = currentUser;
  localStorage.setItem('users', JSON.stringify(users));

  alert('Данные обновлены!');
}

function createTask(e) {
  e.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  const assignees = document.getElementById('assignee').value.split(',').map(login => login.trim());
  const deadline = document.getElementById('deadline').value;

  const task = {
    id: Date.now(),
    title,
    from: currentUser.name,
    to: assignees,
    status: 'ожидает',
    deadline
  };

  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  alert('Задача назначена!');
  e.target.reset();
  renderAllTasksForManager(); // Обновляем список задач
}

function renderUserTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  const filtered = tasks.filter(task => task.to.includes(currentUser.login));

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
      Статус: ${task.status}
      <select onchange="updateTaskStatus(${task.id}, this.value)">
        <option value="ожидает" ${task.status === 'ожидает' ? 'selected' : ''}>Ожидает</option>
        <option value="в работе" ${task.status === 'в работе' ? 'selected' : ''}>В работе</option>
        <option value="выполнено" ${task.status === 'выполнено' ? 'selected' : ''}>Выполнено</option>
      </select>
    `;
    list.appendChild(li);
  });
}

function updateTaskStatus(taskId, newStatus) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderUserTasks();
    if (currentUser.role === 'manager') renderAllTasksForManager();
    if (currentUser.role === 'admin') renderAllTasksForAdmin();
  }
}

function renderAllTasksForAdmin() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${task.title}</strong><br/>
      От: ${task.from}<br/>
      Кому: ${task.to.join(', ')}<br/>
      Срок: ${task.deadline}<br/>
      Статус: ${task.status}
    `;
    list.appendChild(li);
  });
}

function renderAllTasksForManager() {
  const list = document.getElementById('all-tasks');
  list.innerHTML = '';
  const managerUsers = users
    .filter(u => u.role === 'user')
    .map(u => u.login);

  const teamTasks = tasks.filter(task => task.to.some(login => managerUsers.includes(login)));

  if (teamTasks.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Нет задач для команды';
    list.appendChild(li);
    return;
  }

  teamTasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${task.title}</strong><br/>
      От: ${task.from}<br/>
      Кому: ${task.to.join(', ')}<br/>
      Срок: ${task.deadline}<br/>
      Статус: 
      <select onchange="updateTaskStatus(${task.id}, this.value)">
        <option value="ожидает" ${task.status === 'ожидает' ? 'selected' : ''}>Ожидает</option>
        <option value="в работе" ${task.status === 'в работе' ? 'selected' : ''}>В работе</option>
        <option value="выполнено" ${task.status === 'выполнено' ? 'selected' : ''}>Выполнено</option>
      </select>
    `;
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

  if (users.some(u => u.login === login)) {
    alert('Пользователь с таким логином уже существует');
    return;
  }

  users.push({ login, name, position, password, role });
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

function renderUserTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  const filtered = tasks.filter(task => task.to.includes(currentUser.login));

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
      Статус: ${task.status}
      <select onchange="updateTaskStatus(${task.id}, this.value)">
        <option value="ожидает" ${task.status === 'ожидает' ? 'selected' : ''}>Ожидает</option>
        <option value="в работе" ${task.status === 'в работе' ? 'selected' : ''}>В работе</option>
        <option value="выполнено" ${task.status === 'выполнено' ? 'selected' : ''}>Выполнено</option>
      </select>
    `;
    list.appendChild(li);
  });
}