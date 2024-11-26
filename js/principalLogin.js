var bd, cajadatos;

// Iniciar la aplicación al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    iniciar();
});

function iniciar() {
    // Abrir la base de datos IndexedDB
    var solicitud = indexedDB.open("vm15DB");

    solicitud.onsuccess = function (event) {
        bd = event.target.result;
        inicializarUsuario(); // Inicializa y muestra al usuario logueado
        document.getElementById("searchForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Evita el envío del formulario
        buscarPersonas(); // Llama a la búsqueda
});
    };

    solicitud.onerror = function (event) {
        console.error("Error al abrir la base de datos:", event.target.error);
    };
}

function inicializarUsuario() {
    const usuarioData = JSON.parse(sessionStorage.getItem("usuario"));

    // Verifica si hay un usuario logueado
    if (!usuarioData) {
        console.warn("No se encontraron datos de usuario. Redirigiendo a login...");
        window.location.href = "login.html";
        return;
    }

// Mostrar los datos del usuario logueado
const nombreUsuarioElement = document.getElementById("nombreUsuario");
const fotoUsuarioElement = document.getElementById("fotoUsuario");

if (nombreUsuarioElement) {
    nombreUsuarioElement.textContent = `¡Hola, ${usuarioData.userName}!`;
}

if (fotoUsuarioElement) {
    fotoUsuarioElement.src = usuarioData.userPhoto || "imagenes/default-avatar.png"; // Imagen por defecto
}
}

// Función para buscar usuarios según filtros
function buscarPersonas() {
    const genero = document.getElementById("genero").value;
    const edadMinima = parseInt(document.getElementById("edadMinima").value, 10);
    const edadMaxima = parseInt(document.getElementById("edadMaxima").value, 10);
    const provincia = document.getElementById("provincia1").value;

 // Obtener el email del usuario logueado desde sessionStorage
    const usuarioLogueado = JSON.parse(sessionStorage.getItem("usuario"));
    const emailLogueado = usuarioLogueado ? usuarioLogueado.userEmail : null;
    
    
    const transaction = bd.transaction(["Usuario"], "readonly");
    const usuarioStore = transaction.objectStore("Usuario");
    const indice = usuarioStore.index("edad");

    const rango = IDBKeyRange.bound(edadMinima, edadMaxima, false, false);

    const personasEncontradas = [];
    indice.openCursor(rango).onsuccess = function (event) {
        const cursor = event.target.result;

        if (cursor) {
            const usuario = cursor.value;
            if (
                (genero === "ambos" || usuario.genero === genero) &&
                usuario.provincia === provincia &&
                usuario.email !== emailLogueado
            ) {
                personasEncontradas.push(usuario);
            }
            cursor.continue();
        } else {
            mostrarPersonas(personasEncontradas); // Mostrar resultados
        }
    };
    indice.openCursor(rango).onerror = function (event) {
        console.error("Error al buscar personas:", event.target.error);
        };
    }

// Mostrar las personas encontradas en el DOM
    function mostrarPersonas(personas) {
        const cajadatos = document.getElementById("listaPersonas");
    cajadatos.innerHTML = ""; // Limpia resultados previos

    if (!Array.isArray(personas) || personas.length === 0) {
        console.log("No se encontraron personas para mostrar.");
            cajadatos.innerHTML = "<p>No se encontraron resultados.</p>";
            return;
        }

    console.log("Mostrando personas:", personas);
        personas.forEach((persona) => {
            const div = document.createElement("div");
            div.innerHTML = `
                <img src="${persona.foto}" alt="Foto de ${persona.nombre}" style="width: 50px; height: 50px;">
                <p>Nombre: ${persona.nombre}</p>
                <p>Edad: ${persona.edad}</p>
                <p>Género: ${persona.genero}</p>
                <p>Provincia: ${persona.provincia}</p>
            `;
            
            // Crear botón "Ver detalles"
        const botonDetalles = document.createElement("button");
        botonDetalles.classList.add("ver-detalles-btn");
        botonDetalles.textContent = "Ver detalles";
        botonDetalles.addEventListener("click", function () {
            mostrarDetallesPersona(persona.email); // Llama a la función para mostrar los detalles
        });

        // Añadir el botón al contenedor de la persona
        div.appendChild(botonDetalles);
            cajadatos.appendChild(div);
        });
    }
    
    // Función para mostrar los detalles de una persona en un modal
