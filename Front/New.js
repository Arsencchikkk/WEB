document.addEventListener("DOMContentLoaded", function () {
    console.log(" Страница загружена!");
    checkAuthStatus();
    loadFavorites();
});

function showSection(sectionId) {
    var section = document.getElementById(sectionId);
    if (section) {
        var headerOffset = 120; 
        var elementPosition = section.getBoundingClientRect().top;
        var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
}

window.onload = function() {
    console.log("Window loaded:", window);
};



window.logoutUser = function() {
    localStorage.removeItem("user_id");
    alert("Вы вышли из аккаунта!");
    checkAuthStatus();
    location.reload();
};


// Функция поиска лекарства
async function searchMedicine() {
    const query = document.getElementById('search').value.trim();
    const resultsList = document.getElementById('results');
    resultsList.innerHTML = '';

    if (!query) {
        alert("Введите название лекарства");
        return;
    }

    try {
        const response = await fetch(`/medicines/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error("Ошибка сервера. Попробуйте позже.");
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            alert("Лекарство не найдено!");
            return;
        }
        data.forEach(med => {
            // Используем med._id и приводим к строке
            const id = med._id ? med._id.toString() : null;
            if (!id) {
                console.error("Ошибка: у лекарства нет ID", med);
                return;
            }
            const li = document.createElement('li');
            li.innerHTML = `
              <img src="${med.image_url || 'https://via.placeholder.com/100'}" 
                   alt="${med.name}" 
                   style="width: 100px; height: 100px;" 
                   onerror="this.onerror=null; this.src='https://via.placeholder.com/100';">
              <p><b>${med.name}</b> - ${med.description} (Категория: ${med.category}, Цена: $${med.price})</p>
              <button onclick="openReviewModal('${id}')">Оставить отзыв</button>
              <div id="average-rating-${id}" class="average-rating">Загрузка отзывов...</div>
              <button onclick="addToFavorites('${id}')">⭐ В избранное</button>
            `;
            resultsList.appendChild(li);
            updateMedicineRatingDisplay(id);
        });
    } catch (error) {
        console.error("Ошибка при поиске лекарства:", error);
        alert("Ошибка загрузки данных. Попробуйте снова!");
    }
}


// Глобальная переменная для текущего рейтинга
let currentRating = 0;

// Функция переключения модального окна (если её у вас ещё нет)
function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = modal.style.display === "block" ? "none" : "block";
  }
}

// Функция установки рейтинга
function setRating(rating) {
  currentRating = rating;
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById("star" + i);
    if (star) {
      star.className = i <= rating ? "active" : "";
    }
  }
}

function openReviewModal(medicineId) {
    // Здесь можно сохранить medicineId в data-атрибуте модального окна, чтобы потом его использовать
    document.getElementById("review-modal").setAttribute("data-medicine-id", medicineId);
    toggleModal("review-modal");
  }
  

// Функция отправки отзыва на сервер
async function submitReview() {
    // Получаем user_id из localStorage
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert("Сначала войдите в систему, чтобы оставить отзыв.");
      return;
    }
    
    const comment = document.getElementById("review-comment").value.trim();
    const medicineId = document.getElementById("review-modal").getAttribute("data-medicine-id");
    
    if (currentRating < 1 || currentRating > 5) {
      alert("Пожалуйста, поставьте оценку от 1 до 5 звёзд.");
      return;
    }
    if (!comment) {
      alert("Пожалуйста, введите текст отзыва.");
      return;
    }
    
    // Формируем объект отзыва с user_id как строкой
    const review = {
      medicine_id: medicineId,
      user_id: userId, // Передаём идентификатор пользователя
      rating: currentRating,
      comment: comment
    };
  
    try {
      let response = await fetch("/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review)
      });
      let data = await response.json();
      if (response.ok) {
        alert("Спасибо за ваш отзыв!");
        toggleModal("review-modal");
        // Сброс значений
        currentRating = 0;
        for (let i = 1; i <= 5; i++) {
          document.getElementById("star" + i).className = "";
        }
        document.getElementById("review-comment").value = "";
      } else {
        alert("Ошибка: " + data.error);
      }
    } catch (error) {
      console.error("Ошибка при отправке отзыва:", error);
      alert("Ошибка сервера. Попробуйте снова!");
    }
  }
  
window.submitReview = submitReview;
window.openReviewModal = openReviewModal;



async function loadAverageRating(medicineId) {
    try {
      let response = await fetch(`/reviews/average?medicine_id=${encodeURIComponent(medicineId)}`);
      if (!response.ok) {
        throw new Error("Ошибка при получении среднего рейтинга: " + response.status);
      }
      let data = await response.json();
      // data может иметь вид: { _id: "67...", averageRating: 4.2, count: 10 }
      return data;
    } catch (error) {
      console.error("Ошибка загрузки среднего рейтинга:", error);
      return null;
    }
  }
  
  // Пример использования: обновление элемента для карточки лекарства
  async function updateMedicineRatingDisplay(medicineId) {
    const ratingElem = document.getElementById(`average-rating-${medicineId}`);
    const ratingData = await loadAverageRating(medicineId);
    if (!ratingElem) return;
    if (!ratingData || ratingData.count === 0) {
      ratingElem.innerText = "Нет отзывов";
      return;
    }
    let rounded = Math.round(ratingData.averageRating * 10) / 10;
    let starsHtml = "";
    // Заполняем звёздочки: полное число звёзд и незаполненные до 5
    for (let i = 1; i <= 5; i++) {
      starsHtml += i <= Math.floor(rounded) ? "&#9733;" : "&#9734;";
    }
    ratingElem.innerHTML = `Средний рейтинг: ${rounded} ${starsHtml} (${ratingData.count} отзывов)`;
  }
  
  
  


function filterByCategory() {
    var category = document.getElementById('medicine-category').value;
    if (!category) {
        alert("Пожалуйста, выберите категорию");
        return;
    }
    fetch('/medicines/category?category=' + encodeURIComponent(category))
      .then(response => response.json())
      .then(data => {
        const results = document.getElementById('results');
        results.innerHTML = "";
        if (!Array.isArray(data) || data.length === 0) {
          results.innerHTML = "<li>Лекарства не найдены</li>";
          return;
        }
        data.forEach(med => {
          let li = document.createElement('li');
          li.innerHTML = `
            <img src="${med.image_url}" alt="${med.name}" style="width: 100px; height: 100px;">
            <strong>${med.name}</strong> - ${med.description}
          `;
          results.appendChild(li);
        });
      })
      .catch(error => console.error('Ошибка при получении данных:', error));
}
window.filterByCategory = filterByCategory;

// Переключение модального окна
function toggleModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = modal.style.display === "block" ? "none" : "block";
    }
}

// Регистрация пользователя
// Регистрация пользователя с сохранением JWT-токена
async function registerUser() {
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const city = document.getElementById("city").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const message = document.getElementById("message");

    if (!firstName || !lastName || !email || !phone || !city || !password || !confirmPassword) {
        message.textContent = "Все поля обязательны!";
        message.style.color = "red";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Пароли не совпадают!";
        message.style.color = "red";
        return;
    }

    try {
        const response = await fetch('/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,      
                phone: phone,
                city: city,
                password: password
            })
        });

        const data = await response.json();
        console.log("Ответ сервера (register):", data);

        if (response.ok && data.user_id && data.token) {
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("token", data.token);
            console.log("User ID сохранён:", localStorage.getItem("user_id"));
            console.log("Token сохранён:", localStorage.getItem("token"));

            message.textContent = "Регистрация успешна!";
            message.style.color = "green";
            toggleModal('register-modal');
        } else {
            message.textContent = data.error || "Ошибка регистрации!";
            message.style.color = "red";
        }
    } catch (error) {
        console.error("Ошибка при регистрации:", error);
        message.textContent = "Ошибка соединения!";
        message.style.color = "red";
    }
}

// Вход пользователя с сохранением JWT-токена
async function loginUser() {
    const loginInput = document.getElementById("login-input")?.value.trim();
    const password = document.getElementById("login-password")?.value.trim();
    const message = document.getElementById("login-message");

    if (!loginInput || !password) {
        message.textContent = "Введите логин и пароль!";
        message.style.color = "red";
        return;
    }

    try {
        const response = await fetch('.users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: loginInput, password })
        });

        const data = await response.json();
        console.log("Ответ сервера (login):", data);

        if (response.ok && data.user_id && data.token) {
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("token", data.token);
            console.log("User ID сохранён:", localStorage.getItem("user_id"));
            console.log("Token сохранён:", localStorage.getItem("token"));
            message.textContent = "Вход выполнен!";
            message.style.color = "green";
            toggleModal('login-modal');
            checkAuthStatus();
            loadFavorites();
        } else {
            message.textContent = data.error || "Неверные учетные данные!";
            message.style.color = "red";
        }
    } catch (error) {
        console.error("Ошибка входа:", error);
        message.textContent = "Ошибка сервера. Попробуйте снова!";
        message.style.color = "red";
    }
}



// Добавление в избранное
// Добавление лекарства в избранное
async function addToFavorites(medicineId) {
    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("Сначала войдите в систему!");
      return;
    }
    try {
      let response = await fetch('/favorites', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        // Передаём только medicine_id, user_id берется из токена на сервере
        body: JSON.stringify({ medicine_id: medicineId })
      });
      let data = await response.json();
      alert(data.message);
      loadFavorites();
    } catch (error) {
      console.error("❌ Ошибка добавления в избранное:", error);
      alert("Ошибка сервера.");
    }
  }
  
  // Загрузка избранного
  async function loadFavorites() {
    const token = localStorage.getItem("token")?.trim();
    const favoritesList = document.getElementById("favorites-list");
  
    if (!token || !favoritesList) {
      favoritesList.innerHTML = "<p>Войдите, чтобы увидеть избранное.</p>";
      return;
    }
  
    try {
      let response = await fetch(`/favorites`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      });
      let data = await response.json();
      console.log("📢 Ответ API /favorites:", data);
  
      favoritesList.innerHTML = '';
      if (!Array.isArray(data) || data.length === 0) {
        favoritesList.innerHTML = "<p>Избранное пусто.</p>";
        return;
      }
  
      data.forEach(fav => {
        if (!fav.medicine || fav.medicine.length === 0) {
          console.warn("⚠️ Пропущен элемент без medicine:", fav);
          return;
        }
        let med = fav.medicine[0]; // Берем первый элемент из массива medicine
        console.log("✅ Отображаем лекарство:", med);
        let li = document.createElement("li");
        li.innerHTML = `
          <img src="${med.image_url || 'https://via.placeholder.com/100'}" 
               alt="${med.name}" 
               style="width: 80px; height: 100px;" 
               onerror="this.onerror=null; this.src='https://via.placeholder.com/100';">
          <p><b>${med.name}</b> - ${med.description} 
          (Категория: ${med.category}, Цена: KZT ${med.price})</p>
          <button onclick="removeFromFavorites('${fav._id}')">Удалить</button>
        `;
        favoritesList.appendChild(li);
      });
    } catch (error) {
      console.error("❌ Ошибка загрузки избранного:", error);
    }
  }
  
  // Удаление из избранного
  async function removeFromFavorites(favoriteId) {
    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("Сначала войдите в систему!");
      return;
    }
    console.log("Удаление из избранного, ID:", favoriteId);
    try {
      let response = await fetch(`/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      });
      let data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ошибка при удалении!");
      }
      alert(data.message);
      loadFavorites(); 
    } catch (error) {
      console.error("Ошибка удаления из избранного:", error);
      alert("Не удалось удалить лекарство!");
    }
  }
  


