let DB;

function conectarDB(){
    const abrirConexion = window.indexedDB.open('crm', 1)

    abrirConexion.onerror = function(e){
        console.log('Hubo un error en la conexión de la DB ', e);
    }

    abrirConexion.onsuccess = function(){
        DB = abrirConexion.result;
    }
}

function imprimirAlerta(mensaje, tipo){
    //Crear Alerta
    const divMensaje = document.createElement('div')
    const existe = document.querySelector('.existe');
    divMensaje.classList.add('px-4', 'py-3', 'rounded', 'max-w-lg', 'mx-auto', 'mt-6', 'text-center', 'border', 'existe')

    if(!existe){
        if(tipo === 'error'){
            divMensaje.classList.add('bg-red-100', 'border-red-400', 'text-red-700')
        }else{
            divMensaje.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
        }
        divMensaje.textContent = mensaje;

        formulario.appendChild(divMensaje)

        setTimeout(() =>{
            divMensaje.remove();
        }, 3000);
    }
}

