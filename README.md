# Liquid Glass Editor

Un éditeur interactif pour créer des effets de verre liquide réalistes avec WebGL et shaders personnalisables.

## 🎨 Fonctionnalités

- **Effet de verre liquide réaliste** avec distorsion, blur et réfraction
- **5 formes différentes** : rectangle, cercle, étoile, hexagone, donut
- **Contrôles en temps réel** de tous les paramètres visuels
- **Prévisualisation en direct** avec WebGL
- **Export de code** HTML/CSS/SVG prêt à l'emploi
- **Support d'images et vidéos** en arrière-plan
- **Mode clair/sombre** pour différents styles de verre

## 🔧 Comment ça fonctionne

### Architecture Technique

L'effet de verre liquide est créé en combinant plusieurs techniques avancées de rendu graphique :

#### 1. **WebGL Shaders (GLSL)**

L'effet principal utilise des shaders WebGL pour créer un rendu GPU accéléré :

**Vertex Shader** : Simple passe-through qui transmet les coordonnées de texture
```glsl
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
```

**Fragment Shader** : Contient toute la logique de l'effet de verre

#### 2. **SDF (Signed Distance Field)**

Les formes sont définies mathématiquement via des fonctions SDF qui retournent la distance signée à la surface :

- **Valeur négative** : À l'intérieur de la forme
- **Valeur positive** : À l'extérieur de la forme
- **Valeur zéro** : Sur le bord de la forme

**Exemple - Rectangle arrondi** :
```glsl
float sdRoundedRect(vec2 pos, vec2 halfSize, vec4 cornerRadius) {
  vec2 q = abs(pos) - halfSize + cornerRadius.x;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - cornerRadius.x;
}
```

**Avantages des SDF** :
- Rendu précis des bords anti-aliasing
- Calcul efficace du gradient pour la réfraction
- Transitions fluides entre les formes
- Facile d'ajouter de nouvelles formes

#### 3. **Réfraction et Distorsion**

La réfraction simule la façon dont la lumière se courbe en passant à travers le verre :

```glsl
vec2 computeRefractOffset(float sdf, vec2 fragCoord) {
  // Calcule le gradient (direction normale) de la surface
  vec2 grad = normalize(vec2(dFdx(sdf), dFdy(sdf)));
  
  // Applique la distorsion basée sur la distance à la surface
  // Plus on est proche du bord, plus la distorsion est forte
  float offsetAmount = pow(abs(sdf), 12.0) * -0.05 * u_distortion;
  return grad * offsetAmount;
}
```

**Comment ça marche** :
1. Le gradient SDF donne la direction normale de la surface
2. La distorsion est calculée selon la distance au bord (plus fort près des bords)
3. Les coordonnées UV sont décalées pour échantillonner la texture de fond ailleurs
4. Cela crée l'effet de "courbure" optique

#### 4. **Blur Multi-Niveaux avec Bruit**

Le blur crée l'effet de flou optique du verre :

```glsl
vec3 getBlurredColor(vec2 uv, float mipLevel) {
  // Échantillonne 9 fois avec différents offsets temporels
  // Chaque échantillon utilise un niveau de mipmap différent
  return (
    sampleWithChromaticAberration(uv, 0.0, mipLevel, ...) +
    sampleWithChromaticAberration(uv, 0.25, mipLevel, ...) +
    // ... 9 échantillons au total
  ) * 0.11111; // Moyenne
}
```

**Techniques utilisées** :
- **Mipmap levels** : Plus le blur est fort, plus on utilise un niveau de mipmap élevé
- **Bruit procédural** : Ajoute de la variation pour éviter les artefacts
- **Échantillonnage temporel** : 9 échantillons avec des offsets temporels différents
- **Blur progressif** : Le blur est plus fort près des bords grâce à `edgeBlendFactor`

#### 5. **Aberration Chromatique**

Simule la dispersion de la lumière (effet de prisme) :

```glsl
vec3 sampleWithChromaticAberration(vec2 uv, ...) {
  vec2 direction = normalize(coverUV - center);
  float distance = length(coverUV - center);
  float aberrationOffset = aberrationStrength * distance * 0.01;
  
  // Chaque canal RGB est échantillonné avec un décalage différent
  float r = texture2D(u_texture, coverUV + direction * aberrationOffset * 1.2).r;
  float g = texture2D(u_texture, coverUV).g;
  float b = texture2D(u_texture, coverUV - direction * aberrationOffset * 0.8).b;
  
  return vec3(r, g, b);
}
```

