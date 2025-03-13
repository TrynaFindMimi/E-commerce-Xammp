document.addEventListener('DOMContentLoaded', function () {
    const listaFavoritos = document.getElementById('lista-favoritos');
    const mensajeVacio = document.querySelector('.mensaje-vacio');

    const apiUrl = 'http://localhost/prueba/api_productos.php';

    // Función para cargar los productos en la lista de favoritos
    function cargarFavoritos() {
        fetch(`${apiUrl}/favoritos`) // Ruta para obtener los productos de favoritos
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    mensajeVacio.style.display = 'none'; // Ocultar mensaje de lista vacía
                    listaFavoritos.innerHTML = ''; // Limpiar la lista antes de agregar productos

                    data.forEach(producto => {
                        const productoElement = document.createElement('div');
                        productoElement.classList.add('producto-favorito');
                        productoElement.innerHTML = `
                            <img src="${producto.imagen}" alt="${producto.nombre}">
                            <div class="producto-info">
                                <h3>${producto.nombre}</h3>
                                <p>${producto.descripcion}</p>
                                <p>Precio: <span class="precio">${Number(producto.precio).toFixed(2)} Bs</span></p>
                                <button class="agregar-carrito" data-id="${producto.id}">Agregar al Carrito</button>
                                <button class="eliminar" data-id="${producto.id}">Eliminar de Favoritos</button>
                            </div>
                        `;
                        listaFavoritos.appendChild(productoElement);
                    });
                } else {
                    mensajeVacio.style.display = 'block'; // Mostrar mensaje de lista vacía
                }
            })
            .catch(error => {
                console.error('Error al cargar los favoritos:', error);
                mensajeVacio.textContent = 'Error al cargar los favoritos. Inténtalo de nuevo más tarde.';
                mensajeVacio.style.display = 'block';
            });
    }

    // Evento para eliminar un producto de favoritos
    listaFavoritos.addEventListener('click', function (event) {
        if (event.target.classList.contains('eliminar')) {
            const productoId = event.target.getAttribute('data-id');
            if (confirm('¿Estás seguro de que quieres eliminar este producto de favoritos?')) {
                eliminarProducto(productoId, event.target.closest('.producto-favorito'));
            }
        }
    });

    // Función para eliminar un producto de favoritos
    function eliminarProducto(id, productoElement) {
        fetch(`${apiUrl}/eliminar`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ producto_id: id, lista: 'favoritos' }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Eliminar el producto del DOM manualmente
                    productoElement.remove();

                    // Verificar si la lista está vacía después de eliminar el producto
                    if (listaFavoritos.children.length === 0) {
                        mensajeVacio.style.display = 'block';
                    }
                } else {
                    alert(data.error || 'Error al eliminar el producto de favoritos.');
                }
            })
            .catch(error => {
                console.error('Error al eliminar el producto de favoritos:', error);
                alert('Error al eliminar el producto de favoritos. Inténtalo de nuevo más tarde.');
            });
    }

    // Evento para agregar un producto al carrito desde favoritos
    listaFavoritos.addEventListener('click', function (event) {
        if (event.target.classList.contains('agregar-carrito')) {
            const productoId = event.target.getAttribute('data-id');
            agregarAlCarrito(productoId);
        }
    });

    // Función para agregar un producto al carrito
    function agregarAlCarrito(id) {
        fetch(`${apiUrl}/agregar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ producto_id: id, lista: 'carrito' }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Producto agregado al carrito.');
                } else {
                    alert(data.error || 'Error al agregar el producto al carrito.');
                }
            })
            .catch(error => {
                console.error('Error al agregar el producto al carrito:', error);
                alert('Error al agregar el producto al carrito. Inténtalo de nuevo más tarde.');
            });
    }

    // Cargar los favoritos al cargar la página
    cargarFavoritos();
});