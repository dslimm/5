function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("GameDatabase", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("levels")) {
                db.createObjectStore("levels", { keyPath: "level" });
            }
            if (!db.objectStoreNames.contains("recs")) {
                const recsStore = db.createObjectStore("recs", {
                    keyPath: "level",
                });
                for (let i = 1; i <= 1000; i++) {
                    recsStore.put({ level: i, timer: "00:00" });
                }
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

function getAllRecs(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["recs"], "readonly");
        const objectStore = transaction.objectStore("recs");
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function saveRec(db, level, timer) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["recs"], "readwrite");
        const objectStore = transaction.objectStore("recs");
        const request = objectStore.put({ level, timer });

        request.onsuccess = () => {
            resolve();
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function convertToSec(time) {
    const parts = time.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

async function loadLevels() {
    try {
        const db = await openDatabase();
        const savedLevels = await getAllLevels(db);
        const savedRecs = await getAllRecs(db);

        createRecs(savedRecs);

        for (let rec of savedRecs) {
            let lvlElements = document.querySelectorAll(".lvl");
            lvlElements.forEach((lvlElement) => {
                if (lvlElement.textContent == rec.level) {
                    let div = lvlElement.parentNode;
                    let rec1 = div.querySelector(".rec1");
                    rec1.textContent = rec.timer;
                }
            });
        }

        for (let levelInfo of savedLevels) {
            let lvlElements = document.querySelectorAll(".lvl");
            for (let lvlElement of lvlElements) {
                if (lvlElement.textContent == levelInfo.level) {
                    let rec1 = lvlElement.parentNode.querySelector(".rec1");
                    let rec2 = lvlElement.parentNode.querySelector(".rec2");
                    rec2.textContent = levelInfo.timer;
                    let rec1Sec = convertToSec(rec1.textContent);
                    let rec2Sec = convertToSec(rec2.textContent);

                    if (rec2Sec < rec1Sec || rec1Sec === 0) {
                        rec1.textContent = rec2.textContent;
                        await saveRec(db, levelInfo.level, rec2.textContent);
                    }
                    if (
                        convertToSec(rec1.textContent) ===
                        convertToSec(rec2.textContent)
                    ) {
                        rec1.parentNode.className = "best-times";
                    }
                }
            }
        }
        const firstZeroIndex = getFirstZero(savedRecs);
        scrollToZero(firstZeroIndex);
        
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

function createRecs(savedRecs) {
    for (let rec of savedRecs) {
        let div = document.createElement("div");
        div.classList.add("times");

        div.innerHTML = ` 
            <span class="rec1">${rec.timer}</span> 
            <span class="lvl">${rec.level}</span> 
            <span class="rec2">00:00</span> 
        `;
        document.body.appendChild(div);
    }
}

function getFirstZero(savedRecs) {
    return savedRecs.findIndex((rec) => rec.timer === "00:00");
}

function scrollToZero(firstZeroIndex) {
    const timesElems = document.querySelectorAll(".times");
    const firstZero = timesElems[firstZeroIndex];

    if (firstZero) {
        firstZero.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }
}

loadLevels();
