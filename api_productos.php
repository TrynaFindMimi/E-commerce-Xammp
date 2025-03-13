<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
include 'conexion.php';

if (!isset($conexion)) {
    echo json_encode(["error" => "No se pudo establecer la conexión a la base de datos."]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$request = isset($_SERVER['PATH_INFO']) ? explode('/', trim($_SERVER['PATH_INFO'], '/')) : [];

switch ($method) {
    case 'GET':
        handleGetRequest($request);
        break;
    case 'POST':
        handlePostRequest($request);
        break;
    case 'DELETE':
        handleDeleteRequest($request);
        break;
    default:
        echo json_encode(["error" => "Método no permitido."]);
        break;
}

function handleGetRequest($request) {
    global $conexion;

    if (empty($request)) {
        $sql = "SELECT id, nombre, descripcion, precio, imagen FROM catalogo";
        $result = $conexion->query($sql);

        if ($result === false) {
            echo json_encode(["error" => "Error en la consulta SQL: " . $conexion->error]);
            exit;
        }

        $productos = [];

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $productos[] = $row;
            }
        }

        echo json_encode($productos);
    } elseif ($request[0] === 'producto' && isset($request[1])) {
        $productoId = intval($request[1]);
        $sql = "SELECT id, nombre, descripcion, precio, imagen, vendidos FROM catalogo WHERE id = $productoId";
        $result = $conexion->query($sql);

        if ($result === false) {
            echo json_encode(["error" => "Error en la consulta SQL: " . $conexion->error]);
            exit;
        }

        if ($result->num_rows > 0) {
            $producto = $result->fetch_assoc();
            echo json_encode($producto);
        } else {
            echo json_encode(["error" => "Producto no encontrado."]);
        }
    } elseif ($request[0] === 'mas_vendidos') {
        $sql = "SELECT id, nombre, descripcion, precio, imagen, vendidos FROM catalogo ORDER BY vendidos DESC LIMIT 5";
        $result = $conexion->query($sql);

        if ($result === false) {
            echo json_encode(["error" => "Error en la consulta SQL: " . $conexion->error]);
            exit;
        }

        $productos = [];

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $productos[] = $row;
            }
        }

        echo json_encode($productos);
    } elseif ($request[0] === 'carrito') {
        $sql = "SELECT id, imagen, nombre, descripcion, precio, cantidad FROM Carrito";
        $result = $conexion->query($sql);

        if ($result === false) {
            echo json_encode(["error" => "Error en la consulta SQL: " . $conexion->error]);
            exit;
        }

        $productos = [];

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $productos[] = $row;
            }
        }

        echo json_encode($productos);
    } elseif ($request[0] === 'favoritos') {
        $sql = "SELECT id, imagen, nombre, descripcion, precio FROM Favoritos";
        $result = $conexion->query($sql);

        if ($result === false) {
            echo json_encode(["error" => "Error en la consulta SQL: " . $conexion->error]);
            exit;
        }

        $productos = [];

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $productos[] = $row;
            }
        }

        echo json_encode($productos);
    } elseif ($request[0] === 'saldos') {
        $usuarioId = intval($request[1]);
        $saldos = obtenerSaldos($usuarioId);
        echo json_encode($saldos);
    } else {
        echo json_encode(["error" => "Ruta no válida."]);
    }
}

