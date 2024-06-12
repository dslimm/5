function createElements(startLevel, h2Text, isExpand) {
    let mainDiv = createDiv("mainDiv" + startLevel);
    let h2 = document.createElement("h2");
    h2.textContent = h2Text;
    let first10 = createDiv("", "first10");
    first10.classList.add(isExpand ? "block" : "none");
    let down0 = createSpan("down0", " ⤋");
    down0.classList.add(isExpand ? "inline" : "none");
    let right0 = createSpan("right0", " ⇛");
    right0.classList.add(isExpand ? "none" : "inline");

    h2.append(down0, right0);
    mainDiv.append(h2, first10);

    let levelsDiv = createDiv("", "levels");
    first10.appendChild(levelsDiv);
    let isFirstH3 = true;

    for (let i = startLevel; i < startLevel + 200; i++) {
        let levelDiv = createDiv("", "level");
        let link = document.createElement("a");
        link.href = "/5/level.html?id=" + i;
        link.className = i === startLevel ? "link num" : "no-link num";
        link.textContent = i;
        let span = createSpan("no-record", "00 : 00");
        span.classList.add("inline");
        levelDiv.append(link, span);
        levelsDiv.appendChild(levelDiv);

        if (i % 25 === 0 && i !== startLevel + 199) {
            let h3 = createH3(isFirstH3);
            isFirstH3 = false;
            first10.appendChild(h3);
            levelsDiv = createDiv("", "levels");
            first10.appendChild(levelsDiv);
        }
    }
    document.body.appendChild(mainDiv);
    mainDiv.setAttribute("ontouchstart", "");
}

function createDiv(id, className, displayClass) {
    let div = document.createElement("div");
    if (id) div.id = id;
    if (className) div.className = className;
    if (displayClass) div.classList.add(displayClass);
    return div;
}

function createSpan(className, textContent, displayClass = "none") {
    let span = document.createElement("span");
    span.className = className;
    span.textContent = textContent;
    span.classList.add(displayClass);
    return span;
}

function createH3(isFirstH3) {
    let h3 = document.createElement("h3");
    h3.textContent = "Показать ещё 25 уровней";
    h3.classList.add(isFirstH3 ? "block" : "none");
    let spanDown = createSpan("down", " ⇓");
    let spanRight = createSpan("right", " ⇒");
    spanRight.classList.add("inline");

    h3.append(spanDown, spanRight);

    h3.addEventListener("click", function () {
        let newClass = spanRight.classList.contains("inline")
            ? "none"
            : "inline";
        [spanDown, spanRight].forEach((span) => {
            span.className = newClass;
        });
    });

    return h3;
}

createElements(1, "ОЧЕНЬ МЕДЛЕННО", true);
createElements(201, "МЕДЛЕННО", false);
createElements(401, "СРЕДНЯЯ СКОРОСТЬ", false);
createElements(601, "БЫСТРО", false);
createElements(801, "ОЧЕНЬ БЫСТРО", false);


clickForH3(1);
clickForH3(201);
clickForH3(401);
clickForH3(601);
clickForH3(801);


function clickForH3(startLevel) {
    let mainDiv = document.querySelector("#mainDiv" + startLevel);
    let h3Elem = mainDiv.querySelectorAll("h3");

    h3Elem.forEach((h3, index) => {
        let nextElem = h3.nextElementSibling;
        let down = h3.querySelector(".down");
        let right = h3.querySelector(".right");
        nextElem.classList.add("none");

        h3.addEventListener("click", function () {
            let status = nextElem.classList.contains("none");
            nextElem.className = status ? "levels" : "none";
            down.className = status ? "inline" : "none";
            right.className = status ? "none" : "inline";

            if (status && h3Elem[index + 1]) {
                h3Elem[index + 1].className = "block";
            } else {
                for (let i = index + 1; i < h3Elem.length; i++) {
                    h3Elem[i].className = "none";
                    h3Elem[i].nextElementSibling.className = "none";
                }
            }
        });
    });
}

let h2Elem = document.querySelectorAll("h2");

h2Elem.forEach((h2) => {
    h2.addEventListener("click", function () {
        let first10 = this.nextElementSibling;
        let down0 = this.querySelector(".down0");
        let right0 = this.querySelector(".right0");

        first10.className = first10.className.includes("none")
            ? "block"
            : "none";

        const isBlock = first10.classList.contains("block");

        down0.className = "down0 " + (isBlock ? "inline" : "none");
        right0.className = "right0 " + (isBlock ? "none" : "inline");
    });
});

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

function getAllLevels(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["levels"], "readonly");
        const objectStore = transaction.objectStore("levels");
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

async function loadLevels() {
    try {
        const db = await openDatabase();
        const savedLevels = await getAllLevels(db);

        savedLevels.forEach((savedLevel) => {
            let levelLinks = Array.from(document.querySelectorAll(".num"));
            let levelLink = levelLinks.find(
                (link) =>
                    parseInt(link.textContent, 10) ===
                    parseInt(savedLevel.level, 10)
            );

            if (levelLink) {
                let recordElem = levelLink.parentNode.querySelector(
                    ".no-record"
                );
                recordElem.textContent = savedLevel.timer;
                recordElem.className = "record";
                let currentLevel = levelLinks.findIndex(
                    (link) =>
                        parseInt(link.textContent, 10) ===
                        parseInt(savedLevel.level, 10)
                );
                let nextLevel = currentLevel + 1;
                if (nextLevel < levelLinks.length) {
                    let nextElem = levelLinks[nextLevel];
                    nextElem.classList.replace("no-link", "link");
                }
            }
        });
        const firstZeroIndex = getFirstZero();
        scrollToZero(firstZeroIndex);
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}
loadLevels();

function getFirstZero() {
    const levelDivs = document.querySelectorAll(".level");
    return Array.from(levelDivs).findIndex((levelDiv) => {
        const timeElem = levelDiv.querySelector(".no-record");
        return timeElem !== null && timeElem.textContent === "00 : 00";
    });
}

function scrollToZero(firstZeroIndex) {
    const levelElems = document.querySelectorAll(".level");
    const firstZero = levelElems[firstZeroIndex];

    if (firstZero) {
        firstZero.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }
}