function mostrarDetallesPersona(email) {
    const modal = document.getElementById("detallesModal");
    const detallesUsuario = document.getElementById("detallesUsuario");

    const transaction = bd.transaction(["Usuario", "UsuarioAficion", "Aficiones"], "readonly");
    const usuarioStore = transaction.objectStore("Usuario");
    const usuarioaficionStore = transaction.objectStore("UsuarioAficion");
    const aficionesStore = transaction.objectStore("Aficiones");

    // Obtener los datos del usuario
    const request = usuarioStore.get(email);

    request.onsuccess = function (event) {
        const usuario = event.target.result;
        if (usuario) {
            // Mostrar datos del usuario
            detallesUsuario.innerHTML = `
                <h2>${usuario.nombre}</h2>
                <img src="${usuario.foto}" alt="Foto de ${usuario.nombre}" style="width: 50px; height: 50px;">
                <p>Nombre: ${usuario.nombre}</p>
                <p>Edad: ${usuario.edad}</p>
                <p>Género: ${usuario.genero}</p>
                <p>Provincia: ${usuario.provincia}</p>
            `;

            // Obtener y mostrar aficiones del usuario
            const aficiones = [];
            const cursor = usuarioaficionStore.index("emailUsu").openCursor(IDBKeyRange.only(email));
            cursor.onsuccess = function (e) {
                const result = e.target.result;
                if (result) {
                    const aficionID = result.value.idAfi;
                    const aficionRequest = aficionesStore.get(aficionID);

                    aficionRequest.onsuccess = function (event) {
                        const aficion = event.target.result;
                        if (aficion) {
                            aficiones.push(aficion.descripcion);
                        }
                    };

                    result.continue();
                } else {
                    detallesUsuario.innerHTML += `
                        <p><strong>Aficiones:</strong> ${aficiones.join(", ") || "No tiene aficiones registradas."}</p>
                    `;
                    
                    // Mostrar el mapa con la ubicación del usuario
                    if (usuario.ubicacion) {
                        cargarMapa(usuario.ubicacion);
                    } else {
                        document.getElementById("mapa").innerHTML = "<p>Ubicación no disponible.</p>";
                    }
                }
            };

            modal.style.display = "block"; // Mostrar el modal
        } else {
            alert("No se encontraron detalles para este usuario.");
        }
    };
        // Función para cargar el mapa con la ubicación del usuario
        function cargarMapa(ubicacion) {
            const { latitud, longitud } = ubicacion;

            // Asegúrate de incluir la API de Google Maps en tu proyecto
            const mapa = new google.maps.Map(document.getElementById("mapa"), {
                center: { lat: latitud, lng: longitud },
                zoom: 15,
            });

            new google.maps.Marker({
                position: { lat: latitud, lng: longitud },
                map: mapa,
                title: "Ubicación del Usuario",
            });
        }
    request.onerror = function (event) {
        console.error("Error al obtener los detalles del usuario:", event.target.error);
    };

        // Función para cerrar el modal
        function cerrarModal() {
            document.getElementById("detallesModal").style.display = "none";
        }

        // Evento para cerrar el modal al hacer clic fuera del contenido del modal
        window.addEventListener("click", function (event) {
            const modal = document.getElementById("detallesModal");
            if (event.target === modal) {
                cerrarModal();
            }
        });
    }
