document.addEventListener("DOMContentLoaded", function () {
    const listaAficiones = document.getElementById("listaAficiones");
    const eliminarAficionesLista = document.getElementById("eliminarAficionesLista");
    const eliminarAficionesBtn = document.getElementById("eliminarAficionesBtn");
    const añadirAficionesLista = document.getElementById("añadirAficionesLista");
    const añadirAficionesBtn = document.getElementById("añadirAficionesBtn");

    const userData = JSON.parse(sessionStorage.getItem("usuario"));
    if (!userData || !userData.userEmail) {
        alert("No has iniciado sesión. Redirigiendo al login...");
        window.location.href = "login.html";
        return;
    }
    const userEmail = userData.userEmail;

    const dbRequest = indexedDB.open("vm15DB");

    dbRequest.onsuccess = function (event) {
        const db = event.target.result;

        function cargarAficiones() {
            listaAficiones.innerHTML = "";
            const transaction = db.transaction(["UsuarioAficion", "Aficiones"], "readonly");
            const usuarioAficionStore = transaction.objectStore("UsuarioAficion");
            const aficionesStore = transaction.objectStore("Aficiones");

            const cursor = usuarioAficionStore.index("emailUsu").openCursor(IDBKeyRange.only(userEmail));
            cursor.onsuccess = function (event) {
                const result = event.target.result;
                if (result) {
                    const aficionID = result.value.idAfi;
                    const aficionRequest = aficionesStore.get(aficionID);

                    aficionRequest.onsuccess = function (event) {
                        const aficion = event.target.result;
                        if (aficion) {
                            const listItem = document.createElement("li");
                            listItem.textContent = aficion.descripcion;
                            listaAficiones.appendChild(listItem);
                        }
                    };

                    result.continue();
                } else if (listaAficiones.innerHTML === "") {
                    listaAficiones.innerHTML = "<p>No tienes aficiones registradas.</p>";
                }
            };
        }

        function cargarAficionesParaEliminar() {
            eliminarAficionesLista.innerHTML = "";
            const transaction = db.transaction(["UsuarioAficion", "Aficiones"], "readonly");
            const usuarioAficionStore = transaction.objectStore("UsuarioAficion");
            const aficionesStore = transaction.objectStore("Aficiones");

            const cursor = usuarioAficionStore.index("emailUsu").openCursor(IDBKeyRange.only(userEmail));
            cursor.onsuccess = function (event) {
                const result = event.target.result;
                if (result) {
                    const aficionID = result.value.idAfi;
                    const aficionRequest = aficionesStore.get(aficionID);

                    aficionRequest.onsuccess = function (event) {
                        const aficion = event.target.result;
                        if (aficion) {
                            const listItem = document.createElement("li");
                            listItem.innerHTML = `
                                <label>
                                    <input type="checkbox" value="${result.value.idRel}">
                                    ${aficion.descripcion}
                                </label>
                            `;
                            eliminarAficionesLista.appendChild(listItem);
                        }
                    };

                    result.continue();
                }
            };
        }

        function cargarAficionesParaAñadir() {
            añadirAficionesLista.innerHTML = "";
            const transaction = db.transaction(["Aficiones", "UsuarioAficion"], "readonly");
            const aficionesStore = transaction.objectStore("Aficiones");
            const usuarioAficionStore = transaction.objectStore("UsuarioAficion");

            const usuarioAficiones = new Set();
            const cursor = usuarioAficionStore.index("emailUsu").openCursor(IDBKeyRange.only(userEmail));
            cursor.onsuccess = function (event) {
                const result = event.target.result;
                if (result) {
                    usuarioAficiones.add(result.value.idAfi);
                    result.continue();
                } else {
                    aficionesStore.openCursor().onsuccess = function (event) {
                        const aficionCursor = event.target.result;
                        if (aficionCursor) {
                            const aficion = aficionCursor.value;
                            if (!usuarioAficiones.has(aficion.idAfi)) {
                                const listItem = document.createElement("li");
                                listItem.innerHTML = `
                                    <label>
                                        <input type="checkbox" value="${aficion.idAfi}">
                                        ${aficion.descripcion}
                                    </label>
                                `;
                                añadirAficionesLista.appendChild(listItem);
                            }
                            aficionCursor.continue();
                        }
                    };
                }
            };
        }

        eliminarAficionesBtn.addEventListener("click", function () {
            const seleccionados = Array.from(eliminarAficionesLista.querySelectorAll("input:checked"));
            if (seleccionados.length === 0) {
                alert("No has seleccionado ninguna afición para eliminar.");
                return;
            }

            const transaction = db.transaction(["UsuarioAficion"], "readwrite");
            const usuarioAficionStore = transaction.objectStore("UsuarioAficion");

            seleccionados.forEach((checkbox) => {
                const idRel = parseInt(checkbox.value);
                usuarioAficionStore.delete(idRel);
            });

            alert("Aficiones eliminadas correctamente.");
            cargarAficiones();
            cargarAficionesParaEliminar();
            cargarAficionesParaAñadir();
        });

        añadirAficionesBtn.addEventListener("click", function () {
            const seleccionados = Array.from(añadirAficionesLista.querySelectorAll("input:checked"));
            if (seleccionados.length === 0) {
                alert("No has seleccionado ninguna afición para añadir.");
                return;
            }

            const transaction = db.transaction(["UsuarioAficion"], "readwrite");
            const usuarioAficionStore = transaction.objectStore("UsuarioAficion");

            seleccionados.forEach((checkbox) => {
                const aficionID = parseInt(checkbox.value);
                usuarioAficionStore.add({ emailUsu: userEmail, idAfi: aficionID });
            });

            alert("Aficiones añadidas correctamente.");
            cargarAficiones();
            cargarAficionesParaEliminar();
            cargarAficionesParaAñadir();
        });

        cargarAficiones();
        cargarAficionesParaEliminar();
        cargarAficionesParaAñadir();
    };
});