**Effet** : Les couleurs se séparent légèrement, créant des franges colorées aux bords.

#### 6. **Ombres Gaussiennes**

Les ombres portées ajoutent de la profondeur :

```glsl
float gaussianBlur(vec2 uv, float blurSize) {
  float total = 0.0;
  float totalWeight = 0.0;
  float radius = min(blurSize, 15.0);
  
  // Parcourt un rayon de 15x15 pixels
  for (int x = -15; x <= 15; x++) {
    for (int y = -15; y <= 15; y++) {
      if (float(x) >= -radius && float(x) <= radius) {
        // Poids gaussien : plus on est loin du centre, moins c'est important
        float weight = exp(-(float(x*x + y*y)) / (2.0 * radius * radius));
        float shadowValue = 1.0 - clamp(shadowSDF(samplePos), 0.0, 1.0);
        total += weight * shadowValue;
        totalWeight += weight;
      }
    }
  }
  return total / totalWeight;
}
```

### Pipeline de Rendu Complet

```
1. INITIALISATION
   ├─ Chargement de la texture d'arrière-plan (image/vidéo)
   ├─ Compilation des shaders WebGL
   └─ Création du programme WebGL

2. POUR CHAQUE PIXEL (Fragment Shader)
   │
   ├─ CALCUL SDF
   │  └─ Détermine la distance à la forme (rectangle, cercle, etc.)
   │
   ├─ CALCUL DU GRADIENT
   │  └─ Direction normale de la surface (pour la réfraction)
   │
   ├─ RÉFRACTION
   │  └─ Décalage des coordonnées UV selon le gradient et la distorsion
   │
   ├─ ÉCHANTILLONNAGE
   │  ├─ Récupération de la couleur de fond
   │  ├─ Application du blur multi-niveaux
   │  └─ Application de l'aberration chromatique
   │
   ├─ POST-TRAITEMENT
   │  ├─ Application de la saturation
   │  ├─ Application de la teinte (tint)
   │  ├─ Calcul des highlights (reflets)
   │  └─ Application du mode clair/sombre
   │
   └─ COMPOSITION FINALE
      ├─ Calcul de l'ombre portée (gaussian blur)
      ├─ Mélange de l'effet avec l'arrière-plan
      └─ Application du masque de forme
```

### Paramètres Principaux

| Paramètre | Description | Impact Technique |
|-----------|-------------|------------------|
| **Width/Height** | Taille de la forme | Définit les dimensions du SDF |
| **Blur** | Intensité du flou | Contrôle le niveau de mipmap utilisé (0-3.5) |
| **Distortion** | Force de la distorsion | Multiplie `offsetAmount` dans `computeRefractOffset` |
| **Saturation** | Saturation des couleurs | Mélange entre couleur grise et couleur originale |
| **Tint (RGB)** | Teinte du verre | Multiplie les couleurs RGB |
| **Corner Radius** | Rayon des coins | Paramètre du SDF du rectangle arrondi |
| **Shadow Intensity** | Intensité des ombres | Multiplie le résultat du gaussian blur |
| **Shadow Blur** | Flou des ombres | Rayon du gaussian blur (max 15px) |
| **Chromatic Aberration** | Dispersion chromatique | Décalage des canaux RGB (0-1) |
| **Glass Mode** | Mode clair/sombre | Ajuste les highlights et la luminosité |

### Formes Disponibles

Chaque forme a sa propre fonction SDF :

1. **Rectangle** (`sdRoundedRect`) : Rectangle avec coins arrondis configurables
2. **Cercle** (`sdCircle`) : Cercle parfait, rayon = min(width, height)
3. **Étoile** (`sdStar`) : Étoile avec contrôle du nombre de branches et du rayon intérieur
4. **Hexagone** (`sdHexagon`) : Hexagone régulier
5. **Donut** (`sdDonut`) : Forme de donut avec épaisseur contrôlable

## 📁 Structure du Projet

```
app/
├── components/
│   ├── LiquidGlassEditor.tsx    # Composant principal avec contrôles UI
│   ├── LiquidGlassShader.tsx    # Shader WebGL et logique de rendu
│   ├── ColorPicker.tsx          # Sélecteur de couleur
│   └── icons/                   # Système d'icônes SVG personnalisées
├── lib/
│   └── editor-context.tsx       # Context React pour communication inter-composants
└── routes/
    └── editor.tsx               # Route de l'éditeur
```

