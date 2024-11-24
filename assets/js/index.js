

// Obtener elementos del DOM
const botonAnadirTareaMenu = document.getElementById("boton-anadir-tarea-menu");
const botonAnadirTarea = document.getElementById("boton-anadir-tarea");
const modal = document.getElementById("modal-tarea");
const modalCerrar = document.getElementById("boton-cerrar");
const sonido = document.getElementById("sonido");
const tituloTarea = document.getElementById("titulo-tarea");
const descripcionTarea = document.getElementById("descripcion-tarea");
const fechaVencTarea = document.getElementById("fecha-vencimiento-tarea");
const contenedorTareas = document.getElementById("contenedor-tareas");
const cSinTareas = document.getElementById("c-sin-tareas");
const cTareaNoEncontrada = document.getElementById("c-tarea-no-encontrada");
const buscadorTareas = document.getElementById("buscador-tareas");

// Mostrar el modal al hacer clic en el botón "Añadir tarea"
botonAnadirTareaMenu.onclick = function() {
    botonAnadirTarea.disabled = true;
    modal.style.display = "block"; // Abrir el modal
}

// Cerrar el modal al hacer clic en el botón "Cerrar"
modalCerrar.onclick = function() {
    limpiarCampos();
    restablecerColor();
    modal.style.display = "none"; // Cerrar el modal 
}

// Cerrar el modal al hacer clic fuera del modal y reproducir sonido
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
    
    // Reproducir sonido al hacer clic en cualquier lado
    sonido.currentTime = 0; // Reiniciar el sonido
    sonido.play(); // Reproducir el sonido
}

// Cerrar el modal al hacer clic en el botón de añadir tarea
botonAnadirTarea.onclick = function() {
    const tarea = {
        titulo: tituloTarea.value,
        descripcion: descripcionTarea.value,
        fechaVencimiento: formatearFecha(fechaVencTarea.value),
    };
    anadirTarea(tarea);
    modal.style.display = "none";
    contenedorTareas.style.display = "block";
    limpiarCampos();
}

buscadorTareas.oninput = function() {
    const terminoBusqueda = buscadorTareas.value.trim().toLowerCase();
    const tareas = obtenerTareas();

    if (terminoBusqueda.length > 0) {
        const tareasFiltradas = tareas.filter(tarea => {
            return tarea.titulo.toLowerCase().includes(terminoBusqueda) || 
                   tarea.descripcion.toLowerCase().includes(terminoBusqueda) ||
                   tarea.fechaVencimiento.toLowerCase().includes(terminoBusqueda);
        });

        cSinTareas.style.display = "none";
        contenedorTareas.innerHTML = ""; // Limpia el contenedor antes de añadir tareas

        if (tareasFiltradas.length > 0) {
            tareasFiltradas.forEach(tarea => {
                const tituloResaltado = tarea.titulo.replace(new RegExp(`(${terminoBusqueda})`, 'gi'), '<span style="background-color: yellow;">$1</span>');
                const descripcionResaltada = tarea.descripcion.replace(new RegExp(`(${terminoBusqueda})`, 'gi'), '<span style="background-color: yellow;">$1</span>');
                const fechaResaltada = tarea.fechaVencimiento.replace(new RegExp(`(${terminoBusqueda})`, 'gi'), '<span style="background-color: yellow;">$1</span>');

                // Muestra el resaltado solo en el DOM, sin modificar el objeto `tarea`
                agregarTareaAlDOM({ 
                    id: tarea.id,
                    titulo: tituloResaltado,
                    descripcion: descripcionResaltada,
                    fechaVencimiento: fechaResaltada,
                    completada: tarea.completada
                }, false);
                
            });
        } else {
            contenedorTareas.style.display = "none";
            cTareaNoEncontrada.style.display = "block";
        }
    } else {
        mostrarTareasActualizadas();
    }
};


// Función para validar un campo individual
function validarCampo(campo) {
    if (campo.value.trim() === "") {
        campo.style.borderColor = "red"; // Si está vacío, poner borde rojo
    } else {
        campo.style.borderColor = ""; // Restablecer el borde
    }

    // Verificar si todos los campos están llenos para habilitar el botón
    botonAnadirTarea.disabled = !(tituloTarea.value.trim() !== "" &&
                                  descripcionTarea.value.trim() !== "" &&
                                  fechaVencTarea.value.trim() !== "");
}

// Asignar la función de validación a los eventos de entrada
tituloTarea.oninput = function() {
    validarCampo(tituloTarea);
};
descripcionTarea.oninput = function() {
    validarCampo(descripcionTarea);
};

