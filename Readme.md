# Vilka
The app that allows you to prepare release build of your source mod.

## How to used
Just launch vilka.exe with specified path to mod:

```batch
vilka.exe D:\Steam\steamapps\sourcemods\mod_name
```

The app will look for `Gameinfo.txt` and according to this file it will collect base resources.
Also your mod must have `mapsrc` folder with sources of maps, to take assets information.


## Configuration
If you need to add more files/folders to copy, just create config file `vilka.config.json`.

- Here is example of this config:
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

