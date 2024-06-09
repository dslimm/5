document.querySelector(".reset").addEventListener("click", function (event) {
    event.preventDefault();

    let request = indexedDB.deleteDatabase("GameDatabase");

    request.onsuccess = function () {
        console.log("База данных успешно удалена.");
        location.reload();
    };

    request.onerror = function (e) {
        console.error("Ошибка при удалении базы данных:", e);
    };

    request.onblocked = function () {
        console.warn("Удаление базы данных заблокировано.");
    };
});
