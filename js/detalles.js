async function cargarDetallesProducto() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productoId = urlParams.get('id');

        if (!productoId) {
            throw new Error("No se proporcionó un ID de producto.");
        }

        const response = await fetch(`http://localhost/prueba/api_productos.php/producto/${productoId}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const producto = await response.json();

        const contenedorDetalles = document.querySelector('.detalles-container');
        if (contenedorDetalles) {
            contenedorDetalles.innerHTML = `
                <div class="imagenes-producto">
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-principal">
                </div>

                <div class="info-producto">
                    <h1>${producto.nombre}</h1>
                    <p class="precio">${producto.precio} Bs</p>
                    <p class="descripcion">${producto.descripcion}</p>

                    <div class="cantidad">
                        <label for="cantidad">Cantidad:</label>
                        <input type="number" id="cantidad" min="1" value="1">
                    </div>

                    <div class="acciones">
                        <button class="btn-carrito">Agregar al Carrito</button>
                        <button class="btn-favoritos">Agregar a Favoritos</button>
                    </div>

                    <div class="detalles-adicionales">
                        <h2>Detalles Adicionales</h2>
                        <ul>
                            <li><strong>Material:</strong> Vinilo de alta calidad</li>
                            <li><strong>Altura:</strong> 10 cm</li>
                            <li><strong>Serie:</strong> The Monsters</li>
                            <li><strong>Disponibilidad:</strong> En stock</li>
                        </ul>
                    </div>
                </div>
            `;

            document.querySelector('.btn-carrito').addEventListener('click', () => {
                const cantidad = document.getElementById('cantidad').value;
                agregarAlCarrito(producto.id, cantidad);
            });

            document.querySelector('.btn-favoritos').addEventListener('click', () => {
                agregarAFavoritos(producto.id);
            });
        }
    } catch (error) {
        console.error('Error al cargar los detalles del producto:', error);
        const contenedorDetalles = document.querySelector('.detalles-container');
        if (contenedorDetalles) {
            contenedorDetalles.innerHTML = `<p class="error">No se pudieron cargar los detalles del producto.</p>`;
        }
    }
}

async function agregarAlCarrito(id, cantidad = 1) {
    try {
        const response = await fetch('http://localhost/prueba/api_productos.php/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                producto_id: id,
                lista: 'carrito',
                cantidad: cantidad
            }),
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Producto agregado al carrito correctamente');
        } else {
            alert(data.error || 'Error al agregar al carrito');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

async function agregarAFavoritos(id) {
    try {
        const response = await fetch('http://localhost/prueba/api_productos.php/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                producto_id: id,
                lista: 'favoritos'
            }),
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Producto agregado a favoritos correctamente');
        } else {
            alert(data.error || 'Error al agregar a favoritos');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

document.addEventListener('DOMContentLoaded', cargarDetallesProducto);