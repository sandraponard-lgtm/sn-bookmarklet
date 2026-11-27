# sn-fusion / Project Navigator — Contexte développement

## Architecture
- Bookmarklet JS minifié (un seul fichier, ~82KB)
- Chargé via jsDelivr CDN : `https://cdn.jsdelivr.net/gh/sandraponard-lgtm/sn-bookmarklet@main/sn-project-hierarchy.js?t=DATE`
- Le `?t=DATE.now()` est dans le loader bookmark pour forcer le cache-bust

## Fonctions clés internes
| Fonction | Rôle |
|----------|------|
| `rn(n)` | Rendu d'une ligne de l'arbre (tree row) |
| `nn(n, {rec:e, isP:t})` | Rendu du panel détail. `e` = objet data ServiceNow |
| `o(n)` | Renderer générique d'un champ (dates, texte) |
| `oC(n)` | Renderer spécifique coûts : lit `e[n.f].value` (nombre brut EUR) + Intl.NumberFormat fr-FR |
| `tn(n)` | Parser numérique générique (pour les minilistes) |
| `tnCost(n)` | Parser coûts pour display dans ORDY tab |
| `l(n)` | Parser numérique dans la fonction recon (closure locale) |
| `T(url)` | fetch() wrapper → retourne une **Response** : toujours `await (await T(url)).json()` (tous les autres appels le font) |
| `sn(...)` | Rendu d'une minilist |
| `window.snfusOpenCostRecon` | Fonction réconciliation des coûts |

## Arrays de configuration
| Variable | Contenu |
|----------|---------|
| `l[]` | Boutons workspace (Project Workspace, Planning, Resources…) |
| `i[]` | Quick links nav avec `grp`: cl/cp/ex/ra/tc |
| `d[]` | Définitions minilists (ra, rad, tc, cp, ex) |
| `m[]` | Champs coûts : cost, capex_cost, opex_cost, budget_cost, work_cost |
| `q{}` | Groupes nav : Accès rapide / Plans de coût / Dépenses / Ressources / Cartes de temps |

## API ServiceNow — comportement des champs currency
Les champs de type `currency` retournent avec `sysparm_display_value=all` :
```json
{
  "cost": {
    "display_value": "€7,315.9579",        // converti en EUR, format US, trop de décimales
    "currency_display_value": "USD;8000.00", // valeur source en devise native
    "value": "7315.9579"                    // nombre brut EUR (à utiliser pour calculs)
  }
}
```
**Règle** : toujours utiliser `value` (nombre brut) pour les calculs et reformater avec `Intl.NumberFormat('fr-FR', {min/maxFractionDigits:2})`.

Les champs "project currency" simples (non-currency type) :
```json
{
  "amount_project_currency": {
    "display_value": "2,000",   // PIÈGE : virgule = séparateur milliers, pas décimale !
    "value": "2000"             // toujours utiliser value directement
  }
}
```

## Bugs corrigés (historique)
1. **CSS real newlines** dans JS string → utiliser `\\n` (littéral deux caractères)
2. **`D()` sur champs coûts** → retourne `"€7,315.9579"` → remplacé par `oC()` avec `Intl.NumberFormat`
3. **Parser `dvStr`** : `"2,000"` interprété comme `2.0` → utiliser `value` directement
4. **Recon sans `.json()`** (cause des 0.00) : `T()` retourne une Response ; la réconciliation lisait `e.result` directement → toujours vide. Corrigé en v2026-11-27.2 (wrapper local `J` = `T(u).then(r=>r.json())`). L'ancienne note « T() retourne du JSON parsé » était fausse.

