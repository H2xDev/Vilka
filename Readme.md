# Vilka
The app that allows you to prepare release build of your source mod.

## How to use
Just launch vilka.exe with specified path to mod:

```batch
vilka.exe D:\Steam\steamapps\sourcemods\mod_name
```

The app will look for `Gameinfo.txt` and according to this file it will collect base resources.
Also your mod must have `mapsrc` folder with sources of maps, to take assets information. The release version of mod will be placed in folder `release`.


## Configuration
If you need to add more files/folders to copy, just create a config file `vilka.config.json` and place it into your mod folder.
</br>
Here is example of config:
```json
{
	"excludeMaps": [
		"zombie_test.vmf",
		"zombie_hunter.vmf",
		"transition_test.vmf",
		"prefabs\\"
	],
	"include": [
		"sound\\vo",
		"materials\\console"
	],
	"exclude": [
		"resource/closecaption_english.txt",
		"resource/closecaption_russian.txt",
	]
}
```

- `excludeMaps` field contains sources of maps that should be ignored for collecting asset information;
- `include` field contains files and folders that should be copied too;
- `exclude` field contains files and folders that should be ignored;

## Build
To make executable appliaction this project uses `pkg` module.

```batch
yarn build
# npm run build
```

## Contribution
Feel free to contribute this project. There is some features that need to be implemented like:
- Analyse VMFs for scenes to get related-only scenes;
- parse scenes for required audio files;
- autocompile closecaptions to release folder;
- add validation for `vilka.config.json`;

Also you able to suggest another features that will be useful for prepare a release.

### Contribution workflow
If you would like to contribute this project, you should do it by [Gitflow](http://danielkummer.github.io/git-flow-cheatsheet/) workflow:
- feature/* - you want to add a new feature
- bugfix/* - you want to fix something in the project

## Troubleshooting

### Windows 7 support
1. Windows 7 users should set environment variable `NODE_SKIP_PLATFORM_CHECK=1`
