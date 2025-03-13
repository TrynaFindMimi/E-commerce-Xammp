document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = "http://localhost/prueba/api_productos.php";
    const productosContainer = document.getElementById("productos");

    async function obtenerProductos() {
        try {
            const respuesta = await fetch(apiUrl);
            if (!respuesta.ok) {
                throw new Error("Error al obtener los productos");
            }
            const textoRespuesta = await respuesta.text();
            console.log("Respuesta en bruto:", textoRespuesta);

            const datos = JSON.parse(textoRespuesta);

            if (datos.length > 0) {
                mostrarProductos(datos);
            } else {
                productosContainer.innerHTML = "<p>No hay productos disponibles en este momento.</p>";
            }
        } catch (error) {
            console.error("Error:", error);
            productosContainer.innerHTML = "<p>Hubo un error al cargar los productos. Inténtalo de nuevo más tarde.</p>";
        }
    }

    function mostrarProductos(productos) {
        productosContainer.innerHTML = ""; // Limpiar el contenedor

        productos.forEach(producto => {
            const productoHTML = `
                <div class="producto">
                    <a href="detalles.html?id=${producto.id}" class="imagen-link">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                    </a>
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p class="precio">${producto.precio} Bs</p>
                    <button class="btn-carrito" data-id="${producto.id}">Agregar al Carrito</button>
                    <button class="btn-favoritos" data-id="${producto.id}">Agregar a Favoritos</button>
                </div>
            `;
            productosContainer.innerHTML += productoHTML;
        });

        // Agregar event listeners a los botones
        document.querySelectorAll(".btn-carrito").forEach(button => {
            button.addEventListener("click", function () {
                const productoId = this.getAttribute("data-id");
                agregarAlCarrito(productoId);
            });
        });

        document.querySelectorAll(".btn-favoritos").forEach(button => {
            button.addEventListener("click", function () {
                const productoId = this.getAttribute("data-id");
                agregarAFavoritos(productoId);
            });
        });
    }

    async function agregarAlCarrito(productoId) {
        try {
            const respuesta = await fetch(`${apiUrl}/agregar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    producto_id: productoId,
                    lista: "carrito",
                }),
            });

            if (!respuesta.ok) {
                throw new Error("Error al agregar el producto al carrito");
            }

            const data = await respuesta.json();
            if (data.success) {
                alert("Producto agregado al carrito.");
            } else {
                alert(data.error || "Error al agregar el producto al carrito.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un error al agregar el producto al carrito. Inténtalo de nuevo más tarde.");
        }
    }

    async function agregarAFavoritos(productoId) {
        try {
            const respuesta = await fetch(`${apiUrl}/agregar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    producto_id: productoId,
                    lista: "favoritos",
                }),
            });

            if (!respuesta.ok) {
                throw new Error("Error al agregar el producto a favoritos");
            }

            const data = await respuesta.json();
            if (data.success) {
                alert("Producto agregado a favoritos.");
            } else {
                alert(data.error || "Error al agregar el producto a favoritos.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un error al agregar el producto a favoritos. Inténtalo de nuevo más tarde.");
        }
    }

    obtenerProductos();
});