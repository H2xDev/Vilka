import fs from 'fs';

const readResource = (source) => {
  const out = {};
  const hierarchy = [out];

  let currentObject = hierarchy[0];

  const refreshCurrentObject = () => {
    currentObject = hierarchy[hierarchy.length - 1];
  };

  // const propRegex =
    // /"?([\w\d_\.\/]+)"?\s+"?([\w\d_\.\s\/\-\(\)\[\]\\"',\*#!&]+)?"?(?:$|(\s\[.+\]))/i;
  const propRegex = /"?(.*?)?"?\s+"?(.*?)?"?(?:$|(\s\[.+\]))/i;
  const parseProperty = (prop) => {
    const match = prop.match(propRegex);

    if (!match) return {};

    return {
      name: (match[1] || '_').replace(/\"/g, ""),
      value: match[2]?.replace(/\"/g, ""),
      platform: match[3],
    };
  };

  const convertToTypedValue = (value) => {
    const col4 = /^([-\d\.]+)\s([-\d\.]+)\s([-\d\.]+)(\s-?(\d+))?/i;
    const vec3global = /\(([-\d\.e]+)\s([-\d\.e]+)\s([-\d\.e]+)\)/g;
    const vec3 = /\(([-\d\.e]+)\s([-\d\.e]+)\s([-\d\.e]+)\)/i;
    const vec2 = /\d\s\d/;

    if (col4.test(value)) {
      const [, r, g, b, , a] = value.match(col4);

      return {
        x: +r,
        y: +g,
        z: +b,
        a: +a || a,
      };
    }

    if (vec3global.test(value)) {
      return value.match(vec3global).map((vec) => {
        const [, x, y, z] = vec.match(vec3);

        return {
          x,
          y,
          z,
        };
      });
    }

    if (vec2.test(value)) {
      return value.split(" ").map((n) => +n);
    }

    return Number.isNaN(+value) ? value : +value;
  };

  source
    .split("\n")
    .map((line) =>
      line
        .replace(/\t+/g, " ")
        .replace(/\/\/(\s?|\s)+.+/, "")
        .trim()
    )
    .filter((line) => line && !line.startsWith("//"))
    .forEach((line) => {
      switch (line) {
        case "{":
          break;
        case "}":
          hierarchy.pop();
          refreshCurrentObject();
          break;

        default:
          // NOTE: Property
          if (line.match(propRegex)) {
            const data = parseProperty(line);

            data.value = convertToTypedValue(data.value);
            const value = data.platform
              ? {
                  value: data.value,
                  platform: data.platform,
                }
              : Number.isNaN(+data.value)
              ? data.value
              : +data.value;

            if (data.name && currentObject) {
              if (currentObject[data.name]) {
                if (!Array.isArray(currentObject[data.name])) {
                  currentObject[data.name] = [currentObject[data.name], value];
                } else {
                  currentObject[data.name].push(value);
                }
              } else {
                currentObject[data.name] = value;
              }
            }
          } else {
            line = line
              .replace(/\\"/g, "")
              .replace(/\"/g, "");

            const [prop, platform] = line.split(" ");

            if (!currentObject[prop]) {
              currentObject[prop] = {};
              hierarchy.push(currentObject[prop]);
            } else {
              const instance = {};

              if (!Array.isArray(currentObject[prop])) {
                // NOTE: Create array when the current field in file is array
                currentObject[prop] = [currentObject[prop], instance];
                hierarchy.push(instance);
              } else {
                currentObject[prop].push(instance);
                hierarchy.push(instance);
              }
            }

            refreshCurrentObject();
          }

          break;
      }
    });

  return out;
};

export const loadResource = (filename) => {
  if (!fs.existsSync(filename)) throw new Error('Resource "' + filename + '" doesn\'t exist');

  const source = fs.readFileSync(filename).toString();

  return readResource(source);
}
