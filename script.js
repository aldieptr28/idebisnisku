// Inisialisasi variabel
let ideas = [];

// Fungsi untuk menampilkan halaman login atau aplikasi
function showPage(page) {
    if (page === 'login') {
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('app-page').style.display = 'none';
    } else if (page === 'app') {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('app-page').style.display = 'block';
    }
}

// Saat halaman dimuat, tampilkan halaman login
document.addEventListener('DOMContentLoaded', () => {
    showPage('login');
    // Cek preferensi tema
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }
});

// Menangani login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let username = document.getElementById('username').value.trim();
    let password = document.getElementById('password').value.trim();

    if (username === 'admin' && password === 'altra2283') {
        showPage('app');
        loadIdeas();
    } else {
        alert('Username atau kata sandi salah!');
    }
});

// Fungsi untuk memuat ide dari local storage
function loadIdeas() {
    if (localStorage.getItem('ideas')) {
        ideas = JSON.parse(localStorage.getItem('ideas'));
    }
    displayIdeas();
    updateCategoryFilter();
}

// Menangani logout
document.getElementById('logout-button').addEventListener('click', () => {
    location.reload();
});

// Menangani submit form ide
document.getElementById('idea-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let title = document.getElementById('idea-title').value.trim();
    let description = document.getElementById('idea-description').value.trim();
    let strategy = document.getElementById('idea-strategy').value.trim();
    let category = document.getElementById('idea-category').value.trim();
    let imageInput = document.getElementById('idea-image');
    let imageFile = imageInput.files[0];

    if (title !== '' && description !== '' && strategy !== '' && category !== '') {
        if (imageFile) {
            let reader = new FileReader();
            reader.onload = function (e) {
                addIdea({
                    title: title,
                    description: description,
                    strategy: strategy,
                    category: category,
                    image: e.target.result,
                    tasks: []
                });
                document.getElementById('idea-form').reset();
            };
            reader.readAsDataURL(imageFile);
        } else {
            addIdea({
                title: title,
                description: description,
                strategy: strategy,
                category: category,
                image: null,
                tasks: []
            });
            document.getElementById('idea-form').reset();
        }
    }
});

// Fungsi untuk menambahkan ide
function addIdea(idea) {
    ideas.push(idea);
    updateLocalStorage();
    displayIdeas();
    updateCategoryFilter();
}

// Fungsi untuk menghapus ide
function deleteIdea(index) {
    ideas.splice(index, 1);
    updateLocalStorage();
    displayIdeas();
    updateCategoryFilter();
}

// Fungsi untuk memperbarui local storage
function updateLocalStorage() {
    localStorage.setItem('ideas', JSON.stringify(ideas));
}

// Fungsi untuk menampilkan ide
function displayIdeas(keyword = '') {
    let ideaList = document.getElementById('idea-list');
    ideaList.innerHTML = '';
    let selectedCategory = document.getElementById('category-filter').value;
    let searchKeyword = keyword.toLowerCase();

    ideas.forEach((idea, index) => {
        if (
            (idea.title.toLowerCase().includes(searchKeyword) ||
                idea.description.toLowerCase().includes(searchKeyword) ||
                idea.strategy.toLowerCase().includes(searchKeyword)) &&
            (selectedCategory === '' || idea.category === selectedCategory)
        ) {
            let li = document.createElement('li');
            li.classList.add('idea-item');

            let title = document.createElement('h3');
            title.textContent = idea.title;

            let description = document.createElement('p');
            description.textContent = "Deskripsi: " + idea.description;

            let strategy = document.createElement('p');
            strategy.textContent = "Strategi: " + idea.strategy;

            let category = document.createElement('p');
            category.textContent = "Kategori: " + idea.category;

            // Tampilkan gambar jika ada
            if (idea.image) {
                let img = document.createElement('img');
                img.src = idea.image;
                img.alt = 'Gambar Ide';
                li.appendChild(img);
            }

            // Progress bar
            let totalTasks = idea.tasks.length;
            let completedTasks = idea.tasks.filter(task => task.completed).length;
            let progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            let progressBarContainer = document.createElement('div');
            progressBarContainer.classList.add('progress-bar');

            let progressBar = document.createElement('div');
            progressBar.classList.add('progress');
            progressBar.style.width = progressPercent + '%';

            progressBarContainer.appendChild(progressBar);

            let buttonsDiv = document.createElement('div');
            buttonsDiv.classList.add('buttons');

            let taskBtn = document.createElement('button');
            taskBtn.innerHTML = '&#128221;';
            taskBtn.title = 'Kelola Tugas';
            taskBtn.addEventListener('click', () => {
                openTaskModal(index);
            });

            let editBtn = document.createElement('button');
            editBtn.innerHTML = '&#9998;';
            editBtn.title = 'Edit Ide';
            editBtn.addEventListener('click', () => {
                editIdea(index);
            });

            let deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = 'Hapus Ide';
            deleteBtn.addEventListener('click', () => {
                deleteIdea(index);
            });

            buttonsDiv.appendChild(taskBtn);
            buttonsDiv.appendChild(editBtn);
            buttonsDiv.appendChild(deleteBtn);

            li.appendChild(title);
            li.appendChild(description);
            li.appendChild(strategy);
            li.appendChild(category);
            li.appendChild(progressBarContainer);
            li.appendChild(buttonsDiv);

            ideaList.appendChild(li);
        }
    });
}

