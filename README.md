# ASAS18-Explorer-CloudTeam
Proyecto ACME Explorer desarrollado para la asignatura Arquitectura para Software como Servicio

## Extras

### SWAGGER
Esta aplicación contiene una documentación en Swagger con todos los endpoints y modelos actualizados. Para poder ver esta documentación copie y pegue el contenido del fichero en la siguiente URL: (https://editor.swagger.io/)
```
./doc/acmeexplorer-doc.yml
```


### HTTPS
Esta aplicación está preparada para soportar peticiones HTTPS con certificados propios generados con OpenSSL (https://www.openssl.org/).

Para probar esta característica es necesario añadir a PostMan la colección alojada en la carpeta:
```
./postmanCollection/ASAS-1819-CloudTeam.postman_collection.json
```

Dentro de esta colección, en la carpeta HTTPS existe una petición creada hacia el endpoint--> (https://localhost:8080/v1/trips)

Una vez tenemos localizada la petición, tenemos que entrar a los ajustes de PostMan y navegar hasta la ventana 'General' y deshabilitar la casilla 'SSL certificate verification'.

Tras esto, levantar la aplicación y hacer la petición de PostMan nombrada con anterioridad.
