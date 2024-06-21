function createElements(startLevel, h2Text, firstZeroIndex) {
    const docFragment = document.createDocumentFragment();

    for (let i = startLevel; i < startLevel + 200; i += 200) {
        const isActiveH2 = firstZeroIndex >= i && firstZeroIndex < i + 200;
        const mainDiv = createDiv("mainDiv" + i);
        const h2 = document.createElement("h2");
        h2.textContent = h2Text;

        const first25 = createDiv("", "first25");
        first25.classList.add(isActiveH2 ? "block" : "none");
        const down = createSpan("down", " ⤋");
        down.classList.add(isActiveH2 ? "inline" : "none");
        const right = createSpan("right", " ⇛");
        right.classList.add(isActiveH2 ? "none" : "inline");

        h2.append(down, right);
        mainDiv.append(h2, first25);
        const levelsDiv = createDiv("", "levels");
        first25.appendChild(levelsDiv);
        let allLevelsCompleted = true;

        for (let j = i; j < i + 200; j++) {
            const levelDiv = createDiv("", "level");
            const link = document.createElement("a");
            link.href = "/5/level.html?id=" + j;
            link.className = j === startLevel ? "link num" : "no-link num";
            link.textContent = j;

            if (link.className.includes("no-link")) {
                allLevelsCompleted = false;
            }

            const span = createSpan("no-record", "00 : 00");
            span.classList.add("inline");

            levelDiv.append(link, span);
            if (isActiveH2 || (!isActiveH2 && j < startLevel + 25)) {
                levelsDiv.appendChild(levelDiv);
            }
        }

        if (allLevelsCompleted) {
            const allLevels = levelsDiv.querySelectorAll(".level");
            allLevels.forEach((level) => {
                level.style.display = "block";
            });
            down.classList.replace("none", "inline");
            right.classList.replace("inline", "none");
        }

        docFragment.appendChild(mainDiv);
    }
    document.body.appendChild(docFragment);
    document.body.setAttribute("ontouchstart", "");
}

function createDiv(id, className, displayClass) {
    const div = document.createElement("div");
    div.id = id;
    div.className = className;
    div.classList.add(displayClass);
    return div;
}

function createSpan(className, textContent, displayClass = "none") {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = textContent;
    span.classList.add(displayClass);
    return span;
}

createElements(1, "ОЧЕНЬ МЕДЛЕННО", 1);
createElements(201, "МЕДЛЕННО", 0);
createElements(401, "НОРМАЛЬНО", 0);
createElements(601, "БЫСТРО", 0);
createElements(801, "ОЧЕНЬ БЫСТРО", 0);

function clickForH2() {
    const h2Elem = document.querySelectorAll("h2");
    h2Elem.forEach((h2) => {
        h2.addEventListener("click", function () {
            const first25 = this.nextElementSibling;
            const down = this.querySelector(".down");
            const right = this.querySelector(".right");

            first25.className = first25.className.includes("none")
                ? "block"
                : "none";

            const isBlock = first25.classList.contains("block");

            down.className = "down " + (isBlock ? "inline" : "none");
            right.className = "right " + (isBlock ? "none" : "inline");
        });
    });
}
clickForH2();

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
        const levelLinks = Array.from(document.querySelectorAll(".num"));

        savedLevels.forEach((savedLevel) => {
            const levelIndex = levelLinks.findIndex(
                (link) =>
                    parseInt(link.textContent, 10) ===
                    parseInt(savedLevel.level, 10)
            );
            if (levelIndex !== -1) {
                const levelLink = levelLinks[levelIndex];
                const recordElem = levelLink.parentNode.querySelector(
                    ".no-record"
                );
                recordElem.textContent = savedLevel.timer;
                recordElem.className = "record";
                const nextLevel = levelIndex + 1;
                if (nextLevel < levelLinks.length) {
                    levelLinks[nextLevel].classList.replace("no-link", "link");
                }
            }
        });
        const firstZeroIndex = getFirstZero();
        hideElems(firstZeroIndex);
        scrollToZero(firstZeroIndex);
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

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

function hideElems(firstZeroIndex) {
    // Если нет пройденных уровней, устанавливаем firstZeroIndex на 1
    if (firstZeroIndex === 0) {
        firstZeroIndex = 1;
    }
    
    const blockIndex = Math.floor((firstZeroIndex - 1) / 200) + 1;
    const startLevel = (blockIndex - 1) * 200 + 1;
    const endLevel = blockIndex * 200;

    const levelElems = Array.from(document.querySelectorAll(".level")).filter(
        (el) => {
            const level = parseInt(el.querySelector(".num").textContent);
            return level >= startLevel && level <= endLevel;
        }
    );

    const startIndex = levelElems.findIndex(
        (el) =>
            parseInt(el.querySelector(".num").textContent) === firstZeroIndex
    );
    let endIndex = Math.min(
        startIndex + 25 + ((5 - ((startIndex + 25) % 5)) % 5),
        levelElems.length
    );

    // Если firstZeroIndex был установлен на 1, то endIndex должен быть 25 или 30 (в зависимости от кратности 5)
    if (firstZeroIndex === 1) {
        endIndex = 25 + ((5 - (25 % 5)) % 5);
    }

    levelElems.forEach((el, index) => {
        el.style.display = index < endIndex ? "flex" : "none";
    });
}


loadLevels();