## Tables ServiceNow utilisées
| Table | Usage | Champs clés |
|-------|-------|-------------|
| `pm_project` | Projet racine | sys_id, number, short_description, cost, work_cost, capex_cost, opex_cost, budget_cost |
| `pm_project_task` | Tâches | sys_id, number, short_description, parent, top_task, wbs, cost, work_cost |
| `fm_expense_line` | Lignes de dépense | source_id (→ projet), amount, amount_project_currency |
| `cost_plan` | Plans de coût | task (→ projet/tâche), actual_cost_project_currency, cost_default_currency |
| `resource_allocation_daily` | Allocations daily | allocation→resource_assignment→top_task, allocated_cost, actual_cost (decimal ; pas de planned_cost) |
| `sn_plng_att_core_resource_assignment` | Resource assignments | top_task, assignment_type (user/group) |

## ⚠ Types de montants — lire le bon nombre (confirmé sur SC_Pourpre)
| Type dico | Nombre à lire | Devise |
|---|---|---|
| `currency` (cost, work_cost, amount, allocated_cost de resource_plan/allocation…) | `.value` | EUR converti (devise de l'utilisateur) ; natif dans `currency_display_value` (`"USD;2000.00"`) |
| `currency2` (`*_project_currency`, `*_invst_currency`, `*_demand_currency` de pm_project, pm_project_task, resource_plan, resource_allocation) | **`currency_display_value.split(";")[1]`** — `.value` est un sys_id, PAS un nombre (`parseFloat` donne des valeurs fausses) | devise avant le `;` |
| `decimal` (cost_plan.*, cost_plan_breakdown.*, fm_expense_line.amount_project_currency, resource_allocation_daily.allocated_cost/actual_cost) | `.value` (jamais `display_value`) | devise du champ : project = USD ici |
- `actual_cost_project_currency` est `decimal` sur cost_plan mais `currency2` sur pm_project/pm_project_task/resource_plan/resource_allocation.
- Ne pas comparer/additionner un champ `currency` (EUR) et un `decimal` `*_project_currency` (USD) sans conversion ; ne pas suffixer « € » un `decimal` project currency.
- `resource_allocation_daily.planned_cost` n'existe pas (colonne retirée de la minilist RAD). `time_card` n'a aucun champ monétaire.
- Référence complète (tous champs et types) : doc de projet `sn-tables-reference.md`.

## Requêtes recon
```
fm_expense_line?sysparm_query=source_id=SYS_ID&sysparm_fields=amount_project_currency
cost_plan?sysparm_query=task=SYS_ID&sysparm_fields=actual_cost_project_currency
resource_allocation_daily?sysparm_query=allocation.resource_assignment.top_task=SYS_ID^allocation.resource_assignment.assignment_type=user&sysparm_fields=allocated_cost,actual_cost
```

## Données de démo (instance ispconsultingdemo08)
- Projet de test : PRJ0010436 `SC_Pourpre`, sys_id = `4934d4d5fb3c5b10d9ddf5028eefdc60`
- 1 expense line EXP0010110 : amount.value=1822.3235 (EUR affiché, natif USD;2000.00), amount_project_currency.value="2000" (USD)
- 1 cost plan Resource_Internal_Opex : actual_cost_project_currency.value="2000"
- RAD : allocated_cost présent (162.5, 150… = heures × 50, `decimal` en USD), actual_cost = chaîne vide "" (projet futur)
- Devise du projet = USD, devise fonctionnelle = USD, devise d'affichage de l'utilisateur = EUR

## Version courante : v2026-11-27.15
- v2026-11-27.15 : compteurs RA / TC / CP / EX de l'arbre préchargés au chargement de la hiérarchie (6 requêtes `/api/now/stats?sysparm_count=true&sysparm_group_by=…` par lot de 150 nœuds, au lieu de 6 requêtes à chaque survol ; le survol reste le repli si l'API échoue). La réconciliation par agrégation découpe aussi ses requêtes en lots de 150 identifiants (limite de longueur d'URL).
- v2026-11-27.14 : repli ligne à ligne de la réconciliation : un seul appel RAD (allocated_cost + actual_cost) au lieu de deux (4 requêtes par nœud au lieu de 5).
- v2026-11-27.13 : réconciliation par agrégation serveur (`/api/now/stats`, sommes groupées par nœud : EX par source_id, CP par task, RAD par allocation.resource_assignment.task, projets par top_task) + 2 lectures groupées de work_cost : une poignée d'appels au lieu de 5 par nœud et plus de lignes à télécharger. Repli automatique sur l'ancienne lecture ligne à ligne si l'API stats échoue ; le mode utilisé est affiché dans l'en-tête de la réconciliation. Validé sur SC_Pourpre (mêmes valeurs que la lecture ligne à ligne).
- v2026-11-27.12 : (1) réconciliation, colonne « Écart » (max − min entre Σ EX, work_cost, Σ RAD réel, + Σ CP sur la ligne projet ; ✓ si < 0,01) ; (2) filtre rapide au-dessus des minilistes de plus de 3 lignes (insensible casse/accents, compteur n / N, les lignes Breakdown suivent leur ligne parente).
- v2026-11-27.11 : tri des colonnes sur toutes les tables (minilistes, breakdown, réconciliation) : clic sur un en-tête = tri croissant puis décroissant (▲/▼). Nombres (formats fr et US), dates jj-mm-aaaa et texte gérés ; valeurs vides toujours en dernier ; les liens ↗ des en-têtes ne déclenchent pas le tri ; la ligne Breakdown dépliée reste attachée à sa ligne Cost Plan. Délégation d'événement unique (`window.snfusSortInit`).
- v2026-11-27.10 : dans l'arbre, le lien au survol d'une ligne affiche « ↗ » seul (le mot « Classique » est retiré ; l'infobulle reste).
- v2026-11-27.9 : la minilist « Resource Alloc. Daily » est retirée de la partie principale (les RAD restent lues par la réconciliation). Le lien rapide « Resource Allocation » du menu Ressources reste disponible.
- v2026-11-27.8 : (1) Σ RAD alloué dédoublé projet / tâches comme EX et RAD réel ; (2) titres de colonnes de la réconciliation cliquables (↗) vers la liste filtrée correspondante (EX/RAD par colonne projet ou tâches, CP, work_cost) ; (3) barre de navigation en onglets (Workspace, Accès rapide, Plans de coût, Dépenses, Ressources, Cartes de temps) au lieu d'une rangée de boutons défilante : `snfusNavTab(g)`, panneaux `.snfus-np`.
- v2026-11-27.7 : réconciliation, les colonnes Σ EX et Σ RAD réel sont dédoublées en « sur le projet » (valeur de la ligne projet) et « sur les tâches » (valeurs des lignes tâches), pour distinguer visuellement le cumul du projet des lignes de tâches. Les lignes de total remplissent la colonne correspondante.
- v2026-11-27.6 : audit de la logique. Réconciliation : (1) projets parents exclus de la table et des totaux, « Σ Total projet » = projet ouvert uniquement (flags isAnc/isRoot posés dans le chargement de l'arbre), nouvelle ligne « Σ Total sous-projets » si besoin, lien RAD sur le projet ouvert ; (2) Σ EX ne compte que les lignes non Pending (`state!=pending`, la doc ne retient que les lignes Processed), lien ↗ Liste filtré pareil ; (3) pagination (500 par page, tri sys_id, 40 pages max) sur EX, CP et RAD au lieu d'une troncature silencieuse ; (4) format fr-FR, devise projet affichée dans l'en-tête, plus de console.log. Panneau de coûts : symbole de devise lu dans display_value au lieu de « € » en dur. Minilistes : « Σ (partiel a/b) » quand le total dépasse les lignes chargées ; breakdown limité à 500 au lieu de 50.
- v2026-11-27.5 : réconciliation, le Σ TOTAL unique est remplacé par deux lignes : « Σ Total projet » (lignes projet) et « Σ Total tâches » (lignes tâches), car le projet cumule déjà ses tâches (work_cost, RAD) et porte une copie des dépenses issues des time cards (fm_expense_line.base_expense renseigné ; `inherited` reste false). Les deux totaux sont deux lectures du même coût, à ne pas additionner.
- v2026-11-27.4 : liens « ↗ Liste » de la réconciliation filtrés sur le projet (EX : `source_idIN<sys_id des nœuds>`, CP : `taskIN<sys_id des nœuds>`, RAD : `allocation.resource_assignment.top_task=<projet>` + `assignment_type=user`).
- v2026-11-27.3 : liens « ↗ Liste » de la réconciliation corrigés (`${location.origin}` dans un template, pas `'+location.origin+'`) ; log console `[snfus recon]` par nœud (nb de lignes EX/CP/WC/RAD) pour diagnostiquer les 0.00.
- v2026-11-27.2 : réconciliation — résultats des requêtes enfin parsés (`.json()`), cause du 0.00 partout.
- Réconciliation : la colonne work_cost est lue en devise projet (`actual_cost_project_currency`, currency2 → `currency_display_value`) au lieu de `work_cost` (EUR converti), pour être comparable à Σ EX et Σ CP (USD).
- Réconciliation : Σ RAD filtre par `top_task` pour le projet et par `task` pour les tâches (comme les minilists).
- Diagnostic SC_Pourpre (2026-11-27) : requêtes saines (EX=2000, CP=2000 USD, RAD alloué=10000, réel=2000).

## Problème en cours (non résolu)
Note : le sys_id utilisé dans le script de diagnostic ci-dessous était tronqué (29 car. au lieu de 32) → il ne renvoie aucune ligne, donc "0.00" attendu avec ce script. Corrigé ici ; relancer le diagnostic avec l'id complet avant de conclure.
La réconciliation affiche tout à 0.00 malgré le fix `.json()`.
Piste : vérifier si la `T()` interne à snfus est la même que le fetch direct,
ou si `window._snfusNodes` est bien peuplé quand on appelle la réco.

Script de diagnostic à lancer dans la console :
```javascript
(async function() {
  const pid = '4934d4d5fb3c5b10d9ddf5028eefdc60';
  const T = url => fetch(url, {headers:{'Accept':'application/json','X-UserToken':window.g_ck||''}}).then(r=>r.json());
  const ex = await T(`/api/now/table/fm_expense_line?sysparm_query=source_id=${pid}&sysparm_fields=amount_project_currency&sysparm_limit=5&sysparm_display_value=all`);
  console.log('T() result type:', typeof ex, 'has .result:', !!ex.result);
  console.log('ex.result:', JSON.stringify(ex.result));
  console.log('window._snfusNodes:', window._snfusNodes ? Object.keys(window._snfusNodes).length + ' noeuds' : 'undefined');
})();
```

---

# Bookmarklet « Utilisateur » (`sn-user-resources.js`) — refonte

- **Source lisible** : `src/sn-user-resources.src.js` ; **fichier servi (minifié)** : `sn-user-resources.js`. Build : `npx terser src/sn-user-resources.src.js -c -m -o sn-user-resources.js`, puis contrôle `node -e 'new Function(require("fs").readFileSync("sn-user-resources.js","utf8"))'`.
- **Loader** : `javascript:(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/sandraponard-lgtm/sn-bookmarklet@main/sn-user-resources.js?t='+Date.now();document.body.appendChild(s)})()` (même nom de fichier que l'ancien : le bookmarklet existant est mis à jour sans changement).
- **Purge jsDelivr** : `https://purge.jsdelivr.net/gh/sandraponard-lgtm/sn-bookmarklet@main/sn-user-resources.js` (ou épingler un commit : `@<sha>`).
- Versions propres à ce fichier (`vAAAA-MM-JJ.N`, affichée dans l'en-tête).

## Version courante : v2026-11-27.8 (réel hors projet non compté)
- v2026-11-27.8 : le réel (`actual_hours`) et les coûts réels (`actual_cost`) des lignes `resource_allocation_daily` **sans projet** (`top_task` vide) ne sont plus comptés nulle part (vue d'ensemble, allocations, assignations, time cards, agrégats, fiabilité, détail quotidien) ; l'alloué reste complet. Décision de Sandra : critère « sans projet uniquement » (pas le type KTLO), périmètre « partout ». Implémentation : `aggRAD()` lance deux stats (`top_taskISNOTEMPTY` / `top_taskISEMPTY`, réel remis à 0 pour la seconde), fusionne par clé de groupe et expose le réel exclu dans `list.hp` (affiché en information dans la carte Alertes, avec lien vers la liste classique) ; les requêtes « réel seul » filtrent `top_taskISNOTEMPTY`. Coût : deux requêtes au lieu d'une pour chaque stats de RAD.
- Détail quotidien des allocations : le réel d'une ligne sans projet est affiché 0 avec la mention « hors projet : réel non compté ». La ligne « Sans allocation » ne porte plus « réel hors planification » si son réel (hors projet exclu) est nul.
- Motivation : les agrégats (`project_actual`) ne portent que le réel de projet ; le réel sans projet créait un faux Écart réel (ex. −22 j sur un mois).

## v2026-11-27.7 (détail quotidien des time cards + signe des écarts unifié)
- v2026-11-27.7 : onglet **Time cards** — bouton « Charger le détail quotidien » (à la demande, filtre optionnel par time card) : lignes de `time_card_daily` (`date`, `time_card`, `time_worked`) avec Projet / Tâche / État, **Jour de la carte** (valeur du même jour dans la time card, rouge si ≠ Heures), **Réel alloc.** du jour (mêmes règles de base que le tableau des semaines) et **Écart** (Approved / Processed seulement ; base « utilisateur » : somme des time cards approuvées du jour). **Signe des écarts unifié** : agrégat − allocations quotidiennes partout (tableau mensuel de la vue d'ensemble, onglet Agrégats, bloc Fiabilité) ; un écart négatif = manque dans les agrégats.
- Constat : les champs monday…sunday d'une time card correspondent aux vrais jours de la semaine, même si `week_starts_on` est un dimanche (le dimanche de la semaine est le premier jour). `time_card_daily` n'a que `date`, `time_card`, `time_worked` (heures) ; filtrable par `time_card.user`.

## v2026-11-27.6 (calendrier de charge : planifié / réalisé / écart)
- v2026-11-27.6 : le calendrier de la vue d'ensemble a trois modes (Planifié, Réalisé, Écart ; choix mémorisé dans `hm`). Planifié = `hours` des allocations quotidiennes, réalisé = `actual_hours`, écart = réalisé − planifié (jours passés seulement ; ✓ vert si nul, orange si moins réalisé, rouge si plus). Chaque case affiche le jour et la valeur (suit l'unité h / j) ; l'infobulle donne les trois valeurs. Les seuils de couleur restent en heures.

## v2026-11-27.5 (ligne « sans allocation » + Écart des time cards explicable)
- v2026-11-27.5 : **Allocations** — la ligne issue des lignes quotidiennes à `allocation` vide s'appelle « Sans allocation (réel hors planification) » (plus de lien mort `resource_allocation.do?sys_id=`) ; son libellé est un lien vers la liste classique `resource_allocation_daily` filtrée `allocationISEMPTY` ; le détail quotidien accepte ce cas (option `__none__` → `^allocationISEMPTY`) et affiche une colonne **Projet** (top_task). **Time cards** — nouvelles colonnes **Réel alloc.** (actual_hours des allocations quotidiennes sur les 7 jours à partir de `week_starts_on`, lien vers la liste classique), **Lignes** (nombre de lignes quotidiennes) et **Base** (tâche / projet / utilisateur (semaine)) ; si la time card n'a ni projet ni tâche, l'Écart compare le total de toutes les time cards approuvées de la semaine au réel de l'utilisateur sur la semaine. Écart = total time card − Réel alloc. (Approved / Processed seulement).
- Non vérifié : cas « sans allocation » et base « utilisateur (semaine) » non reproductibles sur ispconsultingdemo08 (pas de telles données) ; à confirmer sur l'instance cliente.

## v2026-11-27.4 (lot 4 : finitions et recette)
- v2026-11-27.4 : tableau mensuel de la vue d'ensemble migré vers le tableau générique (tri, filtre, Σ, Copier, CSV) ; tri mémorisé par tableau (`sorts` dans `snus.v1`, retrouvé par libellé de colonne) ; focus visible, `role="dialog"`, `aria-label` sur la fermeture.
- Recette (lecture seule, 2026-11-27) : détection de l'utilisateur dans l'URL du Next Experience (`/now/nav/ui/classic/params/target/sys_user.do%3Fsys_id%3D…`) OK ; ouverture utile (9 requêtes) en ~300–330 ms ; période annuelle en hebdomadaire OK (53 semaines, 64 colonnes) ; utilisateur enfant de groupe (Émilie Rousseau) sans double comptage ; mode ligne à ligne = mêmes valeurs ; constats détaillés dans le doc de projet `sn-tables-reference-utilisateur.md`.
- Non mesuré : durée « avant » de l'ancien bookmarklet (test automatisé non concluant : 2 requêtes API en 31 s sans fin de chargement).
- Purge jsDelivr après fusion : `https://purge.jsdelivr.net/gh/sandraponard-lgtm/sn-bookmarklet@main/sn-user-resources.js`.

## v2026-11-27.3 (lot 3 : Allocations + Agrégats)
- v2026-11-27.3 : onglet **Allocations** (resource_allocation de l'utilisateur chevauchant la période, matrice allocation × mois ou semaines en heures allouées, Σ alloué / réel / coûts ; allocations présentes dans les RAD mais absentes de la liste affichées « sans assignation » pour que les totaux concordent ; **détail quotidien à la demande** par allocation). Onglet **Agrégats** (mensuel ou hebdomadaire : capacité, disponibilité, alloué et réel des agrégats, taux d'occupation, utilisation, alloué et réel des allocations quotidiennes avec colonnes **Écart**, bouton Tester la fiabilité). Granularité mensuelle / hebdomadaire commune, mémorisée (`gran`). Périodes d'agrégats prises entières (mois complets ou semaines lundi → dimanche).
- Constat : `resource_aggregate_weekly.week_starts_on` est un **lundi** (contrairement à `time_card.week_starts_on`, dimanche). `resource_allocation` se filtre par `resource_assignment.user_resource=<user>` (sûr : 1976 → 3) et se lit avec `resource_assignment.top_task` et `resource_assignment.task` en dot-walk (display_value=all renvoie la clé « resource_assignment.top_task »). `stats` groupé par `allocation,date` fonctionne (63 groupes en nov. 2026).
- Concordance nov. 2026 (David Bernard) : mensuel capacité 168 h, alloué 185,25 h (agrégat = RAD), réel 40 h ; hebdo 6 semaines, écarts ✓ ; Allocations Σ 185,25 h / 40 h / 9 262,50 / 2 000,00 ; mode ligne à ligne identique (29 requêtes cumulées contre 16).

## v2026-11-27.2 (lot 2 : Assignations + Time cards)
- v2026-11-27.2 : tableau générique `dtable` (en-têtes triables ▲/▼, vides en bas, nombres fr, dates, texte naturel ; filtre accent/casse insensible avec compteur n / N au-dessus de 3 lignes ; ligne Σ recalculée sur les lignes filtrées ; en-têtes ↗ vers listes classiques ; boutons Copier (TSV) et CSV (`;`, BOM)). Onglet **Assignations** (assignment_type=user chevauchant la période ; alloué / réel / coûts de la période via RAD groupées par `allocation`). Onglet **Time cards** (une ligne par time card, colonnes Lun→Dim, état coloré, lien time sheet, **Écart** = total Approved/Processed − heures réelles RAD de la même tâche et semaine). Chargement à l'ouverture de l'onglet, mis en cache. Requêtes de semaine élargies de 6 jours (voir constat ci-dessous).
- Constat : sur l'instance, `time_card.week_starts_on` peut être un **dimanche** (22-11-2026) alors que les champs jour restent nommés lundi→dimanche (lundi = 23-11) ; les semaines sont donc lues à partir de `week_starts_on` sur 7 jours, sans supposer le lundi.
- Constat : une même semaine peut porter deux time cards pour la même tâche (Submitted + Processed, 40 h chacune) ; la ligne Σ les additionne toutes (tous états confondus).

## v2026-11-27.1 (lot 1 : socle + vue d'ensemble)
- Overlay plein écran, détection de l'utilisateur (g_form / URL, iframe `gsft_main`), recherche par nom / e-mail / sys_id, onglets (Vue d'ensemble active ; Assignations, Allocations, Time cards, Agrégats = compteurs + liens vers listes classiques, détail aux lots 2 et 3).
- Sélecteur de période commun (mois courant par défaut, précédent, trimestre, année civile, personnalisé), unité h / jours-homme, coûts oui/non, mémorisés (`localStorage` `snus.v1`, try/catch).
- Données : 9 requêtes en parallèle (`/api/now/stats` pour RAD, time cards, agrégats ; `sys_user`, `sys_user_grmember`, assignations). Cache par (utilisateur, onglet, période, mode) ; « Recalculer » le vide. Repli automatique ligne à ligne (500/page, `^ORDERBYsys_id`, 40 pages) si l'agrégation échoue ; bouton « Forcer ligne à ligne » pour le tester ; mode, nombre de requêtes et durée affichés (et `console.debug`).
- Vue d'ensemble : identité, manager, groupes, rôles ressource, compteurs, KPI (capacité, alloué, réel, taux d'occupation, coûts), alertes (surallocation mensuelle, jours > 8 h, time cards Pending / Submitted / Rejected / Recalled, écart time cards approuvées vs heures réelles sur semaines entières), heatmap quotidienne (≤ 92 jours), tableau mensuel avec colonne Écart (RAD alloué vs agrégat mensuel), bouton **Tester la fiabilité** des agrégats (historique complet, RAD vs mensuel vs hebdo, dernières mises à jour).

### Constats instance (lecture seule, ispconsultingdemo08, David Bernard `f632d130fbb74710d9ddf5028eefdcd5`, 2026-11-27)
- `resource_aggregate_monthly` : champs `user`, `task`, `month_starts_on`, `category` / `parent_category`, `hours`, `man_days`, `fte`, `utilization`. Catégories : `capacity`, `availability` (porte `utilization`), `non_project_time` + `project_allocated` (parent `allocated`), `project_actual` (parent `actual`). `resource_aggregate_weekly` : mêmes champs avec `week_starts_on`.
- Concordance : Σ RAD `hours` (905,25) = non_project_time + project_allocated (625,25 + 280) ; Σ RAD `actual_hours` (40) = project_actual (40) ; 24 / 24 mois concordent ; hebdo = mensuel.
- `resource_allocation_daily.type` : `ktlo` (hors projet) / `project_work`. Filtre direct `user=<sys_id>` fonctionne.
- Contrôle `X-Total-Count` (sans filtre → avec filtre, nov. 2026) : assignations 352 → 3, allocations (`resource_assignment.user_resource`) 1976 → 3, RAD 95662 → 63, time cards 103 → 2, agrégats mensuels 61747 → 6, hebdo 57198 → 29. Aucun filtre ne renvoie toute la table.
- Agrégation serveur et repli ligne à ligne donnent les mêmes KPI (capacité 168 h, alloué 185,25 h, réel 40 h, coûts 9 262,50 / 2 000,00).
- Time cards de l'utilisateur : états Pending (2), Processed (1), Submitted (1).
- Non vérifié : rôles plateforme (`sys_user_has_role`, 0 ligne non héritée) ; devise du rate model (affichée sans symbole).
