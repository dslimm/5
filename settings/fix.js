// создание игровой страницы (кроме кнопок управления)

const levelElem = document.getElementById("level");
document.title = "Уровень " + levelElem.textContent;

function createBoard() {
    let cardsHtml = "";
    for (let i = 0; i <= 49; i++) {
        const startClass = i === 20 ? "start" : "";
        cardsHtml += `<div class="card ${startClass}" id="${i}"></div>`;
    }

    const div = document.createElement("div");
    div.classList.add("game-board");
    div.setAttribute("id", "board");
    div.setAttribute("ontouchstart", "");
    div.innerHTML = cardsHtml;
    return div;
}
const gameBoard = createBoard();
document.body.appendChild(gameBoard);

// таймер

let timerInterval;
let gameInterval;
let sec = 0;
let min = 0;

function startTimerTime() {
    timerInterval = setInterval(() => {
        sec = sec < 59 ? sec + 1 : 0;
        min = sec === 0 ? min + 1 : min;
        let formatSec = String(sec).padStart(2, "0");
        let formatMin = String(min).padStart(2, "0");
        document.getElementById("timer").textContent =
            formatMin + " : " + formatSec;
    }, 1000);
}

// загрузка страницы / старт

function loadFunc() {
    startTimerTime();
    startTimerGame(id);
    new Cub();
    if (levelsArr[id].createFixCub !== undefined) {
        createFixCub();
    }
    if (levelsArr[id].createSingleCub !== undefined) {
        createSingleCub();
    }
}
window.addEventListener("load", loadFunc);

// создание движущегося куба

let runCub;
const allCards = Array.from(document.querySelectorAll(".card"));

class Cub {
    constructor() {
        setTimeout(() => this.createCub(), 200);
    }
    createCub() {
        const cubStart = document.querySelector(".start");
        if (cubStart.children.length < 1) {
            runCub = document.createElement("div");
            runCub.classList.add("new");
            cubStart.appendChild(runCub);
            getRandomValueSwitch(id);
        } else {
            return;
        }
    }
}

// создание normal, fix, single кубов

function createFixCub() {
    let fixCubObj = levelsArr[id].createFixCub;
    if (fixCubObj !== undefined) {
        fixCubObj.forEach((elem) => {
            const fixCub = document.createElement("div");
            fixCub.classList.add("fix");
            const cardId = elem.fixCubCard;
            document.getElementById(cardId).appendChild(fixCub);
            fixCub.textContent = elem.fixCubValue;
        });
    }
}

function createSingleCub() {
    let singleCubObj = levelsArr[id].createSingleCub;
    if (singleCubObj !== undefined) {
        singleCubObj.forEach((elem) => {
            const singleCub = document.createElement("div");
            singleCub.classList.add("single");
            const cardId = elem.singleCubCard;
            document.getElementById(cardId).appendChild(singleCub);
            singleCub.textContent = elem.singleCubValue;
        });
    }
}

function getNextCard() {
    const currentIndex = allCards.indexOf(runCub.parentElement);
    if (currentIndex < allCards.length - 1) {
        const nextCardId = allCards[currentIndex + 1].id;
        return document.getElementById(nextCardId);
    }
}

function moveCub(nextCard) {
    if (
        nextCard &&
        nextCard.children.length === 0 &&
        !nextCard.id.endsWith("0")
    ) {
        if (nextCard.appendChild(runCub)) {
            return true;
        }
    }
    return false;
}

// проверка заполненности строки:

function cardWithNumberFilled(number) {
    // clearInterval(gameInterval);
    const cardsNum = document.querySelectorAll('.card[id$="' + number + '"]');
    let allFilled = true;

    for (let i = 9; i >= 1; i--) {
        if (number === i) {
            fillCardWithNumber(i);
        }
    }

    cardsNum.forEach((card) => {
        if (
            card.children.length === 0 ||
            runCub.textContent === "✘" ||
            runCub.textContent === "⤋"
        ) {
            allFilled = false;
        }
    });

    if (calculateScore(cardsNum, allFilled)) {
        for (let card of cardsNum) {
            rowDelete(card);
        }
    }
    // startTimerGame(id);
}

// удаление строки:

function rowDelete(card) {
    const fixCubs = Array.from(card.getElementsByClassName("fix"));

    card.classList.add("row-delete");
    setTimeout(() => {
        Array.from(card.children).forEach((child) => {
            if (!fixCubs.includes(child)) {
                card.removeChild(child);
            }
        });
        card.classList.remove("row-delete");
        moveStoppedCubs();
    }, 150);
}

// движение остановленных кубов после удаления строки:

function moveStoppedCubs(iteration = 0) {
    if (iteration >= 9) {
        return;
    }
    setTimeout(() => {
        const stopCubs = Array.from(document.querySelectorAll(".cub"));

        stopCubs.forEach((cub) => {
            const currentIndex = allCards.indexOf(cub.parentElement);
            const nextCard = allCards[currentIndex + 1];

            if (
                nextCard &&
                nextCard.children.length === 0 &&
                !nextCard.id.endsWith("0")
            ) {
                nextCard.appendChild(cub);
                let number = cub.parentElement.id.slice(-1);
                setTimeout(cardWithNumberFilled, 100, number);
                moveStoppedCubs(iteration + 1);
            }
        });
    }, 50);
}

// function upLevelTime(currentTimer) {
//     let currentLevel = document.getElementById("level").textContent;

//     let levels = JSON.parse(localStorage.getItem("levels")) || [];

//     let levelExists = levels.find((level) => level.level === currentLevel);

//     if (levelExists) {
//         levelExists.timer = currentTimer;
//     } else {
//         levels.push({ level: currentLevel, timer: currentTimer });
//     }

//     localStorage.setItem("levels", JSON.stringify(levels));
// }

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("GameDatabase", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("levels")) {
                db.createObjectStore("levels", { keyPath: "level" });
            }
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function getLevel(db, currentLevel) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["levels"], "readonly");
        const objectStore = transaction.objectStore("levels");
        const request = objectStore.get(currentLevel);

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function saveLevel(db, levelData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["levels"], "readwrite");
        const objectStore = transaction.objectStore("levels");
        const request = objectStore.put(levelData);

        request.onsuccess = () => {
            resolve();
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

async function upLevelTime(currentTimer) {
    try {
        const currentLevelText = document.getElementById("level").textContent;
        const currentLevel = parseInt(currentLevelText, 10);
        const db = await openDatabase();
        let levelData = await getLevel(db, currentLevel);

        if (levelData) {
            levelData.timer = currentTimer;
        } else {
            levelData = { level: currentLevel, timer: currentTimer };
        }

        await saveLevel(db, levelData);
    } catch (error) {
        console.error("Ошибка сохранения данных:", error);
    }
}
