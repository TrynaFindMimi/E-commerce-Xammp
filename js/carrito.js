document.addEventListener('DOMContentLoaded', function () {
    const listaProductos = document.getElementById('lista-productos');
    const subtotalElement = document.querySelector('.subtotal');
    const totalElement = document.querySelector('.total span');
    const mensajeVacio = document.querySelector('.mensaje-vacio');
    const btnComprar = document.querySelector('.btn-comprar');
    const envio = 50.00;
    const apiUrl = 'http://localhost/prueba/api_productos.php';

    const tasasCambio = {
        Bitcoin: 250000,
        Ethereum: 15000,
        USDT: 7
    };

    class MetodoPago {
        pagar(monto) {
            throw new Error("Método pagar() debe ser implementado");
        }
    }

    class AdaptadorCripto extends MetodoPago {
        constructor(wallet) {
            super();
            this.wallet = wallet;
        }

        pagar(monto) {
            const tasa = tasasCambio[this.wallet.criptomoneda];
            if (!tasa) throw new Error("Criptomoneda no soportada.");
            const montoEnCrypto = monto / tasa;
            if (this.wallet.saldo < montoEnCrypto) throw new Error("Saldo insuficiente.");
            this.wallet.saldo -= montoEnCrypto;
            return `Pago exitoso. Nuevo saldo: ${this.wallet.saldo.toFixed(2)} ${this.wallet.criptomoneda}`;
        }
    }

    const walletsCrypto = [
        { id: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", criptomoneda: "Bitcoin", saldo: 0.5 },
        { id: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", criptomoneda: "Ethereum", saldo: 10.0 },
        { id: "TQrY8wit4w6foMP6HuKtuqi9c7v3x5a7e9", criptomoneda: "USDT", saldo: 1000.0 }
    ];

    const tarjetas = [
        { numero: "4242424242424242", fechaExpiracion: "12/25", cvv: "123", nombre: "Juan Pérez", saldo: 1000.00 },
        { numero: "5555555555554444", fechaExpiracion: "06/24", cvv: "456", nombre: "María Gómez", saldo: 500.00 }
    ];

    const usuariosPayPal = [
        { correo: "juan.perez@example.com", saldo: 1200.00 },
        { correo: "maria.gomez@example.com", saldo: 800.00 }
    ];

    function validarTarjeta(numero, fechaExpiracion, cvv) {
        return tarjetas.find(t => 
            t.numero === numero && 
            t.fechaExpiracion === fechaExpiracion && 
            t.cvv === cvv
        );
    }

    function validarUsuarioPayPal(correo) {
        return usuariosPayPal.find(u => u.correo === correo);
    }

    function validarWalletCrypto(id) {
        return walletsCrypto.find(w => w.id === id);
    }

    function procesarPagoTarjeta(numero, fechaExpiracion, cvv, monto) {
        const tarjeta = validarTarjeta(numero, fechaExpiracion, cvv);
        if (!tarjeta) return false;
        if (tarjeta.saldo < monto) return false;
        tarjeta.saldo -= monto;
        return true;
    }

    function procesarPagoPayPal(correo, monto) {
        const usuario = validarUsuarioPayPal(correo);
        if (!usuario) return false;
        if (usuario.saldo < monto) return false;
        usuario.saldo -= monto;
        return true;
    }

    function procesarPagoCrypto(id, monto) {
        const wallet = validarWalletCrypto(id);
        if (!wallet) return false;
        try {
            const adaptador = new AdaptadorCripto(wallet);
            adaptador.pagar(monto);
            return true;
        } catch (error) {
            return false;
        }
    }

    function cargarCarrito() {
        fetch(`${apiUrl}/carrito`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    mensajeVacio.style.display = 'none';
                    listaProductos.innerHTML = '';
                    let subtotal = 0;
                    data.forEach(producto => {
                        const productoElement = document.createElement('div');
                        productoElement.classList.add('producto-carrito');
                        productoElement.innerHTML = `
                            <img src="${producto.imagen}" alt="${producto.nombre}">
                            <div class="producto-info">
                                <h3>${producto.nombre}</h3>
                                <p>${producto.descripcion}</p>
                                <p>Precio: <span class="precio">${Number(producto.precio).toFixed(2)} Bs</span></p>
                                <div class="cantidad">
                                    <button class="btn-disminuir">-</button>
                                    <span class="cantidad-numero">${producto.cantidad}</span>
                                    <button class="btn-aumentar">+</button>
                                </div>
                            </div>
                            <button class="eliminar" data-id="${producto.id}">Eliminar</button>
                        `;
                        listaProductos.appendChild(productoElement);
                        subtotal += Number(producto.precio) * producto.cantidad;
                    });
                    subtotalElement.textContent = `${subtotal.toFixed(2)} Bs`;
                    totalElement.textContent = `${(subtotal + envio).toFixed(2)} Bs`;
                } else {
                    mensajeVacio.style.display = 'block';
                    subtotalElement.textContent = '0.00 Bs';
                    totalElement.textContent = '50.00 Bs';
                }
            })
            .catch(error => {
                mensajeVacio.style.display = 'block';
            });
    }

    listaProductos.addEventListener('click', function (event) {
        const target = event.target;
        if (target.classList.contains('btn-aumentar') || target.classList.contains('btn-disminuir')) {
            const cantidadElement = target.parentElement.querySelector('.cantidad-numero');
            let cantidad = parseInt(cantidadElement.textContent);
            target.classList.contains('btn-aumentar') ? cantidad++ : cantidad--;
            if (cantidad < 1) cantidad = 1;
            cantidadElement.textContent = cantidad;
            actualizarSubtotal();
        }
    });

    listaProductos.addEventListener('click', function (event) {
        if (event.target.classList.contains('eliminar')) {
            const productoId = event.target.getAttribute('data-id');
            eliminarProducto(productoId, event.target.closest('.producto-carrito'));
        }
    });

    function eliminarProducto(id, productoElement) {
        fetch(`${apiUrl}/eliminar`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ producto_id: id, lista: 'carrito' }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    productoElement.remove();
                    actualizarSubtotal();
                    if (listaProductos.children.length === 0) mensajeVacio.style.display = 'block';
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function actualizarSubtotal() {
        let subtotal = 0;
        document.querySelectorAll('.producto-carrito').forEach(producto => {
            subtotal += parseFloat(producto.querySelector('.precio').textContent) * parseInt(producto.querySelector('.cantidad-numero').textContent);
        });
        subtotalElement.textContent = `${subtotal.toFixed(2)} Bs`;
        totalElement.textContent = `${(subtotal + envio).toFixed(2)} Bs`;
    }

    document.getElementById('form-tarjeta').addEventListener('submit', function (e) {
        e.preventDefault();
        const numero = document.getElementById('numero-tarjeta').value.replace(/\s+/g, '');
        const fechaExpiracion = document.getElementById('fecha-expiracion').value;
        const cvv = document.getElementById('cvv').value;
        const monto = parseFloat(document.querySelector('.total-modal span').textContent);
        if (procesarPagoTarjeta(numero, fechaExpiracion, cvv, monto)) {
            vaciarCarrito();
            window.location.href = 'index.html';
            alert("Pago exitoso");
        } else alert("Error en el pago");
    });

    document.getElementById('form-paypal').addEventListener('submit', function (e) {
        e.preventDefault();
        const correo = document.getElementById('correo-paypal').value;
        const monto = parseFloat(document.querySelector('.total-modal span').textContent);
        if (procesarPagoPayPal(correo, monto)) {
            vaciarCarrito();
            window.location.href = 'index.html';
            alert("Pago exitoso");
        } else alert("Error en el pago");
    });

    document.getElementById('form-cripto').addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('wallet-crypto').value;
        const monto = parseFloat(document.querySelector('.total-modal span').textContent);
        if (procesarPagoCrypto(id, monto)) {
            vaciarCarrito();
            window.location.href = 'index.html';
            alert("Pago exitoso");
        } else alert("Error en el pago");
    });
    function vaciarCarrito() {
        const productos = document.querySelectorAll('.producto-carrito');
        const deletePromises = Array.from(productos).map(producto => {
            const id = producto.querySelector('.eliminar').getAttribute('data-id');
            return fetch(`${apiUrl}/eliminar`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ producto_id: id, lista: 'carrito' }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    producto.remove();
                } else {
                    console.error('No se pudo eliminar el producto con ID:', id);
                }
            })
            .catch(error => console.error('Error al eliminar el producto con ID:', id, error));
        });
        Promise.all(deletePromises).then(() => {
            mensajeVacio.style.display = 'block';
            subtotalElement.textContent = '0.00 Bs';
            totalElement.textContent = '50.00 Bs';
        });
    }
    
 

    btnComprar.addEventListener('click', () => document.getElementById('modal-pago').style.display = 'block');
    document.getElementById('pagar-tarjeta').addEventListener('click', () => {
        document.getElementById('modal-pago').style.display = 'none';
        document.getElementById('modal-tarjeta').style.display = 'block';
    });
    document.getElementById('pagar-paypal').addEventListener('click', () => {
        document.getElementById('modal-pago').style.display = 'none';
        document.getElementById('modal-paypal').style.display = 'block';
    });
    document.getElementById('pagar-crypto').addEventListener('click', () => {
        document.getElementById('modal-pago').style.display = 'none';
        document.getElementById('modal-cripto').style.display = 'block';
    });
    document.querySelectorAll('.cerrar-modal').forEach(boton => {
        boton.addEventListener('click', () => document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none'));
    });

    cargarCarrito();
});