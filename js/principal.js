var cajadatos, bd, usuarioStore, aficionesStore, likesStore, UsuarioAficionStore;

function iniciar() {
    var formulario = document.getElementById("searchForm");
    formulario.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita que se envÃ­e el formulario
        buscarPersonas();
    });
    
    var solicitud = indexedDB.open("vm15DB"); // Incrementa la versiÃ³n de la base de datos
   

    solicitud.addEventListener("success", comenzar);
    cajadatos = document.getElementById("listaPersonas");
    solicitud.addEventListener("error", mostrarerror);
    solicitud.addEventListener("upgradeneeded", crearBd);}


function comenzar(event) {
    bd = event.target.result;
    inicializarDatos();    
}

function crearBd(event) {
    console.log("Base de datos creada o actualizada.");
    bd = event.target.result;

    // Almacén de Usuarios
    if (!bd.objectStoreNames.contains("Usuario")) {
        var usuarioStore = bd.createObjectStore("Usuario", { keyPath: "email" });
        usuarioStore.createIndex("email", "email", {unique: true});
        usuarioStore.createIndex("genero", "genero", { unique: false });
        usuarioStore.createIndex("edad", "edad", { unique: false });
        usuarioStore.createIndex("provincia", "provincia", { unique: false });
    }

    // Almacén de Aficiones
    if (!bd.objectStoreNames.contains("Aficiones")) {
        var aficionesStore = bd.createObjectStore("Aficiones", { keyPath: "idAfi", autoIncrement: true });
        aficionesStore.createIndex("categoria", "categoria", { unique: false });
    }

    // Almacén de Likes
    if (!bd.objectStoreNames.contains("Likes")) {
        var likesStore = bd.createObjectStore("Likes", { keyPath: "idLike", autoIncrement: true });
        likesStore.createIndex("emailUsuario", "emailUsuario", { unique: false });
        likesStore.createIndex("emailDestino", "emailDestino", { unique: false });
    }

    // Almacen de usuario-Aficion
    if (!bd.objectStoreNames.contains("UsuarioAficion")) {
        var usuarioAficionStore = bd.createObjectStore("UsuarioAficion", { keyPath: "idRel", autoIncrement: true });
        usuarioAficionStore.createIndex("emailUsu", "emailUsu", { unique: false });
        usuarioAficionStore.createIndex("idAfi", "idAfi", { unique: false });
    }
}


