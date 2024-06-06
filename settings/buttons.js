// создание кнопок управления

function myButtons() {
    const buttonsHtml = `
    <div class="btn">
        <span id="left"></span>
        <span id="down"></span>
        <span id="right"></span>
    </div>`;

    const div = document.createElement("div");
    div.setAttribute("ontouchstart", "");
    div.innerHTML = buttonsHtml;
    return div;
}
const buttonsElem = myButtons();
document.body.appendChild(buttonsElem);

left.addEventListener("click", function () {
    const currentIndex = Array.from(allCards).indexOf(runCub.parentElement);
    if (currentIndex >= 10) {
        const leftCardId = allCards[currentIndex - 10].id;
        const leftCard = document.getElementById(leftCardId);
        if (leftCard.children.length === 0) {
            leftCard.appendChild(runCub);
        }
    }
});

right.addEventListener("click", function () {
    const currentIndex = Array.from(allCards).indexOf(runCub.parentElement);
    if (currentIndex < 40) {
        const rightCardId = allCards[currentIndex + 10].id;
        const rightCard = document.getElementById(rightCardId);
        if (rightCard.children.length === 0) {
            rightCard.appendChild(runCub);
        }
    }
});

down.addEventListener("click", function () {
    for (let i = 0; i <= 6; i++) {
        const nextCard = getNextCard();
        moveCub(nextCard);
    }
});

const sound = document.querySelector(".sound");
sound.addEventListener("click", function () {
    sound.classList.toggle("no-sound");
});