// Fungsi untuk memperbarui filter kategori
function updateCategoryFilter() {
    let categories = [...new Set(ideas.map(idea => idea.category))];
    let categoryFilter = document.getElementById('category-filter');
    categoryFilter.innerHTML = '<option value="">Semua Kategori</option>';
    categories.forEach(category => {
        let option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Event listener untuk input pencarian
document.getElementById('search-input').addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    displayIdeas(keyword);
});

// Event listener untuk filter kategori
document.getElementById('category-filter').addEventListener('change', () => {
    displayIdeas(document.getElementById('search-input').value.toLowerCase());
});

/* Modal Tugas */
let modal = document.getElementById('task-modal');
let span = document.getElementsByClassName('close')[0];
let currentIdeaIndex = null;

// Fungsi untuk membuka modal tugas
function openTaskModal(index) {
    currentIdeaIndex = index;
    document.getElementById('modal-idea-title').textContent = ideas[index].title;
    displayTasks();
    modal.style.display = 'block';
}

// Fungsi untuk menutup modal
span.onclick = function () {
    modal.style.display = 'none';
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Menangani submit form tugas
document.getElementById('task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let taskInput = document.getElementById('task-input');
    let taskName = taskInput.value.trim();
    let deadlineInput = document.getElementById('task-deadline');
    let deadline = deadlineInput.value;

    if (taskName !== '' && deadline !== '') {
        addTask(taskName, deadline);
        taskInput.value = '';
        deadlineInput.value = '';
    }
});

// Fungsi untuk menambahkan tugas
function addTask(taskName, deadline) {
    ideas[currentIdeaIndex].tasks.push({
        name: taskName,
        completed: false,
        deadline: deadline
    });
    updateLocalStorage();
    displayTasks();
    displayIdeas(); // Perbarui progress bar
}

// Fungsi untuk menampilkan tugas
function displayTasks() {
    let taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    let today = new Date();

    ideas[currentIdeaIndex].tasks.forEach((task, index) => {
        let li = document.createElement('li');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            updateLocalStorage();
            displayTasks();
            displayIdeas(); // Perbarui progress bar
        });

        let taskName = document.createElement('span');
        taskName.textContent = task.name;
        if (task.completed) {
            taskName.style.textDecoration = 'line-through';
        }

        let taskDeadline = new Date(task.deadline);
        let deadlineSpan = document.createElement('span');
        deadlineSpan.textContent = ' (Deadline: ' + task.deadline + ')';
        deadlineSpan.classList.add('deadline');

        // Tandai tugas yang mendekati deadline
        if (!task.completed && (taskDeadline - today) / (1000 * 60 * 60 * 24) <= 3) {
            li.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        }

        li.appendChild(checkbox);
        li.appendChild(taskName);
        li.appendChild(deadlineSpan);
        taskList.appendChild(li);
    });
}

// Fungsi untuk mengedit ide
function editIdea(index) {
    let idea = ideas[index];
    // Isi form dengan data ide yang akan diedit
    document.getElementById('idea-title').value = idea.title;
    document.getElementById('idea-description').value = idea.description;
    document.getElementById('idea-strategy').value = idea.strategy;
    document.getElementById('idea-category').value = idea.category;
    // Hapus ide lama
    ideas.splice(index, 1);
    updateLocalStorage();
    displayIdeas();
    updateCategoryFilter();
}

// Fungsi untuk toggle tema
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    // Simpan preferensi tema
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
});

// Event listener untuk tombol ekspor
document.getElementById('export-button').addEventListener('click', () => {
    let dataStr = JSON.stringify(ideas);
    let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    let exportFileDefaultName = 'data_ide_bisnis.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

// Event listener untuk tombol impor
document.getElementById('import-button').addEventListener('click', () => {
    document.getElementById('import-input').click();
});

// Event listener untuk input file impor
document.getElementById('import-input').addEventListener('change', (e) => {
    let file = e.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function (e) {
        try {
            let importedIdeas = JSON.parse(e.target.result);
            if (Array.isArray(importedIdeas)) {
                ideas = importedIdeas;
                updateLocalStorage();
                displayIdeas();
                updateCategoryFilter();
                alert('Data berhasil diimpor!');
            } else {
                alert('Format data tidak valid.');
            }
        } catch (error) {
            alert('Terjadi kesalahan saat mengimpor data.');
        }
    };
    reader.readAsText(file);
});
