(function(){ //Hacemos un IIFE
    // let DB;

    const formulario = document.querySelector('#formulario')

    document.addEventListener('DOMContentLoaded', function(){
        conectarDB();
        formulario.addEventListener('submit', validarCliente);
    })

    function validarCliente(e){
        e.preventDefault();
        
        //Leer todos los inputs
        const nombre = document.querySelector('#nombre').value;
        const email = document.querySelector('#email').value;
        const telefono = document.querySelector('#telefono').value;
        const empresa = document.querySelector('#empresa').value;

        if(nombre == '' || email == '' || telefono == '' || empresa == ''){
            // console.log('Los campos estan vacios');
            imprimirAlerta('Todos los campos son obligatorios', 'error')
            return;
        }
        // console.log('Los campos estan llenos');

        //Crear un objeto con la información para la DB
        const cliente = { //Como esto es un Object Literal y la llave y el valor son iguales, podemos solo colocarlo y esto nos tomara para ambos datos lo mismo
            nombre,
            email,
            telefono,
            empresa,
        }
        cliente.id = Date.now()

        crearNuevoCliente(cliente);

    }

    function crearNuevoCliente(cliente){

        const transaction = DB.transaction(['clientes'], 'readwrite')
        const objectStore = transaction.objectStore('clientes')

        objectStore.add(cliente)

        transaction.onerror = function(e){
            console.log('Hubo un error', e);
        } 

        transaction.oncomplete = function(){
            imprimirAlerta('Cliente agregado correctamente', 'success')

            setTimeout(() =>{
                window.location.href = './index.html'
            }, 2000)
        }
    }

})();