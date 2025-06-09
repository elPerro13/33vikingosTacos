document.addEventListener('DOMContentLoaded', () => {
  const btnAgregarCliente = document.getElementById('agregar-cliente');
  const btnEliminarCliente = document.getElementById('eliminar-cliente');
  const selectorMesas = document.getElementById('selector-mesas');
  const textareaOrden = document.querySelector('.orden-nota');
  const botonesProducto = document.querySelectorAll('.botones-producto button');
  const btnSumar = document.querySelector('[data-orden="sumar"]');
  const spanTotalAcumulado = document.getElementById('total-acumulado');
  const contenedorCopias = document.getElementById('copias-ordenes');

  let ordenes = JSON.parse(localStorage.getItem('ordenes')) || {};
  let totalAcumulado = parseFloat(localStorage.getItem('totalAcumulado')) || 0;

  let imagenesGuardadas = JSON.parse(localStorage.getItem('imagenesOrdenes')) || [];
  imagenesGuardadas.forEach(src => {
    const img = new Image();
    img.src = src;
    img.style.display = 'block';
    img.style.margin = '10px auto';
    img.style.border = '2px solid #48ea18';
    img.style.borderRadius = '8px';
    img.style.maxWidth = '100%';
    contenedorCopias.appendChild(img);
  });

  spanTotalAcumulado.textContent = `$${totalAcumulado.toFixed(2)}`;

  Object.keys(ordenes).forEach(id => {
    const opcion = document.createElement('option');
    opcion.value = id;
    opcion.textContent = ordenes[id].nombre;
    selectorMesas.appendChild(opcion);
  });

  if (selectorMesas.value) {
    selectorMesas.dispatchEvent(new Event('change'));
  }

  if (localStorage.getItem('ordenActualTexto')) {
    textareaOrden.value = localStorage.getItem('ordenActualTexto');
    const textoGuardado = textareaOrden.value;
    const primerLinea = textoGuardado.split('\n')[0];

    for (const opcion of selectorMesas.options) {
      if (opcion.textContent === primerLinea) {
        selectorMesas.value = opcion.value;
        selectorMesas.dispatchEvent(new Event('change'));
        break;
      }
    }
  }

  selectorMesas.addEventListener('change', () => {
    const id = selectorMesas.value;
    if (ordenes[id]) {
      const textoCompleto = ordenes[id].nombre + '\n' +
        (ordenes[id].texto ? ordenes[id].texto + `\nTotal: $${ordenes[id].total.toFixed(2)}` : '');
      textareaOrden.value = textoCompleto;
    } else {
      textareaOrden.value = '';
    }
  });

  btnAgregarCliente.addEventListener('click', () => {
    const nombreCliente = prompt('Ingresa el nombre del cliente:');
    if (nombreCliente && nombreCliente.trim() !== '') {
      const nombre = nombreCliente.trim();
      const id = `${nombre}_${Date.now()}`;
      const nuevaOpcion = document.createElement('option');
      nuevaOpcion.value = id;
      nuevaOpcion.textContent = nombre;
      selectorMesas.appendChild(nuevaOpcion);
      selectorMesas.value = id;
      ordenes[id] = { nombre, texto: '', total: 0 };
      localStorage.setItem('ordenes', JSON.stringify(ordenes));
      textareaOrden.value = nombre;
    }
  });

  btnEliminarCliente.addEventListener('click', () => {
    const id = selectorMesas.value;
    if (!id) return;
    const opcion = selectorMesas.querySelector(`option[value="${id}"]`);
    if (opcion) opcion.remove();
    delete ordenes[id];
    localStorage.setItem('ordenes', JSON.stringify(ordenes));
    textareaOrden.value = '';
    selectorMesas.value = '';
  });

  botonesProducto.forEach(boton => {
    boton.addEventListener('click', () => {
      const id = selectorMesas.value;
      if (!id || !ordenes[id]) return;
      const producto = boton.dataset.orden;
      const precio = parseFloat(boton.dataset.precio);
      const linea = `${producto} - $${precio.toFixed(2)}`;

      const lineas = textareaOrden.value.split('\n');
      const nombre = ordenes[id].nombre;
      const textoManual = lineas
        .filter(line => !line.startsWith(nombre) && !line.startsWith('Total:') && !ordenes[id].texto.includes(line))
        .join('\n');

      ordenes[id].texto += (ordenes[id].texto ? '\n' : '') + linea;
      ordenes[id].total += precio;

      let textoCompleto = ordenes[id].nombre + '\n' + ordenes[id].texto;
      if (textoManual) textoCompleto += '\n' + textoManual;
      textoCompleto += `\nTotal: $${ordenes[id].total.toFixed(2)}`;

      textareaOrden.value = textoCompleto;
      localStorage.setItem('ordenes', JSON.stringify(ordenes));
    });
  });

  function crearImagenDeTexto(texto) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const padding = 20;
    const lineHeight = 24;
    const lines = texto.split('\n');

    canvas.width = 400;
    canvas.height = padding * 2 + lineHeight * lines.length;

    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#48ea18';
    ctx.font = '16px Segoe UI, Tahoma, Geneva, Verdana, sans-serif';

    lines.forEach((line, i) => {
      ctx.fillText(line, padding, padding + (i + 1) * lineHeight);
    });

    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    img.style.display = 'block';
    img.style.margin = '10px auto';
    img.style.border = '2px solid #48ea18';
    img.style.borderRadius = '8px';
    img.style.maxWidth = '100%';
    return img;
  }

  btnSumar.addEventListener('click', () => {
    const id = selectorMesas.value;
    if (!id || !ordenes[id]) return;

    const sumaNueva = ordenes[id].total;

    totalAcumulado += sumaNueva;
    spanTotalAcumulado.textContent = `$${totalAcumulado.toFixed(2)}`;
    localStorage.setItem('totalAcumulado', totalAcumulado.toFixed(2));

    if (textareaOrden.value.trim()) {
      const imagenOrden = crearImagenDeTexto(textareaOrden.value);
      contenedorCopias.appendChild(imagenOrden);

      imagenesGuardadas.push(imagenOrden.src);
      localStorage.setItem('imagenesOrdenes', JSON.stringify(imagenesGuardadas));
    }

    ordenes[id].texto = '';
    ordenes[id].total = 0;
    textareaOrden.value = '';
    localStorage.setItem('ordenes', JSON.stringify(ordenes));
  });

  const btnEliminarTodo = document.getElementById('eliminar-todo');
  if (btnEliminarTodo) {
    btnEliminarTodo.addEventListener('click', () => {
      localStorage.removeItem('ordenes');
      localStorage.removeItem('clienteSeleccionado');
      localStorage.removeItem('totalAcumulado');
      localStorage.removeItem('imagenesOrdenes');
      ordenes = {};
      totalAcumulado = 0;
      selectorMesas.innerHTML = '<option value="" disabled selected style="color: #48ea18;">Selecciona una mesa</option>';
      textareaOrden.value = '';
      spanTotalAcumulado.textContent = '$0.00';
      contenedorCopias.innerHTML = '';
      imagenesGuardadas = [];
    });
  }

  // ✅ ÚNICA MODIFICACIÓN PARA ACTUALIZAR TOTAL AL CAMBIAR TEXTO MANUALMENTE
  textareaOrden.addEventListener('input', () => {
    const id = selectorMesas.value;
    if (!id || !ordenes[id]) return;

    const lineas = textareaOrden.value.split('\n');
    const nombre = ordenes[id].nombre;

    const cuerpo = lineas.filter(line =>
      !line.startsWith(nombre) && !line.startsWith('Total:')
    ).join('\n');

    // Recalcular total desde el texto manual
    const nuevoTotal = cuerpo
      .split('\n')
      .filter(line => line.includes('$'))
      .reduce((suma, linea) => {
        const match = linea.match(/\$([\d.]+)/);
        return match ? suma + parseFloat(match[1]) : suma;
      }, 0);

    ordenes[id].texto = cuerpo;
    ordenes[id].total = nuevoTotal;

    localStorage.setItem('ordenes', JSON.stringify(ordenes));
    localStorage.setItem('ordenActualTexto', textareaOrden.value);
  });
});
