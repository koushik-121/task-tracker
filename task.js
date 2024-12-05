document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('listContainer');
    const taskContainer = document.getElementById('taskContainer');
    const taskHeader = document.getElementById('taskHeader');
    const newTaskInput = document.getElementById('newTaskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const addListBtn = document.getElementById('addListBtn');
    const createListBtn = document.getElementById('createListBtn');
    const newListInput = document.getElementById('newListInput');
    const editListBtn = document.getElementById('editListBtn');
    const newListContainer = document.querySelector('.new-list-container');
    const deleteListBtn = document.getElementById('deleteListBtn');
    const logOutBtn = document.getElementById('logOutBtn');

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        alert('User not logged in.');
        window.location.href = 'login.html';
        return;
    }

    let userLists = JSON.parse(localStorage.getItem(`lists_${currentUser.email}`)) || [];
    let selectedListId = localStorage.getItem(`selectedListId_${currentUser.email}`) || null;

    // Save to local storage
    function save() {
        localStorage.setItem(`lists_${currentUser.email}`, JSON.stringify(userLists));
        localStorage.setItem(`selectedListId_${currentUser.email}`, selectedListId);
    }

    // Render the lists
    function renderLists() {
        listContainer.innerHTML = '';
        userLists.forEach((list, index) => {
            const li = document.createElement('li');
            li.textContent = list.name;
            li.classList.toggle('active', index == selectedListId);
            li.addEventListener('click', () => {
                selectedListId = index;
                save();
                renderTasks();
                renderLists();
            });
            listContainer.appendChild(li);
        });
    }

    // Render the tasks
    function renderTasks() {
        if (selectedListId !== null) {
            const selectedList = userLists[selectedListId];
            taskHeader.textContent = selectedList.name;
            taskContainer.innerHTML = '';
            selectedList.tasks.forEach((task, taskIndex) => {
                const li = document.createElement('li');
                li.classList.toggle('completed', task.completed);
                li.classList.toggle('gold-bg', task.starred);
                li.innerHTML = `
                    <span>${task.name}</span>
                    <span class="date">Entered: ${task.enteredDate} | Due: ${task.dueDate}</span>
                    <div>
                        <button class="star-btn ${task.starred ? 'active' : ''}">✨</button>
                        <button class="edit-btn">✎</button>
                        <button class="delete-btn">🗑</button>
                    </div>
                `;
                li.addEventListener('dblclick', () => {
                    task.completed = !task.completed;
                    save();
                    renderTasks();
                });
                li.querySelector('.star-btn').addEventListener('click', () => {
                    task.starred = !task.starred;
                    save();
                    renderTasks();
                });
                li.querySelector('.edit-btn').addEventListener('click', () => {
                    const newName = prompt('Edit task name', task.name);
                    const newDueDate = prompt('Edit due date (YYYY-MM-DD)', task.dueDate);
                    if (newName) {
                        task.name = newName;
                        if (newDueDate) {
                            task.dueDate = newDueDate;
                        }
                        save();
                        renderTasks();
                    }
                });
                li.querySelector('.delete-btn').addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete the task?`)) {
                        selectedList.tasks.splice(taskIndex, 1);
                        save();
                        renderTasks();
                    }
                });
                taskContainer.appendChild(li);
            });
        } else {
            taskHeader.textContent = 'TASKS';
            taskContainer.innerHTML = '';
        }
    }

    // Add new list
    addListBtn.addEventListener('click', () => {
        newListContainer.style.display = 'flex';
        newListInput.focus();
    });

    createListBtn.addEventListener('click', () => {
        const listName = newListInput.value.trim();
        if (listName) {
            userLists.push({ name: listName, tasks: [] });
            selectedListId = userLists.length - 1;
            newListInput.value = '';
            newListContainer.style.display = 'none';
            save();
            renderLists();
            renderTasks();
        }
    });

    // Add new task
    addTaskBtn.addEventListener('click', () => {
        if (selectedListId !== null) {
            const taskName = newTaskInput.value.trim();
            const dueDate = dueDateInput.value;
            const enteredDate = new Date().toISOString().split('T')[0]; // Current date
            if (taskName) {
                userLists[selectedListId].tasks.push({ name: taskName, enteredDate, dueDate, completed: false, starred: false });
                newTaskInput.value = '';
                dueDateInput.value = '';
                save();
                renderTasks();
            }
        } else {
            alert('Please select a list first.');
        }
    });

    // Edit list name
    editListBtn.addEventListener('click', () => {
        if (selectedListId !== null) {
            const newName = prompt('Edit list name', userLists[selectedListId].name);
            if (newName) {
                userLists[selectedListId].name = newName;
                save();
                renderLists();
                renderTasks();
            }
        } else {
            alert('Please select a list first.');
        }
    });

    // Delete selected list
    deleteListBtn.addEventListener('click', () => {
        if (selectedListId !== null) {
            if (confirm(`Are you sure you want to delete the list "${userLists[selectedListId].name}"?`)) {
                userLists.splice(selectedListId, 1);
                selectedListId = userLists.length > 0 ? 0 : null;
                save();
                renderLists();
                renderTasks();
            }
        } else {
            alert('Please select a list first.');
        }
    });


    logOutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });


    // Initial render
    renderLists();
    renderTasks();
});