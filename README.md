# Twitch plays mots fléchés

## Présentation

Ce petit projet, surtout fait pour rigoler avec les gens de canardPC, peut-être utilisé directement à l'adresse <https://eskimon.fr/twitch-plays-crosswords/>.
Le principe est simple, une grille de mots-fléchés se charge et vous pouvez alors la remplir en cliquant sur les définitions. Si le mot est juste, il apparait alors dans la grille.
MAIS vous devez aussi composer avec vos spectateurs ! En effet, la grille peut-être rempli de manière "communautaire" via Twitch. Pour cela, ajouter le paramètre `channel` avec le nom de votre chaîne Twitch.

Par exemple quand je joue sur ma chaine j'accède à l'adresse suivante :

`https://eskimon.fr/twitch-plays-crosswords/?channel=eskimon`

Et si vous voulez jouer mais sans streamer, c'est pareil ! Le chat Twitch est toujours accessible mais quand il n'y aucune live en cours !

Petit trailer :

[![Trailer](https://img.youtube.com/vi/SGnJBQcSnmQ/0.jpg)](https://www.youtube.com/watch?v=SGnJBQcSnmQ)

### Participants

Pour les spectateurs c'est très simple. Pour répondre il suffit de taper le numéro de la définition tel qu'affiché sur la grille puis le mot que l'on pense avoir deviné. Si le mot est juste, le participant gagne alors autant de points que de lettres trouvées et qui n'étaient pas déjà présentes sur la grille.

### Commandes utiles

Voici quelques commandes d'administration de la grille :

- `!reset` : remet à zéro les scores
- `!grille x` : Démarre une nouvelle grille (`x` est la difficulté parmis [1,2,3,4])
- `!grille x g` : Démarre une nouvelle grille "giant" (`x` est la difficulté parmis [1,2,3,4])
- `!grille t` : Démarre une nouvelle grille "thème" (pas de difficulté règlable)
- `!grille gt` : Démarre une nouvelle grille "thème giant" (pas de difficulté règlable)

Ces commandes sont executables en les tapant directement dans le chat Twitch par le streamer de la chaine (spécifié dans le paramètre `channel`) ou un modérateur de la chaîne.

## Si vous voulez éditer le code

### Installation
```
npm install
```

#### Compilation, hot-reload et serveur de dev'
```
npm run serve
```

#### Compilation en version prod'
```
npm run build
```

#### Linter
```
npm run lint
```


### Remerciements

Certaines parties du code ont été inspiré de ce dépôt : <https://github.com/benVigie/mots>
