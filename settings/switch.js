// создание параметров уровня по id

function switchLevel(id) {   
    const levelData = levelsArr[id];
    let content = `   
        <div class="elems1">   
            <a href="#" id="open-pause-modal" aria-label="Пауза">   
                <div class="pause"></div>   
            </a>   
            <div class="levels">   
                <span class="levels-text">— <span id="level">${levelData.id}</span> —</span>   
                <div class="text-cubs-value">   
                    <span>[ <span class="cubs-value">${levelData.value}</span> ]</span>   
                </div>   
            </div>   
            <div class="sound"></div>   
        </div>   
        <div class="elems2">   
            <div class="time">   
                <span id="timer"></span>   
            </div>   
            <div class="scores">   
                <span id="total">0</span>   
                <span>/</span>   
                <span id="target">${levelData.target}</span>   
            </div>   
        </div>   
    `; 
    const div = document.createElement("div");
    div.setAttribute("ontouchstart", "");
    div.innerHTML = content;
    document.body.appendChild(div);
}   

function windowLoad(id) {
    const funcId = levelsArr[id].load;
    const func = loadArr[Number(funcId)];
    func();

}

function startTimerGame(id) {
    const funcId = levelsArr[id].startTimerGame;
    const func = startTimerGameArr[Number(funcId)];
    func();
}

function getRandomValueSwitch(id) {
    const funcId = levelsArr[id].getRandomValue;
    const func = getRandomValueArr[Number(funcId)];
    func();
}

function gameProcess(id, nextCard) {
    const funcId = levelsArr[id].gameProcess;
    const func = gameProcessArr[Number(funcId)];
    func(nextCard);
}

function calculateScore(cardsNum, allFilled) {
    const funcId = levelsArr[id].calculateScore;
    const func = calculateScoreArr[Number(funcId)];
    return func(cardsNum, allFilled);
}
