(function(){

    // let DB;

    const listadoClientes = document.querySelector('#listado-clientes'); //Donde se imprimen los clientes

    const exportData = document.querySelector('#export-data');

    document.addEventListener('DOMContentLoaded', function(){
        crearDB();
        conectarDB();
        if(window.indexedDB.open('crm',1)){ //Solo se listaran los clientes si la DB tiene datos y existe
            listarClientes();
        }

        listadoClientes.addEventListener('click', eliminarCliente) 

        exportData.addEventListener('click', exportDataJson)
    })

    let tiempoVisible = 0;
    let tiempoInicio;

    function empezarTemporizador() {
        tiempoInicio = Date.now();
    }

    function pararTemporizador() {
        let tiempoFinal = Date.now();
        tiempoVisible += Math.floor((tiempoFinal - tiempoInicio) / 1000);
        updateTime(tiempoVisible)
    }

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            pararTemporizador();
        } else {
            empezarTemporizador();
        }
    });

    // Inicializar el temporizador cuando la página se carga
    empezarTemporizador();

    //Crear la BD en IndexDB
    function crearDB(){
        const crearDB = window.indexedDB.open('crm', 1);

        crearDB.onerror = (e) =>{
            console.log('Hubo un error', e);
        }

        crearDB.onsuccess = () => {
            DB = crearDB.result;
        }

        crearDB.onupgradeneeded = (e) => {
            const db = e.target.result;

            //Tabla para clientes
            const objectStoreClients = db.createObjectStore('clientes',{
                keyPath: 'id',
                autoIncrement: true,
            })
            objectStoreClients.createIndex('nombre', 'nombre', {unique: false})
            objectStoreClients.createIndex('email', 'email', {unique: true})
            objectStoreClients.createIndex('telefono', 'telefono', {unique: false})
            objectStoreClients.createIndex('empresa', 'empresa', {unique: false})
            objectStoreClients.createIndex('id', 'id', {unique: true})
            
            const objectStorePage = db.createObjectStore('time', {
                keyPath: 'id',
            })
            objectStorePage.createIndex('index', 'index', {unique: false})
            objectStorePage.createIndex('nuevoCliente', 'nuevoCliente', {unique: false})
            objectStorePage.createIndex('editarCliente', 'editarCliente', {unique: false})
            
            console.log('Se creo de forma correcta la BD');
        }
    }

    function listarClientes(){
        const conectarDB = window.indexedDB.open('crm', 1)

        conectarDB.onerror = function(e){
            console.log('Hubo un error en la conexión de la DB', e);
        }

        conectarDB.onsuccess = function(){
            DB = conectarDB.result; //Generamos una instancia de la DB
            const objectStore = DB.transaction('clientes').objectStore('clientes') //Accedemos a los datos de la DB
            objectStore.openCursor().onsuccess = function(e){ //Lo usamos para listar la información de la DB
                const cursor = e.target.result;

                if(cursor){
                    // console.log(cursor.value);
                    const { id, nombre, email, telefono, empresa } = cursor.value; //Destructuring de los datos de indexDB
                    listadoClientes.innerHTML += ` 
                        <tr>
                            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                <p class="text-sm leading-5 font-medium text-gray-700 text-lg  font-bold"> ${nombre} </p>
                                <p class="text-sm leading-10 text-gray-700"> ${email} </p>
                            </td>
                            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 ">
                                <p class="text-gray-700">${telefono}</p>
                            </td>
                            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200  leading-5 text-gray-700">    
                                <p class="text-gray-600">${empresa}</p>
                            </td>
                            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5">
                                <a href="editar-cliente.html?id=${id}" class="text-teal-600 hover:text-teal-900 mr-5">Editar</a>
                                <a href="#" data-cliente="${id}" class="text-red-600 hover:text-red-900 eliminar">Eliminar</a>
                            </td>
                        </tr>
                    `;

                    cursor.continue()
                }
            }
        }
    }

    function eliminarCliente(e){
        if(e.target.classList.contains('eliminar')){
            // console.log('Se dio clic en eliminar');
            const idEliminar = Number(e.target.dataset.cliente);
            // console.log(idEliminar);
            
            const confirmar = confirm('¿Deseas eliminar este cliente?')
            // console.log(confirmar);

            if(confirmar){
                const transaction = DB.transaction(['clientes'], 'readwrite')
                const objectStore = transaction.objectStore('clientes')
                objectStore.delete(idEliminar)

                transaction.oncomplete = () => {
                    console.log('Eliminando');
                    //Podemos usar traversing en el DOM para eliminar el registro con el fin de no recargar la página
                    e.target.parentElement.parentElement.remove();
                }

                transaction.onerror = (e) => {
                    console.log('Hubo un error en la eliminación', e);
                }
            }

        }
    }

    function updateTime(timePage){
        const transaction = DB.transaction(['time'], 'readwrite')
        const objectStore = transaction.objectStore('time')

        const idPage = objectStore.openCursor()

        const data = {
            index: timePage,
            id: 1
        }

        idPage.onsuccess = (e) => {
            const cursor = e.target.result
            if(cursor){
                if(cursor.value.id === 1){
                    objectStore.put(data)
                }
            }
        }

        transaction.onerror = (e) => {
            console.log('Se genero un error', e);
        }

        transaction.onsuccess = () => {
            DB = conectarDB.result;

        }
    }

    function exportDataJson(e){
        e.preventDefault();
        // console.log('Exportando Datos');
        const transaction = DB.transaction(['clientes'], 'readwrite')
        const objectStore = transaction.objectStore('clientes')

        //Obtenemos los datos de IndexDB
        const getAllData = objectStore.getAll();
        
        getAllData.onsuccess = function(){
            const data = getAllData.result;
            // console.log(data);

            const jsonData = JSON.stringify(data)
            
            const blob = new Blob([jsonData], { type: 'application/json' });
            // console.log(blob);
            
            //Crear el enlace interno para la descarga
            const a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = 'data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

})();