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

### FIREBASE
Esta aplicación tiene habilitada la característica de hacer un registro de usuarios con la autenticación de Firebase. Contiene la configuración necesaria para hacer un login y la edición del nombre y apellidos de un usuario.

Para levantar el cliente de Angular es necesario clonar el siguiente repositorio:
- https://github.com/Sojer23/ASAS-Explorer-CloudTeam-Client

Para crear la aplicación hay que ejecutar el siguiente comando dentro del directorio de la aplicación:
```
ng serve
```

Se mostrará lo siguiente:
- https://drive.google.com/file/d/1imPzDN1-v4PxVB9rJmr7DuPJtD8XPD2-/view

Sólo se podrá iniciar sesión en el caso de que el actor no esté baneado, en otro caso la aplicación te notificará:

- https://drive.google.com/file/d/1bsloInjxa1vWslBCF8T4ShaEcPslLWhr/view
