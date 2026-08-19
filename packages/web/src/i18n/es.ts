import type { Dictionary } from './en.js';

export const es: Dictionary = {
  'meta.title': 'Mesh Chopper - STL Fixer — reparar archivos STL en el navegador',
  'meta.description':
    'Suelta un STL que tu laminador rechaza: aristas non-manifold, aristas abiertas, normales invertidas. Se repara localmente en el navegador, no se sube nada.',

  'lang.label': 'Idioma',

  'tagline.lead':
    'Suelta un STL que tu laminador rechaza — aristas non-manifold, aristas abiertas, normales invertidas.',
  'tagline.local': 'Todo ocurre en esta pestaña',
  'tagline.rest': '; ningún archivo sale de tu equipo.',

  'drop.title.strong': 'Suelta archivos .stl aquí',
  'drop.title.rest': ' o haz clic para elegir',
  'drop.hint': 'Binario o ASCII · varios a la vez · la copia reparada se descarga como',
  'drop.aria': 'Elegir archivos STL',

  'options.summary': 'Opciones de reparación',
  'options.fill': 'Rellenar agujeros',
  'options.flip': 'Girar cuerpos invertidos',
  'options.largest': 'Conservar solo el cuerpo más grande',
  'options.ascii': 'Escribir STL ASCII',
  'options.tolerance': 'Tolerancia de fusión',
  'options.tiny.before': 'Descartar cuerpos por debajo de',
  'options.tiny.after': '× el mayor',
  'options.manifold': 'pasada de manifold3d',
  'manifold.off': 'desactivada',
  'manifold.rebuild': 'reconstruir (conserva las piezas)',
  'manifold.union': 'unión (funde las piezas)',
  'options.reset': 'Restablecer valores por defecto',

  'help.aria': '¿Qué hace esta opción?',
  'help.fill':
    'Recorre el borde de cada agujero y lo triangula: recorte de orejas en los pequeños, abanico desde un nuevo punto central en los grandes o retorcidos. Desactivado, los agujeros siguen ahí y el archivo no queda estanco.',
  'help.flip':
    'Calcula el volumen con signo de cada cuerpo; si es negativo, está del revés y se reorientan todos sus triángulos. Los modelos sanos no se tocan.',
  'help.largest':
    'Conserva el cuerpo de mayor volumen y borra el resto. Va bien contra restos que viajan con la pieza, pero un modelo formado por varias piezas reales las pierde: mira antes el número de cuerpos del informe.',
  'help.ascii':
    'Escribe la variante de texto del STL en vez de la binaria: unas cinco veces más grande, pero legible y comparable. Los laminadores aceptan ambas.',
  'help.manifold':
    'Una segunda opinión de manifold3d, el núcleo geométrico de varias herramientas CAD. <code>rebuild</code> pasa la malla por él: manifold3d no acepta nada que no sea un sólido válido, así que la pasada valida el resultado y limpia restos, sin cambiar el número de cuerpos ni el volumen. <code>union</code> además une el sólido consigo mismo y recorta las autointersecciones —el mismo tipo de reparación que el botón «Fix model» de Windows—, pero también suelda las piezas que se solapan: una bisagra impresa en el sitio sale como un bloque único. Ambos modos descargan unos 0,5 MB de WebAssembly la primera vez.',
  'help.tolerance':
    'Dos vértices más cercanos que esta distancia, en milímetros, pasan a ser uno — así se cierran las costuras que el laminador reporta como aristas abiertas. <code>auto</code> es la diagonal de la caja envolvente × 1e-6 (unos 0,0001 mm en un modelo de 100 mm), el ruido float32 que guarda el STL. Se acepta cualquier número desde 0; 0 solo fusiona vértices idénticos y un valor demasiado grande se come el detalle fino.',
  'help.tiny':
    'Borra los cuerpos cuyo volumen esté por debajo de esta fracción del mayor. <code>0</code> conserva todo; <code>0.001</code> descarta las motas menores a una milésima del cuerpo principal. Rango 0…1.',

  'card.working': 'trabajando…',
  'card.failed': 'ha fallado',
  'card.meta': 'triángulos: {triangles} · {ms} ms',
  'row.size': 'tamaño',
  'row.found': 'encontrado',
  'row.fixed': 'reparado',
  'row.result': 'resultado',
  'row.error': 'error',
  'row.preview': 'vista 3D',
  'size.value': '{size} mm · cuerpos: {shells}',
  'found.clean': 'nada que corregir',
  'result.clean': 'estanco · triángulos: {triangles} · {volume} mm³',

  'defect.open': 'aristas abiertas: {n}',
  'defect.nonManifold': 'aristas non-manifold: {n}',
  'defect.flipped': 'aristas mal orientadas: {n}',
  'defect.bowtie': 'vértices en pajarita: {n}',
  'defect.duplicate': 'triángulos duplicados: {n}',
  'defect.zeroArea': 'triángulos sin área: {n}',
  'defect.inverted': 'cuerpos invertidos: {n}',

  'action.welded': 'vértices fusionados: {n}',
  'action.zeroArea': 'triángulos sin área eliminados: {n}',
  'action.duplicate': 'duplicados eliminados: {n}',
  'action.nonManifold': 'non-manifold recortados: {n}',
  'action.bowtie': 'pajaritas separadas: {n}',
  'action.rewound': 'triángulos reorientados: {n}',
  'action.filled': 'agujeros rellenados: {n} (+{triangles})',
  'action.skipped': 'agujeros omitidos: {n}',
  'action.shells': 'cuerpos eliminados: {n}',
  'action.flippedShells': 'cuerpos girados: {n}',
  'action.manifold': 'reconstruido por manifold3d: {triangles} triángulos',

  'verdict.repaired': 'Reparado',
  'verdict.broken': 'Sigue roto',
  'button.download': 'Descargar',
  'button.preview': 'Vista 3D',
  'button.hidePreview': 'Ocultar vista 3D',
  'button.building': 'Preparando vista…',

  'preview.wireframe': 'Malla de aristas',
  'preview.defects': 'Resaltar defectos',
  'preview.next': 'Siguiente problema',
  'preview.reset': 'Restablecer vista',
  'preview.counter': 'problema {index} de {total}',
  'preview.none': 'no hay defectos que visitar',
  'preview.before': 'antes · {triangles} △',
  'preview.after': 'después · {triangles} △',

  'legend.backface': 'cara interior visible a través de la superficie — agujero o cuerpo invertido',
  'legend.open': 'arista abierta',
  'legend.nonManifold': 'arista non-manifold',
  'legend.flipped': 'arista mal orientada',
  'legend.marker': 'pajarita / sin área',
  'legend.cursor': 'adónde saltó «Siguiente problema»',

  'note.floating.title': '«Floating regions» no es un defecto del archivo.',
  'note.floating.body':
    'Ese aviso trata de geometría sin nada debajo al imprimir: reorienta el modelo o activa los soportes. Ninguna reparación lo elimina.',
  'note.cli.title': 'Lo mismo en la terminal',
  'note.cli.rest': ', para lotes y CI:',
  'note.cli.comment1': '# crea cat-fixed.stl',
  'note.cli.comment2': '# devuelve 1 si algo está roto',

  'footer.source': 'Código en GitHub',
  'error.noWorker':
    'La vista 3D necesita Web Workers; abre la página por http, no desde el disco.',
};
