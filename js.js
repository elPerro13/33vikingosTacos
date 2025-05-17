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
  let clientesEnBarra = 0;

  const CLAVE_MESAS = 'ordenApp.mesas';
  const CLAVE_BARRA = 'ordenApp.barra';
  const CLAVE_TOTAL_ACUMULADO = 'ordenApp.totalAcumulado';

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
      if (totalSpan) {
        totalSpan.textContent = `$${totalAcumulado.toFixed(2)}`;
      }
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

  function guardarMesas() {
    const mesasParaGuardar = Array.from(recuadroMesas.children)
      .filter(el => el.classList.contains('mesa'))
      .map(mesaDiv => ({
        id: mesaDiv.dataset.id,
        nombre: mesaDiv.textContent.trim(),
        orden: ordenesPorElemento.get(mesaDiv.dataset.id)
      }));
    localStorage.setItem(CLAVE_MESAS, JSON.stringify(mesasParaGuardar));
  }

  function cargarMesasGuardadas() {
    const mesasGuardadasString = localStorage.getItem(CLAVE_MESAS);
    if (mesasGuardadasString) {
      const mesasGuardadas = JSON.parse(mesasGuardadasString);
      mesasGuardadas.forEach(mesaInfo => {
        const mesa = crearElemento(mesaInfo.nombre, "mesa");
        mesa.dataset.id = mesaInfo.id;
        ordenesPorElemento.set(mesaInfo.id, { ...mesaInfo.orden });
        recuadroMesas.appendChild(mesa);
      });
    }
  }

  function guardarBarra() {
    const barraParaGuardar = Array.from(recuadroMesas.children)
      .filter(el => el.classList.contains('cc'))
      .map(clienteDiv => ({
        id: clienteDiv.dataset.id,
        nombre: clienteDiv.textContent.trim(),
        left: clienteDiv.style.left,
        orden: ordenesPorElemento.get(clienteDiv.dataset.id)
      }));
    localStorage.setItem(CLAVE_BARRA, JSON.stringify(barraParaGuardar));
  }

  function cargarBarraGuardada() {
    const barraGuardadaString = localStorage.getItem(CLAVE_BARRA);
    if (barraGuardadaString) {
      const barraGuardada = JSON.parse(barraGuardadaString);
      barraGuardada.forEach(clienteInfo => {
        const cliente = crearElemento(clienteInfo.nombre, "cc");
        cliente.dataset.id = clienteInfo.id;
        cliente.style.position = "absolute";
        cliente.style.bottom = "5px";
        cliente.style.left = clienteInfo.left;
        ordenesPorElemento.set(clienteInfo.id, { ...clienteInfo.orden });
        recuadroMesas.appendChild(cliente);
        clientesEnBarra++;
      });
    }
  }

  cargarTotalAcumulado();
  cargarMesasGuardadas();
  cargarBarraGuardada();

  btnAgregarMesa.addEventListener("click", () => {
    const nombre = prompt("¿Cómo se llamará la mesa?");
    if (!nombre || !nombre.trim()) return;
    const mesa = crearElemento(nombre, "mesa");
    recuadroMesas.appendChild(mesa);
    guardarMesas();
  });

  btnAgregarBarra.addEventListener("click", () => {
    const nombre = prompt("¿Cómo se llama el cliente?");
    if (!nombre || !nombre.trim()) return;
    const cliente = crearElemento(nombre, "cc");

    cliente.style.position = "absolute";
    cliente.style.bottom = "5px";
    cliente.style.left = `${10 + clientesEnBarra * 60}px`;
    clientesEnBarra++;

    recuadroMesas.appendChild(cliente);
    guardarBarra();
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
      guardarTotalAcumulado();
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
        if (el.classList.contains('cc')) {
          clientesEnBarra--;
        }
      }
    });

    ordenTextarea.value = "";
    idSeleccionadoGlobal = null;
    guardarMesas();
    guardarBarra();
  });

  window.addEventListener('beforeunload', () => {
    guardarMesas();
    guardarBarra();
    guardarTotalAcumulado();
  });
});