// Проверка авторизации и обновление интерфейса
function checkAuthStatus() {
    const userId = localStorage.getItem("user_id");
    const authButtons = document.querySelector(".auth-buttons");
    if (userId) {
        authButtons.innerHTML = `
            <button class="profile-btn" onclick="showProfile()">Профиль</button>
            <button class="logout-btn" onclick="logoutUser()">Выйти</button>
        `;
        loadUserProfile();
    } else {
        authButtons.innerHTML = `
            <button class="login-btn" onclick="toggleModal('login-modal')">Войти</button>
            <button class="register-btn" onclick="toggleModal('register-modal')">Регистрация</button>
        `;
        document.getElementById("user-info").textContent = "Вы не авторизованы";
    }
}

// Показ профиля
function showProfile() {
    toggleModal('profile-modal');
    loadUserProfileModal();
}

async function loadUserProfileModal() {
    const token = localStorage.getItem("token")?.trim();
    console.log("loadUserProfileModal: token =", token);
    const profileDetails = document.getElementById("profile-details");
    if (!token) {
      if (profileDetails) profileDetails.textContent = "Вы не авторизованы";
      return;
    }
    try {
      const response = await fetch(`/users/profile`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      });
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error("Ошибка получения профиля");
      }
      const data = await response.json();
      console.log("Полученные данные профиля:", data);
      if (profileDetails) {
        profileDetails.innerHTML = `
            <p><strong>Имя:</strong> ${data.first_name} ${data.last_name}</p>
            <p><strong>Город:</strong> ${data.city}</p>
            ${data.email ? `<p><strong>Email:</strong> ${data.email}</p>` : ""}
            ${data.phone ? `<p><strong>Телефон:</strong> ${data.phone}</p>` : ""}
        `;
      }
    } catch (error) {
      console.error("Ошибка загрузки профиля (modal):", error);
      if (profileDetails) profileDetails.textContent = "Не удалось загрузить профиль.";
    }
  }
  
  async function loadUserProfile() {
    const token = localStorage.getItem("token")?.trim();
    const userInfo = document.getElementById("user-info");
    if (!token) {
      if (userInfo) userInfo.textContent = "Вы не авторизованы";
      return;
    }
    try {
      const response = await fetch(`/users/profile`, {
        headers: {
          "Authorization": "Bearer " + token
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Ошибка получения профиля: " + errorText);
      }
      const data = await response.json();
      userInfo.innerHTML = `<strong>Добро пожаловать, ${data.first_name} ${data.last_name}!</strong>`;
    } catch (error) {
      console.error("Ошибка загрузки профиля:", error);
      if (userInfo) userInfo.textContent = "Ошибка загрузки профиля";
    }
  }
  
  async function loadUserProfileModalFields() {
    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      document.getElementById("profile-details").innerHTML = "Вы не авторизованы";
      return;
    }
    try {
      const response = await fetch(`/users/profile`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        }
      });
      if (!response.ok) {
        throw new Error("Ошибка получения профиля");
      }
      const data = await response.json();
      document.getElementById("profile-first-name").textContent = data.first_name || "Не указано";
      document.getElementById("profile-last-name").textContent = data.last_name || "";
      document.getElementById("profile-email").textContent = data.email || "Не указано";
      document.getElementById("profile-phone").textContent = data.phone || "Не указано";
      document.getElementById("profile-city").textContent = data.city || "Не указано";
    } catch (error) {
      console.error("Ошибка загрузки профиля:", error);
      document.getElementById("profile-details").innerHTML = "Ошибка загрузки профиля";
    }
  }
  

