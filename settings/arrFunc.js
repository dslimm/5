// массив для скорости игры

function startTimerGame(interval) {
    return function () {
        gameInterval = setInterval(() => {
            const nextCard = getNextCard();

            gameOver(nextCard);
            gameProcess(id, nextCard);
            moveCub(nextCard);
        }, interval);
    };
}

const startTimerGameArr = [
    startTimerGame(1150),
    startTimerGame(1000),
    startTimerGame(850),
    startTimerGame(700),
    startTimerGame(550),
];


// массивы для создания кубов со свойствами

function getRandomValue() {
    let strValue = document.querySelector(".cubs-value").textContent;
    let arrValue = strValue.split(", ").map(Number);
    return arrValue[Math.floor(Math.random() * arrValue.length)];
}

function setRandomValue() {
    let randomValue = getRandomValue();
    runCub.textContent = randomValue;
    return randomValue;
}

function shortFunc(condition, wrongText, classToAdd) {
    return function () {
        let randomValue = setRandomValue();
        if (condition(randomValue)) {
            if (wrongText !== undefined) {
                runCub.textContent = wrongText;
            }
            if (classToAdd !== undefined) {
                runCub.classList.add(classToAdd);
            }
        }
    };
}

const rotates = ["rotateZ(0deg)", "rotateZ(90deg)", "rotateZ(270deg)"];
function rotateClick() {
    function clickStart() {
        runCub.style.transform = "rotateZ(0deg)";
        board.style.opacity = "0.5";
        board.style.boxShadow = "0 0 5px 5px rgba(255, 255, 255, 0.3)";
    }

    function clickEnd() {
        board.style.opacity = "";
        board.style.boxShadow = "";
    }

    ["mousedown", "touchstart"].forEach((event) =>
        board.addEventListener(event, clickStart, false)
    );
    ["mouseup", "touchend"].forEach((event) =>
        board.addEventListener(event, clickEnd, false)
    );
}

const getRandomValueArr = [
    /*0*/ shortFunc(() => false),
    /*1*/ shortFunc((value) => isNaN(value), "✘", "del"),
    /*2*/ shortFunc((value) => isNaN(value), "⇆", "del"),
    /*3*/ shortFunc((value) => isNaN(value), "⤋", "del"),
    /*4*/ shortFunc((value) => value === 5, undefined, "swap"),
    /*5*/ shortFunc((value) => value === 5, undefined, "del"),
    /*6*/ shortFunc((value) => value === 0, undefined, "zero"),
    /*7*/ function () {
        const randomRotate =
            rotates[Math.floor(Math.random() * rotates.length)];
        setRandomValue();
        runCub.style.transform = randomRotate;
        rotateClick();
    },
];


// массив для обработки свойств кубов

function baseGameProcess(nextCard) {
    if (
        !nextCard ||
        nextCard.children.length !== 0 ||
        nextCard.id.endsWith("0")
    ) {
        runCub.classList.replace("new", "cub");
        let number = runCub.parentElement.id.slice(-1);
        cardWithNumberFilled(number);
        new Cub();
    }
}

