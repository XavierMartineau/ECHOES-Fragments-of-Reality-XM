// ============================================================================
// Traduction automatique FR vers EN du texte des pages quand la langue enregistrée est « en ».
// ============================================================================
(() => {
  if (localStorage.getItem("echoes-language") !== "en") return;
  document.documentElement.lang = "en";

  const exact = {
    "CLÉS :": "KEYS:",
    "Progression des clés": "Key progress",
    "Progression du puzzle": "Puzzle progress",
    "Choisis une partie, puis un niveau": "Choose a part, then a level",
    "Sélectionne un symbole, puis son emplacement mémoire.": "Select a symbol, then its memory slot.",
    "Voyageur": "Traveler",
    "CANAL EN ATTENTE": "CHANNEL STANDBY",
    "CANAL 01.5 // STABLE": "CHANNEL 01.5 // STABLE",
    "ECHO // CANAL SÉCURISÉ": "ECHO // SECURE CHANNEL",
    "NOUVEAU CANAL // INDICE DE LA SUITE": "NEW CHANNEL // HINT FOR WHAT'S NEXT",
    "Transmission automatique // indice entrant...": "Automatic transmission // incoming hint...",
    "Progression des niveaux 1 à 15": "Level progress 1 to 15",
    "Progression des niveaux 1 à 10": "Level progress 1 to 10",
    "Objet fractal à faire pivoter": "Fractal object to rotate",
    "ACCÈS SPÉCIAUX": "SPECIAL ACCESS",
    "RÉCUPÉRATION": "RECOVERY",
    "REPÈRES COULEURS ACCESSIBLES": "ACCESSIBLE COLOR MARKERS",
    "Éclipse": "Eclipse",
    "CLÉE_01 // CINÉMATIQUE": "CLEE_01 // CINEMATIC",
    "Progression de la Partie 2": "Part 2 progress",
    "Emplacements des formes": "Shape slots",
    "Formes à aligner": "Shapes to align",
    "Panneaux holographiques mélangés": "Shuffled holographic panels",
    "Motif à reconstituer": "Pattern to rebuild",
    "Noyau du gardien": "Guardian core",
    "Observation des motifs": "Pattern observation",
    "Carré": "Square",
    "Démonstration visuelle": "Visual demonstration",
    "Démonstration": "Demonstration",
    "ECHOES - Protocole de récupération": "ECHOES - Recovery protocol",
    "ECHOES - CLEE 01 BOSS LEVEL": "ECHOES - CLEE 01 BOSS LEVEL",
    "ECHOES - Niveau 01": "ECHOES - Level 01",
    "ECHOES - Niveau 10": "ECHOES - Level 10",
    "ECHOES - Niveau 13": "ECHOES - Level 13",
    "ECHOES - Transmission": "ECHOES - Transmission",
    "ECHOES - Partie bonus": "ECHOES - Bonus part",
    "ECHOES // Clé 01": "ECHOES // Key 01",
    "PROTOCOLE DE RÉCUPÉRATION": "RECOVERY PROTOCOL",
    "ÉCHEC DES 3 CHECKS // DERNIÈRE CHANCE": "3 CHECKS FAILED // LAST CHANCE",
    "Appuie sur les touches 1, 2 ou 3 quand elles atteignent leur zone lumineuse. Sur PC : 120 touches, rythme légèrement accéléré. Obtiens au moins 90 réussites.":
      "Press keys 1, 2 or 3 when they reach their glowing zone. On PC: 120 keys, slightly faster rhythm. Get at least 90 hits.",
    "Appuie sur les touches 1, 2 ou 3 quand elles atteignent leur zone lumineuse. Sur mobile : 120 touches, vitesse 2×. Obtiens au moins 90 réussites.":
      "Press keys 1, 2 or 3 when they reach their glowing zone. On mobile: 120 keys, 2× speed. Get at least 90 hits.",
    "Le Gardien attend ta dernière preuve de synchronisation.": "The Guardian awaits your final proof of synchronization.",
    "DÉMARRER LA RÉCUPÉRATION": "START RECOVERY",
    "PRÉPARE-TOI À ACCÉLÉRER": "GET READY TO SPEED UP",
    "RÉINITIALISER": "RESET",
    "Réinitialiser": "Reset",
    "SAUVEGARDER": "SAVE",
    "SAUVEGARDÉ": "SAVED",
    "VOIR UN EXEMPLE": "SEE AN EXAMPLE",
    "FERMER L'EXEMPLE": "CLOSE EXAMPLE",
    "Fermer l'exemple": "Close example",
    "note 1 dans la zone 1": "note 1 in zone 1",
    "note 2 dans la zone 2 — deux notes visibles en même temps, avec 1 seconde de décalage":
      "note 2 in zone 2 — two notes visible at the same time, 1 second apart",
    "Le Gardien du Signal": "The Signal Guardian",
    "GARDIEN DU SIGNAL // APAISÉ": "SIGNAL GUARDIAN // CALM",
    "ÉCHO // INITIATION ACTIVE": "ECHO // INITIATION ACTIVE",
    "ÉCHO // FRACTURES ACTIVES": "ECHO // ACTIVE FRACTURES",
    "Retour à l'accueil": "Back to home",
    "Clé 01 récupérée": "Key 01 collected",
    "Noyau ECHO et clé de résonance": "ECHO core and resonance key",
    "Clé de résonance 01": "Resonance key 01",
    "Cliquer pour commencer la transmission": "Click to start the transmission",
    "CHAMBRE DE RÉSONANCE": "RESONANCE CHAMBER",
    "SIGNAL ACTIF": "SIGNAL ACTIVE",
    "RÉSONANCES": "RESONANCES",
    "CLÉ 01 // À RÉCUPÉRER": "KEY 01 // TO COLLECT",
    "NIVEAU SPÉCIAL // 01": "SPECIAL LEVEL // 01",
    "GARDIEN DE LA RUPTURE // VAINCU": "RUPTURE GUARDIAN // DEFEATED",
    "LA PREMIÈRE RÉSONANCE": "THE FIRST RESONANCE",
    "Une clé ancienne attend dans le cœur du signal.": "An ancient key waits in the heart of the signal.",
    "RÉSONANCE 01 // OBJET EN APPROCHE": "RESONANCE 01 // OBJECT APPROACHING",
    "VOYAGEUR // OBJET IDENTIFIÉ": "TRAVELER // OBJECT IDENTIFIED",
    "CLIQUER POUR OUVRIR LE SIGNAL": "CLICK TO OPEN THE SIGNAL",
    "CLIQUE POUR OUVRIR LA TRANSMISSION": "CLICK TO OPEN THE TRANSMISSION",
    "OUVRIR LA TRANSMISSION": "OPEN THE TRANSMISSION",
    "Interface en attente // entrée utilisateur requise": "Interface standby // user input required",
    "La résonance attend ton signal.": "The resonance awaits your signal.",
    "La fréquence attend ton signal.": "The frequency awaits your signal.",
    "La première clé est déjà enregistrée.": "The first key is already recorded.",
    "CONFIRMER LA RÉCUPÉRATION": "CONFIRM RECOVERY",
    "APRÈS-RÉSONANCE": "POST-RESONANCE",
    "PROTOCOLE DE PASSAGE": "PASSAGE PROTOCOL",
    "LA CLÉ 01 EST ENREGISTRÉE": "KEY 01 IS RECORDED",
    "TRANSMISSION ÉTABLIE": "TRANSMISSION ESTABLISHED",
    "Un message traverse les ruines.": "A message crosses the ruins.",
    "// CANAL SÉCURISÉ": "// SECURE CHANNEL",
    "Transmission": "Transmission",
    "Le gardien est tombé. Pourtant... cette lumière bat encore sous les ruines.": "The guardian has fallen. And yet... this light still beats beneath the ruins.",
    "Arrête-toi. Ce n'est pas une lumière. C'est une mémoire qui cherche un porteur.": "Stop. It is not a light. It is a memory looking for a bearer.",
    "Une clé ? Elle ressemble au symbole gravé sur le noyau du gardien.": "A key? It looks like the symbol engraved on the guardian's core.",
    "Oui. La première Clé de Résonance. Elle ne s'ouvre pas avec la force, mais avec ton signal.": "Yes. The first Resonance Key. It does not open with force, but with your signal.",
    "Alors je vais lui répondre. Echo, reste avec moi pendant la synchronisation.": "Then I will answer it. Echo, stay with me during the synchronization.",
    "Je suis là. Confirme la récupération et laisse la clé rejoindre ton réseau.": "I am here. Confirm the recovery and let the key join your network.",
    "La synchronisation est terminée. La clé est désormais liée à ton empreinte.": "Synchronization complete. The key is now bound to your imprint.",
    "J'entends le signal. Quel chemin devons-nous prendre maintenant ?": "I hear the signal. Which path should we take now?",
    "Suis le cercle brisé. Derrière lui se trouve la prochaine fracture de la réalité.": "Follow the broken circle. Behind it lies the next fracture of reality.",
    "La clé traverse le champ de résonance...": "The key crosses the resonance field...",
    "Animation de récupération en cours...": "Recovery animation in progress...",
    "CLÉ 01 RÉCUPÉRÉE // PROGRESSION ENREGISTRÉE": "KEY 01 COLLECTED // PROGRESS SAVED",
    "TRANSMISSION COMPLÈTE // PASSAGE OUVERT": "TRANSMISSION COMPLETE // PASSAGE OPEN",
    "Indice reçu // niveau suivant disponible": "Hint received // next level available",
    "CLÉ 01 RÉCUPÉRÉE // INDICE ENREGISTRÉ": "KEY 01 COLLECTED // HINT SAVED",
    "Transmission automatique // prochaine réplique...": "Automatic transmission // next line...",
    "RÉCOMPENSE DISPONIBLE // CONFIRMATION REQUISE": "REWARD AVAILABLE // CONFIRMATION REQUIRED",
    "Clique sur le bouton pour confirmer la récupération.": "Click the button to confirm the recovery.",
    "SIGNAL CORROMPU // ANALYSE DU NOYAU": "CORRUPTED SIGNAL // CORE ANALYSIS",
    "Transmission terminée // confirmation disponible": "Transmission finished // confirmation available",
    "Transmission active // les répliques s'enchaînent": "Transmission active // lines in progress",
    "Transmission terminée": "Transmission finished",
    "RÉCOMPENSE DÉJÀ VALIDÉE // RÉSONANCE 01": "REWARD ALREADY CLAIMED // RESONANCE 01",
    "Voyageur... je reçois enfin ton signal.": "Traveler... I am finally receiving your signal.",
    "La clé est en sécurité. Qu'est-ce que tu vois ?": "The key is safe. What do you see?",
    "Merci de l'avoir récupérée. Cherche maintenant la porte marquée d'un cercle brisé.": "Thank you for retrieving it. Now look for the door marked with a broken circle.",
    "Transmission reçue // passage suivant disponible": "Transmission received // next passage available",
    "INDICE ENREGISTRÉ // LA PORTE DU CERCLE BRISÉ T'ATTEND": "HINT SAVED // THE BROKEN CIRCLE DOOR AWAITS YOU",
    "Synchronisation de la fréquence...": "Synchronizing frequency...",
    "Transmission active // écoute en cours": "Transmission active // listening",
    "Fragment 001 // Géométrie primaire": "Fragment 001 // Primary geometry",
    "Trois formes flottent dans le premier fragment de réalité. Aligne-les sur la ligne holographique pour stabiliser le signal.":
      "Three shapes float in the first fragment of reality. Align them on the holographic line to stabilize the signal.",
    "Résonance géométrique": "Geometric resonance",
    "Clique sur une forme, puis dépose-la dans la bonne couleur": "Click a shape, then drop it in the right color",
    "DÉMARRER LE PUZZLE": "START PUZZLE",
    "Sélectionne une forme ou fais-la glisser vers un emplacement.": "Select a shape or drag it to a slot.",
    "Fragment 010 // Séquence chromatique": "Fragment 010 // Chromatic sequence",
    "Première illusion": "First illusion",
    "Observe la séquence de couleurs, puis reproduis-la dans le même ordre.": "Watch the color sequence, then repeat it in the same order.",
    "Mémoire des couleurs": "Color memory",
    "Observe la séquence de couleurs.": "Watch the color sequence.",
    "Les fragments doivent glisser… jusqu'à retrouver leur forme. Déplace les panneaux voisins de la case vide pour reconstituer le motif fractal.":
      "The fragments must slide... until they find their shape again. Move the panels next to the empty cell to rebuild the fractal pattern.",
    "Reforme le motif en déplaçant les panneaux vers la case vide.": "Reform the pattern by moving panels toward the empty cell.",
    "Démarre le puzzle, puis déplace les panneaux voisins de la case vide.": "Start the puzzle, then move the panels next to the empty cell.",
    "ECHO // SIGNAL HORS PROTOCOLE": "ECHO // OFF-PROTOCOL SIGNAL",
    "Partie bonus": "Bonus part",
    "Un fragment secret apparaît en dehors de la progression principale.": "A secret fragment appears outside the main progression.",
    "Réveiller le fragment": "Awaken the fragment",
    "Signal en attente.": "Signal standby.",
    "Fragment bonus réveillé. La réalité a répondu.": "Bonus fragment awakened. Reality has answered.",
    "Trouve les trois symboles identiques.": "Find the three identical symbols.",
    "Repere les trois symboles identiques.": "Spot the three identical symbols.",
    "Active les trois symboles dans le bon ordre.": "Activate the three symbols in the right order.",
    "Sequence de la porte": "Gate sequence",
    "Active les symboles dans le bon ordre.": "Activate the symbols in the right order.",
    "Tri des symboles": "Symbol sorting",
    "Classe les symboles selon leur couleur.": "Sort the symbols by color.",
    "Classe chaque symbole dans sa couleur.": "Sort each symbol into its color.",
    "Mauvaise couleur.": "Wrong color.",
    "Mauvaise couleur. Essaie une autre zone.": "Wrong color. Try another zone.",
    "Oriente les miroirs vers le recepteur.": "Aim the mirrors at the receiver.",
    "Aligne les trois miroirs.": "Align the three mirrors.",
    "Le rayon atteint le recepteur.": "The beam reaches the receiver.",
    "Trouve la seule forme reelle.": "Find the only real shape.",
    "Active les deux lignes holographiques dans le bon ordre.": "Activate the two holographic lines in the right order.",
    "Active les modules dans l'ordre indique.": "Activate the modules in the order shown.",
    "Mauvais module. La sequence recommence.": "Wrong module. The sequence restarts.",
    "Active les intersections lumineuses dans le bon ordre.": "Activate the glowing intersections in the right order.",
    "Active les intersections dans l'ordre indique.": "Activate the intersections in the order shown.",
    "Mauvaise intersection. La sequence recommence.": "Wrong intersection. The sequence restarts.",
    "Reconstruis le motif fractal dans les neuf panneaux.": "Rebuild the fractal pattern across the nine panels.",
    "Active les panneaux du motif lumineux.": "Activate the panels of the light pattern.",
    "Reproduis la combinaison lumineuse dans le bon ordre.": "Repeat the light combination in the right order.",
    "Observe puis reproduis la combinaison.": "Watch, then repeat the combination.",
    "SIGNAL:// DÉSYNCHRONISATION // NOUVELLE LECTURE REQUISE": "SIGNAL:// DESYNCHRONIZATION // NEW READ REQUIRED",
    "GATE:// OUVERT // ACCÈS STABILISÉ": "GATE:// OPEN // ACCESS STABILIZED",
    "Mauvaise étoile. La séquence recommence.": "Wrong star. The sequence restarts.",
    "Observe la séquence de couleurs...": "Watch the color sequence...",
    "A toi. Reproduis la séquence de couleurs.": "Your turn. Repeat the color sequence.",
    "Mauvaise couleur. Observe puis recommence la séquence.": "Wrong color. Watch, then restart the sequence.",
    "Le Gardien contre-attaque.": "The Guardian counterattacks.",
    "Armure fissurée. Le Gardien change d'attaque.": "Armor cracked. The Guardian changes its attack.",
    "Le noyau est exposé. Clique quand il s'illumine.": "The core is exposed. Click when it lights up.",
    "À toi. Reproduis la séquence.": "Your turn. Repeat the sequence.",
    "Réponse incorrecte.": "Incorrect answer.",
    "Impact hors rythme.": "Off-rhythm hit.",
    "Les deux calculs sont validés. Le Gardien est vaincu.": "Both calculations are correct. The Guardian is defeated.",
    "Calcul validé. Voici le dernier calcul.": "Correct. Here is the final calculation.",
    "Réponds aux deux calculs pour stabiliser le noyau.": "Answer two calculations to stabilize the core.",
    "Le noyau est ouvert. Il ne reste que deux calculs.": "The core is open. Only two calculations remain.",
    "Le bouclier révèle ses failles. Mémorise puis frappe.": "The shield reveals its flaws. Memorize, then strike.",
    "Nombres : du plus grand au plus petit": "Numbers: largest to smallest",
    "Nombres : du plus petit au plus grand": "Numbers: smallest to largest",
    "Dates : de la plus récente à la plus ancienne": "Dates: newest to oldest",
    "Dates : de la plus ancienne à la plus récente": "Dates: oldest to newest",
    "Mots : ordre alphabétique inverse": "Words: reverse alphabetical order",
    "Mots : ordre alphabétique": "Words: alphabetical order",
    "Emplacements de dépôt": "Drop slots",
    "Cases noires : dépose ou remplace une carte ici": "Black slots: drop or replace a card here",
    "Sélectionne une autre carte pour remplacer celle-ci.": "Select another card to replace this one.",
    "Sélectionne d'abord une carte en haut.": "Select a card at the top first.",
    "Ordre incorrect. Toutes les cases sont rouges : réinitialise pour recommencer.": "Incorrect order. All slots are red: reset to start over.",
    "Ce panneau ne fait pas partie du motif cible.": "This panel is not part of the target pattern.",
    "Active les panneaux 01, 03, 05, 07 et 09.": "Activate panels 01, 03, 05, 07 and 09.",
    "FACILE": "EASY",
    "MOYEN": "MEDIUM",
    "DIFFICILE": "HARD",
    "MÉMORISÉ": "MEMORIZED",
    "Observe l'ordre des lumières, puis clique sur les mêmes piliers dans cet ordre.": "Watch the lights, then click the same pillars in that order.",
    "Aligne chaque forme avec l'emplacement qui correspond à sa couleur et à son symbole.": "Match each shape with the slot that corresponds to its color and symbol.",
    "Place chaque forme dans la zone portant la même couleur.": "Place each shape in the area with the matching color.",
    "Fais pivoter l'objet jusqu'à ce qu'il corresponde à l'orientation cible.": "Rotate the object until it matches the target orientation.",
    "Mémorise la séquence présentée, puis reproduis-la exactement.": "Memorize the shown sequence, then reproduce it exactly.",
    "Active uniquement les symboles qui correspondent au motif cible.": "Activate only the symbols that match the target pattern.",
    "Suis l'ordre indiqué et active chaque élément une seule fois.": "Follow the shown order and activate each element once.",
    "Retourne deux cartes à la fois et retrouve les symboles identiques.": "Reveal two cards at a time and find the matching symbols.",
  };

  const eyebrows = {
    "Géométrie primaire": "Primary geometry",
    "Mémoire lumineuse": "Light memory",
    "Langage géométrique": "Geometric language",
    "Perspective holographique": "Holographic perspective",
    "Résonance sonore": "Sound resonance",
    "Observation des motifs": "Pattern observation",
    "Porte lumineuse": "Light gate",
    "Tri des symboles": "Symbol sorting",
    "Constellation fracturée": "Fractured constellation",
    "Séquence chromatique": "Chromatic sequence",
  };
  const ariaWords = {
    Etoile: "Star", Module: "Module", Intersection: "Intersection", Carte: "Card",
    Emplacement: "Slot", Panneau: "Panel", Frappe: "Strike",
  };
  const colors = {
    rouge: "red", bleu: "blue", vert: "green", jaune: "yellow", violet: "purple",
    orange: "orange", rose: "pink", cyan: "cyan",
  };
  const systemWords = [
    [/^SYSTEME::/, "SYSTEM::"],
    [/\bEN ATTENTE\b/g, "STANDBY"],
    [/\bENREGISTREE\b/g, "RECORDED"],
    [/\bDETECTES?\b/g, "DETECTED"],
    [/\bPILIERS\b/g, "PILLARS"],
    [/\bMEMOIRE\b/g, "MEMORY"],
    [/\bA RECALER\b/g, "TO REALIGN"],
    [/\bCANAL SONORE OUVERT\b/g, "SOUND CHANNEL OPEN"],
    [/\bSEQUENCE ACTIVE\b/g, "ACTIVE SEQUENCE"],
    [/\bSEQUENCE\b/g, "SEQUENCE"],
  ];

  const rules = [
    [/^Fragment (\d+) \/\/ (.+)$/, (m) => (eyebrows[m[2]] ? `Fragment ${m[1]} // ${eyebrows[m[2]]}` : null)],
    [/^(Etoile|Module|Intersection|Carte|Emplacement|Panneau|Frappe) (\d+)$/, (m) => `${ariaWords[m[1]]} ${m[2]}`],
    [/^Couleur (\w+)$/, (m) => (colors[m[1].toLowerCase()] ? `Color ${colors[m[1].toLowerCase()]}` : null)],
    [/^Cartes disponibles$/, () => "Available cards"],
    [/^SEQUENCE ACTIVE$/, () => "ACTIVE SEQUENCE"],
    [/^PARTIE (\d+) \/\/ (.+)$/, (m) => `PART ${m[1]} // ${tr(m[2])}`],
    [/^SYSTEME::.*$/, (m) => systemWords.reduce((s, [p, r]) => s.replace(p, r), m[0])],
    [/^(.*?) \/ (\d+) \/\/ RÉUSSITES (\d+)$/, (m) => `${m[1]} / ${m[2]} // HITS ${m[3]}`],
    [/^(\d+) \/ (\d+) \/\/ RÉUSSITES (\d+)$/, (m) => `${m[1]} / ${m[2]} // HITS ${m[3]}`],
    [/^Touche synchronisée \/\/ (\d+) réussites \/ (\d+) touches$/, (m) => `Key synchronized // ${m[1]} hits / ${m[2]} keys`],
    [/^Touche manquée\. Score : (.*)\.$/, (m) => `Key missed. Score: ${m[1]}.`],
    [/^PHASE (\d+) \/\/ Réussites : (.*?)\. Les erreurs font continuer\.$/, (m) => `PHASE ${m[1]} // Hits: ${m[2]}. Mistakes let the sequence continue.`],
    [/^Échec\. Il faut au moins (\d+) réussites pour continuer\.$/, (m) => `Failure. You need at least ${m[1]} hits to continue.`],
    [/^SIGNAL:\/\/ (FACILE|MOYEN|DIFFICILE) \/\/ (\d+) BOUTONS ACTIFS$/, (m) => `SIGNAL:// ${exact[m[1]]} // ${m[2]} ACTIVE BUTTONS`],
    [/^SIGNAL:\/\/ LECTURE (FACILE|MOYEN|DIFFICILE)$/, (m) => `SIGNAL:// READING ${exact[m[1]]}`],
    [/^SIGNAL:\/\/ (FACILE|MOYEN|DIFFICILE) MÉMORISÉ$/, (m) => `SIGNAL:// ${exact[m[1]]} MEMORIZED`],
    [/^NIVEAU (\d+) CHARGÉ \/\/ (FACILE|MOYEN|DIFFICILE)$/, (m) => `LEVEL ${m[1]} LOADED // ${exact[m[2]]}`],
    [/^Niveau (\d+)$/, (m) => `Level ${m[1]}`],
    [/^NIVEAU (\d+)$/, (m) => `LEVEL ${m[1]}`],
    [/^Progression : (\d+) sur (\d+)$/, (m) => `Progress: ${m[1]} of ${m[2]}`],
    [/^Panneau (\d+)$/, (m) => `Panel ${m[1]}`],
    [/^(\d+) \/ (\d+) panneaux corrects\.$/, (m) => `${m[1]} / ${m[2]} correct panels.`],
    [/^Manche (\d+) \/ (\d+) : active la séquence (.*)\.$/, (m) => `Round ${m[1]} / ${m[2]}: activate sequence ${m[3]}.`],
    [/^Étoile (\d+) \/ (\d+) confirmée\.$/, (m) => `Star ${m[1]} / ${m[2]} confirmed.`],
    [/^Couleur (\d+) \/ (\d+) confirmée\.$/, (m) => `Color ${m[1]} / ${m[2]} confirmed.`],
    [/^Module (\d+) \/ (\d+) confirm[ée]\.$/, (m) => `Module ${m[1]} / ${m[2]} confirmed.`],
    [/^Intersection (\d+) \/ (\d+) confirm[ée]e\.$/, (m) => `Intersection ${m[1]} / ${m[2]} confirmed.`],
    [/^Manche (\d+) \/ (\d+) réussie\. Nouvelle constellation en préparation\.\.\.$/, (m) => `Round ${m[1]} / ${m[2]} complete. New constellation loading...`],
    [/^Manche (\d+) \/ (\d+) réussie\. Nouvelles cartes chargées\.$/, (m) => `Round ${m[1]} / ${m[2]} complete. New cards loaded.`],
    [/^Manche (\d+) \/ (\d+) réussie\. Nouvelle règle chargée\.$/, (m) => `Round ${m[1]} / ${m[2]} complete. New rule loaded.`],
    [/^Manche (\d+) \/ (\d+) \/\/ (\d+) cartes \/\/ paires\.$/, (m) => `Round ${m[1]} / ${m[2]} // ${m[3]} cards // pairs.`],
    [/^Manche (\d+) \/ (\d+) \/\/ groupe trouvé : (\d+) \/ (\d+)\.$/, (m) => `Round ${m[1]} / ${m[2]} // group found: ${m[3]} / ${m[4]}.`],
    [/^Manche (\d+) \/ (\d+) \/\/ cartes différentes\. Recommence\.$/, (m) => `Round ${m[1]} / ${m[2]} // cards differ. Try again.`],
    [/^Manche (\d+) \/ (\d+) \/\/ observation des cartes\.\.\.$/, (m) => `Round ${m[1]} / ${m[2]} // observing the cards...`],
    [/^Manche (\d+) \/ (\d+) \/\/ rassemblement du paquet\.\.\.$/, (m) => `Round ${m[1]} / ${m[2]} // gathering the deck...`],
    [/^Manche (\d+) \/ (\d+) \/\/ mélange en cours\.\.\.$/, (m) => `Round ${m[1]} / ${m[2]} // shuffling...`],
    [/^Manche (\d+) \/ (\d+) \/\/ redistribution des cartes\.\.\.$/, (m) => `Round ${m[1]} / ${m[2]} // redistributing the cards...`],
    [/^Manche (\d+) \/ (\d+) \/\/ retourne deux cartes pour trouver une paire\.$/, (m) => `Round ${m[1]} / ${m[2]} // flip two cards to find a pair.`],
    [/^Carte (\S+) sélectionnée\. Choisis une autre case libre\.$/, (m) => `Card ${m[1]} selected. Choose another free slot.`],
    [/^Carte (\S+) sélectionnée\. Choisis n'importe quelle case libre\.$/, (m) => `Card ${m[1]} selected. Choose any free slot.`],
    [/^Déplacer la carte (\S+)$/, (m) => `Move card ${m[1]}`],
    [/^Carte déposée : (\d+) \/ (\d+)\. Remplis toutes les cases\.$/, (m) => `Card placed: ${m[1]} / ${m[2]}. Fill all slots.`],
    [/^Dépose les (\d+) cartes selon : (.*)\.$/, (m) => `Place the ${m[1]} cards according to: ${tr(m[2])}.`],
    [/^La manche (\d+) \/ (\d+) recommence\. Dépose les (\d+) cartes selon : (.*)\.$/, (m) => `Round ${m[1]} / ${m[2]} restarts. Place the ${m[3]} cards according to: ${tr(m[4])}.`],
    [/^Manche (\d+) \/ (\d+) réussie$/, (m) => `Round ${m[1]} / ${m[2]} complete`],
    [/^(.*) Vies restantes : (\d+)\.$/, (m) => `${tr(m[1])} Lives remaining: ${m[2]}.`],
    [/^Vies : (\d+)$/, (m) => `Lives: ${m[1]}`],
    [/^Calcul (\d+) \/ (\d+)$/, (m) => `Calculation ${m[1]} / ${m[2]}`],
  ];

  // Normalise les espaces et apostrophes avant de chercher une traduction.
  const normalize = (value) => value.replace(/\s+/g, " ").replace(/[’‘]/g, "'").trim();
  const exactNormalized = new Map(
    Object.entries(exact).map(([key, value]) => [normalize(key), value]),
  );

  const upperExact = new Map(
    [...exactNormalized].map(([key, value]) => [key.toUpperCase(), value]),
  );

  // Renvoie la traduction anglaise d'un texte français (ou le texte inchangé).
  function tr(text) {
    const core = normalize(text);
    if (!core) return text;
    if (exactNormalized.has(core)) return exactNormalized.get(core);
    const upper = core === core.toUpperCase();
    if (upper) {
      const found = upperExact.get(core);
      if (found) return found.toUpperCase();
    }
    for (const [pattern, build] of rules) {
      const match = core.match(pattern);
      const built = match && build(match);
      if (built) return built;
    }
    return text;
  }

  // Traduit un nœud de texte.
  const translateText = (node) => {
    const value = node.nodeValue;
    if (!value || !value.trim()) return;
    const result = tr(value);
    if (result === value) return;
    const lead = value.match(/^\s*/)[0];
    const trail = value.match(/\s*$/)[0];
    node.nodeValue = lead + result + trail;
  };

  const attributes = ["aria-label", "title", "placeholder", "alt"];
  // Traduit les attributs textuels d'un élément (titre, placeholder…).
  const translateElement = (element) => {
    if (element.nodeType !== 1) return;
    if (["SCRIPT", "STYLE"].includes(element.tagName)) return;
    attributes.forEach((name) => {
      const value = element.getAttribute(name);
      if (!value) return;
      const result = tr(value);
      if (result !== value) element.setAttribute(name, result);
    });
  };

  // Parcourt le DOM pour tout traduire.
  const walk = (root) => {
    if (root.nodeType === 3) {
      translateText(root);
      return;
    }
    if (root.nodeType !== 1) return;
    translateElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === 3) {
        if (!["SCRIPT", "STYLE"].includes(node.parentNode?.tagName)) translateText(node);
      } else translateElement(node);
      node = walker.nextNode();
    }
  };

  // Lance la traduction de la page.
  const run = () => {
    document.title = tr(document.title);
    walk(document.body);
  };

  const observer = new MutationObserver((mutations) => {
    observer.disconnect();
    mutations.forEach((mutation) => {
      if (mutation.type === "characterData") translateText(mutation.target);
      else if (mutation.type === "attributes") translateElement(mutation.target);
      else mutation.addedNodes.forEach(walk);
      if (mutation.type === "childList" && mutation.target.nodeType === 1) {
        mutation.target.childNodes.forEach((child) => child.nodeType === 3 && translateText(child));
      }
    });
    observe();
  });
  // Observe les changements du DOM pour traduire le contenu ajouté plus tard.
  const observe = () =>
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: attributes,
    });

  window.echoesTranslate = tr;
  // Démarre la traduction au chargement de la page.
  const start = () => {
    run();
    observe();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
