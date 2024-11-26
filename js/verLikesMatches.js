

document.addEventListener("DOMContentLoaded", function () {
    const likesList = document.getElementById("listaLikes");
    const matchesList = document.getElementById("listaMatches");

    // Obtener el usuario logueado desde sessionStorage
    const userData = JSON.parse(sessionStorage.getItem("usuario"));
    if (!userData || !userData.userEmail) {
        alert("No has iniciado sesión. Redirigiendo al login...");
        window.location.href = "login.html";
        return;
    }

    const userEmail = userData.userEmail;

    // Conectar a la base de datos IndexedDB
    const request = indexedDB.open("vm15DB");

    request.onsuccess = function (event) {
        const db = event.target.result;

        // Limpiar listas
        likesList.innerHTML = "";
        matchesList.innerHTML = "";

        // Acceder al almacén de Likes y buscar registros donde el usuario logueado es el destino
        const transaction = db.transaction(["Likes"], "readonly");
        const likesStore = transaction.objectStore("Likes");
        const index = likesStore.index("emailDestino");

        const range = IDBKeyRange.only(userEmail);

        index.openCursor(range).onsuccess = function (event) {
            const cursor = event.target.result;

            if (cursor) {
                const usuarioLike = cursor.value.emailUsuario;
                
                 verificarMatch(db, userEmail, usuarioLike, function (isMatch) {
                    // Obtener datos del usuario
                    obtenerUsuario(db, usuarioLike, function (usuario) {
                        if (usuario) {
                            const listItem = document.createElement("div");
                            listItem.innerHTML = `
                                <img src="${usuario.foto}" alt="Foto de ${usuario.nombre}" style="width: 50px; height: 50px;">
                                <p><strong>${usuario.nombre}</strong>, ${usuario.edad} años, ${usuario.provincia}</p>
                            `;
                           
                            // Verificar si es un match
                            if (isMatch) {
                                // Si es un match, agregar a la lista de matches con un corazón rojo
                                listItem.innerHTML += '<span style="color: red; font-size: 1.5em;">❤️</span>';
                                matchesList.appendChild(listItem);
                            } else {
                                likesList.appendChild(listItem);
                            }
                        }
                    });
                });


                // Continuar con el siguiente registro
                cursor.continue();
            } else {
                console.log("Procesados todos los likes.");
            }
        };

        index.openCursor(range).onerror = function (event) {
            console.error("Error al recorrer los likes:", event.target.error);
        };
    };

    request.onerror = function (event) {
        console.error("Error al abrir la base de datos:", event.target.error);
    };

    // Función para verificar si hay un match
    function verificarMatch(db, emailUsuario, emailDestino, callback) {
        const transaction = db.transaction(["Likes"], "readonly");
        const likesStore = transaction.objectStore("Likes");
        const index = likesStore.index("emailUsuario");

        const range =IDBKeyRange.only(emailUsuario);
        let isMatch = false;

        index.openCursor(range).onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.emailDestino === emailDestino) {
                    isMatch = true; // Hay match
                }
                cursor.continue();
            } else {
                callback(isMatch); // Retorna true o false al terminar de recorrer los datos
            }
        };

        request.openCursor = function (event) {
            console.error("Error al verificar el match:", event.target.error);
            callback(false);
        };
    }

    // Función para obtener los datos del usuario por su email
    function obtenerUsuario(db, email, callback) {
        const transaction = db.transaction(["Usuario"], "readonly");
        const usuarioStore = transaction.objectStore("Usuario");

        const request = usuarioStore.get(email);

        request.onsuccess = function (event) {
            callback(event.target.result);
        };

        request.onerror = function (event) {
            console.error("Error al obtener usuario:", event.target.error);
            callback(null);
        };
    }
});