fechaVencTarea.oninput = function() {
    let fecha = fechaVencTarea.value; // Obtenemos la fecha del input
    let fechaActual = new Date(); // Obtenemos la fecha actual como un objeto Date
    let fechaInput = new Date(fecha); // Convertimos la fecha del input a un objeto Date

    // Validamos que se haya introducido una fecha
    if (fecha) {
        // Comparamos la fecha del input con la fecha actual
        if (fechaInput < fechaActual) {
            fechaVencTarea.style.borderColor = "red";
        } else {
            fechaVencTarea.style.borderColor = "";
            botonAnadirTarea.disabled = false;
        }
    }
}

// Función para limpiar los campos
function limpiarCampos() {
    tituloTarea.value = '';
    descripcionTarea.value = '';
    fechaVencTarea.value = ''; // Resetear a vacío
}

// Función para restablecer el color de los bordes
function restablecerColor() {
    tituloTarea.style.borderColor = "";
    descripcionTarea.style.borderColor = "";
    fechaVencTarea.style.borderColor = "";
}

// Función para generar un ID único
function generarIdUnico() {
    return Date.now() + Math.random().toString(36).substring(2, 9);
}

// Función para añadir una tarea
function anadirTarea(tarea) {
    cSinTareas.style.display = "none";
    
    // Asignar un ID único a la tarea
    tarea.id = generarIdUnico();
    tarea.completada = false;

    // Guardar la tarea en el localStorage
    const tareas = obtenerTareas();
    tareas.push(tarea);
    localStorage.setItem("tareas", JSON.stringify(tareas));

    // Añadir la tarea al DOM
    agregarTareaAlDOM(tarea, true);
}

// Función para borrar una tarea
function borrarTarea(idTarea) {
    const tareas = obtenerTareas();
    const tareasActualizadas = tareas.filter(tarea => tarea.id !== idTarea);

    // Guardar el arreglo actualizado en el localStorage
    localStorage.setItem("tareas", JSON.stringify(tareasActualizadas));

    // Eliminar la tarea del DOM
    const tareaElemento = document.getElementById(`tarea-${idTarea}`);
    if (tareaElemento) {
        tareaElemento.remove();
        const tareasRestantes = obtenerTareas();
        tareasRestantes.forEach(tarea => {
        agregarTareaAlDOM(tarea, false);
        })
    }

    const tareasRestantes = obtenerTareas(); // Verificar tareas restantes después de borrar
    if (tareasRestantes.length === 0) {
        cSinTareas.style.display = "block";
    }
    mostrarTareasActualizadas();
}

// Función para limpiar el resaltado antes de guardarlo en el localstorage
function limpiarResaltado(texto) {
    return texto.replace(/<span style="background-color: yellow;">|<\/span>/g, '');
}

// Función para mostrar las tareas actuales desde el localStorage
function mostrarTareasActualizadas() {
    const tareas = obtenerTareas();
    
    cTareaNoEncontrada.style.display = "none";
    contenedorTareas.innerHTML = ""; // Limpia el contenedor antes de añadir las tareas

    // Si hay tareas, agregar todas las tareas al DOM
    if (tareas.length > 0) {
        tareas.forEach(tarea => {
            tarea.titulo = limpiarResaltado(tarea.titulo);
            tarea.descripcion = limpiarResaltado(tarea.descripcion);
            tarea.fechaVencimiento = limpiarResaltado(tarea.fechaVencimiento);
            agregarTareaAlDOM(tarea, true);
        });
        contenedorTareas.style.display = "block";
        cSinTareas.style.display = "none";
    } else {
        cSinTareas.style.display = "block";
    }
}


// Función para obtener las tareas del localStorage
function obtenerTareas() {
    const tareasGuardadas = localStorage.getItem("tareas");
    return tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
}

// Función para formatear la fecha de la tarea
function formatearFecha(fechaString) {
    const fecha = new Date(fechaString);
    
    // Obtener componentes de la fecha
    const ano = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const dia = String(fecha.getDate()).padStart(2, '0');
    
    // Formatear la fecha como 'DD/MM/YYYY'
    return `${dia}/${mes}/${ano}`;
}