function inicializarDatos(){
    console.log("Inicializando datos...");
    var transaction = bd.transaction(["Usuario", "Aficiones", "Likes", "UsuarioAficion"], "readwrite");
    
    
    // Obtiene los almacenes de objetos
    usuarioStore = transaction.objectStore("Usuario");
    aficionesStore = transaction.objectStore("Aficiones");
    likesStore = transaction.objectStore("Likes");
    usuarioAficionStore = transaction.objectStore("UsuarioAficion");

        // Usuarios con ubicación
        usuarioStore.add({
            email: "leire@gmail.com",
            contraseña: "leireleire",
            nombre: "Leire",
            provincia: "Gipuzkoa",
            edad: 23,
            genero: "F",
            foto: "imagenes/Leire.png",
            ubicacion: { latitud: 43.3193, longitud: -1.9812 }
        });

        usuarioStore.add({
            email: "laura@gmail.com",
            contraseña: "lauralaura",
            nombre: "Laura",
            provincia: "Araba",
            edad: 28,
            genero: "F",
            foto: "imagenes/Laura.png",
            ubicacion: { latitud: 42.8515, longitud: -2.6724 }
        });

        usuarioStore.add({
            email: "lucia@gmail.com",
            contraseña: "lucialucia",
            nombre: "Lucia",
            provincia: "Araba",
            edad: 35,
            genero: "F",
            foto: "imagenes/Lucia.png",
            ubicacion: { latitud: 42.8591, longitud: -2.6813 }
        });

        usuarioStore.add({
            email: "azaila@gmail.com",
            contraseña: "azailaazaila",
            nombre: "Azaila",
            provincia: "Gipuzkoa",
            edad: 29,
            genero: "F",
            foto: "imagenes/Azaila.png",
            ubicacion: { latitud: 43.3125, longitud: -1.9782 }
        });

        usuarioStore.add({
            email: "olatz@gmail.com",
            contraseña: "olatzolatz",
            nombre: "Olatz",
            provincia: "Bizkaia",
            edad: 24,
            genero: "F",
            foto: "imagenes/Olatz.png",
            ubicacion: { latitud: 43.2630, longitud: -2.9349 }
        });

        usuarioStore.add({
            email: "eider@gmail.com",
            contraseña: "eidereider",
            nombre: "Eider",
            provincia: "Bizkaia",
            edad: 18,
            genero: "F",
            foto: "imagenes/Eider.png",
            ubicacion: { latitud: 43.2549, longitud: -2.9234 }
        });

        usuarioStore.add({
            email: "urko@gmail.com",
            contraseña: "urkourko",
            nombre: "Urko",
            provincia: "Gipuzkoa",
            edad: 27,
            genero: "M",
            foto: "imagenes/Urko.png",
            ubicacion: { latitud: 43.3193, longitud: -1.9815 }
        });

        usuarioStore.add({
            email: "mikel@gmail.com",
            contraseña: "mikelmikel",
            nombre: "Mikel",
            provincia: "Gipuzkoa",
            edad: 27,
            genero: "M",
            foto: "imagenes/Mikel.png",
            ubicacion: { latitud: 43.3120, longitud: -1.9845 }
        });

        usuarioStore.add({
            email: "unai@gmail.com",
            contraseña: "unaiunai",
            nombre: "Unai",
            provincia: "Bizkaia",
            edad: 23,
            genero: "M",
            foto: "imagenes/Unai.png",
            ubicacion: { latitud: 43.2572, longitud: -2.9238 }
        });

        usuarioStore.add({
            email: "hodei@gmail.com",
            contraseña: "hodeihodei",
            nombre: "Hodei",
            provincia: "Araba",
            edad: 19,
            genero: "M",
            foto: "imagenes/Hodei.png",
            ubicacion: { latitud: 42.8497, longitud: -2.6762 }
        });

        usuarioStore.add({
            email: "raul@gmail.com",
            contraseña: "raulraul",
            nombre: "Raul",
            provincia: "Araba",
            edad: 39,
            genero: "M",
            foto: "imagenes/Raul.png",
            ubicacion: { latitud: 42.8453, longitud: -2.6781 }
        });

        usuarioStore.add({
            email: "gorka@gmail.com",
            contraseña: "gorkagorka",
            nombre: "Gorka",
            provincia: "Gipuzkoa",
            edad: 33,
            genero: "M",
            foto: "imagenes/Gorka.png",
            ubicacion: { latitud: 43.3152, longitud: -1.9787 }
        });

        
        
        // Aficiones
        aficionesStore.add({ idAfi: 1, descripcion: "Gimnasio", categoria: "Deporte" });
        aficionesStore.add({ idAfi: 2, descripcion: "Senderismo", categoria: "Deporte" });
        aficionesStore.add({ idAfi: 3, descripcion: "Cine", categoria: "Cultura" });
        aficionesStore.add({ idAfi: 4, descripcion: "Lectura", categoria: "Cultura" });
        aficionesStore.add({ idAfi: 5, descripcion: "Música", categoria: "Arte" });
        aficionesStore.add({ idAfi: 6, descripcion: "Pintura", categoria: "Arte" });
        aficionesStore.add({ idAfi: 7, descripcion: "Escalada", categoria: "Deporte" });
        aficionesStore.add({ idAfi: 8, descripcion: "Fotografía", categoria: "Arte" });
        aficionesStore.add({ idAfi: 9, descripcion: "Baile", categoria: "Arte" });
        aficionesStore.add({ idAfi: 10, descripcion: "Jardinería", categoria: "Hogar" });
        
        //Almacen de usuario-aficion
        usuarioAficionStore.add({ emailUsu: "leire@gmail.com", idAfi: 1 });
        usuarioAficionStore.add({ emailUsu: "leire@gmail.com", idAfi: 2 });
        usuarioAficionStore.add({ emailUsu: "leire@gmail.com", idAfi: 3 });
        usuarioAficionStore.add({ emailUsu: "mikel@gmail.com", idAfi: 2 });
        usuarioAficionStore.add({ emailUsu: "mikel@gmail.com", idAfi: 3 });
        usuarioAficionStore.add({ emailUsu: "mikel@gmail.com", idAfi: 4 });
        usuarioAficionStore.add({ emailUsu: "lucia@gmail.com", idAfi: 1 });
        usuarioAficionStore.add({ emailUsu: "lucia@gmail.com", idAfi: 3 });
        usuarioAficionStore.add({ emailUsu: "lucia@gmail.com", idAfi: 4 });
        usuarioAficionStore.add({ emailUsu: "unai@gmail.com", idAfi: 1 });
        usuarioAficionStore.add({ emailUsu: "unai@gmail.com", idAfi: 2 });
        usuarioAficionStore.add({ emailUsu: "unai@gmail.com", idAfi: 4 });
        usuarioAficionStore.add({ emailUsu: "azaila@gmail.com", idAfi: 3 });
        usuarioAficionStore.add({ emailUsu: "azaila@gmail.com", idAfi: 4 });
        usuarioAficionStore.add({ emailUsu: "azaila@gmail.com", idAfi: 2 });
        usuarioAficionStore.add({ emailUsu: "raul@gmail.com", idAfi: 1 });
        usuarioAficionStore.add({ emailUsu: "raul@gmail.com", idAfi: 2 });
        usuarioAficionStore.add({ emailUsu: "raul@gmail.com", idAfi: 3 });
        usuarioAficionStore.add({ emailUsu: "raul@gmail.com", idAfi: 4 });

        // Almacen de likes
        likesStore.add({ emailUsuario: "leire@gmail.com", emailDestino: "mikel@gmail.com" });
        likesStore.add({ emailUsuario: "mikel@gmail.com", emailDestino: "leire@gmail.com" });
        likesStore.add({ emailUsuario: "mikel@gmail.com", emailDestino: "lucia@gmail.com" });
        likesStore.add({ emailUsuario: "lucia@gmail.com", emailDestino: "mikel@gmail.com" });
        likesStore.add({ emailUsuario: "lucia@gmail.com", emailDestino: "leire@gmail.com" });
        likesStore.add({ emailUsuario: "leire@gmail.com", emailDestino: "lucia@gmail.com" });
        likesStore.add({ emailUsuario: "unai@gmail.com", emailDestino: "azaila@gmail.com" });
        likesStore.add({ emailUsuario: "azaila@gmail.com", emailDestino: "raul@gmail.com" });
        likesStore.add({ emailUsuario: "raul@gmail.com", emailDestino: "mikel@gmail.com" });
        likesStore.add({ emailUsuario: "eider@gmail.com", emailDestino: "unai@gmail.com" });
        likesStore.add({ emailUsuario: "unai@gmail.com", emailDestino: "eider@gmail.com" });
        likesStore.add({ emailUsuario: "olatz@gmail.com", emailDestino: "raul@gmail.com" });
        likesStore.add({ emailUsuario: "raul@gmail.com", emailDestino: "olatz@gmail.com" });
        
        console.log("Datos anadidos.");
       }


