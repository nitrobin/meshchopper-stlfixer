import type { Dictionary } from './en.js';

export const fr: Dictionary = {
  'meta.title': 'Mesh Chopper - STL Fixer — réparer des STL dans le navigateur',
  'meta.description':
    'Déposez un STL refusé par votre trancheur : arêtes non-manifold, arêtes ouvertes, normales inversées. Réparé localement dans le navigateur, rien n’est envoyé.',

  'lang.label': 'Langue',

  'tagline.lead':
    'Déposez un STL que votre trancheur refuse — arêtes non-manifold, arêtes ouvertes, normales inversées.',
  'tagline.local': 'Tout se passe dans cet onglet',
  'tagline.rest': ' ; aucun fichier ne quitte votre machine.',

  'drop.title.strong': 'Déposez des fichiers .stl ici',
  'drop.title.rest': ' ou cliquez pour choisir',
  'drop.hint': 'Binaire ou ASCII · plusieurs à la fois · la copie réparée se télécharge sous',
  'drop.aria': 'Choisir des fichiers STL',

  'options.summary': 'Options de réparation',
  'options.fill': 'Combler les trous',
  'options.flip': 'Retourner les coques inversées',
  'options.largest': 'Ne garder que la plus grande coque',
  'options.ascii': 'Écrire un STL ASCII',
  'options.tolerance': 'Tolérance de fusion',
  'options.tiny.before': 'Supprimer les coques sous',
  'options.tiny.after': '× la plus grande',
  'options.manifold': 'passe manifold3d',
  'manifold.off': 'désactivée',
  'manifold.rebuild': 'reconstruction (garde les pièces)',
  'manifold.union': 'union (fusionne les pièces)',
  'options.reset': 'Rétablir les valeurs par défaut',

  'help.aria': 'À quoi sert cette option ?',
  'help.fill':
    'Suit le contour de chaque trou et le triangule — découpage d’oreilles pour les petits, éventail depuis un nouveau point central pour les grands ou tordus. Désactivé, les trous restent et le fichier reste non étanche.',
  'help.flip':
    'Calcule le volume signé de chaque coque ; un volume négatif signifie qu’elle est retournée, et tous ses triangles sont réorientés. Les modèles sains ne bougent pas.',
  'help.largest':
    'Garde la coque au plus gros volume et supprime toutes les autres. Pratique contre les débris qui suivent la pièce, mais un modèle réellement composé de plusieurs pièces les perd — vérifiez d’abord le nombre de coques dans le rapport.',
  'help.ascii':
    'Écrit la variante texte du STL au lieu du binaire : environ cinq fois plus gros, mais lisible et comparable en diff. Les trancheurs acceptent les deux.',
  'help.manifold':
    'Un second avis de manifold3d, le noyau géométrique de plusieurs outils de CAO. <code>rebuild</code> fait passer le maillage à travers : manifold3d n’accepte qu’un solide valide, la passe valide donc le résultat et nettoie les restes, tandis que le nombre de coques et le volume ne bougent pas. <code>union</code> unit en plus le solide avec lui-même et retaille les auto-intersections — la même catégorie de réparation que le bouton « Fix model » de Windows — mais soude aussi les pièces qui se chevauchent : une charnière imprimée en place ressort en un seul bloc. Les deux modes téléchargent environ 0,5 Mo de WebAssembly au premier lancement.',
  'help.tolerance':
    'Deux sommets plus proches que cette distance, en millimètres, n’en font plus qu’un — c’est ce qui referme les coutures signalées comme arêtes ouvertes. <code>auto</code> vaut la diagonale de la boîte englobante × 1e-6 (environ 0,0001 mm sur un modèle de 100 mm), soit le bruit float32 stocké par le STL. Tout nombre à partir de 0 est accepté ; 0 ne fusionne que les sommets exactement identiques, et une valeur trop grande avale les petits détails.',
  'help.tiny':
    'Supprime les coques dont le volume est sous cette fraction de la plus grande. <code>0</code> garde tout ; <code>0.001</code> élimine les grains sous un millième du corps principal. Plage 0…1.',

  'card.working': 'calcul…',
  'card.failed': 'échec',
  'card.meta': 'triangles : {triangles} · {ms} ms',
  'row.size': 'taille',
  'row.found': 'trouvé',
  'row.fixed': 'corrigé',
  'row.result': 'résultat',
  'row.error': 'erreur',
  'row.preview': 'aperçu',
  'size.value': '{size} mm · coques : {shells}',
  'found.clean': 'rien à signaler',
  'result.clean': 'étanche · triangles : {triangles} · {volume} mm³',

  'defect.open': 'arêtes ouvertes : {n}',
  'defect.nonManifold': 'arêtes non-manifold : {n}',
  'defect.flipped': 'arêtes mal orientées : {n}',
  'defect.bowtie': 'sommets papillon : {n}',
  'defect.duplicate': 'triangles en double : {n}',
  'defect.zeroArea': 'triangles sans surface : {n}',
  'defect.inverted': 'coques inversées : {n}',

  'action.welded': 'sommets fusionnés : {n}',
  'action.zeroArea': 'sans surface supprimés : {n}',
  'action.duplicate': 'doublons supprimés : {n}',
  'action.nonManifold': 'non-manifold retirés : {n}',
  'action.bowtie': 'papillons séparés : {n}',
  'action.rewound': 'triangles réorientés : {n}',
  'action.filled': 'trous comblés : {n} (+{triangles})',
  'action.skipped': 'trous ignorés : {n}',
  'action.shells': 'coques supprimées : {n}',
  'action.flippedShells': 'coques retournées : {n}',
  'action.manifold': 'reconstruit par manifold3d : {triangles} triangles',

  'verdict.repaired': 'Réparé',
  'verdict.broken': 'Toujours cassé',
  'button.download': 'Télécharger',
  'button.preview': 'Aperçu 3D',
  'button.hidePreview': 'Masquer l’aperçu',
  'button.building': 'Aperçu en cours…',

  'preview.wireframe': 'Fil de fer',
  'preview.defects': 'Surligner les défauts',
  'preview.next': 'Problème suivant',
  'preview.reset': 'Réinitialiser la vue',
  'preview.counter': 'problème {index} sur {total}',
  'preview.none': 'aucun défaut à visiter',
  'preview.before': 'avant · {triangles} △',
  'preview.after': 'après · {triangles} △',

  'legend.backface': 'face arrière visible à travers la surface — trou ou coque inversée',
  'legend.open': 'arête ouverte',
  'legend.nonManifold': 'arête non-manifold',
  'legend.flipped': 'arête mal orientée',
  'legend.marker': 'papillon / sans surface',
  'legend.cursor': 'cible du bouton « Problème suivant »',

  'note.floating.title': '« Floating regions » n’est pas un défaut du fichier.',
  'note.floating.body':
    'Cet avertissement concerne la géométrie sans rien en dessous à l’impression — réorientez le modèle ou activez les supports. Aucune réparation ne le fera disparaître.',
  'note.cli.title': 'La même chose dans un terminal',
  'note.cli.rest': ', pour les lots et la CI :',
  'note.cli.comment1': '# écrit cat-fixed.stl',
  'note.cli.comment2': '# code de sortie 1 si quelque chose est cassé',

  'footer.source': 'Sources sur GitHub',
  'error.noWorker':
    'L’aperçu 3D a besoin des Web Workers ; ouvrez la page via http, pas depuis le disque.',
};
