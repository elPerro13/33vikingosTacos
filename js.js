document.addEventListener("DOMContentLoaded", () => {
  const btnAgregarMesa = document.getElementById("agregar-cliente-mesa");
  const btnAgregarBarra = document.getElementById("agregar-cliente-barra");
  const btnEliminarCliente = document.getElementById("eliminar-cliente");
  const ordenTextarea = document.querySelector(".orden-nota");
  const botonesProducto = document.querySelectorAll(".botones-producto button");
  const totalSpan = document.getElementById("total-acumulado");

  const ordenesPorElemento = new Map();
  let totalPrecio = 0;
  let totalAcumulado = 0;
  let idSeleccionadoGlobal = null;

  const piso = document.querySelector(".piso");
  const mainContenedor = document.querySelector(".main-contenedor"); // Referencia a main-contenedor
  let recuadroMesas = document.querySelector(".recuadro-mesas");
  if (!recuadroMesas) {
    recuadroMesas = document.createElement("div");
    recuadroMesas.classList.add("recuadro-mesas");
    piso.appendChild(recuadroMesas);
  }

  let recuadroClientes = document.querySelector(".recuadro-clientes");
  if (!recuadroClientes) {
    recuadroClientes = document.createElement("div");
    recuadroClientes.classList.add("recuadro-clientes");
    piso.appendChild(recuadroClientes);
  }

  const generarID = (() => {
    let id = 0;
    return () => `id-${++id}`;
  })();

  let clientesEnBarra = 0;

  function mostrarOrden(id) {
    const orden = ordenesPorElemento.get(id);
    if (!orden) return;
    ordenTextarea.value =
      `Cliente/Mesa: ${orden.nombre}\n` +
      orden.productos.join('\n') +
      `\nTotal: $${orden.total.toFixed(2)}`;
  }

  function crearElemento(nombre, clase) {
    const div = document.createElement("div");
    div.classList.add(clase);
    div.textContent = nombre;
    div.style.position = "relative";

    const id = generarID();
    div.dataset.id = id;

    ordenesPorElemento.set(id, {
      nombre,
      productos: [],
      total: 0
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.position = "absolute";
    checkbox.style.top = "2px";
    checkbox.style.right = "2px";
    checkbox.style.transform = "scale(0.8)";
    div.appendChild(checkbox);

    div.addEventListener("click", (e) => {
      if (e.target !== checkbox) {
        document.querySelectorAll(".mesa, .cc").forEach(el => el.classList.remove("seleccionado"));
        div.classList.add("seleccionado");
        idSeleccionadoGlobal = id;
        mostrarOrden(id);
      }
    });

    return div;
  }

  btnAgregarMesa.addEventListener("click", () => {
    const nombre = prompt("¿Cómo se llamará la mesa?");
    if (!nombre || !nombre.trim()) return;
    const mesa = crearElemento(nombre, "mesa");
    recuadroMesas.appendChild(mesa);
  });

  btnAgregarBarra.addEventListener("click", () => {
    const nombre = prompt("¿Cómo se llama el cliente?");
    if (!nombre || !nombre.trim()) return;
    const cliente = crearElemento(nombre, "cc");

    // Obtener la barra plateada
    const barraPlateada = document.querySelector(".barra");

    if (barraPlateada) {
      // Obtener las coordenadas y tamaño de la barra
      const barraRect = barraPlateada.getBoundingClientRect();

      // Posicionar el cliente sobre la barra plateada ajustando la posición
      cliente.style.position = "absolute";
      cliente.style.left = `${barraRect.left + 10 + clientesEnBarra * 60}px`; // Ajuste horizontal
      cliente.style.top = `${barraRect.top - 40}px`; // Ajuste vertical

      clientesEnBarra++; // Incrementar número de clientes en la barra
    }

    piso.appendChild(cliente); // Agregar cliente al contenedor principal (piso)
  });

  btnAgregarBarra.addEventListener("click", () => {
    const nombre = prompt("¿Cómo se llama el cliente?");
    if (!nombre || !nombre.trim()) return;
    const cliente = crearElemento(nombre, "cc");

    // Colocamos el cliente en la parte inferior de .main-contenedor
    cliente.style.position = "absolute";
    cliente.style.left = `${clientesEnBarra * 60}px`; // Desplazamos horizontalmente
    cliente.style.bottom = "10px"; // Lo colocamos en la parte inferior

    // Agregamos al main-contenedor
    mainContenedor.appendChild(cliente); // Aquí lo agregamos al contenedor principal
    clientesEnBarra++; // Contabilizamos los clientes en la barra
  });

  botonesProducto.forEach((button) => {
    button.addEventListener("click", () => {
      const nombreProducto = button.getAttribute("data-orden");

      if (!idSeleccionadoGlobal) return;

      let precio = parseFloat(button.getAttribute("data-precio")) || 0;
      let descripcion = `${nombreProducto} - $${precio}`;

      const orden = ordenesPorElemento.get(idSeleccionadoGlobal);
      if (!orden) return;

      orden.productos.push(descripcion);
      orden.total += precio;

      totalPrecio += precio;

      mostrarOrden(idSeleccionadoGlobal);
    });
  });

  const btnSumar = document.querySelector('[data-orden="sumar"]');
  if (btnSumar) {
    btnSumar.addEventListener("click", () => {
      if (!idSeleccionadoGlobal) return;

      const orden = ordenesPorElemento.get(idSeleccionadoGlobal);
      if (!orden) return;

      totalAcumulado += orden.total;

      if (totalSpan) {
        totalSpan.textContent = `$${totalAcumulado.toFixed(2)}`;
      }

      orden.total = 0;
      orden.productos = [];
      mostrarOrden(idSeleccionadoGlobal);
    });
  }

  ordenTextarea.addEventListener("input", () => {
    if (!idSeleccionadoGlobal) return;

    const orden = ordenesPorElemento.get(idSeleccionadoGlobal);
    if (!orden) return;

    const texto = ordenTextarea.value.trim();
    const productos = texto.split("\n").slice(1, -1);

    orden.productos = productos;
    orden.total = productos.reduce((total, producto) => {
      const precio = parseFloat(producto.split('- $')[1]) || 0;
      return total + precio;
    }, 0);

    const totalNota = `Total: $${orden.total.toFixed(2)}`;
    ordenTextarea.value = `Cliente/Mesa: ${orden.nombre}\n` + productos.join("\n") + `\n${totalNota}`;
  });

  btnEliminarCliente.addEventListener("click", () => {
    const elementos = document.querySelectorAll(".mesa, .cc");
    elementos.forEach((el) => {
      const checkbox = el.querySelector("input[type='checkbox']");
      if (checkbox && checkbox.checked) {
        const id = el.dataset.id;
        ordenesPorElemento.delete(id);
        el.remove();
      }
    });

    ordenTextarea.value = "";
    idSeleccionadoGlobal = null;
  });
});
