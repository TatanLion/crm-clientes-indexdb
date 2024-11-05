(function(){

    // let DB;
    let idCliente;

    const nombreInput = document.querySelector('#nombre')
    const emailInput = document.querySelector('#email')
    const telefonoInput = document.querySelector('#telefono')
    const empresaInput = document.querySelector('#empresa')

    const formulario = document.querySelector('#formulario')

    document.addEventListener('DOMContentLoaded', function(){
        conectarDB();

        //Actualizar el resgistro
        formulario.addEventListener('submit', actualizarCliente)

        //Verificar el ID de la URL
        const parametrosURL = new URLSearchParams(window.location.search)
        idCliente = parametrosURL.get('id')
        if(idCliente){
            setTimeout(() => { //Esto lo generamos puesto toma cierto tiempo la consulta a indexDB y generario error si llama la función inmediatamente, otra variante para esto es usar async - await
                obtenerCliente(idCliente)
            }, 100)
        }

        function obtenerCliente(id){
            // console.log(id);
            const transaction = DB.transaction(['clientes'], 'readonly')
            const objectStore = transaction.objectStore('clientes')
            // console.log(objectStore);
            const cliente = objectStore.openCursor()
            cliente.onsuccess = function(e){
                const cursor = e.target.result
                if(cursor){
                    if(cursor.value.id === Number(id)){
                        // console.log(cursor.value);
                        llenarFormulario(cursor.value)
                    }
                    cursor.continue();
                }
            }

        }

        function conectarDB(){
            const abrirConexion = window.indexedDB.open('crm', 1)

            abrirConexion.onerror = function(e){
                console.log('Hubo un error en la conexión de la DB ', e);
            }

            abrirConexion.onsuccess = function(){
                DB = abrirConexion.result;
            }
        }

        function llenarFormulario(datosCliente){
            // console.log(datosCliente);
            const { nombre, email, telefono, empresa } = datosCliente;

            nombreInput.value = nombre;
            emailInput.value = email;
            telefonoInput.value = telefono;
            empresaInput.value = empresa;
             
        }

        function actualizarCliente(e){
            e.preventDefault();

            if(nombreInput.value == '' || emailInput.value == '' || telefonoInput.value == '' || empresaInput.value == ''){
                imprimirAlerta('Todos los campos son obligatorios', 'error')
                return;
            }

            //Actualizar Cliente
            const clienteActualizado = {
                nombre: nombreInput.value,
                email: emailInput.value,
                telefono: telefonoInput.value,
                empresa: empresaInput.value,
                id: Number(idCliente), //Como esto viene como string, toca convertirlo a número
            }

            const transaction = DB.transaction(['clientes'], 'readwrite')
            const objectStore = transaction.objectStore('clientes')
            objectStore.put(clienteActualizado)

            transaction.oncomplete = () => {
                imprimirAlerta('Cliente editado correctamente')
                setTimeout(() =>{
                    window.location.href = './index.html'
                }, 1000)
            }

            transaction.onerror = () =>{
                imprimirAlerta('Error al editar cliente', 'error')
            }
        }

    })
})()