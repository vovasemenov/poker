// Основные массивы для карт и переводов
const suits = ['черви', 'бубны', 'крести', 'пики'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let deck = [];
let playerHand = [];
const valueTranslation = {
    '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', 
    '7': '7', '8': '8', '9': '9', '10': '10', 
    'J': 'Валет', 'Q': 'Дама', 'K': 'Королёк', 'A': 'Туз'
};
const suitTranslation = {
    'черви': 'черви', 
    'бубны': 'бубны', 
    'крести': 'крести', 
    'пики': 'пики'
};

// Загрузка базы данных игроков из localStorage, если она существует
let playerDatabase = JSON.parse(localStorage.getItem('playersDB')) || [];
let currentPlayer = '';

// Функция для создания новой колоды
function createDeck() {
    deck = [];
    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({ value, suit });
        });
    });
    shuffleDeck();
}

// Функция для перемешивания колоды
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Функция для начала игры
function startGame() {
    const playerName = document.getElementById('playerName').value;
    if (playerName.trim() === '') {
        alert('Пожалуйста, введите ваше имя.');
        return;
    }

    // Установить текущего игрока и показать игровой стол
    currentPlayer = playerName;
    document.getElementById('playerNameDisplay').innerText = playerName;
    document.getElementById('playerName').value = '';
    document.getElementById('player-entry').style.display = 'none';
    document.getElementById('poker-table').style.display = 'flex';

    createDeck();
    playerHand = [];
    document.getElementById('cards').innerHTML = '';
    document.getElementById('combinationDisplay').textContent = '';

    // Добавить игрока в базу данных, если его там нет
    addPlayerToDatabase(playerName);
    updatePlayerList();
}

// Функция для вытягивания карты
function drawCard() {
    if (deck.length === 0) {
        alert('Колода пуста!');
        return;
    }

    if (playerHand.length >= 5) {
        alert('Вы уже набрали 5 карт!');
        return;
    }

    const card = deck.pop();
    playerHand.push(card);
    updateCards();
    if (playerHand.length === 5) {
        displayCombination();
    }
}

// Обновление отображения карт
function updateCards() {
    const cardsDiv = document.getElementById('cards');
    cardsDiv.innerHTML = '';
    playerHand.forEach(card => {
        const cardElem = document.createElement('div');
        cardElem.className = 'card';

        const imagePath = `./cards/${card.value}_of_${card.suit}.png`;
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = `${valueTranslation[card.value]} ${suitTranslation[card.suit]}`;
        cardElem.appendChild(img);

        cardsDiv.appendChild(cardElem);
    });
}

// Определение комбинации игрока
function getCombination(hand) {
    const valueCounts = {};
    const suitCounts = {};
    const valuesArr = [];

    hand.forEach(card => {
        valuesArr.push(card.value);
        valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
        suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    });

    const pairs = Object.values(valueCounts).filter(count => count === 2);
    const threes = Object.values(valueCounts).filter(count => count === 3);
    const fours = Object.values(valueCounts).filter(count => count === 4);

    const sortedValues = valuesArr.map(value => '23456789TJQKA'.indexOf(value)).sort((a, b) => a - b);
    const isStraight = sortedValues.every((value, idx, arr) => idx === 0 || value === arr[idx - 1] + 1);
    const isFlush = Object.values(suitCounts).some(count => count === 5);

    if (isStraight && isFlush && sortedValues[4] === 12) {
        return 'Флеш-рояль';
    } else if (isStraight && isFlush) {
        return 'Стрит-флеш';
    } else if (fours.length) {
        return 'Каре';
    } else if (threes.length && pairs.length) {
        return 'Фулл-хаус';
    } else if (isFlush) {
        return 'Флеш';
    } else if (isStraight) {
        return 'Стрит';
    } else if (threes.length) {
        return 'Тройка';
    } else if (pairs.length === 2) {
        return 'Две пары';
    } else if (pairs.length) {
        return 'Пара';
    } else {
        return 'Старшая карта';
    }
}

// Отображение комбинации игрока
function displayCombination() {
    const combination = getCombination(playerHand);
    document.getElementById('combinationDisplay').innerText = `Комбинация: ${combination}`;
    updatePlayerInDatabase(currentPlayer, combination);
}

// Добавление игрока в базу данных
function addPlayerToDatabase(playerName) {
    const playerExists = playerDatabase.some(player => player.name === playerName);
    if (!playerExists) {
        playerDatabase.push({ name: playerName, combination: '' });
        localStorage.setItem('playersDB', JSON.stringify(playerDatabase));
    }
}

// Обновление данных игрока в базе данных
function updatePlayerInDatabase(playerName, combination) {
    const playerIndex = playerDatabase.findIndex(player => player.name === playerName);
    if (playerIndex !== -1) {
        playerDatabase[playerIndex].combination = combination;
        localStorage.setItem('playersDB', JSON.stringify(playerDatabase));
    }
    updatePlayerList();
}

// Очистка базы данных
function clearDatabase() {
    playerDatabase = [];
    localStorage.removeItem('playersDB');
    updatePlayerList();
}

// Обновление списка игроков на экране
function updatePlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    playerDatabase.forEach(player => {
        const playerItem = document.createElement('div');
        playerItem.textContent = `${player.name}: ${player.combination}`;
        playerList.appendChild(playerItem);
    });
}

// Сброс игры до начального состояния
function resetGame() {
    document.getElementById('player-entry').style.display = 'block';
    document.getElementById('poker-table').style.display = 'none';
    document.getElementById('playerName').value = '';
    document.getElementById('cards').innerHTML = '';
    document.getElementById('combinationDisplay').innerHTML = '';
    playerHand = [];
    deck = []; 
    currentPlayer = '';
    updateCards();
}

// Привязка событий к кнопкам и начальная настройка списка игроков
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('drawButton').addEventListener('click', drawCard);
document.getElementById('resetButton').addEventListener('click', resetGame);
document.getElementById('clearDatabaseButton').addEventListener('click', clearDatabase);

// Первоначальное отображение списка игроков
updatePlayerList();