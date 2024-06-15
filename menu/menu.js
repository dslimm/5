let modal;

if (!document.getElementById("reset-modal")) {
    createModal();
}

function createModal() {
    const modalHtml = `   
        <div id="reset-modal" class="modal">   
            <div class="modal-content">   
                <p class="max-text">Начать игру<br> сначала?</p>   
                <button id="yes-reset">ДА</button>   
                <button id="no-reset">НЕТ</button>   
            </div>   
        </div>`;
    const div = document.createElement("div");
    div.innerHTML = modalHtml;
    document.body.appendChild(div);

    modal = document.getElementById("reset-modal");

    div.querySelector("#yes-reset").addEventListener("click", function (event) {
        event.stopPropagation();

        const request = indexedDB.deleteDatabase("GameDatabase");

        request.onsuccess = function () {
            location.reload();
        };

        request.onerror = function (e) {
            console.error("Ошибка при удалении данных:", e);
        };

        request.onblocked = function () {
            console.warn("Удаление данных заблокировано.");
        };
        closeModal();
    });

    div.querySelector("#no-reset").addEventListener("click", function (event) {
        event.stopPropagation();
        closeModal();
    });

    modal.addEventListener("click", function (event) {
        const modalContent = document.querySelector(".modal-content");
        if (!modalContent.contains(event.target)) {
            closeModal();
        }
    });
}

function closeModal() {
    if (modal) {
        modal.classList.remove("show");
    }
}

const resetLink = document.querySelector(".reset");
resetLink.addEventListener("click", function (event) {
    event.preventDefault();
    modal.classList.add("show");
});
