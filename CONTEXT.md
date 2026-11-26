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
| `T(url)` | fetch() wrapper → retourne directement le JSON parsé (pas une Response !) |
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
4. **Recon `.json()` parasite** : `T()` retourne déjà du JSON parsé, ne pas appeler `.json()` dessus

## Tables ServiceNow utilisées
| Table | Usage | Champs clés |
|-------|-------|-------------|
| `pm_project` | Projet racine | sys_id, number, short_description, cost, work_cost, capex_cost, opex_cost, budget_cost |
| `pm_project_task` | Tâches | sys_id, number, short_description, parent, top_task, wbs, cost, work_cost |
| `fm_expense_line` | Lignes de dépense | source_id (→ projet), amount, amount_project_currency |
| `cost_plan` | Plans de coût | task (→ projet/tâche), actual_cost_project_currency, cost_default_currency |
| `resource_allocation_daily` | Allocations daily | allocation→resource_assignment→top_task, allocated_cost, actual_cost, planned_cost |
| `sn_plng_att_core_resource_assignment` | Resource assignments | top_task, assignment_type (user/group) |

## Requêtes recon
```
fm_expense_line?sysparm_query=source_id=SYS_ID&sysparm_fields=amount_project_currency
cost_plan?sysparm_query=task=SYS_ID&sysparm_fields=actual_cost_project_currency
resource_allocation_daily?sysparm_query=allocation.resource_assignment.top_task=SYS_ID^allocation.resource_assignment.assignment_type=user&sysparm_fields=allocated_cost,actual_cost
```

## Données de démo (instance ispconsultingdemo08)
- Projet de test : PRJ0010436 `SC_Pourpre`, sys_id = `4934d4d5fb3c5b10d9ddf5028eefd`
- 1 expense line EXP0010110 : amount=1828.99€ (USD 2000), amount_project_currency.value="2000"
- 1 cost plan Resource_Internal_Opex : actual_cost_project_currency.value="2000"
- RAD : allocated_cost présent (162.5, 150...), actual_cost vide (projet futur)

## Problème en cours (non résolu)
La réconciliation affiche tout à 0.00 malgré le fix `.json()`.
Piste : vérifier si la `T()` interne à snfus est la même que le fetch direct,
ou si `window._snfusNodes` est bien peuplé quand on appelle la réco.

Script de diagnostic à lancer dans la console :
```javascript
(async function() {
  const pid = '4934d4d5fb3c5b10d9ddf5028eefd';
  const T = url => fetch(url, {headers:{'Accept':'application/json','X-UserToken':window.g_ck||''}}).then(r=>r.json());
  const ex = await T(`/api/now/table/fm_expense_line?sysparm_query=source_id=${pid}&sysparm_fields=amount_project_currency&sysparm_limit=5&sysparm_display_value=all`);
  console.log('T() result type:', typeof ex, 'has .result:', !!ex.result);
  console.log('ex.result:', JSON.stringify(ex.result));
  console.log('window._snfusNodes:', window._snfusNodes ? Object.keys(window._snfusNodes).length + ' noeuds' : 'undefined');
})();
```
