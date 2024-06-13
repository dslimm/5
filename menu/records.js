
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
        const [savedLevels, savedRecs] = await Promise.all([
            getAllLevels(db),
            getAllRecs(db)
        ]);
        

        createRecs(savedRecs);
        updateRecs(savedRecs);
        await updateLevels(db, savedLevels);

        const firstZeroIndex = getFirstZero(savedRecs);
        requestAnimationFrame(() => {
            scrollToZero(firstZeroIndex);
        });
        
        hideElems(firstZeroIndex);
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

function updateRecs(savedRecs) {  
    const lvlElements = document.querySelectorAll(".lvl");  
    const recsByLevel = {}; 

    savedRecs.forEach((rec) => {  
        recsByLevel[rec.level] = rec; 
    });

    lvlElements.forEach((lvlElement) => {  
        const rec = recsByLevel[lvlElement.textContent];
        if (rec) {  
            const div = lvlElement.parentNode;  
            const rec1 = div.querySelector(".rec1");  
            rec1.textContent = rec.timer;  
        }  
    });  
}

async function updateLevels(db, savedLevels) {
    const lvlElements = [...document.querySelectorAll(".lvl")];
    const lvlMap = lvlElements.reduce((acc, el) => {
        acc[el.textContent] = el;
        return acc;
    }, {});

    for (let levelInfo of savedLevels) {
        let lvlElement = lvlMap[levelInfo.level];

        if (lvlElement) {
            const rec1 = lvlElement.parentNode.querySelector(".rec1");
            const rec2 = lvlElement.parentNode.querySelector(".rec2");
            rec2.textContent = levelInfo.timer;
            const rec1Sec = convertToSec(rec1.textContent);
            const rec2Sec = convertToSec(rec2.textContent);

            if (rec2Sec < rec1Sec || rec1Sec === 0) {
                rec1.textContent = rec2.textContent;
                await saveRec(db, levelInfo.level, rec2.textContent);
            }

            if (convertToSec(rec1.textContent) === rec2Sec) {
                rec1.parentNode.className = "best-times";
            }
        }
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

function hideElems(firstZeroIndex) {
    const timesElems = document.querySelectorAll(".times");
    let startIndex = 0;

    timesElems.forEach((el, index) => {
        const level = parseInt(el.querySelector(".lvl").textContent);
        if (level === firstZeroIndex && startIndex === 0) {
            startIndex = index;
        }
    });

    timesElems.forEach((el, index) => {
        const level = el.querySelector(".lvl").textContent;
        if (index <= startIndex + 25 || level === "1000") {
            el.style.display = "flex";
        } else {
            el.style.display = "none";
        }
    });
}

loadLevels();
