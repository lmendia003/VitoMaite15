
    document.addEventListener("DOMContentLoaded", function () {
            
        // Acceder a la base de datos indexedDB
        var request = indexedDB.open("vm15DB");
        
        request.onsuccess = function (event) {
        var bd = event.target.result; //obtenemos la base de datos
        
        
        var form = document.getElementById("loginform");

        if (form){
        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevenir el envío por defecto del formulario
            
        var email = document.getElementById("username").value;
        var password = document.getElementById("password").value;

        // Validar el formato del correo electrónico
        if (!validateEmail(email)) {
          alert("Formato de correo electrónico no válido");
          return;
    }


      // Acceder al almacén de objetos de usuario
      var transaccion = bd.transaction(["Usuario"], "readonly");
      var usuarioStore = transaccion.objectStore("Usuario");
      var index = usuarioStore.index("email");
      
      var solicitud = index.get(email);

      solicitud.onsuccess = function (event) {
        var usuario = event.target.result;

    // Verificar si el usuario existe y la contraseña es correcta
        if (usuario && usuario.contraseña === password) {
            
            var usuario ={
        // Guardar información del usuario en sessionStorage
                userEmail: email,
                userName: usuario.nombre,
                userPhoto: usuario.foto
               };
               sessionStorage.setItem("usuario", JSON.stringify(usuario));
       
            // Verificar los datos almacenados en sessionStorage
                const storedUser = JSON.parse(sessionStorage.getItem("usuario"));
                console.log("Datos del usuario guardados:", storedUser);
            window.location.href = "principalLogin.html";
            } else {
                 alert("Credenciales incorrectas");
            }
      };

      request.onerror = function (event) {
        console.error("Error al acceder a la base de datos: ", event.target.error);
      };
    });
   }

    // Botón de logout
        var logoutButton = document.getElementById("logoutButton");
        if (logoutButton) {
            logoutButton.addEventListener("click", function () {
                sessionStorage.clear(); // Limpiamos el sessionStorage
                window.location.href = "index.html"; // Redirigimos a la página de inicio
            });
        }
    };
    
    request.onerror = function (event) {
      console.error("Error al abrir la base de datos: ", event.target.error);
    };

  function validateEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
    });