function mostrarerror(evento) {
    alert("Error: " + evento.code + " " + evento.message);
}

function buscarPersonas() {
    console.log("Iniciando busqueda...");
    var genero = document.getElementById("genero").value;
    var edadMinima = parseInt(document.getElementById("edadMinima").value, 10);
    var edadMaxima = parseInt(document.getElementById("edadMaxima").value, 10);
    var provincia = document.getElementById("provincia").value;

    console.log("Criterios:", { genero, edadMinima, edadMaxima, provincia });

    var transaction = bd.transaction(["Usuario"], "readonly");
    var usuarioStore = transaction.objectStore("Usuario");
    
    var indice = usuarioStore.index("edad");
    
    
    var personasEncontradas = [];
    var rango = IDBKeyRange.bound(edadMinima, edadMaxima, false, false); // Rango de edades
    
    cajadatos.innerHTML = ""; // Limpiamos la caja de datos antes de mostrar los resultados

    indice.openCursor(rango).onsuccess = function (event) {
        var cursor = event.target.result;

        if (cursor) {
            var usuario = cursor.value;

            if (
                (genero === "ambos" || usuario.genero === genero) &&
                usuario.provincia === provincia
                
            ){
                personasEncontradas.push(usuario);
            }

            cursor.continue();
        } else {
            console.log("Usuarios encontrados:", personasEncontradas);
            mostrarPersonas(personasEncontradas);
        }
    };
}


function mostrarPersonas(personas) {
    console.log("Mostrando personas:", personas);

    if (personas.length === 0) {
        cajadatos.innerHTML = "<p>No se encontraron resultados.</p>";
        return;
    }
        personas.forEach(function (persona) {
                // Crear contenedor de persona
                const div = document.createElement("div");
                div.classList.add("persona");
   
            // Crear descripción de la persona
        const descripcion = document.createElement("div");
        descripcion.innerHTML = `
            <p>Nombre: ${persona.nombre}</p>
            <p>Edad: ${persona.edad}</p>
            <p>Genero: ${persona.genero}</p><br><br>
        `;

        // Crear botón "Ver detalles"
        const botonDetalles = document.createElement("button");
        botonDetalles.classList.add("ver-detalles-btn");
        botonDetalles.textContent = "Ver detalles";
        botonDetalles.addEventListener("click", function () {
            // Redirigir al login
            window.location.href = "login.html";
        });

        // Añadir imagen, descripción y botón al contenedor de la persona
        div.appendChild(descripcion);
        div.appendChild(botonDetalles);

        // Añadir el contenedor de la persona al DOM
        cajadatos.appendChild(div);
        
    });
}

window.addEventListener("load", iniciar);
