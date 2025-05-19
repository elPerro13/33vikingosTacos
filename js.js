document.addEventListener("DOMContentLoaded", () => {
  const btnAgregarMesa = document.getElementById("agregar-cliente-mesa");
  const btnAgregarBarra = document.getElementById("agregar-cliente-barra");
  const btnEliminarCliente = document.getElementById("eliminar-cliente");
  const ordenTextarea = document.querySelector(".orden-nota");
  const botonesProducto = document.querySelectorAll(".botones-producto button");
  const totalSpan = document.getElementById("total-acumulado");

  const ordenesPorElemento = new Map();
  let totalAcumulado = 0;
  let idSeleccionadoGlobal = null;
  let clientesEnBarra = 0;

  const CLAVE_MESAS = 'ordenApp.mesas';
  const CLAVE_BARRA = 'ordenApp.barra';
  const CLAVE_TOTAL_ACUMULADO = 'ordenApp.totalAcumulado';
  const CLAVE_ORDENES = 'ordenApp.ordenes';
  const CLAVE_SELECCIONADO = 'ordenApp.seleccionado';

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
    piso.appendChild(recuadroClientes);
  }

  const generarID = (() => {
    let id = 0;
    return () => `id-${++id}`;
  })();

  function guardarTotalAcumulado() {
    localStorage.setItem(CLAVE_TOTAL_ACUMULADO, totalAcumulado.toString());
  }

  function cargarTotalAcumulado() {
    const totalGuardado = localStorage.getItem(CLAVE_TOTAL_ACUMULADO);
    if (totalGuardado) {
      totalAcumulado = parseFloat(totalGuardado) || 0;
      totalSpan.textContent = `$${totalAcumulado.toFixed(2)}`;
    }
  }

  function guardarOrdenes() {
    const obj = {};
    ordenesPorElemento.forEach((orden, id) => {
      obj[id] = orden;
    });
    localStorage.setItem(CLAVE_ORDENES, JSON.stringify(obj));
  }

  function cargarOrdenesGuardadas() {
    const data = localStorage.getItem(CLAVE_ORDENES);
    if (data) {
      const parsed = JSON.parse(data);
      Object.entries(parsed).forEach(([id, orden]) => {
        ordenesPorElemento.set(id, orden);
      });
    }
  }

  function mostrarOrden(id) {
    const orden = ordenesPorElemento.get(id);
    if (!orden) return;
    ordenTextarea.value =
      `Cliente/Mesa: ${orden.nombre}\n` +
      orden.productos.join('\n') +
      `\nTotal: $${orden.total.toFixed(2)}`;
  }

  function crearElemento(nombre, clase, id = null, left = null) {
    const div = document.createElement("div");
    div.classList.add(clase);
    div.textContent = nombre;
    div.style.position = "relative";

    const nuevoID = id || generarID();
    div.dataset.id = nuevoID;

    if (!ordenesPorElemento.has(nuevoID)) {
      ordenesPorElemento.set(nuevoID, {
        nombre,
        productos: [],
        total: 0
      });
    }

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
        idSeleccionadoGlobal = nuevoID;
        localStorage.setItem(CLAVE_SELECCIONADO, idSeleccionadoGlobal);
        mostrarOrden(nuevoID);
      }
    });

    if (clase === "cc") {
      div.classList.add("cc");
      div.style.position = "absolute";
      div.style.bottom = "5px";
      div.style.left = left !== null ? left : `${clientesEnBarra * 60}px`;
    }

    return div;
  }

  function guardarMesas() {
    const mesas = Array.from(recuadroMesas.children).filter(el => el.classList.contains('mesa'));
    const data = mesas.map(mesa => ({
      id: mesa.dataset.id,
      nombre: mesa.textContent.trim(),
      orden: ordenesPorElemento.get(mesa.dataset.id)
    }));
    localStorage.setItem(CLAVE_MESAS, JSON.stringify(data));
  }

  function cargarMesasGuardadas() {
    const data = localStorage.getItem(CLAVE_MESAS);
    if (data) {
      JSON.parse(data).forEach(mesaInfo => {
        const mesa = crearElemento(mesaInfo.nombre, "mesa", mesaInfo.id);
        ordenesPorElemento.set(mesaInfo.id, { ...mesaInfo.orden });
        recuadroMesas.appendChild(mesa);
      });
    }
  }

  function guardarBarra() {
    const clientes = Array.from(recuadroClientes.children).filter(el => el.classList.contains('cc'));
    const data = clientes.map(cliente => ({
      id: cliente.dataset.id,
      nombre: cliente.textContent.trim(),
      left: cliente.style.left,
      orden: ordenesPorElemento.get(cliente.dataset.id)
    }));
    localStorage.setItem(CLAVE_BARRA, JSON.stringify(data));
  }

  function cargarBarraGuardada() {
    const data = localStorage.getItem(CLAVE_BARRA);
    if (data) {
      JSON.parse(data).forEach(info => {
        const cliente = crearElemento(info.nombre, "cc", info.id, info.left);
        ordenesPorElemento.set(info.id, { ...info.orden });
        recuadroClientes.appendChild(cliente);
        clientesEnBarra++;
      });
    }
  }

  cargarOrdenesGuardadas();
  cargarTotalAcumulado();
  cargarMesasGuardadas();
  cargarBarraGuardada();

  const idPrev = localStorage.getItem(CLAVE_SELECCIONADO);
  if (idPrev && ordenesPorElemento.has(idPrev)) {
    idSeleccionadoGlobal = idPrev;
  } else if (ordenesPorElemento.size > 0) {
    idSeleccionadoGlobal = ordenesPorElemento.keys().next().value;
  }

  if (idSeleccionadoGlobal) {
    const elem = document.querySelector(`[data-id="${idSeleccionadoGlobal}"]`);
    if (elem) {
      elem.classList.add("seleccionado");
      mostrarOrden(idSeleccionadoGlobal);
    }
  }

  btnAgregarMesa.addEventListener("click", () => {
    const nombre = prompt("¿Cómo se llamará la mesa?");
    if (!nombre || !nombre.trim()) return;
    const mesa = crearElemento(nombre.trim(), "mesa");
    recuadroMesas.appendChild(mesa);
    guardarMesas();
    guardarOrdenes();
  });

  btnAgregarBarra.addEventListener("click", () => {
    const nombre = prompt("¿Cómo se llama el cliente?");
    if (!nombre || !nombre.trim()) return;
    const cliente = crearElemento(nombre.trim(), "cc");
    recuadroClientes.appendChild(cliente);
    clientesEnBarra++;
    guardarBarra();
    guardarOrdenes();
  });

  botonesProducto.forEach((button) => {
    button.addEventListener("click", () => {
      const nombreProducto = button.getAttribute("data-orden");
      if (nombreProducto === "sumar" || !idSeleccionadoGlobal) return;

      const precio = parseFloat(button.getAttribute("data-precio")) || 0;
      const descripcion = `${nombreProducto} - $${precio}`;

      const orden = ordenesPorElemento.get(idSeleccionadoGlobal);
      orden.productos.push(descripcion);
      orden.total += precio;

      mostrarOrden(idSeleccionadoGlobal);
      guardarOrdenes();
    });
  });

  const btnSumar = document.querySelector('[data-orden="sumar"]');
  if (btnSumar) {
    btnSumar.addEventListener("click", () => {
      if (!idSeleccionadoGlobal) return;
      const orden = ordenesPorElemento.get(idSeleccionadoGlobal);

      totalAcumulado += orden.total;
      totalSpan.textContent = `$${totalAcumulado.toFixed(2)}`;

      // Clonar el contenido del textarea y mostrarlo debajo del total
      const copia = document.createElement("pre");
      copia.textContent = ordenTextarea.value;
      copia.style.marginTop = "1rem";
      copia.style.padding = "0.5rem";
      copia.style.backgroundColor = "#222";
      copia.style.color = "#48ea18";
      copia.style.borderRadius = "5px";
      copia.style.whiteSpace = "pre-wrap";
      ordenTextarea.parentElement.appendChild(copia);

      orden.total = 0;
      orden.productos = [];

      mostrarOrden(idSeleccionadoGlobal);
      guardarTotalAcumulado();
      guardarOrdenes();
    });
  }

  ordenTextarea.addEventListener("input", () => {
    if (!idSeleccionadoGlobal) return;
    const orden = ordenesPorElemento.get(idSeleccionadoGlobal);

    const texto = ordenTextarea.value.trim();
    const lineas = texto.split("\n");
    const productosConTotal = lineas.slice(1);
    const productos = productosConTotal.slice(0, -1);

    orden.productos = productos.filter(p => p.trim() !== '');
    orden.total = orden.productos.reduce((acc, prod) => {
      const partes = prod.split("- $");
      return acc + (parseFloat(partes[1]) || 0);
    }, 0);

    ordenTextarea.value = `${lineas[0]}\n${orden.productos.join("\n")}\nTotal: $${orden.total.toFixed(2)}`;
    guardarOrdenes();
  });

  btnEliminarCliente.addEventListener("click", () => {
    const elementos = document.querySelectorAll(".mesa, .cc");
    elementos.forEach((el) => {
      const checkbox = el.querySelector("input[type='checkbox']");
      if (checkbox && checkbox.checked) {
        const id = el.dataset.id;
        ordenesPorElemento.delete(id);
        if (id === idSeleccionadoGlobal) {
          idSeleccionadoGlobal = null;
          ordenTextarea.value = "";
        }
        el.remove();
        if (el.classList.contains("cc")) {
          clientesEnBarra--;
        }
      }
    });

    localStorage.removeItem(CLAVE_SELECCIONADO);
    guardarMesas();
    guardarBarra();
    guardarOrdenes();
  });

  window.addEventListener('beforeunload', () => {
    guardarMesas();
    guardarBarra();
    guardarTotalAcumulado();
    guardarOrdenes();
    localStorage.setItem(CLAVE_SELECCIONADO, idSeleccionadoGlobal || "");
  });
});