const gameProcessArr = [
    /*0*/ function gameProcess(nextCard) {
        baseGameProcess(nextCard);
    },
    /*1*/ function gameProcess(nextCard) {
        baseGameProcess(nextCard);
        if (runCub.textContent === "✘") {
            if (nextCard && nextCard.firstChild) {
                nextCard.removeChild(nextCard.firstChild);
                setTimeout(() => {
                    runCub.parentElement.removeChild(runCub);
                }, 0);
            }
            if (!nextCard || (nextCard && nextCard.id.endsWith("0"))) {
                runCub.parentElement.removeChild(runCub);
            }
        }
    },
    /*2*/ function gameProcess(nextCard) {
        if (
            !nextCard ||
            nextCard.children.length !== 0 ||
            nextCard.id.endsWith("0")
        ) {
            runCub.classList.replace("new", "cub");
            let number = runCub.parentElement.id.slice(-1);
            cardWithNumberFilled(number);
            new Cub();
            if (runCub.textContent === "⇆") {
                let number = runCub.parentElement.id.slice(-1);
                const cardsInRow = document.querySelectorAll(
                    '.card[id$="' + number + '"]'
                );
                cardsInRow.forEach((card) => {
                    while (card.firstChild) {
                        card.removeChild(card.firstChild);
                    }
                });
                moveStoppedCubs();
            }
        }
    },
    /*3*/ function gameProcess(nextCard) {
        baseGameProcess(nextCard);
        if (runCub.textContent === "⤋") {
            if (nextCard && nextCard.firstChild) {
                let id = parseInt(nextCard.id);

                while (
                    nextCard &&
                    nextCard.id === id.toString() &&
                    !nextCard.id.endsWith("0")
                ) {
                    if (nextCard.firstChild) {
                        nextCard.removeChild(nextCard.firstChild);
                    }
                    id++;
                    nextCard = document.getElementById(id.toString());
                }
                setTimeout(() => {
                    runCub.parentElement.removeChild(runCub);
                }, 0);
            }
            if (!nextCard || (nextCard && nextCard.id.endsWith("0"))) {
                runCub.parentElement.removeChild(runCub);
            }
        }
    },
    /*4*/ function gameProcess(nextCard) {
        if (runCub.textContent === "5" && nextCard && nextCard.firstChild) {
            nextCard.removeChild(nextCard.firstChild);
            runCub.classList.replace("swap", "cub");
            runCub.textContent = levelsArr[id].gameProcessSwap;
        }
        if (
            runCub.textContent === "5" &&
            (!nextCard || (nextCard && nextCard.id.endsWith("0")))
        ) {
            runCub.classList.replace("swap", "cub");
        }
        baseGameProcess(nextCard);
    },
    /*5*/ function gameProcess(nextCard) {
        if (runCub.textContent === "5" && nextCard && nextCard.firstChild) {
            nextCard.removeChild(nextCard.firstChild);
        }
        if (
            runCub.textContent === "5" &&
            (!nextCard || (nextCard && nextCard.id.endsWith("0")))
        ) {
            runCub.classList.replace("del", "cub");
            runCub.textContent = levelsArr[id].gameProcessDel;
        }
        baseGameProcess(nextCard);
    },
];


// подсчёт суммы

function baseCalculateScore(cardsNum, allFilled) {
    let totalScore = 0;
    cardsNum.forEach((card) => {
        totalScore += parseInt(card.textContent) || 0;
    });
    if (allFilled && (totalScore % 5 === 0 || totalScore === 0)) {
        let total = document.getElementById("total");
        let currentScore = parseInt(total.textContent) || 0;
        setTimeout(() => {
            total.textContent = currentScore + totalScore;
            gameWin(total);
        }, 0);
        return true;
    }
    return false;
}

const calculateScoreArr = [
    /*0*/ function calculateScore(cardsNum, allFilled) {
        return baseCalculateScore(cardsNum, allFilled);
    },
    /* 1 */ function calculateScore(cardsNum, allFilled) {
        let allRotated = true;
        cardsNum.forEach((card) => {
            const cub = card.querySelectorAll(".cub");
            cub.forEach((cub) => {
                if (cub.style.transform !== "rotateZ(0deg)") {
                    allRotated = false;
                }
            });
        });
        if (allRotated) {
            return baseCalculateScore(cardsNum, allFilled);
        }
    },
    /* 2 */ function calculateScore(cardsNum, allFilled) {
        let totalScore = 0;
        cardsNum.forEach((card) => {
            totalScore += parseInt(card.textContent);
        });
        let zeroCube = Array.from(cardsNum).find(
            (card) => parseInt(card.textContent) === 0
        );
        if (
            (allFilled && (totalScore % 5 === 0 || totalScore === 0)) ||
            (allFilled && zeroCube)
        ) {
            let total = document.getElementById("total");
            let currentScore = parseInt(total.textContent);
            setTimeout(function () {
                total.textContent = currentScore + totalScore;
                gameWin(total);
            }, 0);
            return true;
        }
        return false;
    },
];
