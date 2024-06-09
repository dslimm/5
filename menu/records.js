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
                for (let i = 1; i <= 200; i++) {
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

async function loadLevels() {
    try {
        const db = await openDatabase();
        const savedLevels = await getAllLevels(db);
        const savedRecs = await getAllRecs(db);

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
                    if (convertToSec(rec1.textContent) === convertToSec(rec2.textContent)) { 
                        rec1.parentNode.className = "best-times"; 
                    } 
                }
            }
        }
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

function convertToSec(time) {
    const parts = time.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}
loadLevels();

// let recs =
//     JSON.parse(localStorage.getItem("recs")) || Array(200).fill("00 : 00");

// for (let i = 1; i <= 200; i++) {
//     let div = document.createElement("div");
//     div.classList.add("times");

//     div.innerHTML = `
//         <span class="rec1">${recs[i - 1]}</span>
//         <span class="lvl">${i}</span>
//         <span class="rec2">00 : 00</span>
//     `;
//     document.body.appendChild(div);
// }

// let levels = JSON.parse(localStorage.getItem("levels")) || [];

// for (let levelInfo of levels) {
//     let lvlElements = document.querySelectorAll(".lvl");
//     for (let lvlElement of lvlElements) {
//         if (lvlElement.textContent == levelInfo.level) {
//             let rec2 = lvlElement.parentNode.querySelector(".rec2");
//             let rec1 = lvlElement.parentNode.querySelector(".rec1");
//             rec2.textContent = levelInfo.timer;
//             let rec1Sec = convertToSec(rec1.textContent);
//             let rec2Sec = convertToSec(rec2.textContent);

//             if (rec2Sec < rec1Sec || rec1Sec === 0) {
//                 rec1.textContent = rec2.textContent;
//                 recs[levelInfo.level - 1] = rec1.textContent;
//                 localStorage.setItem("recs", JSON.stringify(recs));
//             }
//             if (rec2Sec === rec1Sec) {
//                 rec1.parentNode.className = "best-times";
//             }
//         }
//     }
// }

// function convertToSec(time) {
//     const parts = time.split(":");
//     return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
// }
