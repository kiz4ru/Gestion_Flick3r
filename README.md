
## Gestionar_Flickr_Session 
![T](img/Flickr_logo.png)

Esta aplicación permite iniciar sesión en Flickr utilizando OAuth y subir una foto a tu cuenta de Flickr.

## Requisitos previos

- Sistema operativo compatible (Windows, macOS, Linux)
- Versión de [Node.js v21.1.0](https://nodejs.org) instalada
- Otros requisitos específicos del proyecto (API key y API secret de flickr)

## Instalación

1. Clona el repositorio en tu máquina local:

    ```bash
    git clone https://github.com/kiz4ru/Gestionar_Flickr_Session.git
    ```

2. Navega al directorio del proyecto:

    ```bash
    cd tu-repositorio
    ```


3. Instala las dependencias del proyecto:

    ```bash
    npm install
    ```

## Configuración

1. Crea un archivo de configuración `.env` en la raíz del proyecto.
2. Completa las variables de entorno necesarias en el archivo `.env` según las instrucciones proporcionadas.
3. Cambiar el id `photosetIdMontaje`, `photosetIdFinal`.
Esto lo que hace es agregarte las fotos que vas subiendo al flickr a un album. Lo unico hay que tener un album creado y arriba de la url estara la id del album.
Lineas 163-164
## Uso

1. Inicia la aplicación:

    ```bash
    node app.js
    ```

2. Se abrira automaticamente el `http://localhost:3000/authorize` para acceder a la aplicación.