function agregarTareaAlDOM(tarea, efecto, temporal = false) {
    const nuevaTareaHTML = document.createElement("div");
    if (efecto) {
        nuevaTareaHTML.classList.add("c-tarea");
        nuevaTareaHTML.id = `tarea-${tarea.id}`;
    } else {
        nuevaTareaHTML.classList.add("c-tarea-sin-efecto");
    }

    nuevaTareaHTML.innerHTML = `
        <h5 class="c-titulo" style="padding:5px">${tarea.titulo}</h5>
        <hr class="cero-margin-hr">
        <p class="c-descripcion" style="padding:5px">${tarea.descripcion}</p>
        <hr class="cero-margin-hr">
        <p class="c-fecha" style="padding: 0px 5px 0px">
            <span class="fecha-texto">${tarea.fechaVencimiento}</span>
            <span class="botones-tareas fa-basura" id="fa-basura">
                <i class="fa-solid fa-trash"></i>
            </span>
            <span class="botones-tareas fa-lapiz" id="fa-lapiz">
                <i class="fa-solid fa-pencil"></i>
            </span>
            <span class="botones-tareas" id="fa-check">
                <i class="fa-solid fa-check"></i>
            </span>
        </p>
    `;

    if (tarea.completada) {
        nuevaTareaHTML.style.backgroundColor = "#93e288";
        nuevaTareaHTML.querySelector(".c-titulo").style.color = "black";
        nuevaTareaHTML.querySelector(".c-descripcion").style.color = "black";
        nuevaTareaHTML.querySelector(".fecha-texto").style.color = "black";
    }

    nuevaTareaHTML.querySelector(".fa-basura").addEventListener("click", function() {
        borrarTarea(tarea.id);
    });

    nuevaTareaHTML.querySelector(".fa-check").onclick = function() {
        tarea.completada = !tarea.completada;
        const tareas = obtenerTareas().map(t => t.id === tarea.id ? tarea : t);
        localStorage.setItem("tareas", JSON.stringify(tareas));

        if (tarea.completada) {
            nuevaTareaHTML.style.backgroundColor = "#93e288";
            nuevaTareaHTML.querySelector(".c-titulo").style.color = "black";
            nuevaTareaHTML.querySelector(".c-descripcion").style.color = "black";
            nuevaTareaHTML.querySelector(".fecha-texto").style.color = "black";
        } else {
            nuevaTareaHTML.style.backgroundColor = "";
            nuevaTareaHTML.querySelector(".c-titulo").style.color = "";
            nuevaTareaHTML.querySelector(".c-descripcion").style.color = "";
            nuevaTareaHTML.querySelector(".fecha-texto").style.color = "";
        }
    };

    nuevaTareaHTML.querySelector(".fa-lapiz").onclick = function() {
        modal.style.display = "block";
        // Limpiamos los resaltos antes de cargar los valores en los campos de entrada
        tituloTarea.value = quitarResaltosAmarillos(tarea.titulo);
        descripcionTarea.value = quitarResaltosAmarillos(tarea.descripcion);
        const fechaArray = tarea.fechaVencimiento.split('/');
        const fechaFormateada = `${fechaArray[2]}-${fechaArray[1]}-${fechaArray[0]}`;
        fechaVencTarea.value = fechaFormateada;

        let permitirEdicion = false;

        tituloTarea.oninput = function() {
            permitirEdicion = tituloTarea.value !== tarea.titulo;
        };
        descripcionTarea.oninput = function() {
            permitirEdicion = descripcionTarea.value !== tarea.descripcion;
        };
        fechaVencTarea.oninput = function() {
            permitirEdicion = formatearFecha(fechaVencTarea.value) !== tarea.fechaVencimiento;
        };


        botonAnadirTarea.onclick = function() {
            if (permitirEdicion) {
                tarea.titulo = tituloTarea.value;
                tarea.descripcion = descripcionTarea.value;
                tarea.fechaVencimiento = formatearFecha(fechaVencTarea.value);

                const tareas = obtenerTareas().map(t => t.id === tarea.id ? tarea : t);
                localStorage.setItem("tareas", JSON.stringify(tareas));

                modal.style.display = "none";
                limpiarCampos();
                actualizarTareaEnDOM(tarea);
                
            } else {
                alert("No se ha realizado ningún cambio.");
            }
        };
    };

    contenedorTareas.appendChild(nuevaTareaHTML);
}

// Función para limpiar resaltos amarillos en el texto
function quitarResaltosAmarillos(texto) {
    const temporalDiv = document.createElement("div");
    temporalDiv.innerHTML = texto;
    return temporalDiv.textContent || temporalDiv.innerText || "";
}

// Función para actualizar la tarea en el DOM después de la edición
function actualizarTareaEnDOM(tarea) {
    const tareaElemento = document.getElementById(`tarea-${tarea.id}`);
    if (tareaElemento) {
        tareaElemento.querySelector(".c-titulo").textContent = tarea.titulo;
        tareaElemento.querySelector(".c-descripcion").textContent = tarea.descripcion;
        tareaElemento.querySelector(".c-fecha span").textContent = tarea.fechaVencimiento;
    }

    // Si hay un filtro activo en el buscador, actualizar el filtro
    if (buscadorTareas.value.trim() !== "") {
        buscadorTareas.oninput();
    }
}

// Cargar tareas desde localStorage al cargar la página
window.onload = function() {
    const tareas = obtenerTareas();
    if (tareas.length > 0) {
        contenedorTareas.style.display = "block";
        tareas.forEach(tarea => agregarTareaAlDOM(tarea), true);
    } else {
        cSinTareas.style.display = "block";
    }
}