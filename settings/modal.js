// создание модальных окон

function myModal() {
    const modalHtml = `
        <div id="pause-modal" class="modal"> 
            <div class="modal-content"> 
                <p class="max-text">ПАУЗА</p> 
                <a href="/5/menu/menu.html"> 
                    <p class="exit">Выйти в Меню</p> 
                </a> 
                <p class="min-text">или</p> 
                <a><p class="close">Вернуться в Игру</p></a> 
            </div> 
        </div> 

        <div id="loss-modal" class="modal"> 
            <div class="modal-content"> 
                <p class="max-text loss">Ну, почти...</p> 
                <a href="/5/menu/menu.html"> 
                    <p class="exit">Выйти в Меню</p> 
                </a> 
                <p class="min-text">или</p> 
                <a href="javascript:window.location.reload(true)"> 
                    <p class="close">Начать заново</p> 
                </a> 
            </div> 
        </div> 

        <div id="win-modal" class="modal"> 
            <div class="modal-content"> 
                <p class="max-text">ПОБЕДА</p> 
                <p class="min-text win"></p> 
                <p class="min-text new-record" style="display: none">0</p> 
                <a href="/5/menu/menu.html"> 
                    <p class="exit">Выйти в Меню</p> 
                </a> 
                <p class="min-text">или</p> 
                <a id="up" href=""> 
                    <p class="close">Играть дальше</p> 
                </a> 
            </div> 
        </div>`;

    const div = document.createElement("div");
    div.setAttribute("ontouchstart", "");
    div.innerHTML = modalHtml;
    return div;
}
const modalElems = myModal();
document.body.appendChild(modalElems);

let pauseModal = document.getElementById("pause-modal");
let pause = document.getElementById("open-pause-modal");
let close = document.getElementsByClassName("close")[0];
const pauseBtn = document.querySelector(".pause");

pause.addEventListener("click", function (event) {
    event.preventDefault();
    pauseBtn.classList.add("no-pause");
    pauseGame();
    pauseModal.style.display = "block";
    pauseModal.classList.add("show");
});

close.addEventListener("click", function () {
    pauseModal.classList.remove("show");
    pauseBtn.classList.remove("no-pause");
    resumeGame();
});

window.addEventListener("click", function (event) {
    if (event.target === pauseModal) {
        pauseBtn.classList.remove("no-pause");
        resumeGame();
        pauseModal.style.display = "none";
    }
});

function pauseGame() {
    clearInterval(timerInterval);
    clearInterval(gameInterval);
}

function resumeGame() {
    startTimerTime();
    startTimerGame(id);
}

let lossModal = document.getElementById("loss-modal");
function gameOver(nextCard) {
    if (
        nextCard &&
        nextCard.children.length !== 0 &&
        nextCard.id.endsWith("1")
    ) {
        pauseGame();
        lossModal.style.display = "block";
            lossModal.classList.add("show");
    }
}

let winModal = document.getElementById("win-modal");
function gameWin(total) {
    let targetValue = parseInt(document.getElementById("target").textContent);

    if (total.textContent >= targetValue) {
        pauseGame();
        upLinkLevel();
        winModal.style.display = "block";
            winModal.classList.add("show");
        const currentTimer = document.getElementById("timer").textContent;

        let messageWin = document.querySelector(".win");
        messageWin.textContent = "за " + currentTimer;

        // let record = document.querySelector(".record");
        // record.textContent = "[рекорд " + currentTimer + "]";
        // record.style.display = "block";

        upLevelTime(currentTimer);
    }
}

// ссылка на следующий уровень

function upLinkLevel() {
    let currentLevel = Number(document.getElementById("level").textContent);
    let nextLevel = currentLevel + 1;
    document.getElementById("up").href = `/5/level.html?id=${nextLevel}`;
}