function enableProfileEditing() {
    document.getElementById("edit-profile-form").style.display = "block";
    const profileText = document.getElementById("profile-details").innerText;
    const nameMatch = profileText.match(/Имя:\s(.*)/);
    const emailMatch = profileText.match(/Email:\s(.*)/);
    const phoneMatch = profileText.match(/Телефон:\s(.*)/);
    document.getElementById("edit-first-name").value = nameMatch ? nameMatch[1].split(" ")[0] : "";
    document.getElementById("edit-last-name").value = nameMatch ? nameMatch[1].split(" ")[1] : "";
    document.getElementById("edit-email").value = emailMatch ? emailMatch[1] : "";
    document.getElementById("edit-phone").value = phoneMatch ? phoneMatch[1] : "";
}

async function saveProfileChanges() {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
        alert("Ошибка: Вы не авторизованы!");
        return;
    }

    let firstName = document.getElementById("edit-first-name")?.value.trim();
    let lastName = document.getElementById("edit-last-name")?.value.trim();
    let email = document.getElementById("edit-email")?.value.trim();
    let phone = document.getElementById("edit-phone")?.value.trim();

    if (!firstName || !lastName || !email || !phone) {
        alert("Все поля обязательны!");
        return;
    }

    try {
        // Изменили URL с '/users/update-profile' на '/users/profile'
        const response = await fetch(`/users/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,  // Если сервер извлекает user_id из токена, этот параметр можно не передавать
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Профиль обновлён!");
            loadUserProfile();
            toggleModal("profile-modal");
        } else {
            alert("Ошибка: " + data.error);
        }
    } catch (error) {
        console.error("Ошибка обновления профиля:", error);
        alert("Ошибка сервера!");
    }
}
async function saveProfileChanges() {
    const token = localStorage.getItem("token")?.trim();
    if (!token) {
      alert("Сначала войдите в систему!");
      return;
    }
    // Собираем данные из формы
    let firstName = document.getElementById("edit-first-name").value.trim();
    let lastName = document.getElementById("edit-last-name").value.trim();
    let email = document.getElementById("edit-email").value.trim();
    let phone = document.getElementById("edit-phone").value.trim();
    if (!firstName || !lastName || !email || !phone) {
      alert("Все поля обязательны!");
      return;
    }
    try {
      const response = await fetch(`/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert("Профиль обновлён!");
        loadUserProfile();
        toggleModal("profile-modal");
      } else {
        alert("Ошибка: " + data.error);
      }
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);
      alert("Ошибка сервера!");
    }
  }
  



  function deleteProfile() {
    if (confirm("Вы уверены, что хотите удалить профиль?")) {
      const token = localStorage.getItem("token")?.trim();
      if (!token) {
        alert("Ошибка: Вы не авторизованы!");
        return;
      }
  
      fetch('/users/profile', {  
        method: 'DELETE', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
        // Тело запроса не нужно, так как user_id извлекается из токена
      })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          alert("Профиль удален!");
          localStorage.clear(); 
          window.location.href = "/";
        } else {
          alert("Ошибка: " + data.error);
        }
      })
      .catch(error => console.error('Ошибка:', error));
    }
  }
  

