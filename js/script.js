// Установка текущего года в футере
document.querySelector('#currentYear').textContent = new Date().getFullYear();

// Массив данных о пиццах
const pizzas = [
    { 
        name: "Margherita",         
        price: 189,  
        desc: "Tomato sauce, mozzarella, fresh basil",                       
        img: "img/pizza1.jpg" 
    },
    { 
        name: "Pepperoni",         
        price: 249,  
        desc: "Spicy pepperoni, mozzarella, tomato sauce",                    
        img: "img/pizza2.jpg" 
    },
    { 
        name: "Four Cheeses",       
        price: 289,  
        desc: "Mozzarella, gorgonzola, parmesan, gouda",                        
        img: "img/pizza3.jpg" 
    },
    { 
        name: "Hawaiian",         
        price: 259,  
        desc: "Ham, pineapple, mozzarella, sauce",                              
        img: "img/pizza4.jpg" 
    },
];

// Получаем корзину из localStorage или создаём пустую
let cart = JSON.parse(localStorage.getItem('bestPizzaCart')) || [];

// Функция рендера карточек пицц
function renderPizzas(list = pizzas) {
    const container = document.querySelector('#pizzaContainer');
    container.innerHTML = ''; // очищаем контейнер перед рендером

    list.forEach(pizza => {
        const div = document.createElement('div');
        div.className = 'pizza-simple';
        div.innerHTML = `
            <img src="${pizza.img}" alt="${pizza.name}">
            <div class="pizza-info">
                <div class="pizza-name">${pizza.name}</div>
                <div class="pizza-desc">${pizza.desc}</div>
                <div class="pizza-price">${pizza.price} грн</div>
                <button class="btn-add-simple" 
                        data-name="${pizza.name}" 
                        data-price="${pizza.price}">
                    Add to cart
                </button>
            </div>
        `;
        container.appendChild(div); // добавляем карточку в контейнер
    });
}

// Функция сортировки пицц по цене
function sortPizzas(type) {
    let sorted = [...pizzas]; // создаём копию массива

    if (type === 'asc') {
        sorted.sort((a, b) => a.price - b.price); // по возрастанию
    } else if (type === 'desc') {
        sorted.sort((a, b) => b.price - a.price); // по убыванию
    }

    renderPizzas(sorted); // рендерим отсортированный список
}

// Функция обновления корзины на странице
function updateCartDisplay() {
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.qty;
        totalPrice += item.price * item.qty;
    });

    document.querySelector('#cartCount').textContent = totalItems;
    document.querySelector('#cartTotal').textContent = totalPrice;

    const container = document.querySelector('#cartItems');
    container.innerHTML = cart.length === 0 
        ? '<p class="text-center text-muted py-5">Cart is empty</p>' 
        : '';

    // Рендерим товары в корзине
    cart.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'd-flex justify-content-between align-items-center mb-3';
        row.innerHTML = `
            <div class="flex-grow-1">
                <strong>${item.name}</strong><br>
                <small>${item.price} UAN × ${item.qty}</small>
            </div>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" onclick="changeQty(${index}, -1)">–</button>
                <button class="btn btn-outline-secondary disabled">${item.qty}</button>
                <button class="btn btn-outline-secondary" onclick="changeQty(${index}, 1)">+</button>
            </div>
        `;
        container.appendChild(row);
    });

    // Сохраняем корзину в localStorage
    localStorage.setItem('bestPizzaCart', JSON.stringify(cart));
}

// Добавление товара в корзину
function addToCart(name, price) {
    const existing = cart.find(p => p.name === name);
    if (existing) {
        existing.qty++; // если товар уже есть — увеличиваем количество
    } else {
        cart.push({ name, price, qty: 1 }); // иначе добавляем новый объект
    }
    updateCartDisplay(); // обновляем отображение
}

// Функция изменения количества товара
window.changeQty = function(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty < 1) {
        cart.splice(index, 1); // удаляем товар если qty < 1
    }
    updateCartDisplay();
};

// Обработчик клика по кнопке "Add to cart" на карточках
document.addEventListener('click', e => {
    if (e.target.classList.contains('btn-add-simple')) {
        const name = e.target.dataset.name;
        const price = Number(e.target.dataset.price);
        addToCart(name, price);
    }
});

// Обработчики сортировки
document.querySelector('#sortAsc').addEventListener('click', () => sortPizzas('asc'));
document.querySelector('#sortDesc').addEventListener('click', () => sortPizzas('desc'));
document.querySelector('#sortDefault').addEventListener('click', () => renderPizzas());

// Кнопка "Checkout" — открытие формы заказа
document.querySelector('#checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    // Считаем общую сумму
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    document.querySelector('#orderTotalDisplay').textContent = total;

    // Скрываем offcanvas корзины
    const offcanvasEl = document.getElementById('cartOffcanvas');
    const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    offcanvas.hide();

    // Показываем модальное окно оформления заказа через 300ms
    setTimeout(() => {
        const modal = new bootstrap.Modal(document.getElementById('orderModal'));
        modal.show();
    }, 300);
});

// Валидация и отправка формы заказа
document.querySelector('#orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const nameInput = document.getElementById('orderName');
    const phoneInput = document.getElementById('orderPhone');
    const addressInput = document.getElementById('orderAddress');

    [nameInput, phoneInput, addressInput].forEach(el => el.classList.remove('is-invalid'));

    let hasError = false;

    // Проверка имени
    const name = nameInput.value.trim();
    if (name.length < 2 || !/^[А-Яа-яA-Za-z\s\-]+$/.test(name)) {
        nameInput.classList.add('is-invalid');
        hasError = true;
    }

    // Проверка телефона (только цифры, минимум 9)
    const phoneClean = phoneInput.value.replace(/\D/g, '');
    if (phoneClean.length < 9) {
        phoneInput.classList.add('is-invalid');
        hasError = true;
    }

    // Проверка адреса (не меньше 5 символов)
    const address = addressInput.value.trim();
    if (address.length < 5) {
        addressInput.classList.add('is-invalid');
        hasError = true;
    }

    // Если есть ошибки — скроллим к первому полю
    if (hasError) {
        document.querySelector('.is-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // Успешная отправка
    alert(`Thank you, ${name}! Your order has been received.\nWe will contact you shortly!`);

    // Очистка корзины и localStorage
    cart = [];
    updateCartDisplay();
    localStorage.removeItem('bestPizzaCart');

    // Закрываем модальное окно
    bootstrap.Modal.getInstance($('#orderModal')).hide();

    // Сбрасываем форму
    this.reset();
});

// Инициализация страницы
renderPizzas();
updateCartDisplay();
