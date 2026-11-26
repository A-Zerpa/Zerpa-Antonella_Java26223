const API_URL = 'http://localhost:8080/api/articulos';

const form = document.getElementById('articulo-form');
const tablaBody = document.getElementById('tabla-body');
const inputId = document.getElementById('articulo-id');
const inputNombre = document.getElementById('nombre');
const inputPrecio = document.getElementById('precio');
const inputImagen = document.getElementById('imagen');
const formTitulo = document.getElementById('form-titulo');
const btnCancelar = document.getElementById('btn-cancelar');

const inputBuscar = document.getElementById('input-buscar');
const btnBuscar = document.getElementById('btn-buscar');
const inputPrecioMin = document.getElementById('precio-min');
const inputPrecioMax = document.getElementById('precio-max');
const btnFiltrarPrecio = document.getElementById('btn-filtrar-precio');
const btnOrdenarPrecio = document.getElementById('btn-ordenar-precio');
const btnLimpiar = document.getElementById('btn-limpiar');

let articulosCache = [];

async function cargarArticulos() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al obtener los artículos');

        articulosCache = await res.json();
        renderizarTabla(articulosCache);
    } catch (error) {
        console.error(error);
        tablaBody.innerHTML = '<tr><td colspan="5">No se pudo conectar con la API.</td></tr>';
    }
}

function renderizarTabla(articulos) {
    tablaBody.innerHTML = '';

    if (articulos.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="5">No hay artículos cargados todavía.</td></tr>';
        return;
    }

    articulos.forEach((art) => {
        const tr = document.createElement('tr');
        const imgHtml = art.imagen
            ? `<img src="${art.imagen}" alt="${art.nombre}">`
            : 'Sin imagen';

        tr.innerHTML = `
            <td>${art.id}</td>
            <td>${imgHtml}</td>
            <td>${art.nombre}</td>
            <td>$${Number(art.precio).toFixed(2)}</td>
            <td class="acciones">
                <button type="button" class="btn-secondary btn-editar" data-id="${art.id}">Editar</button>
                <button type="button" class="btn-danger btn-eliminar" data-id="${art.id}">Eliminar</button>
            </td>
        `;
        tablaBody.appendChild(tr);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const datos = {
        nombre: inputNombre.value.trim(),
        precio: parseFloat(inputPrecio.value),
        imagen: inputImagen.value.trim()
    };

    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (!res.ok) throw new Error('Error al guardar el artículo');

        resetForm();
        cargarArticulos();
    } catch (error) {
        console.error(error);
        alert('Ocurrió un error al guardar el artículo.');
    }
});

tablaBody.addEventListener('click', (e) => {
    const id = Number(e.target.dataset.id);
    if (!id) return;

    if (e.target.classList.contains('btn-editar')) {
        const articulo = articulosCache.find((a) => a.id === id);
        if (articulo) cargarEnFormulario(articulo);
    }

    if (e.target.classList.contains('btn-eliminar')) {
        eliminarArticulo(id);
    }
});

function cargarEnFormulario(articulo) {
    inputId.value = articulo.id;
    inputNombre.value = articulo.nombre;
    inputPrecio.value = articulo.precio;
    inputImagen.value = articulo.imagen || '';
    formTitulo.textContent = `Editando Artículo #${articulo.id}`;
    btnCancelar.classList.remove('oculto');
}

async function eliminarArticulo(id) {
    if (!confirm('¿Seguro que querés eliminar este artículo?')) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar el artículo');

        cargarArticulos();
    } catch (error) {
        console.error(error);
        alert('Ocurrió un error al eliminar el artículo.');
    }
}

function resetForm() {
    form.reset();
    inputId.value = '';
    formTitulo.textContent = 'Nuevo Artículo';
    btnCancelar.classList.add('oculto');
}

async function buscarArticulos() {
    const texto = inputBuscar.value.trim();
    if (!texto) {
        cargarArticulos();
        return;
    }

    try {
        const res = await fetch(`${API_URL}/buscar?nombre=${encodeURIComponent(texto)}`);
        if (!res.ok) throw new Error('Error al buscar artículos');

        articulosCache = await res.json();
        renderizarTabla(articulosCache);
    } catch (error) {
        console.error(error);
        alert('Ocurrió un error al buscar.');
    }
}

async function filtrarPorPrecio() {
    const min = inputPrecioMin.value;
    const max = inputPrecioMax.value;

    if (min === '' || max === '') {
        alert('Ingresá un precio mínimo y un precio máximo.');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/precio-entre?min=${encodeURIComponent(min)}&max=${encodeURIComponent(max)}`);
        if (!res.ok) throw new Error('Error al filtrar por precio');

        articulosCache = await res.json();
        renderizarTabla(articulosCache);
    } catch (error) {
        console.error(error);
        alert('Ocurrió un error al filtrar por precio.');
    }
}

async function ordenarPorPrecio() {
    try {
        const res = await fetch(`${API_URL}/ordenados-precio`);
        if (!res.ok) throw new Error('Error al ordenar por precio');

        articulosCache = await res.json();
        renderizarTabla(articulosCache);
    } catch (error) {
        console.error(error);
        alert('Ocurrió un error al ordenar.');
    }
}

btnCancelar.addEventListener('click', resetForm);
btnBuscar.addEventListener('click', buscarArticulos);
btnFiltrarPrecio.addEventListener('click', filtrarPorPrecio);
btnOrdenarPrecio.addEventListener('click', ordenarPorPrecio);

inputBuscar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') buscarArticulos();
});

btnLimpiar.addEventListener('click', () => {
    inputBuscar.value = '';
    inputPrecioMin.value = '';
    inputPrecioMax.value = '';
    cargarArticulos();
});

cargarArticulos();