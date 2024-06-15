function createElems1() {  
    let div = document.createElement("div");  
    div.setAttribute("ontouchstart", "");

    div.innerHTML = `  
        <div class="elems1">  
            <a href="/5/menu/menu.html" aria-label="Выйти в меню">  
                <div class="back"></div>  
            </a>  
            <div class="sound"></div>  
        </div>  
    `;  
    document.body.prepend(div);

    const sound = document.querySelector(".sound");  
    sound.addEventListener('click', function () {  
        sound.classList.toggle("no-sound");  
    });
}  
createElems1();
