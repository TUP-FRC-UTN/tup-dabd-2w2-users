# Creación y Publicación de Librerías

En caso de necesitar proveer componentes, servicios u otro tipo de elementos a otros grupos, será necesario crear una librería que albergará los mismos. Esta será publicada en npm de manera pública para que todos aquellos interesados puedan utilizar de manera sencilla y estable los elementos que deseen.

## Pasos para crear y publicar una librería en Angular

1. **Crear proyecto tipo librería:**
```bash
ng generate library NOMBRE_LIBRERIA
```
El NOMBRE_LIBRERIA deberá tener el siguiente formato: `ngx-dabd-nombre-equipo`


2. **Agregar los elementos que se deseen exportar:**  
   Recordar que deben ser exportados en el archivo `public_api.ts` para que puedan ser utilizados por aquellos que se van a instalar la librería, de ahora en más llamados "clientes".

3. **Compilar la librería antes de publicar:**  
Es necesario compilar con el comando:

```bash
ng build NOMBRE_LIBRERIA
```

4. **Publicar la librería:**
   - Es necesario crearse una cuenta en [npm](https://www.npmjs.com/).
   - Luego, en la consola de comandos, ejecutar:
     ```bash
     npm login
     ```
     Esto solicitará ingresar los datos de la cuenta de npm previamente creada.
   - Si el ingreso fue correcto, se puede verificar con el comando:
     ```bash
     npm whoami
     ```
     que retornará el usuario logueado.

5. **Subir la librería a npm:**  
   Ir a la carpeta `dist` donde están todos los archivos generados al compilar y ejecutar el siguiente comando:
   ```bash
   npm publish
	```
	
6. **Compartir paquete**
Por ultimo en el perfil de la cuenta npm en la sección Packages se pueden ver todos los paquetes subidos y visitarlos para obtener información sobre la documentación como asi también el script para su instalación el cual puede ser compartido con todos los clientes intersados.

**Links de interes**
Para más información visitar los siguientes links:
- https://angular.dev/tools/libraries/creating-libraries
- https://medium.com/angular-in-depth/complete-beginner-guide-to-publish-an-angular-library-to-npm-d42343801660
