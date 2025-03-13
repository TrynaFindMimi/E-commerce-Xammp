document.addEventListener('DOMContentLoaded', () => {
    // Configuración del Swiper (Slider)
    const swiper = new Swiper('.swiper-container', {
        loop: true, // Habilita el bucle infinito
        navigation: {
            nextEl: '.swiper-button-next', // Flecha de siguiente
            prevEl: '.swiper-button-prev', // Flecha de anterior
        },
        pagination: {
            el: '.swiper-pagination', // Paginación (puntos)
            clickable: true, // Permite hacer clic en los puntos para navegar
        },
        autoplay: {
            delay: 3000, // Cambia cada 3 segundos
            disableOnInteraction: false, // Permite que el autoplay continúe después de la interacción del usuario
        },
        breakpoints: {
            640: {
                slidesPerView: 1, // 1 slide en pantallas pequeñas
            },
            768: {
                slidesPerView: 2, // 2 slides en pantallas medianas
            },
            1024: {
                slidesPerView: 3, // 3 slides en pantallas grandes
            },
        },
        preventClicks: true, // Evita que los clics interfieran con el slider
        preventClicksPropagation: true, // Evita la propagación de clics
        simulateTouch: false, // Desactiva el arrastre con el mouse/touch
    });

    // Cargar productos destacados y más vendidos
    cargarProductosDestacados();
    cargarMasVendidos();
});

// Función para cargar productos destacados
async function cargarProductosDestacados() {
    try {
        const response = await fetch('http://localhost/prueba/api_productos.php');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const productos = await response.json();
        const productosDestacados = productos.slice(0, 5); // Tomar los primeros 5 productos
        const swiperWrapper = document.querySelector('.swiper-wrapper');

        if (swiperWrapper) {
            swiperWrapper.innerHTML = ''; // Limpiar el contenedor

            // Crear slides dinámicamente
            productosDestacados.forEach(producto => {
                const slide = document.createElement('div');
                slide.classList.add('swiper-slide');

                slide.innerHTML = `
                    <article>
                        <a href="detalles.html?id=${producto.id}">
                            <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
                        </a>
                        <h3>${producto.nombre}</h3>
                        <p>${producto.descripcion}</p>
                        <p class="precio">${producto.precio} Bs</p>
                    </article>
                `;

                swiperWrapper.appendChild(slide);
            });

            swiper.update(); // Actualizar el slider después de agregar los slides
        }
    } catch (error) {
        console.error('Error al cargar productos destacados:', error);
        mostrarError('No se pudieron cargar los productos destacados.');
    }
}

// Función para cargar productos más vendidos
async function cargarMasVendidos() {
    try {
        const response = await fetch('http://localhost/prueba/api_productos.php');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const productos = await response.json();
        const masVendidos = productos.sort((a, b) => b.vendidos - a.vendidos).slice(0, 5); // Ordenar por más vendidos y tomar los primeros 5
        const contenedorMasVendidos = document.getElementById('mas-vendidos');

        if (contenedorMasVendidos) {
            contenedorMasVendidos.innerHTML = ''; // Limpiar el contenedor

            // Crear elementos dinámicamente
            masVendidos.forEach(producto => {
                const productoElemento = document.createElement('div');
                productoElemento.classList.add('producto');

                productoElemento.innerHTML = `
                    <article>
                        <a href="detalles.html?id=${producto.id}">
                            <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
                        </a>
                        <h3>${producto.nombre}</h3>
                        <p>${producto.descripcion}</p>
                        <p class="precio">${producto.precio} Bs</p>
                    </article>
                `;

                contenedorMasVendidos.appendChild(productoElemento);
            });
        }
    } catch (error) {
        console.error('Error al cargar los productos más vendidos:', error);
        mostrarError('No se pudieron cargar los productos más vendidos.');
    }
}


function mostrarError(mensaje) {
    const contenedorError = document.createElement('div');
    contenedorError.classList.add('error');
    contenedorError.textContent = mensaje;
    document.body.appendChild(contenedorError);
}