## 🚀 Utilisation

### Dans l'Éditeur

1. **Ajustez les paramètres** via la sidebar à droite
2. **Déplacez le verre** en cliquant et glissant sur le canvas
3. **Changez l'arrière-plan** avec le bouton "Random" ou "Upload"
4. **Prévisualisez le code** avec le bouton "Prévisualiser le code"
5. **Copiez le code généré** pour l'utiliser dans vos projets

### Code Généré

Le code exporté inclut :
- **HTML** : Structure avec divs empilées pour les différentes couches
- **CSS** : Styles avec `backdrop-filter` et filtres SVG
- **SVG Filters** : Filtres de distorsion avec `feTurbulence` et `feDisplacementMap`
- **Variables CSS** : Pour faciliter la personnalisation

**Note** : Le code CSS/SVG généré est une approximation de l'effet WebGL. Pour un rendu identique, il faut utiliser le shader WebGL complet.

## 🎯 Technologies Utilisées

- **React** : Framework UI avec hooks et context API
- **WebGL** : Rendu GPU accéléré via canvas
- **GLSL** : Langage de shaders pour les calculs GPU
- **TypeScript** : Typage statique pour la sécurité du code
- **Tailwind CSS** : Styles utilitaires
- **Radix UI** : Composants UI accessibles (Dialog, Accordion, etc.)

## 🔬 Détails Techniques Avancés

### Optimisations

- **Memoization** : Utilisation extensive de `useMemo` et `useCallback` pour éviter les recalculs
- **ResizeObserver** : Détection efficace des changements de taille du canvas
- **Cache de textures** : Réutilisation des textures WebGL pour éviter les rechargements
- **Uniform locations** : Cache des emplacements d'uniforms pour éviter les lookups répétés
- **Device pixel ratio** : Prise en compte du DPR pour un rendu net sur écrans Retina

### Compatibilité

- **Fallback pour dFdx/dFdy** : Échantillonnage manuel si les dérivées ne sont pas supportées
- **Support multi-navigateurs** : Testé sur Chrome, Firefox, Safari, Edge
- **Responsive** : Adaptation automatique aux différentes tailles d'écran
- **Mobile-friendly** : Interface adaptée pour les écrans tactiles

### Limitations

- Les filtres SVG CSS ne reproduisent pas exactement l'effet WebGL (moins de précision)
- Le blur CSS `backdrop-filter` nécessite un navigateur moderne
- Les performances peuvent varier selon la puissance GPU
- Le rendu WebGL nécessite un contexte WebGL valide

## 📝 Notes de Développement

### Ajouter une Nouvelle Forme

1. Créer une fonction SDF dans `LiquidGlassShader.tsx` :
```glsl
float sdNewShape(vec2 pos, float size) {
  // Votre logique SDF
  return distance;
}
```

2. Ajouter le cas dans `getShapeSDF` :
```glsl
else if (u_shape < 5.5) {
  return sdNewShape(pos, size);
}
```

3. Ajouter l'option dans l'interface de l'éditeur (`LiquidGlassEditor.tsx`)

### Personnaliser les Effets

Les effets peuvent être ajustés en modifiant :
- Les constantes dans les shaders (ex: `pow(normalizedInside, 12.0)`)
- Les poids dans les fonctions de blur
- Les formules de réfraction et d'aberration chromatique
- Les paramètres des highlights et rim lighting

### Exemple de Modification

Pour changer l'intensité de la réfraction, modifiez dans `computeRefractOffset` :
```glsl
// Avant
float offsetAmount = pow(abs(sdf), 12.0) * -0.05 * u_distortion;

// Après (réfraction plus forte)
float offsetAmount = pow(abs(sdf), 10.0) * -0.08 * u_distortion;
```

## 📄 Licence

Ce projet est open source et disponible sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer de nouvelles fonctionnalités
- Soumettre une pull request avec vos améliorations

## 📚 Ressources

- [WebGL Fundamentals](https://webglfundamentals.org/)
- [The Book of Shaders](https://thebookofshaders.com/)
- [SDF Functions](https://iquilezles.org/articles/distfunctions2d/)
- [GLSL Reference](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
