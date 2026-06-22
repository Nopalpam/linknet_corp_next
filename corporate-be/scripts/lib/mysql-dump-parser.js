function cleanValue(value) {
  if (value === 'NULL' || value === 'null') {
    return null;
  }

  if (/^-?\d+$/.test(value)) {
    return parseInt(value, 10);
  }

  if (/^-?\d+\.\d+$/.test(value)) {
    return parseFloat(value);
  }

  return value;
}

function unescapeMysqlCharacter(character) {
  switch (character) {
    case '0': return '\0';
    case 'b': return '\b';
    case 'n': return '\n';
    case 'r': return '\r';
    case 't': return '\t';
    case 'Z': return '\x1a';
    case '\\': return '\\';
    case "'": return "'";
    case '"': return '"';
    default: return character;
  }
}

function parseRowValues(rowStr) {
  const values = [];
  let current = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < rowStr.length; i++) {
    const ch = rowStr[i];

    if (escapeNext) {
      current += unescapeMysqlCharacter(ch);
      escapeNext = false;
      continue;
    }

    if (ch === '\\') {
      escapeNext = true;
      continue;
    }

    if (ch === "'" && !escapeNext) {
      if (!inString) {
        inString = true;
        continue;
      }

      if (i + 1 < rowStr.length && rowStr[i + 1] === "'") {
        current += "'";
        i++;
        continue;
      }

      inString = false;
      continue;
    }

    if (ch === ',' && !inString) {
      values.push(cleanValue(current.trim()));
      current = '';
      continue;
    }

    current += ch;
  }

  values.push(cleanValue(current.trim()));
  return values;
}

function parseSqlInserts(sql, tableName) {
  const rows = [];
  const marker = `INSERT INTO \`${tableName}\``;

  let searchStart = 0;
  while (true) {
    const insertPos = sql.indexOf(marker, searchStart);
    if (insertPos === -1) {
      break;
    }

    const valuesPos = sql.indexOf('VALUES', insertPos + marker.length);
    if (valuesPos === -1) {
      break;
    }

    let i = valuesPos + 6;
    let depth = 0;
    let currentRow = '';
    let inString = false;
    let escapeNext = false;
    let foundEnd = false;

    while (i < sql.length && !foundEnd) {
      const ch = sql[i];

      if (escapeNext) {
        if (depth >= 1) {
          currentRow += ch;
        }
        escapeNext = false;
        i++;
        continue;
      }

      if (ch === '\\') {
        if (depth >= 1) {
          currentRow += ch;
        }
        escapeNext = true;
        i++;
        continue;
      }

      if (ch === "'" && !escapeNext) {
        inString = !inString;
        if (depth >= 1) {
          currentRow += ch;
        }
        i++;
        continue;
      }

      if (!inString) {
        if (ch === '(') {
          depth++;
          if (depth === 1) {
            currentRow = '';
            i++;
            continue;
          }
        } else if (ch === ')') {
          depth--;
          if (depth === 0) {
            rows.push(parseRowValues(currentRow));
            currentRow = '';
            i++;
            continue;
          }
        } else if (ch === ';' && depth === 0) {
          foundEnd = true;
          i++;
          continue;
        }
      }

      if (depth >= 1) {
        currentRow += ch;
      }
      i++;
    }

    searchStart = i;
  }

  return rows;
}

module.exports = {
  parseSqlInserts,
};
