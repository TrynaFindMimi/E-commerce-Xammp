<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servidor = "localhost";  
$usuario = "root";        
$contrasena = "";         
$basedatos = "stock";  

$conexion = new mysqli($servidor, $usuario, $contrasena, $basedatos);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
?>