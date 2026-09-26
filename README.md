# Arima — Maquetación Web + JavaScript (PEC 4 + PEC 5)

Proyecto e-commerce para la marca de moda **Arima**. Este proyecto parte de la maquetación en HTML5 y CSS3 realizada en la PEC 4 y añade interactividad completa mediante **JavaScript**.

- **Diseño Figma de referencia:** [https://www.figma.com/design/JOlPAE8DV9Dc80r3zVf2Hh/Wireframe-tienda?node-id=0-1&t=PHK7MH8v5Mrt9nQX-1]

---

## 1. Interacciones JavaScript (PEC 5)

Todo el código de comportamiento se encuentra en un único archivo externo: `js/funciones.js`. Se han utilizado eventos del DOM, manejo de clases CSS y **delegación de eventos** para mantener un código eficiente y organizado. No se utiliza JavaScript intrusivo (sin atributos `onclick` en HTML).

| # | Interacción | Páginas | Descripción |
|---|---|---|---|
| 1 | **Menú Hamburguesa** | Todas (menos `login.html`) | Permite abrir y cerrar la navegación en dispositivos móviles mediante la clase `.nav-open`. Se puede cerrar con el botón, haciendo clic en el overlay o con la tecla `Escape`. |
| 2 | **Buscador Desplegable y Filtro** | Todas | El botón `SEARCH` despliega el panel `.search-drawer`. Si el usuario busca desde `shop.html`, filtra los productos en tiempo real. Desde cualquier otra página, redirige a la tienda con el término de búsqueda. |
| 3 | **Cesta / Carrito (`Bag`)** | Todas | Abre el panel lateral `.bag-drawer`. Permite añadir productos, modificar cantidades (`+` / `-`), calcular el precio subtotal y actualizar el contador del header (`BAG (X)`). Guarda los datos en `localStorage`. |
| 4 | **Vista Rápida (Lightbox)** | `shop.html`, `new_in.html` | Al hacer clic en la tarjeta de un producto, se abre una ventana emergente (`.lightbox`) con los detalles de la prenda y la opción de añadirla directamente al carrito. |
| 5 | **Validación de Formularios** | Todas | Valida los inputs de correo electrónico en la Newsletter (footer) y en la página de Login mediante expresiones regulares, mostrando mensajes de confirmación sin recargar la página. |

---

## 2. Bloques Finalizados y Correcciones

- **Paneles interactivos conectados:** Conexión completa de los paneles `.search-drawer` y `.bag-drawer` creados en la PEC 4.
- **Lightbox de producto:** Incorporación de la vista rápida de prendas.
- **Cálculo dinámico de posiciones:** Cálculo de la altura del header mediante JS (`getBoundingClientRect()`) para asegurar que el buscador y el overlay se posicionen correctamente en todas las pantallas.
- **Control de scroll:** Aplicación de la clase `no-scroll` en `body` cuando hay un panel abierto para evitar el desplazamiento de la página de fondo.
- **Z-Index y Capas:** Reordenamiento de la pila de capas CSS para evitar que el header quede tapado o ensombrecido por el overlay.

---

## 3. Estructura de Páginas

El sitio se compone de 5 páginas HTML totalmente funcionales:

* **`index.html`**: Portada principal con portada *Hero*.
* **`new_in.html`**: Novedades y catálogo reciente.
* **`shop.html`**: Catálogo completo de productos.
* **`about.html`**: Historia y valores de la marca.
* **`login.html`**: Acceso de usuarios y registro.

---

## 4. Diagrama del Flujo de Interacción

```mermaid
graph TD
    A[Páginas HTML] --> B[Navegación / Header]
    A --> C[Catálogo de Productos]
    A --> D[Formularios]

    B -->|Click en Menú| M[Menú Hamburguesa]
    B -->|Click en SEARCH| S[Search Drawer]
    B -->|Click en BAG| G[Bag Drawer / Carrito]

    C -->|Click en Producto| L[Lightbox / Vista Rápida]
    L -->|Añadir| G

    D -->|Validar Email| V[Feedback al Usuario]

    G -->|Guardar datos| P[(localStorage)]