function handlePostRequest($request) {
    global $conexion;

    if ($request[0] === 'agregar') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['producto_id']) && isset($data['lista'])) {
            $productoId = intval($data['producto_id']);
            $lista = $conexion->real_escape_string($data['lista']);

            $sql = "SELECT id, imagen, nombre, descripcion, precio FROM catalogo WHERE id = $productoId";
            $result = $conexion->query($sql);

            if ($result->num_rows === 0) {
                echo json_encode(["error" => "Producto no encontrado."]);
                exit;
            }

            $producto = $result->fetch_assoc();

            if ($lista === 'carrito') {
                $sql = "SELECT cantidad FROM Carrito WHERE id = $productoId";
                $result = $conexion->query($sql);

                if ($result->num_rows > 0) {
                    $row = $result->fetch_assoc();
                    $nuevaCantidad = $row['cantidad'] + 1;
                    $sql = "UPDATE Carrito SET cantidad = $nuevaCantidad WHERE id = $productoId";
                } else {
                    $sql = "INSERT INTO Carrito (id, imagen, nombre, descripcion, precio, cantidad)
                            VALUES ($productoId, '{$producto['imagen']}', '{$producto['nombre']}', '{$producto['descripcion']}', {$producto['precio']}, 1)";
                }
            } elseif ($lista === 'favoritos') {
                $sql = "SELECT id FROM Favoritos WHERE id = $productoId";
                $result = $conexion->query($sql);

                if ($result->num_rows > 0) {
                    echo json_encode(["error" => "El producto ya está en favoritos."]);
                    exit;
                } else {
                    $sql = "INSERT INTO Favoritos (id, imagen, nombre, descripcion, precio)
                            VALUES ($productoId, '{$producto['imagen']}', '{$producto['nombre']}', '{$producto['descripcion']}', {$producto['precio']})";
                }
            } else {
                echo json_encode(["error" => "Lista no válida."]);
                exit;
            }

            if ($conexion->query($sql) === true) {
                echo json_encode(["success" => "Producto agregado a la lista de $lista."]);
            } else {
                echo json_encode(["error" => "Error al agregar el producto: " . $conexion->error]);
            }
        } else {
            echo json_encode(["error" => "Datos incompletos."]);
        }
    } elseif ($request[0] === 'pagar') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['usuario_id']) && isset($data['metodo']) && isset($data['monto'])) {
            $usuarioId = intval($data['usuario_id']);
            $metodo = $conexion->real_escape_string($data['metodo']);
            $monto = floatval($data['monto']);

            if ($metodo === 'paypal') {
                $sql = "UPDATE paypal SET saldo = saldo - $monto WHERE usuario_id = $usuarioId";
            } elseif ($metodo === 'tarjeta') {
                $sql = "UPDATE tarjeta SET saldo = saldo - $monto WHERE usuario_id = $usuarioId";
            } elseif ($metodo === 'cripto') {
                $sql = "UPDATE cripto SET saldo = saldo - $monto WHERE usuario_id = $usuarioId";
            } else {
                echo json_encode(["error" => "Método de pago no válido."]);
                exit;
            }

            if ($conexion->query($sql) === true) {
                echo json_encode(["success" => "Pago realizado con éxito."]);
            } else {
                echo json_encode(["error" => "Error al procesar el pago: " . $conexion->error]);
            }
        } else {
            echo json_encode(["error" => "Datos incompletos."]);
        }
    } else {
        echo json_encode(["error" => "Ruta no válida."]);
    }
}

function handleDeleteRequest($request) {
    global $conexion;

    if ($request[0] === 'eliminar') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($data['producto_id']) && isset($data['lista'])) {
            $productoId = intval($data['producto_id']);
            $lista = $conexion->real_escape_string($data['lista']);

            if ($lista === 'carrito') {
                $sql = "DELETE FROM Carrito WHERE id = $productoId";
            } elseif ($lista === 'favoritos') {
                $sql = "DELETE FROM Favoritos WHERE id = $productoId";
            } else {
                echo json_encode(["error" => "Lista no válida."]);
                exit;
            }

            if ($conexion->query($sql) === true) {
                echo json_encode(["success" => "Producto eliminado de la lista de $lista."]);
            } else {
                echo json_encode(["error" => "Error al eliminar el producto: " . $conexion->error]);
            }
        } else {
            echo json_encode(["error" => "Datos incompletos."]);
        }
    } else {
        echo json_encode(["error" => "Ruta no válida."]);
    }
}

$conexion->close();
?>