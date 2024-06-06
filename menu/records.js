for (let i = 1; i <= 20; i++) {  
    let div = document.createElement("div");
    div.classList.add("times");

    div.innerHTML = `  
        <span class="rec1">05 : 00</span>  
        <span class="lvl">${i}</span>  
        <span class="rec2">00 : 00</span>  
    `;  
    document.body.appendChild(div);
}

let levels = JSON.parse(localStorage.getItem("levels"));

if (levels) {
    for (let levelInfo of levels) {
        let lvlElements = document.querySelectorAll(".lvl");
        for (let lvlElement of lvlElements) {
            if (lvlElement.textContent == levelInfo.level) {
                let rec2 = lvlElement.parentNode.querySelector(".rec2");
                let rec1 = lvlElement.parentNode.querySelector(".rec1");
                rec2.textContent = levelInfo.timer;

                let rec1Sec = convertToSec(rec1.textContent);
                let rec2Sec = convertToSec(rec2.textContent);

                // console.log(rec1Sec);
                // console.log(rec2Sec);

                if (rec2Sec < rec1Sec) {
                    rec1.textContent = rec2.textContent;
                    rec1.parentNode.className = "best-times";
                }
            }
        }
    }
}

function convertToSec(time) {
    const parts = time.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}
