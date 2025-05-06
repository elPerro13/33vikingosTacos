document.addEventListener("DOMContentLoaded", () => {
  const btnAgregarMesa = document.getElementById("agregar-cliente-mesa");
  const btnAgregarBarra = document.getElementById("agregar-cliente-barra");
  const btnEliminarCliente = document.getElementById("eliminar-cliente");
  const ordenTextarea = document.querySelector(".orden-nota");
  const botonesProducto = document.querySelectorAll(".botones-producto button");
  const totalVendido = document.querySelector(".total-vendido");

  const ordenesPorElemento = new Map();
  let totalPrecio = 0;
  let idSeleccionadoGlobal = null;

  const piso = document.querySelector(".piso");
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
    recuadroMesas.appendChild(recuadroClientes);
  }

  const generarID = (() => {
    let id = 0;
    return () => `id-${++id}`;
  })();

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
        idSeleccionadoGlobal = id;
        mostrarOrden(id);
      }
    });

    return div;
  }

  btnAgregarMesa.addEventListener("click", () => {
    const nombre = prompt("¿Cómo se llamará la mesa?");
    if (!nombre) return;
    const mesa = crearElemento(nombre, "mesa");
    recuadroMesas.appendChild(mesa);
  });

  btnAgregarBarra.addEventListener("click", () => {
    const nombre = prompt("¿Cómo se llama el cliente?");
    if (!nombre) return;
    const cliente = crearElemento(nombre, "cc");
    recuadroClientes.appendChild(cliente);
  });

  botonesProducto.forEach((button) => {
    button.addEventListener("click", () => {
      if (!idSeleccionadoGlobal) return;

      const nombreProducto = button.getAttribute("data-orden");
      let precio = parseFloat(button.getAttribute("data-precio"));
      let descripcion = `${nombreProducto} - $${precio}`;

      const cebolla = document.getElementById("cebolla").checked;
      const papa = document.getElementById("papa").checked;
      const queso = document.getElementById("queso").checked;
      const bistec = document.getElementById("bistec").checked;
      const suadero = document.getElementById("suadero").checked;

      const extras = [];

      if (cebolla) extras.push("con cebolla");
      if (papa) extras.push("con papa");
      if (queso) {
        extras.push("con queso");
        precio += 7;
      }
      if (bistec) extras.push("con bistec");
      if (suadero) extras.push("con suadero");

      if (extras.length > 0) {
        descripcion += ` (${extras.join(", ")})`;
      }

      const orden = ordenesPorElemento.get(idSeleccionadoGlobal);
      if (!orden) return;

      orden.productos.push(descripcion);
      orden.total += precio;

      mostrarOrden(idSeleccionadoGlobal);

      totalPrecio += precio;
      totalVendido.innerHTML = `<h3>Total Vendido: $${totalPrecio.toFixed(2)}</h3>`;
    });
  });

  btnEliminarCliente.addEventListener("click", () => {
    const elementos = document.querySelectorAll(".mesa, .cc");
    elementos.forEach((el) => {
      const checkbox = el.querySelector("input[type='checkbox']");
      if (checkbox && checkbox.checked) {
        const id = el.dataset.id;
        // ❌ Ya NO se resta el total
        // const orden = ordenesPorElemento.get(id);
        // if (orden) {
        //   totalPrecio -= orden.total;
        // }
        ordenesPorElemento.delete(id);
        el.remove();
      }
    });

    ordenTextarea.value = "";
    totalVendido.innerHTML = `<h3>Total Vendido: $${totalPrecio.toFixed(2)}</h3>`;
    idSeleccionadoGlobal = null;
  });
});