document.addEventListener("DOMContentLoaded", function () {
    // Selección de elementos del DOM
    const fotoUsuario = document.getElementById("fotoUsuario");
    const editarPerfilDiv = document.getElementById("editarPerfil");
    const fotoInput = document.getElementById("fotoInput");
    const dropZone = document.getElementById("dropZone");
    const fotoPreview = document.getElementById("fotoPreview");
    const provinciaSelect = document.getElementById("provincia");
    const formEditarPerfil = document.getElementById("formEditarPerfil");

    // Verificar que los elementos existen antes de usarlos
    if (!fotoUsuario || !editarPerfilDiv || !fotoInput || !dropZone || !fotoPreview || !provinciaSelect || !formEditarPerfil) {
        console.error("No se encontraron todos los elementos requeridos en el DOM.");
        return;
    }

    // Mostrar/Ocultar el cuadro de editar perfil al hacer clic en la foto
    fotoUsuario.addEventListener("click", function () {
        console.log("Clic en fotoUsuario para editar perfil.");
        editarPerfilDiv.style.display =
            editarPerfilDiv.style.display === "block" ? "none" : "block";
    });

    // Drag and Drop para la foto
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "blue";
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.style.borderColor = "#ccc";
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "#ccc";
        const file = e.dataTransfer.files[0];
        mostrarVistaPrevia(file);
    });

    dropZone.addEventListener("click", () => {
        fotoInput.click();
    });

    fotoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        mostrarVistaPrevia(file);
    });

    // Función para mostrar la vista previa de la imagen
    function mostrarVistaPrevia(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            fotoPreview.src = e.target.result;
            fotoPreview.style.display = "block";
        };

        reader.onerror = () => {
            console.error("Error al cargar la imagen.");
            alert("Hubo un error al cargar la imagen. Por favor, intenta con otro archivo.");
        };

        reader.readAsDataURL(file);
    }

    // Guardar cambios en el perfil
    formEditarPerfil.addEventListener("submit", function (e) {
        e.preventDefault();

        const userData = JSON.parse(sessionStorage.getItem("usuario"));
        if (!userData || !userData.userEmail) {
            alert("No hay un usuario logueado. Por favor, inicia sesión nuevamente.");
            return;
        }

        const nuevaProvincia = provinciaSelect.value;
        const nuevaFoto = fotoPreview.src;

        // Actualizar en IndexedDB
        const request = indexedDB.open("vm15DB");

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["Usuario"], "readwrite");
            const usuarioStore = transaction.objectStore("Usuario");

            const getRequest = usuarioStore.get(userData.userEmail);
            getRequest.onsuccess = function (event) {
                const usuario = event.target.result;
                if (usuario) {
                    // Actualizar datos en la base de datos
                    usuario.provincia = nuevaProvincia;
                    usuario.foto = nuevaFoto;

                    const updateRequest = usuarioStore.put(usuario);
                    updateRequest.onsuccess = function () {
                        // Actualizar sessionStorage
                        const updatedUserData = {
                            ...userData,
                            userPhoto: nuevaFoto
                        };
                        sessionStorage.setItem("usuario", JSON.stringify(updatedUserData));

                        // Actualizar elementos del DOM sin recargar
                        fotoUsuario.src = nuevaFoto;
                        alert("Perfil actualizado correctamente.");

                        // Ocultar el cuadro de edición
                        editarPerfilDiv.style.display = "none";
                    };

                    updateRequest.onerror = function () {
                        alert("Error al guardar los cambios en la base de datos.");
                    };
                } else {
                    alert("No se encontró el usuario en la base de datos.");
                }
            };

            getRequest.onerror = function () {
                console.error("Error al obtener el usuario de la base de datos.");
            };
        };

        request.onerror = function (event) {
            console.error("Error al abrir la base de datos:", event.target.error);
        };
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const aficionesCheckboxes = document.getElementById("aficionesCheckboxes");
    const toggleBusquedaAficionesBtn = document.getElementById("toggleBusquedaAficionesBtn");
    const busquedaAficiones = document.getElementById("busquedaAficiones");

    // Mostrar/Ocultar el contenedor de búsqueda de aficiones
    toggleBusquedaAficionesBtn.addEventListener("click", function () {
        if (busquedaAficiones.classList.contains("oculto")) {
            busquedaAficiones.classList.remove("oculto");
        } else {
            busquedaAficiones.classList.add("oculto");
        }
    });

    // Abrir la base de datos y cargar aficiones
    const dbRequest = indexedDB.open("vm15DB");

    dbRequest.onsuccess = function (event) {
        const db = event.target.result;
        console.log("Base de datos abierta con éxito.");
        cargarAficiones(db);
        configurarFormulario(db);
    };

    dbRequest.onerror = function () {
        console.error("Error al abrir la base de datos.");
    };

    // Cargar aficiones como checkboxes
    function cargarAficiones(db) {
        const transaction = db.transaction(["Aficiones"], "readonly");
        const aficionesStore = transaction.objectStore("Aficiones");

        aficionesCheckboxes.innerHTML = ""; // Limpiar el contenido previo

        aficionesStore.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                const aficion = cursor.value;
                const div = document.createElement("div");
                div.innerHTML = `
                    <label>
                        <input type="checkbox" value="${aficion.idAfi}">
                        ${aficion.descripcion}
                    </label>
                `;
                aficionesCheckboxes.appendChild(div);
                cursor.continue();
            } else {
                console.log("Aficiones cargadas con éxito.");
            }
        };
    }

    // Configurar formulario para búsqueda
    function configurarFormulario(db) {
        document
            .getElementById("searchAficionesForm")
            .addEventListener("submit", function (event) {
                event.preventDefault();
                console.log("Formulario de búsqueda enviado.");

                // Obtener las aficiones seleccionadas
                const selectedAficiones = Array.from(
                    aficionesCheckboxes.querySelectorAll("input:checked")
                ).map((checkbox) => parseInt(checkbox.value));

                if (selectedAficiones.length === 0) {
                    alert("Por favor, selecciona al menos una afición.");
                    return;
                }

                console.log("Aficiones seleccionadas:", selectedAficiones);
                buscarPorAficiones(db, selectedAficiones); // Llamar a la función de búsqueda con las aficiones seleccionadas
            });
    }

    // Buscar usuarios que tengan todas las aficiones seleccionadas
    function buscarPorAficiones(db, aficionesSeleccionadas) {
        console.log("Buscando usuarios con todas las aficiones:", aficionesSeleccionadas);
        const transaction = db.transaction(["Usuario", "UsuarioAficion"], "readonly");
        const usuarioStore = transaction.objectStore("Usuario");
        const usuarioAficionStore = transaction.objectStore("UsuarioAficion");

        const usuariosPorAficion = new Map(); // Map para almacenar usuarios por ID de afición

        let aficionesProcesadas = 0;

        aficionesSeleccionadas.forEach((aficionId) => {
            const cursor = usuarioAficionStore.index("idAfi").openCursor(IDBKeyRange.only(aficionId));

            cursor.onsuccess = function (event) {
                const result = event.target.result;
                if (result) {
                    const emailUsuario = result.value.emailUsu;

                    if (!usuariosPorAficion.has(emailUsuario)) {
                        usuariosPorAficion.set(emailUsuario, new Set());
                    }

                    usuariosPorAficion.get(emailUsuario).add(aficionId);

                    result.continue();
                } else {
                    aficionesProcesadas++;

                    // Cuando se procesan todas las aficiones
                    if (aficionesProcesadas === aficionesSeleccionadas.length) {
                        // Filtrar usuarios que tengan todas las aficiones seleccionadas
                        const usuariosFiltrados = Array.from(usuariosPorAficion.entries())
                            .filter(([email, aficiones]) =>
                                aficionesSeleccionadas.every((id) => aficiones.has(id))
                            )
                            .map(([email]) => email);

                        // Obtener los detalles de los usuarios
                        if (usuariosFiltrados.length > 0) {
                            mostrarUsuariosFiltrados(db, usuariosFiltrados);
                        } else {
                            mostrarPersonas([]); // Mostrar "No se encontraron resultados"
                        }
                    }
                }
            };
        });
    }

    // Obtener y mostrar usuarios filtrados
    function mostrarUsuariosFiltrados(db, emails) {
        console.log("Usuarios filtrados:", emails);
        const transaction = db.transaction(["Usuario"], "readonly");
        const usuarioStore = transaction.objectStore("Usuario");

        const usuarios = [];

        emails.forEach((email) => {
            const request = usuarioStore.get(email);

            request.onsuccess = function (event) {
                const usuario = event.target.result;
                if (usuario) {
                    usuarios.push(usuario);
                }

                if (usuarios.length === emails.length) {
                    mostrarPersonas(usuarios); // Reutilizar función mostrarPersonas
                }
            };
        });
    }
});

// Botón de Logout
document.getElementById("boton-logueo").addEventListener("click", function () {
    sessionStorage.clear(); // Limpia los datos del usuario logueado
    window.location.href = "login.html"; // Redirige al login
});