// Функция для фильтрации клиник по городу
async function filterClinicsByCity() {
    const city = document.getElementById('clinic-city').value;
    let url = '/clinics';
    if (city) {
      url += `?city=${encodeURIComponent(city)}`;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      const clinics = await response.json();
      renderClinicCards(clinics);
    } catch (error) {
      console.error("Ошибка при получении клиник:", error);
      alert("Ошибка загрузки клиник. Попробуйте снова!");
    }
  }
  
  // Функция отрисовки карточек клиник
  function renderClinicCards(clinics) {
    const container = document.getElementById('clinic-cards');
    container.innerHTML = '';
  
    if (!Array.isArray(clinics) || clinics.length === 0) {
      container.innerHTML = '<p>Клиники не найдены.</p>';
      return;
    }
  
    clinics.forEach(clinic => {
      const card = document.createElement('div');
      card.className = 'clinic-card';
      card.innerHTML = `
        <img src="${clinic.image_url}" alt="${clinic.name}">
        <div class="clinic-info">
          <h3>${clinic.name}</h3>
          <p class="address">${clinic.address}</p>
          <p class="description">${clinic.description}</p>
          ${clinic.url ? `<a href="${clinic.url}" target="_blank">Сайт клиники</a>` : ''}
        </div>
      `;
      container.appendChild(card);
    });
  }
  
  // Экспортируем функцию в глобальное пространство (если нужно)
  window.filterClinicsByCity = filterClinicsByCity;
  

const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
        this.classList.toggle('active');
        const answer = this.nextElementSibling;
        answer.classList.toggle('open');
    });
});
